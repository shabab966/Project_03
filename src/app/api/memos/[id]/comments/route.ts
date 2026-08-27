import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '../../../../../lib/auth';
import { db } from '../../../../../lib/db';
import { enforceTenant } from '../../../../../lib/tenant';
import { logAuditEvent } from '../../../../../lib/audit';
import { sendNotification, notifyManyUsers } from '../../../../../lib/notifications';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const memoId = params.id;
    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Comment content cannot be empty' }, { status: 400 });
    }

    const memo = await db.memo.findUnique({
      where: { id: memoId },
      include: {
        steps: true,
        author: true,
      },
    });

    if (!memo) return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    if (memo.organizationId !== session!.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const comment = await db.memoComment.create({
      data: {
        memoId,
        authorId: session!.userId,
        type: 'GENERAL',
        content: content.trim(),
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, designation: true, role: true },
        },
      },
    });

    await logAuditEvent({
      organizationId: session!.organizationId,
      userId: session!.userId,
      action: 'MEMO_COMMENT_ADDED',
      entityType: 'MEMO',
      entityId: memoId,
      details: { commentAuthor: session!.name },
    });

    // Notify author if someone else commented, or notify assigned user
    const recipientIds = new Set<string>();
    if (memo.authorId !== session!.userId) recipientIds.add(memo.authorId);
    if (memo.currentAssigneeId && memo.currentAssigneeId !== session!.userId) recipientIds.add(memo.currentAssigneeId);

    if (recipientIds.size > 0) {
      await notifyManyUsers(Array.from(recipientIds), {
        organizationId: session!.organizationId,
        memoId: memo.id,
        title: 'New Comment on Memo',
        message: `${session!.name} posted a comment on "${memo.title}" (${memo.referenceNumber}).`,
        type: 'COMMENT',
      });
    }

    return NextResponse.json({ comment });
  } catch (error: any) {
    console.error('Failed to add comment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
