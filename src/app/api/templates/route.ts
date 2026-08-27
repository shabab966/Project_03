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

    const templates = await db.workflowTemplate.findMany({
      where: { organizationId: session!.organizationId, isActive: true },
      orderBy: { name: 'asc' },
    });

    const parsedTemplates = templates.map(t => ({
      ...t,
      steps: JSON.parse(t.stepsJson || '[]'),
    }));

    return NextResponse.json({ templates: parsedTemplates });
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
    const { name, description, steps = [] } = body;

    if (!name || !steps || steps.length === 0) {
      return NextResponse.json({ error: 'Template name and at least one workflow step are required' }, { status: 400 });
    }

    const template = await db.workflowTemplate.create({
      data: {
        organizationId: session!.organizationId,
        name: name.trim(),
        description: description ? description.trim() : null,
        stepsJson: JSON.stringify(steps),
        isActive: true,
      },
    });

    await logAuditEvent({
      organizationId: session!.organizationId,
      userId: session!.userId,
      action: 'WORKFLOW_TEMPLATE_CREATED',
      entityType: 'TEMPLATE',
      entityId: template.id,
      details: { name: template.name, stepCount: steps.length },
    });

    return NextResponse.json({ template: { ...template, steps } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
