function getApiKey(): string | undefined {
  return process.env.RESEND_API_KEY;
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://inter-office-memo-system.onrender.com' : 'http://localhost:3000');
}

function getFromEmail(): string {
  return process.env.FROM_EMAIL || 'onboarding@resend.dev';
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = getApiKey();
  const fromEmail = getFromEmail();

  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not set — skipping email send. Would have sent to:', to, 'Subject:', subject);
    return { success: false, skipped: true, error: { message: 'RESEND_API_KEY is not configured.' } };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Inter-Office Memo System <${fromEmail}>`,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[Email] Failed to send to', to, ':', data);
      return { success: false, error: data };
    }
    console.log('[Email] Dispatched successfully to', to, 'ID:', data.id);
    return { success: true, data };
  } catch (err: any) {
    console.error('[Email] Network error during send:', err);
    return { success: false, error: { message: err.message } };
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

export async function sendInviteEmail(user: { name: string; email: string }, token: string) {
  const verifyUrl = `${getAppUrl()}/api/auth/verify-email?token=${token}`;


  return sendEmail({
    to: user.email,
    subject: '🎉 You have been invited — Set your password',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 56px; height: 56px; background: #0e8ceb; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span style="font-size: 28px;">📄</span>
            </div>
            <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0;">Inter-Office Memo System</h1>
            <p style="color: #64748b; margin: 8px 0 0;">You have been added to the platform</p>
          </div>

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi <strong>${user.name}</strong>,</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            An administrator has created an account for you on the Inter-Office Memo Management System.
            Click the button below to verify your email and set your password.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}"
               style="background: #0e8ceb; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
              ✅ Verify Email & Set Password
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            This link expires in <strong>24 hours</strong>.<br/>
            If you did not expect this invitation, you can safely ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Inter-Office Memo Management System &bull; CSE226 Project
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(user: { name: string; email: string }, token: string) {
  const resetUrl = `${getAppUrl()}/reset-password?token=${token}`;

  return sendEmail({

    to: user.email,
    subject: '🔐 Reset your password',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 56px; height: 56px; background: #0e8ceb; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span style="font-size: 28px;">🔐</span>
            </div>
            <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0;">Password Reset Request</h1>
          </div>

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi <strong>${user.name}</strong>,</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to choose a new password.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}"
               style="background: #0e8ceb; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
              🔑 Reset My Password
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            This link expires in <strong>1 hour</strong>.<br/>
            If you did not request a password reset, you can safely ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Inter-Office Memo Management System &bull; CSE226 Project
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendWorkflowNotificationEmail(
  user: { name: string; email: string },
  memo: { referenceNumber: string; title: string; authorName: string }
) {
  const memoUrl = `${APP_URL}/memos`;

  return sendEmail({
    to: user.email,
    subject: `📋 Action Required: Memo ${memo.referenceNumber}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 56px; height: 56px; background: #f59e0b; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span style="font-size: 28px;">⚡</span>
            </div>
            <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0;">Action Required</h1>
            <p style="color: #64748b; margin: 8px 0 0;">A memo is waiting for your review</p>
          </div>

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi <strong>${user.name}</strong>,</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            A memo has been assigned to you for review/approval:
          </p>

          <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #0e8ceb;">
            <p style="margin: 0 0 8px; color: #64748b; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">REFERENCE</p>
            <p style="margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #0e8ceb;">${memo.referenceNumber}</p>
            <p style="margin: 0 0 8px; color: #64748b; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">TITLE</p>
            <p style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #0f172a;">${memo.title}</p>
            <p style="margin: 0 0 8px; color: #64748b; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">SUBMITTED BY</p>
            <p style="margin: 0; font-size: 15px; color: #374151;">${memo.authorName}</p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${memoUrl}"
               style="background: #0e8ceb; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
              📋 View Memo & Take Action
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Inter-Office Memo Management System &bull; CSE226 Project
          </p>
        </div>
      </div>
    `,
  });
}
