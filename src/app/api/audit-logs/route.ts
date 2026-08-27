import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { enforceAdmin } from '@/lib/tenant';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const adminCheck = enforceAdmin(session);
    if (!adminCheck.allowed) return adminCheck.response;

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');
    const query = searchParams.get('q');

    const where: any = {
      organizationId: session!.organizationId,
    };

    if (action && action !== 'ALL') {
      where.action = action;
    }
    if (entityType && entityType !== 'ALL') {
      where.entityType = entityType;
    }
    if (query) {
      where.OR = [
        { action: { contains: query } },
        { entityType: { contains: query } },
        { detailsJson: { contains: query } },
        { user: { name: { contains: query } } },
      ];
    }

    const logs = await db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { select: { id: true, name: true, email: true, designation: true, role: true } },
      },
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
