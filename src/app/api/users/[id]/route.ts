import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, hashPassword } from '@/lib/auth';
import { db } from '@/lib/db';
import { enforceAdmin } from '@/lib/tenant';
import { logAuditEvent } from '@/lib/audit';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession(req);
    const adminCheck = enforceAdmin(session);
    if (!adminCheck.allowed) return adminCheck.response;

    const userId = params.id;
    const body = await req.json();
    const { name, designation, departmentId, role, status, password } = body;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.organizationId !== session!.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (designation) updateData.designation = designation.trim();
    if (departmentId !== undefined) updateData.departmentId = departmentId || null;
    if (role && ['ADMIN', 'USER'].includes(role)) updateData.role = role;
    if (status && ['ACTIVE', 'INACTIVE'].includes(status)) updateData.status = status;
    if (password) updateData.passwordHash = await hashPassword(password);

    const updated = await db.user.update({
      where: { id: userId },
      data: updateData,
      include: { department: true },
    });

    await logAuditEvent({
      organizationId: session!.organizationId,
      userId: session!.userId,
      action: 'USER_UPDATED',
      entityType: 'USER',
      entityId: userId,
      details: {
        role: updated.role,
        status: updated.status,
        department: updated.department?.name,
      },
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status,
        designation: updated.designation,
        department: updated.department,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
