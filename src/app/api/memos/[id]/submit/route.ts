import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '../../../../../lib/auth';
import { enforceTenant } from '../../../../../lib/tenant';
import { submitMemoWorkflow } from '../../../../../lib/workflow';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const memoId = params.id;
    const memo = await submitMemoWorkflow(memoId, session!.userId, session!.organizationId);

    return NextResponse.json({ success: true, memo });
  } catch (error: any) {
    console.error('Failed to submit memo:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
