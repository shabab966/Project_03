import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { hashPassword } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token, userId, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    let user;

    // Handle invite verification flow (email already verified, just set password)
    if (token === 'invite_verified' && userId) {
      user = await db.user.findUnique({ where: { id: userId } });
      if (!user || !user.emailVerified) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
      }
    } else {
      // Standard forgot-password reset flow
      if (!token) {
        return NextResponse.json({ error: 'Reset token is required' }, { status: 400 });
      }

      user = await db.user.findUnique({ where: { resetToken: token } });

      if (!user) {
        return NextResponse.json({ error: 'Invalid or expired reset link. Please request a new one.' }, { status: 400 });
      }

      if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
        return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
      }
    }

    const passwordHash = await hashPassword(newPassword);

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can now log in.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
