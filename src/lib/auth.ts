import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { db } from './db';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'cse226-vibe-coding-secure-jwt-secret-key-2026-nsu';
const JWT_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  departmentId?: string | null;
  departmentName?: string | null;
  designation: string;
  avatarUrl?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export async function createSessionToken(session: AuthSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_KEY);
}

export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_KEY);
    return payload as unknown as AuthSession;
  } catch (error) {
    return null;
  }
}

export async function getAuthSession(req?: NextRequest): Promise<AuthSession | null> {
  let token: string | undefined;

  if (req) {
    // Check Authorization Header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    // Check Cookies in request
    if (!token) {
      token = req.cookies.get('memo_token')?.value;
    }
  }

  if (!token) {
    try {
      const cookieStore = cookies();
      token = cookieStore.get('memo_token')?.value;
    } catch {
      // In certain contexts cookies() may not be available
    }
  }

  if (!token) {
    return null;
  }

  const session = await verifySessionToken(token);
  if (!session) return null;

  // Verify that the user still exists, belongs to the same organization, and is active
  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: {
        organization: true,
        department: true,
      },
    });

    if (!user || user.status !== 'ACTIVE' || user.organizationId !== session.organizationId) {
      return null;
    }

    return {
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
    };
  } catch (error) {
    console.error('Error verifying user in db:', error);
    return null;
  }
}
