import { db } from './db';
import { logAuditEvent } from './audit';
import { sendNotification, notifyManyUsers } from './notifications';

export async function checkActiveDelegation(delegatorId: string, delegateId: string, organizationId: string): Promise<boolean> {
  const now = new Date();
  const delegation = await db.delegation.findFirst({
    where: {
      organizationId,
      delegatorId,
      delegateId,
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });
  return !!delegation;
}

export async function isUserAuthorizedForStep(
  assignedUserId: string,
  currentUserId: string,
  organizationId: string
): Promise<{ authorized: boolean; isDelegate: boolean; delegatorId?: string }> {
  if (assignedUserId === currentUserId) {
    return { authorized: true, isDelegate: false };
  }

  // Check if current user is an active delegate for the assigned user
  const isDelegate = await checkActiveDelegation(assignedUserId, currentUserId, organizationId);
  if (isDelegate) {
    return { authorized: true, isDelegate: true, delegatorId: assignedUserId };
  }

  return { authorized: false, isDelegate: false };
}

export async function submitMemoWorkflow(memoId: string, authorId: string, organizationId: string) {
  const memo = await db.memo.findUnique({
    where: { id: memoId },
    include: {
      steps: {
        orderBy: { stepOrder: 'asc' },
        include: { assignedUser: true },
      },
      author: true,
    },
  });

  if (!memo) throw new Error('Memo not found');
  if (memo.organizationId !== organizationId) throw new Error('Unauthorized');
  if (memo.authorId !== authorId) throw new Error('Only the author can submit the memo');
  if (memo.status !== 'DRAFT') throw new Error('Only draft memos can be submitted');
  if (!memo.steps || memo.steps.length === 0) throw new Error('Workflow must contain at least one participant');

  // Create Initial Version (v1)
  await db.memoVersion.create({
    data: {
      memoId: memo.id,
      versionNumber: 1,
      title: memo.title,
      body: memo.body,
      richTextHtml: memo.richTextHtml,
      authorId: memo.authorId,
      changeSummary: 'Initial Submission',
    },
  });

  // Activate first step
  const firstStep = memo.steps[0];
  await db.workflowStep.update({
    where: { id: firstStep.id },
    data: { status: 'IN_PROGRESS' },
  });

  const nextStatus = firstStep.stepType === 'REVIEW' ? 'PENDING_REVIEW' : 'PENDING_APPROVAL';

  const updatedMemo = await db.memo.update({
    where: { id: memo.id },
    data: {
      status: nextStatus,
      currentStepIndex: 0,
      currentAssigneeId: firstStep.assignedUserId,
      submittedAt: new Date(),
    },
    include: {
      steps: { include: { assignedUser: true } },
      author: true,
    },
  });

  // Log Audit
  await logAuditEvent({
    organizationId,
    userId: authorId,
    action: 'MEMO_SUBMITTED',
    entityType: 'MEMO',
    entityId: memo.id,
    details: {
      referenceNumber: memo.referenceNumber,
      title: memo.title,
      firstAssignee: firstStep.assignedUser.name,
    },
  });

  // Notify First Assignee
  await sendNotification({
    organizationId,
    userId: firstStep.assignedUserId,
    memoId: memo.id,
    title: 'Action Required: New Memo Assigned',
    message: `Memo "${memo.title}" (${memo.referenceNumber}) submitted by ${memo.author.name} requires your ${firstStep.stepType === 'REVIEW' ? 'review' : 'approval'}.`,
    type: 'ACTION_REQUIRED',
  });

  return updatedMemo;
}

export async function executeWorkflowAction(params: {
  memoId: string;
  userId: string;
  organizationId: string;
  action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | 'FORWARD';
  comments?: string;
}) {
  const { memoId, userId, organizationId, action, comments } = params;

  const memo = await db.memo.findUnique({
    where: { id: memoId },
    include: {
      steps: {
        orderBy: { stepOrder: 'asc' },
        include: { assignedUser: true },
      },
      author: true,
    },
  });

  if (!memo) throw new Error('Memo not found');
  if (memo.organizationId !== organizationId) throw new Error('Unauthorized');

  const currentStep = memo.steps[memo.currentStepIndex];
  if (!currentStep) throw new Error('No active workflow step found');
  if (currentStep.status !== 'IN_PROGRESS') throw new Error('Current step is not in progress');

  // Verify authorization (direct assignee or active delegate)
  const authCheck = await isUserAuthorizedForStep(currentStep.assignedUserId, userId, organizationId);
  if (!authCheck.authorized) {
    throw new Error('You are not authorized to perform this workflow action');
  }

  const actingUser = await db.user.findUnique({ where: { id: userId } });
  const actingName = actingUser?.name || 'User';
  const assignedName = currentStep.assignedUser.name;
  const isDelegatedAction = authCheck.isDelegate;

  const delegationNote = isDelegatedAction ? ` (Acted by delegate: ${actingName} on behalf of ${assignedName})` : '';
  const fullComment = comments ? `${comments}${delegationNote}` : (isDelegatedAction ? `Action performed by delegate ${actingName}` : '');

  const now = new Date();

  if (action === 'APPROVE' || action === 'FORWARD') {
    // Update current step
    await db.workflowStep.update({
      where: { id: currentStep.id },
      data: {
        status: 'APPROVED',
        actionTaken: action === 'FORWARD' ? 'FORWARDED' : 'APPROVED',
        actionTimestamp: now,
        comments: fullComment,
        actedByUserId: isDelegatedAction ? userId : null,
      },
    });

    // Add Approval Comment to discussion thread
    await db.memoComment.create({
      data: {
        memoId: memo.id,
        authorId: userId,
        type: 'APPROVAL',
        content: fullComment ? `[Approved] ${fullComment}` : `[Approved] Memo approved at step ${currentStep.stepOrder + 1}${delegationNote}`,
      },
    });

    const nextIndex = memo.currentStepIndex + 1;
    if (nextIndex < memo.steps.length) {
      // Advance to next step
      const nextStep = memo.steps[nextIndex];
      await db.workflowStep.update({
        where: { id: nextStep.id },
        data: { status: 'IN_PROGRESS' },
      });

      const nextStatus = nextStep.stepType === 'REVIEW' ? 'PENDING_REVIEW' : 'PENDING_APPROVAL';

      await db.memo.update({
        where: { id: memo.id },
        data: {
          status: nextStatus,
          currentStepIndex: nextIndex,
          currentAssigneeId: nextStep.assignedUserId,
        },
      });

      // Notify next assignee
      await sendNotification({
        organizationId,
        userId: nextStep.assignedUserId,
        memoId: memo.id,
        title: 'Action Required: Memo Awaiting Approval',
        message: `Memo "${memo.title}" (${memo.referenceNumber}) has been approved by ${assignedName}${delegationNote} and now requires your action.`,
        type: 'ACTION_REQUIRED',
      });

      // Notify author of progress
      await sendNotification({
        organizationId,
        userId: memo.authorId,
        memoId: memo.id,
        title: 'Memo Workflow Advanced',
        message: `Step ${currentStep.stepOrder + 1} approved by ${assignedName}${delegationNote}. Now with ${nextStep.assignedUser.name}.`,
        type: 'APPROVED',
      });
    } else {
      // Completed all steps!
      await db.memo.update({
        where: { id: memo.id },
        data: {
          status: 'APPROVED',
          currentAssigneeId: null,
          completedAt: now,
        },
      });

      // Notify author
      await sendNotification({
        organizationId,
        userId: memo.authorId,
        memoId: memo.id,
        title: 'Memo Fully Approved & Completed! 🎉',
        message: `Your memo "${memo.title}" (${memo.referenceNumber}) has been approved by all participants and is now completed.`,
        type: 'COMPLETED',
      });

      // Notify all participants
      const participantIds = memo.steps.map(s => s.assignedUserId).filter(id => id !== memo.authorId);
      await notifyManyUsers(participantIds, {
        organizationId,
        memoId: memo.id,
        title: 'Workflow Completed',
        message: `Memo "${memo.title}" (${memo.referenceNumber}) has been fully approved.`,
        type: 'COMPLETED',
      });
    }

    await logAuditEvent({
      organizationId,
      userId,
      action: 'WORKFLOW_APPROVED',
      entityType: 'MEMO',
      entityId: memo.id,
      details: {
        stepOrder: currentStep.stepOrder,
        assignedTo: assignedName,
        actedBy: actingName,
        isDelegated: isDelegatedAction,
        comments: fullComment,
      },
    });

  } else if (action === 'REJECT') {
    if (!comments || !comments.trim()) {
      throw new Error('A reason or comment is strictly required when rejecting a memo.');
    }

    await db.workflowStep.update({
      where: { id: currentStep.id },
      data: {
        status: 'REJECTED',
        actionTaken: 'REJECTED',
        actionTimestamp: now,
        comments: fullComment,
        actedByUserId: isDelegatedAction ? userId : null,
      },
    });

    await db.memoComment.create({
      data: {
        memoId: memo.id,
        authorId: userId,
        type: 'REJECTION',
        content: `[Rejected] Reason: ${fullComment}`,
      },
    });

    await db.memo.update({
      where: { id: memo.id },
      data: {
        status: 'REJECTED',
        completedAt: now,
        currentAssigneeId: null,
      },
    });

    // Notify author
    await sendNotification({
      organizationId,
      userId: memo.authorId,
      memoId: memo.id,
      title: 'Memo Rejected',
      message: `Memo "${memo.title}" (${memo.referenceNumber}) was rejected by ${assignedName}${delegationNote}. Reason: ${comments}`,
      type: 'REJECTED',
    });

    await logAuditEvent({
      organizationId,
      userId,
      action: 'WORKFLOW_REJECTED',
      entityType: 'MEMO',
      entityId: memo.id,
      details: {
        stepOrder: currentStep.stepOrder,
        assignedTo: assignedName,
        actedBy: actingName,
        reason: comments,
      },
    });

  } else if (action === 'REQUEST_CHANGES') {
    if (!comments || !comments.trim()) {
      throw new Error('A comment explaining required modifications is required when requesting changes.');
    }

    await db.workflowStep.update({
      where: { id: currentStep.id },
      data: {
        status: 'CHANGES_REQUESTED',
        actionTaken: 'CHANGES_REQUESTED',
        actionTimestamp: now,
        comments: fullComment,
        actedByUserId: isDelegatedAction ? userId : null,
      },
    });

    await db.memoComment.create({
      data: {
        memoId: memo.id,
        authorId: userId,
        type: 'CHANGES_REQUESTED',
        content: `[Changes Requested] ${fullComment}`,
      },
    });

    await db.memo.update({
      where: { id: memo.id },
      data: {
        status: 'CHANGES_REQUESTED',
        currentAssigneeId: memo.authorId, // Assigned back to author to revise
      },
    });

    // Notify author
    await sendNotification({
      organizationId,
      userId: memo.authorId,
      memoId: memo.id,
      title: 'Changes Requested on Memo',
      message: `${assignedName}${delegationNote} requested changes on "${memo.title}" (${memo.referenceNumber}): ${comments}`,
      type: 'CHANGES_REQUESTED',
    });

    await logAuditEvent({
      organizationId,
      userId,
      action: 'WORKFLOW_CHANGES_REQUESTED',
      entityType: 'MEMO',
      entityId: memo.id,
      details: {
        stepOrder: currentStep.stepOrder,
        assignedTo: assignedName,
        actedBy: actingName,
        changesRequired: comments,
      },
    });
  }

  return await db.memo.findUnique({
    where: { id: memoId },
    include: {
      steps: { include: { assignedUser: true, actedByUser: true } },
      author: true,
      comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
      versions: { orderBy: { versionNumber: 'asc' } },
    },
  });
}

export async function resubmitMemoWorkflow(params: {
  memoId: string;
  authorId: string;
  organizationId: string;
  title: string;
  body: string;
  richTextHtml?: string;
  changeSummary: string;
}) {
  const { memoId, authorId, organizationId, title, body, richTextHtml, changeSummary } = params;

  const memo = await db.memo.findUnique({
    where: { id: memoId },
    include: {
      steps: { orderBy: { stepOrder: 'asc' }, include: { assignedUser: true } },
      versions: true,
      author: true,
    },
  });

  if (!memo) throw new Error('Memo not found');
  if (memo.organizationId !== organizationId) throw new Error('Unauthorized');
  if (memo.authorId !== authorId) throw new Error('Only the author can resubmit');
  if (memo.status !== 'CHANGES_REQUESTED') throw new Error('Only memos with Changes Requested can be resubmitted');

  const newVersionNumber = (memo.versions.length || 0) + 1;

  // Create new version snapshot
  await db.memoVersion.create({
    data: {
      memoId: memo.id,
      versionNumber: newVersionNumber,
      title,
      body,
      richTextHtml: richTextHtml || null,
      authorId,
      changeSummary: changeSummary || `Revision ${newVersionNumber}`,
    },
  });

  // Re-activate current step that requested changes
  const targetStep = memo.steps[memo.currentStepIndex];
  await db.workflowStep.update({
    where: { id: targetStep.id },
    data: {
      status: 'IN_PROGRESS',
      actionTaken: null,
      actionTimestamp: null,
      comments: null,
      actedByUserId: null,
    },
  });

  const nextStatus = targetStep.stepType === 'REVIEW' ? 'PENDING_REVIEW' : 'PENDING_APPROVAL';

  const updatedMemo = await db.memo.update({
    where: { id: memo.id },
    data: {
      title,
      body,
      richTextHtml: richTextHtml || null,
      status: nextStatus,
      currentAssigneeId: targetStep.assignedUserId,
    },
    include: {
      steps: { include: { assignedUser: true } },
      author: true,
    },
  });

  // Add system comment
  await db.memoComment.create({
    data: {
      memoId: memo.id,
      authorId,
      type: 'SYSTEM',
      content: `[Resubmitted] Version ${newVersionNumber} submitted with changes: ${changeSummary}`,
    },
  });

  // Notify the reviewer/approver
  await sendNotification({
    organizationId,
    userId: targetStep.assignedUserId,
    memoId: memo.id,
    title: 'Memo Resubmitted for Action',
    message: `${memo.author.name} resubmitted revised memo "${title}" (${memo.referenceNumber}).`,
    type: 'RESUBMITTED',
  });

  await logAuditEvent({
    organizationId,
    userId: authorId,
    action: 'MEMO_RESUBMITTED',
    entityType: 'MEMO',
    entityId: memo.id,
    details: {
      versionNumber: newVersionNumber,
      changeSummary,
      assignee: targetStep.assignedUser.name,
    },
  });

  return updatedMemo;
}
