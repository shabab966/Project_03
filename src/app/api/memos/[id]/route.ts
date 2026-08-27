import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '../../../../lib/auth';
import { db } from '../../../../lib/db';
import { enforceTenant } from '../../../../lib/tenant';
import { isUserAuthorizedForStep } from '../../../../lib/workflow';
import { logAuditEvent } from '../../../../lib/audit';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const memoId = params.id;
    const memo = await db.memo.findUnique({
      where: { id: memoId },
      include: {
        organization: { select: { id: true, name: true, slug: true, logoUrl: true, contactEmail: true, contactPhone: true, address: true } },
        author: { select: { id: true, name: true, email: true, designation: true, avatarUrl: true, signatureUrl: true } },
        department: { select: { id: true, name: true, code: true } },
        category: { select: { id: true, name: true } },
        steps: {
          orderBy: { stepOrder: 'asc' },
          include: {
            assignedUser: { select: { id: true, name: true, email: true, designation: true, avatarUrl: true } },
            actedByUser: { select: { id: true, name: true, email: true, designation: true } },
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, name: true, email: true, designation: true, role: true } },
          },
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
          include: {
            uploadedBy: { select: { id: true, name: true } },
          },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
      },
    });

    if (!memo) {
      return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    }

    // Strict Tenant Isolation Check
    if (memo.organizationId !== session!.organizationId) {
      return NextResponse.json({ error: 'Forbidden. Cross-tenant access is prohibited.' }, { status: 403 });
    }

    // Role-based / participant authorization check for viewing
    const isAdmin = session!.role === 'ADMIN';
    const isAuthor = memo.authorId === session!.userId;
    const isParticipant = memo.steps.some(s => s.assignedUserId === session!.userId);

    // Also check if current user is active delegate for any participant
    const now = new Date();
    const activeDelegations = await db.delegation.findMany({
      where: {
        organizationId: session!.organizationId,
        delegateId: session!.userId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
    const delegatorIds = activeDelegations.map(d => d.delegatorId);
    const isDelegateForParticipant = memo.steps.some(s => delegatorIds.includes(s.assignedUserId));

    if (!isAdmin && !isAuthor && !isParticipant && !isDelegateForParticipant) {
      return NextResponse.json({ error: 'Forbidden. You do not have permission to access this memo.' }, { status: 403 });
    }

    // Check if current user is active action taker right now
    let canAct = false;
    let actingAsDelegateFor: string | null = null;

    if (memo.status === 'PENDING_APPROVAL' || memo.status === 'PENDING_REVIEW') {
      const currentStep = memo.steps[memo.currentStepIndex];
      if (currentStep && currentStep.status === 'IN_PROGRESS') {
        const authCheck = await isUserAuthorizedForStep(currentStep.assignedUserId, session!.userId, session!.organizationId);
        if (authCheck.authorized) {
          canAct = true;
          if (authCheck.isDelegate) {
            const delegator = await db.user.findUnique({ where: { id: authCheck.delegatorId } });
            actingAsDelegateFor = delegator?.name || 'Delegator';
          }
        }
      }
    } else if (memo.status === 'CHANGES_REQUESTED' && isAuthor) {
      canAct = true;
    }

    return NextResponse.json({
      memo,
      permissions: {
        isAuthor,
        isAdmin,
        canAct,
        actingAsDelegateFor,
        canEditDraft: isAuthor && memo.status === 'DRAFT',
        canResubmit: isAuthor && memo.status === 'CHANGES_REQUESTED',
      },
    });
  } catch (error: any) {
    console.error('Failed to get memo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const memoId = params.id;
    const body = await req.json();
    const { title, body: memoBody, richTextHtml, priority, categoryId, departmentId, steps } = body;

    const memo = await db.memo.findUnique({
      where: { id: memoId },
    });

    if (!memo) return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    if (memo.organizationId !== session!.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if (memo.authorId !== session!.userId) {
      return NextResponse.json({ error: 'Only the author can edit a draft memo' }, { status: 403 });
    }
    if (memo.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Only draft memos can be modified directly' }, { status: 400 });
    }

    // Update steps if provided
    if (steps && Array.isArray(steps)) {
      await db.workflowStep.deleteMany({ where: { memoId } });
      await db.workflowStep.createMany({
        data: steps.map((s: any, idx: number) => ({
          memoId,
          stepOrder: idx,
          stepType: s.stepType || 'APPROVAL',
          assignedUserId: s.assignedUserId,
          status: 'PENDING',
        })),
      });
    }

    const updated = await db.memo.update({
      where: { id: memoId },
      data: {
        title: title ? title.trim() : memo.title,
        body: memoBody ? memoBody.trim() : memo.body,
        richTextHtml: richTextHtml !== undefined ? richTextHtml : memo.richTextHtml,
        priority: priority || memo.priority,
        categoryId: categoryId || memo.categoryId,
        departmentId: departmentId || memo.departmentId,
      },
      include: {
        steps: { include: { assignedUser: true } },
      },
    });

    return NextResponse.json({ memo: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const memoId = params.id;
    const memo = await db.memo.findUnique({ where: { id: memoId } });

    if (!memo) return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    if (memo.organizationId !== session!.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if (memo.authorId !== session!.userId && session!.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only the author or an admin can delete a draft' }, { status: 403 });
    }
    if (memo.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Only draft memos can be deleted' }, { status: 400 });
    }

    await db.memo.delete({ where: { id: memoId } });

    await logAuditEvent({
      organizationId: session!.organizationId,
      userId: session!.userId,
      action: 'MEMO_DELETED',
      entityType: 'MEMO',
      entityId: memoId,
      details: { referenceNumber: memo.referenceNumber, title: memo.title },
    });

    return NextResponse.json({ success: true, message: 'Draft memo deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
