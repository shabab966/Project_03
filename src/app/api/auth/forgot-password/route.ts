import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { logAuditEvent } from '../../../../lib/audit';
import { sendPasswordResetEmail } from '../../../../lib/email';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    let emailDelivered = false;
    let resetUrl: string | null = null;
    let emailWarning: string | null = null;

    if (user && user.status === 'ACTIVE') {
      // Generate a secure reset token valid for 1 hour
      const resetToken = randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });

      // Send the reset email via Resend
      const emailRes = await sendPasswordResetEmail({ name: user.name, email: user.email }, resetToken);
      emailDelivered = emailRes?.success || false;

      if (!emailRes?.success) {
        emailWarning = emailRes?.error?.message || 'Email delivery limited by provider sandbox mode.';
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://inter-office-memo-system.onrender.com' : 'http://localhost:3000');
      resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

      await logAuditEvent({
        organizationId: user.organizationId,
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'AUTH',
        entityId: user.id,
        details: { email: user.email, emailDelivered },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If an account matches that email address, password reset instructions have been sent.',
      emailDelivered,
      resetUrl,
      emailWarning,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
