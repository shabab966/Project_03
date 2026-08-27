import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '../../../../../../lib/auth';
import { db } from '../../../../../../lib/db';
import { enforceTenant } from '../../../../../../lib/tenant';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; attachmentId: string } }
) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const { id: memoId, attachmentId } = params;

    const attachment = await db.memoAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        memo: {
          include: {
            steps: true,
          },
        },
      },
    });

    if (!attachment || attachment.memoId !== memoId) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Strict Tenant Isolation Check
    if (attachment.memo.organizationId !== session!.organizationId) {
      return NextResponse.json({ error: 'Forbidden. Cross-tenant access is prohibited.' }, { status: 403 });
    }

    // Permission check
    const isAdmin = session!.role === 'ADMIN';
    const isAuthor = attachment.memo.authorId === session!.userId;
    const isParticipant = attachment.memo.steps.some(s => s.assignedUserId === session!.userId);

    if (!isAdmin && !isAuthor && !isParticipant) {
      return NextResponse.json({ error: 'Forbidden. You are not authorized to download this attachment.' }, { status: 403 });
    }

    const fullLocalPath = path.join(process.cwd(), 'public', attachment.filePath);
    try {
      const fileBuffer = await fs.readFile(fullLocalPath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': attachment.mimeType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(attachment.originalFilename)}"`,
          'Content-Length': attachment.sizeBytes.toString(),
        },
      });
    } catch {
      return NextResponse.json({ error: 'File content could not be read on disk' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
