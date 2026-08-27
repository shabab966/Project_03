import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, hashPassword, comparePassword } from '../../../../lib/auth';
import { db } from '../../../../lib/db';
import { logAuditEvent } from '../../../../lib/audit';

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, designation, currentPassword, newPassword } = body;

    const user = await db.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (designation) updateData.designation = designation.trim();

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
      }
      const isMatch = await comparePassword(currentPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password does not match' }, { status: 400 });
      }
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updatedUser = await db.user.update({
      where: { id: session.userId },
      data: updateData,
      include: {
        department: true,
        organization: true,
      },
    });

    await logAuditEvent({
      organizationId: session.organizationId,
      userId: session.userId,
      action: 'USER_PROFILE_UPDATED',
      entityType: 'USER',
      entityId: session.userId,
      details: { passwordChanged: !!newPassword },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        designation: updatedUser.designation,
        department: updatedUser.department?.name,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
