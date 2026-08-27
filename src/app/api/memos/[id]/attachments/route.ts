import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '../../../../../lib/auth';
import { db } from '../../../../../lib/db';
import { enforceTenant } from '../../../../../lib/tenant';
import { logAuditEvent } from '../../../../../lib/audit';
import path from 'path';
import fs from 'fs/promises';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession(req);
    const tenantCheck = enforceTenant(session);
    if (!tenantCheck.allowed) return tenantCheck.response;

    const memoId = params.id;
    const memo = await db.memo.findUnique({ where: { id: memoId } });

    if (!memo) return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    if (memo.organizationId !== session!.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Size restriction (max 15MB)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File exceeds maximum size limit (15MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', session!.organizationId);
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${safeOriginalName}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    await fs.writeFile(filePath, buffer);

    const attachment = await db.memoAttachment.create({
      data: {
        memoId,
        uploadedById: session!.userId,
        filename: uniqueFilename,
        originalFilename: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        filePath: `/uploads/${session!.organizationId}/${uniqueFilename}`,
      },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });

    await logAuditEvent({
      organizationId: session!.organizationId,
      userId: session!.userId,
      action: 'ATTACHMENT_UPLOADED',
      entityType: 'MEMO',
      entityId: memoId,
      details: { filename: file.name, sizeBytes: file.size },
    });

    return NextResponse.json({ attachment });
  } catch (error: any) {
    console.error('Failed to upload attachment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
