import { AuthSession } from './auth';
import { NextResponse } from 'next/server';

export function enforceTenant(session: AuthSession | null, targetOrgId?: string) {
  if (!session) {
    return {
      allowed: false,
      response: NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 }),
    };
  }

  if (targetOrgId && session.organizationId !== targetOrgId) {
    return {
      allowed: false,
      response: NextResponse.json({ error: 'Forbidden. Cross-tenant access is strictly prohibited.' }, { status: 403 }),
    };
  }

  return { allowed: true, session };
}

export function enforceAdmin(session: AuthSession | null) {
  const tenantCheck = enforceTenant(session);
  if (!tenantCheck.allowed) return tenantCheck;

  if (session?.role !== 'ADMIN') {
    return {
      allowed: false,
      response: NextResponse.json({ error: 'Forbidden. Organization Administrator access required.' }, { status: 403 }),
    };
  }

  return { allowed: true, session };
}
