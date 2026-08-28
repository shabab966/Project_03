import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, hashPassword } from '../../../lib/auth';
import { db } from '../../../lib/db';
import { enforceAdmin, enforceTenant } from '../../../lib/tenant';
import { logAuditEvent } from '../../../lib/audit';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const all = req.nextUrl.searchParams.get('all') === 'true';

    // Platform Owner view: return all organizations with summary counts
    if (all && session!.role === 'ADMIN') {
      const orgs = await db.organization.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
          _count: {
            select: {
              users: true,
              departments: true,
              memos: true,
            },
          },
          users: {
            where: { role: 'ADMIN' },
            select: { id: true, name: true, email: true, designation: true },
            take: 1,
          },
        },
      });

      return NextResponse.json({ organizations: orgs });
    }

    // Default tenant view: return current organization
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

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const adminCheck = enforceAdmin(session);
    if (!adminCheck.allowed) return adminCheck.response;

    const body = await req.json();
    const {
      name,
      slug,
      contactEmail,
      contactPhone,
      address,
      adminName,
      adminEmail,
      adminPassword = 'password123',
      adminDesignation = 'Organization Administrator',
    } = body;

    if (!name || !slug || !adminName || !adminEmail) {
      return NextResponse.json(
        { error: 'Organization name, slug, administrator name, and email are required' },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

    const existing = await db.organization.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json({ error: `An organization with slug "${cleanSlug}" already exists.` }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email: adminEmail.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json({ error: `A user with email "${adminEmail}" already exists.` }, { status: 400 });
    }

    // 1. Create Organization
    const newOrg = await db.organization.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        contactEmail: contactEmail ? contactEmail.trim() : null,
        contactPhone: contactPhone ? contactPhone.trim() : null,
        address: address ? address.trim() : null,
        settingsJson: JSON.stringify({
          allowDelegation: true,
          strictSequentialWorkflow: true,
        }),
      },
    });

    // 2. Create Default Departments
    const adminDept = await db.department.create({
      data: {
        organizationId: newOrg.id,
        name: 'Central Administration',
        code: 'ADMIN',
        description: 'Executive and general administration',
      },
    });

    await db.department.create({
      data: {
        organizationId: newOrg.id,
        name: 'Finance & Accounts',
        code: 'FIN',
        description: 'Financial management, budgeting, and disbursements',
      },
    });

    await db.department.create({
      data: {
        organizationId: newOrg.id,
        name: 'Operations & Procurement',
        code: 'OPS',
        description: 'Operations, logistics, and vendor management',
      },
    });

    // 3. Create Default Memo Categories
    const categories = [
      { name: 'General Administrative', description: 'Internal memos, policy updates, and executive notices' },
      { name: 'Financial & Budgeting', description: 'Budget approvals, expenditure requests, and reimbursements' },
      { name: 'Procurement & Supplies', description: 'Vendor orders, hardware, and service requisitions' },
      { name: 'Human Resources & Leave', description: 'Staffing, appointments, and leave authorizations' },
    ];

    for (const cat of categories) {
      await db.memoCategory.create({
        data: {
          organizationId: newOrg.id,
          name: cat.name,
          description: cat.description,
        },
      });
    }

    // 4. Create Default Workflow Template
    await db.workflowTemplate.create({
      data: {
        organizationId: newOrg.id,
        name: 'Standard Two-Stage Approval',
        description: 'Initiator -> Department Head / Reviewer -> Executive Approval',
        stepsJson: JSON.stringify([
          { stepOrder: 0, title: 'Departmental Review', stepType: 'REVIEW', defaultRole: 'USER' },
          { stepOrder: 1, title: 'Executive Approval', stepType: 'APPROVAL', defaultRole: 'ADMIN' },
        ]),
      },
    });

    // 5. Create Organization Administrator User
    const passwordHash = await hashPassword(adminPassword);
    const adminUser = await db.user.create({
      data: {
        organizationId: newOrg.id,
        departmentId: adminDept.id,
        name: adminName.trim(),
        email: adminEmail.toLowerCase().trim(),
        passwordHash,
        designation: adminDesignation.trim(),
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
      },
    });

    await logAuditEvent({
      organizationId: session!.organizationId,
      userId: session!.userId,
      action: 'ORGANIZATION_CREATED',
      entityType: 'ORGANIZATION',
      entityId: newOrg.id,
      details: { name: newOrg.name, slug: newOrg.slug, adminEmail: adminUser.email },
    });

    return NextResponse.json({
      success: true,
      organization: newOrg,
      admin: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
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
