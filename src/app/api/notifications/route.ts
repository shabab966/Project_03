import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '../../../lib/auth';
import { db } from '../../../lib/db';
import { enforceTenant } from '../../../lib/tenant';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const notifications = await db.notification.findMany({
      where: {
        userId: session!.userId,
        organizationId: session!.organizationId,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        memo: {
          select: { id: true, referenceNumber: true, title: true, status: true },
        },
      },
    });

    const unreadCount = await db.notification.count({
      where: {
        userId: session!.userId,
        organizationId: session!.organizationId,
        isRead: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const body = await req.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      await db.notification.updateMany({
        where: {
          userId: session!.userId,
          organizationId: session!.organizationId,
          isRead: false,
        },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'All marked as read' });
    }

    if (notificationId) {
      await db.notification.updateMany({
        where: {
          id: notificationId,
          userId: session!.userId,
          organizationId: session!.organizationId,
        },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'Marked as read' });
    }

    return NextResponse.json({ error: 'Notification ID or markAllAsRead flag required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
