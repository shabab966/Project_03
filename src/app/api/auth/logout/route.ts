import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '../../../../lib/auth';
import { logAuditEvent } from '../../../../lib/audit';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (session) {
      await logAuditEvent({
        organizationId: session.organizationId,
        userId: session.userId,
        action: 'USER_LOGOUT',
        entityType: 'AUTH',
        entityId: session.userId,
      });
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.set('memo_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return NextResponse.json({ success: true });
  }
}
