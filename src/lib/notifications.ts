import { db } from './db';

export interface SendNotificationParams {
  organizationId: string;
  userId: string;
  memoId?: string | null;
  title: string;
  message: string;
  type: 'ACTION_REQUIRED' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'COMMENT' | 'ASSIGNED' | 'COMPLETED' | 'RESUBMITTED';
}

export async function sendNotification(params: SendNotificationParams) {
  try {
    return await db.notification.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        memoId: params.memoId || null,
        title: params.title,
        message: params.message,
        type: params.type,
      },
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

export async function notifyManyUsers(userIds: string[], params: Omit<SendNotificationParams, 'userId'>) {
  try {
    const records = userIds.map(userId => ({
      organizationId: params.organizationId,
      userId,
      memoId: params.memoId || null,
      title: params.title,
      message: params.message,
      type: params.type,
    }));

    return await db.notification.createMany({
      data: records,
    });
  } catch (error) {
    console.error('Failed to broadcast notifications:', error);
  }
}
