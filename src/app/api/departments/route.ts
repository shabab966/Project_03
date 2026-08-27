import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { enforceAdmin, enforceTenant } from '@/lib/tenant';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const departments = await db.department.findMany({
      where: { organizationId: session!.organizationId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { users: true, memos: true },
        },
      },
    });

    return NextResponse.json({ departments });
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
    const { name, code, description } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Department name and code are required' }, { status: 400 });
    }

    const department = await db.department.create({
      data: {
        organizationId: session!.organizationId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description ? description.trim() : null,
        isActive: true,
      },
    });

    await logAuditEvent({
      organizationId: session!.organizationId,
      userId: session!.userId,
      action: 'DEPARTMENT_CREATED',
      entityType: 'DEPARTMENT',
      entityId: department.id,
      details: { name: department.name, code: department.code },
    });

    return NextResponse.json({ department });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
