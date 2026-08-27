import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const organizations = await db.organization.findMany({
      orderBy: { name: 'asc' },
      include: {
        users: {
          where: { status: 'ACTIVE' },
          orderBy: [{ role: 'asc' }, { name: 'asc' }],
          include: { department: true },
        },
      },
    });

    const data = organizations.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      users: org.users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        designation: u.designation,
        department: u.department?.name || 'Central Administration',
      })),
    }));

    return NextResponse.json({ organizations: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
