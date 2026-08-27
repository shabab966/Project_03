import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '../../../lib/auth';
import { db } from '../../../lib/db';
import { enforceTenant } from '../../../lib/tenant';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const orgId = session!.organizationId;

    // Total counts
    const totalUsers = await db.user.count({ where: { organizationId: orgId } });
    const activeUsers = await db.user.count({ where: { organizationId: orgId, status: 'ACTIVE' } });
    const totalDepartments = await db.department.count({ where: { organizationId: orgId } });
    const totalMemos = await db.memo.count({ where: { organizationId: orgId } });

    // Status breakdown
    const memosByStatus = await db.memo.groupBy({
      by: ['status'],
      where: { organizationId: orgId },
      _count: { id: true },
    });

    const statusCounts: Record<string, number> = {
      DRAFT: 0,
      SUBMITTED: 0,
      PENDING_REVIEW: 0,
      PENDING_APPROVAL: 0,
      CHANGES_REQUESTED: 0,
      APPROVED: 0,
      REJECTED: 0,
    };

    memosByStatus.forEach(item => {
      statusCounts[item.status] = item._count.id;
    });

    // Priority breakdown
    const memosByPriority = await db.memo.groupBy({
      by: ['priority'],
      where: { organizationId: orgId },
      _count: { id: true },
    });

    const priorityCounts: Record<string, number> = {
      NORMAL: 0,
      HIGH: 0,
      URGENT: 0,
    };
    memosByPriority.forEach(item => {
      priorityCounts[item.priority] = item._count.id;
    });

    // Department breakdown
    const departments = await db.department.findMany({
      where: { organizationId: orgId },
      include: {
        _count: { select: { memos: true } },
      },
    });

    const deptStats = departments.map(d => ({
      name: d.name,
      code: d.code,
      count: d._count.memos,
    }));

    // Category breakdown
    const categories = await db.memoCategory.findMany({
      where: { organizationId: orgId },
      include: {
        _count: { select: { memos: true } },
      },
    });

    const catStats = categories.map(c => ({
      name: c.name,
      count: c._count.memos,
    }));

    // Calculate Average Turnaround Time for Completed Memos
    const completedMemos = await db.memo.findMany({
      where: {
        organizationId: orgId,
        status: 'APPROVED',
        submittedAt: { not: null },
        completedAt: { not: null },
      },
      select: {
        submittedAt: true,
        completedAt: true,
      },
    });

    let avgTurnaroundHours = 0;
    if (completedMemos.length > 0) {
      const totalHours = completedMemos.reduce((sum, memo) => {
        const diffMs = memo.completedAt!.getTime() - memo.submittedAt!.getTime();
        return sum + diffMs / (1000 * 60 * 60);
      }, 0);
      avgTurnaroundHours = Math.round((totalHours / completedMemos.length) * 10) / 10;
    }

    return NextResponse.json({
      summary: {
        totalUsers,
        activeUsers,
        totalDepartments,
        totalMemos,
        pendingWorkflows: (statusCounts.PENDING_APPROVAL || 0) + (statusCounts.PENDING_REVIEW || 0) + (statusCounts.CHANGES_REQUESTED || 0),
        completedWorkflows: statusCounts.APPROVED || 0,
        rejectedWorkflows: statusCounts.REJECTED || 0,
        urgentMemos: priorityCounts.URGENT || 0,
        avgTurnaroundHours,
      },
      statusCounts,
      priorityCounts,
      departmentStats: deptStats,
      categoryStats: catStats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
