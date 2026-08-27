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

    const org = await db.organization.findUnique({
      where: { id: session!.organizationId },
      include: {
        _count: {
          select: {
            users: true,
            departments: true,
            memos: true,
          },
        },
      },
    });

    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

    return NextResponse.json({ organization: org });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const adminCheck = enforceAdmin(session);
    if (!adminCheck.allowed) return adminCheck.response;

    const body = await req.json();
    const { name, contactEmail, contactPhone, address, logoUrl, settingsJson } = body;

    const updatedOrg = await db.organization.update({
      where: { id: session!.organizationId },
      data: {
        name: name ? name.trim() : undefined,
        contactEmail: contactEmail !== undefined ? contactEmail : undefined,
        contactPhone: contactPhone !== undefined ? contactPhone : undefined,
        address: address !== undefined ? address : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        settingsJson: settingsJson !== undefined ? (typeof settingsJson === 'object' ? JSON.stringify(settingsJson) : settingsJson) : undefined,
      },
    });

    await logAuditEvent({
      organizationId: session!.organizationId,
      userId: session!.userId,
      action: 'ORGANIZATION_UPDATED',
      entityType: 'ORGANIZATION',
      entityId: session!.organizationId,
      details: { name: updatedOrg.name },
    });

    return NextResponse.json({ organization: updatedOrg });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
