import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { comparePassword, createSessionToken } from '../../../../lib/auth';
import { logAuditEvent } from '../../../../lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        organization: true,
        department: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Your account has been deactivated. Please contact your administrator.' }, { status: 403 });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ error: 'Please verify your email first. Check your inbox for the invitation email.' }, { status: 403 });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
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
      action: 'USER_LOGIN',
      entityType: 'AUTH',
      entityId: user.id,
      details: { email: user.email, name: user.name },
      ipAddress: req.ip || req.headers.get('x-forwarded-for') || '127.0.0.1',
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
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
