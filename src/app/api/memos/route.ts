import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { enforceTenant } from '@/lib/tenant';
import { generateReferenceNumber } from '@/lib/utils';
import { logAuditEvent } from '@/lib/audit';
import { submitMemoWorkflow } from '@/lib/workflow';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const { searchParams } = new URL(req.url);
    const view = searchParams.get('view') || 'inbox'; // inbox, sent, completed, drafts, all, search
    const query = searchParams.get('q') || '';
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const categoryId = searchParams.get('categoryId');
    const departmentId = searchParams.get('departmentId');
    const authorId = searchParams.get('authorId');

    const orgId = session!.organizationId;
    const userId = session!.userId;
    const isAdmin = session!.role === 'ADMIN';

    // Find active delegators for the current user
    const now = new Date();
    const activeDelegations = await db.delegation.findMany({
      where: {
        organizationId: orgId,
        delegateId: userId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
    const authorizedUserIds = [userId, ...activeDelegations.map(d => d.delegatorId)];

    const where: any = {
      organizationId: orgId,
    };

    // Filter by View
    if (view === 'inbox') {
      where.OR = [
        // Memos pending approval/review assigned to current user or delegators
        {
          status: { in: ['PENDING_APPROVAL', 'PENDING_REVIEW'] },
          currentAssigneeId: { in: authorizedUserIds },
        },
        // Memos with changes requested where current user is the author
        {
          status: 'CHANGES_REQUESTED',
          authorId: userId,
        },
      ];
    } else if (view === 'sent') {
      where.authorId = userId;
      where.status = { not: 'DRAFT' };
    } else if (view === 'drafts') {
      where.authorId = userId;
      where.status = 'DRAFT';
    } else if (view === 'completed') {
      where.status = { in: ['APPROVED', 'REJECTED'] };
      if (!isAdmin) {
        where.OR = [
          { authorId: userId },
          { steps: { some: { assignedUserId: { in: authorizedUserIds } } } },
        ];
      }
    } else {
      // 'all' or 'search'
      if (!isAdmin) {
        where.OR = [
          { authorId: userId },
          { steps: { some: { assignedUserId: { in: authorizedUserIds } } } },
        ];
      }
    }

    // Additional specific filters
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }
    if (categoryId && categoryId !== 'ALL') {
      where.categoryId = categoryId;
    }
    if (departmentId && departmentId !== 'ALL') {
      where.departmentId = departmentId;
    }
    if (authorId && authorId !== 'ALL') {
      where.authorId = authorId;
    }

    // Full text search
    if (query.trim()) {
      const q = query.trim();
      where.AND = [
        {
          OR: [
            { referenceNumber: { contains: q } },
            { title: { contains: q } },
            { body: { contains: q } },
            { author: { name: { contains: q } } },
          ],
        },
      ];
    }

    const memos = await db.memo.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, email: true, designation: true, avatarUrl: true },
        },
        department: { select: { id: true, name: true, code: true } },
        category: { select: { id: true, name: true } },
        steps: {
          orderBy: { stepOrder: 'asc' },
          include: {
            assignedUser: { select: { id: true, name: true, designation: true } },
            actedByUser: { select: { id: true, name: true } },
          },
        },
        _count: {
          select: { comments: true, attachments: true, versions: true },
        },
      },
    });

    return NextResponse.json({ memos });
  } catch (error: any) {
    console.error('Failed to list memos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const body = await req.json();
    const {
      title,
      body: memoBody,
      richTextHtml,
      departmentId,
      categoryId,
      priority = 'NORMAL',
      steps = [], // Array of { stepOrder, stepType, assignedUserId }
      isDraft = false,
    } = body;

    if (!title || !memoBody) {
      return NextResponse.json({ error: 'Title and Memo Body are required' }, { status: 400 });
    }

    if (!isDraft && (!steps || steps.length === 0)) {
      return NextResponse.json({ error: 'At least one workflow participant is required to submit a memo' }, { status: 400 });
    }

    const referenceNumber = generateReferenceNumber(session!.organizationSlug);

    const memo = await db.memo.create({
      data: {
        organizationId: session!.organizationId,
        referenceNumber,
        title: title.trim(),
        body: memoBody.trim(),
        richTextHtml: richTextHtml || null,
        authorId: session!.userId,
        departmentId: departmentId || session!.departmentId || null,
        categoryId: categoryId || null,
        priority: priority || 'NORMAL',
        status: 'DRAFT',
        currentStepIndex: 0,
        steps: {
          create: steps.map((s: any, idx: number) => ({
            stepOrder: idx,
            stepType: s.stepType || 'APPROVAL',
            assignedUserId: s.assignedUserId,
            status: 'PENDING',
          })),
        },
      },
      include: {
        steps: { include: { assignedUser: true } },
        author: true,
      },
    });

    await logAuditEvent({
      organizationId: session!.organizationId,
      userId: session!.userId,
      action: 'MEMO_CREATED',
      entityType: 'MEMO',
      entityId: memo.id,
      details: {
        referenceNumber: memo.referenceNumber,
        title: memo.title,
        isDraft,
      },
    });

    // If not draft, immediately submit to sequential workflow
    if (!isDraft) {
      const submittedMemo = await submitMemoWorkflow(memo.id, session!.userId, session!.organizationId);
      return NextResponse.json({ memo: submittedMemo });
    }

    return NextResponse.json({ memo });
  } catch (error: any) {
    console.error('Failed to create memo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
