import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '../../../lib/auth';
import { db } from '../../../lib/db';
import { enforceAdmin, enforceTenant } from '../../../lib/tenant';
import { logAuditEvent } from '../../../lib/audit';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const categories = await db.memoCategory.findMany({
      where: { organizationId: session!.organizationId },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { memos: true } },
      },
    });

    return NextResponse.json({ categories });
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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const category = await db.memoCategory.create({
      data: {
        organizationId: session!.organizationId,
        name: name.trim(),
        description: description ? description.trim() : null,
      },
    });

    await logAuditEvent({
      organizationId: session!.organizationId,
      userId: session!.userId,
      action: 'CATEGORY_CREATED',
      entityType: 'CATEGORY',
      entityId: category.id,
      details: { name: category.name },
    });

    return NextResponse.json({ category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
