import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { enforceTenant } from '@/lib/tenant';
import { resubmitMemoWorkflow } from '@/lib/workflow';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const memoId = params.id;
    const body = await req.json();
    const { title, body: memoBody, richTextHtml, changeSummary } = body;

    if (!title || !memoBody) {
      return NextResponse.json({ error: 'Title and revised body are required' }, { status: 400 });
    }

    if (!changeSummary || !changeSummary.trim()) {
      return NextResponse.json({ error: 'A summary of modifications made is required for resubmission' }, { status: 400 });
    }

    const updatedMemo = await resubmitMemoWorkflow({
      memoId,
      authorId: session!.userId,
      organizationId: session!.organizationId,
      title: title.trim(),
      body: memoBody.trim(),
      richTextHtml: richTextHtml || null,
      changeSummary: changeSummary.trim(),
    });

    return NextResponse.json({ success: true, memo: updatedMemo });
  } catch (error: any) {
    console.error('Failed to resubmit memo:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
