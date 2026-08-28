import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
    }

    const user = await db.user.findUnique({
      where: { verifyToken: token },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
    }

    if (user.verifyTokenExpiry && user.verifyTokenExpiry < new Date()) {
      return NextResponse.redirect(new URL('/login?error=token_expired', req.url));
    }

    // Mark email as verified and clear the token
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verifyToken: null,
        verifyTokenExpiry: null,
      },
    });

    // Redirect to set-password page
    return NextResponse.redirect(
      new URL(`/reset-password?token=invite_verified&userId=${user.id}&verified=true`, req.url)
    );
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', req.url));
  }
}
