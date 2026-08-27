import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, hashPassword } from '@/lib/auth';
import { db } from '@/lib/db';
import { enforceAdmin, enforceTenant } from '@/lib/tenant';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const users = await db.user.findMany({
      where: { organizationId: session!.organizationId },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
    });

    const safeUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      designation: u.designation,
      avatarUrl: u.avatarUrl,
      department: u.department,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ users: safeUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const adminCheck = enforceAdmin(session);
    if (!adminCheck.allowed) return adminCheck.response;

    const body = await req.json();
    const { name, email, password, designation, departmentId, role = 'USER' } = body;

    if (!name || !email || !password || !designation) {
      return NextResponse.json({ error: 'Name, email, password, and designation are required' }, { status: 400 });
    }

    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: 'A user with this email address already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        organizationId: session!.organizationId,
        departmentId: departmentId || null,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        designation: designation.trim(),
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
        status: 'ACTIVE',
      },
      include: { department: true },
    });

    await logAuditEvent({
      organizationId: session!.organizationId,
      userId: session!.userId,
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: user.id,
      details: { email: user.email, name: user.name, role: user.role },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        designation: user.designation,
        department: user.department,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
