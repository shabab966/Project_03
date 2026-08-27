import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '../../../../lib/auth';
import { db } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: {
        organization: true,
        department: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    // Get unread notification count
    const unreadNotificationsCount = await db.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    // Check if user has active delegations received or given
    const now = new Date();
    const activeDelegationReceived = await db.delegation.findFirst({
      where: {
        delegateId: user.id,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: { delegator: true },
    });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        status: user.status,
        avatarUrl: user.avatarUrl,
        signatureUrl: user.signatureUrl,
        department: user.department ? { id: user.department.id, name: user.department.name, code: user.department.code } : null,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
          slug: user.organization.slug,
          logoUrl: user.organization.logoUrl,
        },
        unreadNotificationsCount,
        activeDelegationReceived: activeDelegationReceived ? {
          delegatorId: activeDelegationReceived.delegatorId,
          delegatorName: activeDelegationReceived.delegator.name,
          reason: activeDelegationReceived.reason,
        } : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
