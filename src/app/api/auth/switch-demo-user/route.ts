import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { createSessionToken } from '../../../../lib/auth';
import { logAuditEvent } from '../../../../lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        department: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 404 });
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organization.name,
      organizationSlug: user.organization.slug,
      departmentId: user.departmentId,
      departmentName: user.department?.name,
      designation: user.designation,
      avatarUrl: user.avatarUrl,
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'DEMO_USER_SWITCHED',
      entityType: 'AUTH',
      entityId: user.id,
      details: { switchedTo: user.name, role: user.role },
      ipAddress: req.ip || '127.0.0.1',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        department: user.department?.name,
        organization: user.organization.name,
        organizationSlug: user.organization.slug,
      },
      token,
    });

    response.cookies.set('memo_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
