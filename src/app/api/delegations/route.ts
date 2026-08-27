import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '../../../lib/auth';
import { db } from '../../../lib/db';
import { enforceTenant } from '../../../lib/tenant';
import { logAuditEvent } from '../../../lib/audit';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const delegations = await db.delegation.findMany({
      where: {
        organizationId: session!.organizationId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        delegator: { select: { id: true, name: true, designation: true, email: true } },
        delegate: { select: { id: true, name: true, designation: true, email: true } },
      },
    });

    return NextResponse.json({ delegations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const body = await req.json();
    const { delegatorId, delegateId, startDate, endDate, reason } = body;

    // A user can delegate on their own behalf, or an admin can configure it
    const effectiveDelegatorId = session!.role === 'ADMIN' && delegatorId ? delegatorId : session!.userId;

    if (!delegateId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Delegate, start date, and end date are required' }, { status: 400 });
    }

    if (effectiveDelegatorId === delegateId) {
      return NextResponse.json({ error: 'Cannot delegate authority to oneself' }, { status: 400 });
    }

    const delegation = await db.delegation.create({
      data: {
        organizationId: session!.organizationId,
        delegatorId: effectiveDelegatorId,
        delegateId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason ? reason.trim() : null,
        isActive: true,
      },
      include: {
        delegator: { select: { name: true } },
        delegate: { select: { name: true } },
      },
    });

    await logAuditEvent({
      organizationId: session!.organizationId,
      userId: session!.userId,
      action: 'DELEGATION_CREATED',
      entityType: 'DELEGATION',
      entityId: delegation.id,
      details: {
        delegator: delegation.delegator.name,
        delegate: delegation.delegate.name,
        startDate,
        endDate,
      },
    });

    return NextResponse.json({ delegation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const body = await req.json();
    const { id, isActive } = body;

    const delegation = await db.delegation.findUnique({
      where: { id },
      include: { delegator: true },
    });

    if (!delegation) return NextResponse.json({ error: 'Delegation not found' }, { status: 404 });
    if (delegation.organizationId !== session!.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if (delegation.delegatorId !== session!.userId && session!.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only the delegator or admin can modify this delegation' }, { status: 403 });
    }

    const updated = await db.delegation.update({
      where: { id },
      data: { isActive },
    });

    await logAuditEvent({
      organizationId: session!.organizationId,
      userId: session!.userId,
      action: 'DELEGATION_UPDATED',
      entityType: 'DELEGATION',
      entityId: id,
      details: { isActive },
    });

    return NextResponse.json({ delegation: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
