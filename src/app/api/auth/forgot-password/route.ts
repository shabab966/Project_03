import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';

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

    if (user) {
      await logAuditEvent({
        organizationId: user.organizationId,
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'AUTH',
        entityId: user.id,
        details: { email: user.email },
      });
    }

    // Return standard security response without revealing existence
    return NextResponse.json({
      success: true,
      message: 'If an account matches that email address, password reset instructions have been dispatched.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
