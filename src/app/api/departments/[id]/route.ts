import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '../../../../lib/auth';
import { db } from '../../../../lib/db';
import { enforceAdmin } from '../../../../lib/tenant';
import { logAuditEvent } from '../../../../lib/audit';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession(req);
    const adminCheck = enforceAdmin(session);
    if (!adminCheck.allowed) return adminCheck.response;

    const deptId = params.id;
    const body = await req.json();
    const { name, code, description, isActive } = body;

    const dept = await db.department.findUnique({ where: { id: deptId } });
    if (!dept) return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    if (dept.organizationId !== session!.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updated = await db.department.update({
      where: { id: deptId },
      data: {
        name: name ? name.trim() : dept.name,
        code: code ? code.trim().toUpperCase() : dept.code,
        description: description !== undefined ? description : dept.description,
        isActive: isActive !== undefined ? isActive : dept.isActive,
      },
    });

    await logAuditEvent({
      organizationId: session!.organizationId,
      userId: session!.userId,
      action: 'DEPARTMENT_UPDATED',
      entityType: 'DEPARTMENT',
      entityId: deptId,
      details: { name: updated.name, isActive: updated.isActive },
    });

    return NextResponse.json({ department: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
