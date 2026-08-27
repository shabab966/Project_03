import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { enforceTenant } from '@/lib/tenant';
import { executeWorkflowAction } from '@/lib/workflow';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const memoId = params.id;
    const body = await req.json();
    const { action, comments } = body;

    if (!action || !['APPROVE', 'REJECT', 'REQUEST_CHANGES', 'FORWARD'].includes(action)) {
      return NextResponse.json({ error: 'Valid action (APPROVE, REJECT, REQUEST_CHANGES, FORWARD) is required' }, { status: 400 });
    }

    const updatedMemo = await executeWorkflowAction({
      memoId,
      userId: session!.userId,
      organizationId: session!.organizationId,
      action,
      comments,
    });

    return NextResponse.json({ success: true, memo: updatedMemo });
  } catch (error: any) {
    console.error('Failed to execute workflow action:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
