# AI Prompt and Response History (Vibe-Coding Log)

- **Course Code**: CSE226
- **Course Title**: Foundations of Vibe Coding
- **Project**: Inter-Office Memo Management System
- **Institution**: North South University
- **Date**: August 2026
- **Repository**: [https://github.com/shabab966/Project_03](https://github.com/shabab966/Project_03)
- **Live Deployment**: [https://inter-office-memo-system.onrender.com](https://inter-office-memo-system.onrender.com)

---

## 1. Overview of AI-Assisted Development

This document records the chronological prompts, architectural directives, iterations, error diagnoses, refactoring sessions, and verification cycles conducted with AI coding assistants throughout the development of the multi-tenant Inter-Office Memo Management System.

> [!NOTE]
> In compliance with **Section 27 (Security & Confidentiality)** of the course specifications, all sensitive credentials, personal access tokens (PATs), and API secrets have been redacted (`[REDACTED]`).

---

## 2. Chronological Prompt & Response Trajectory

### Phase 1: Architectural Inception & Core Multi-Tenant State Machine

#### User Prompt 1
> "Create a complete, deploy-ready Inter-Office Memo Management System as specified in @prd.md. It must support multi-tenant isolation, sequential approval workflows, rich text formatting, delegations, versioning, audit logging, and reporting."

#### AI Action & Response Summary
- **Architecture Designed:** Next.js 14 App Router, TypeScript, Prisma ORM, Tailwind CSS, Lucide React, and JWT cookie auth.
- **Database Schema Created (`prisma/schema.prisma`):**
  - Designed 12 relational models: `Organization`, `Department`, `User`, `MemoCategory`, `WorkflowTemplate`, `Memo`, `MemoVersion`, `WorkflowStep`, `MemoComment`, `MemoAttachment`, `Delegation`, `Notification`, and `AuditLog`.
- **Sequential Workflow State Machine (`src/lib/workflow.ts`):**
  - Implemented `submitMemoWorkflow`, `executeWorkflowAction`, `resubmitMemoWorkflow`, `checkActiveDelegation`, and `isUserAuthorizedForStep`.
- **Multi-Tenant Isolation Layer (`src/lib/tenant.ts`):**
  - Created middleware and helper guards (`enforceTenant`, `enforceAdmin`) ensuring all database queries strictly filter by `organizationId`.

---

### Phase 2: User Interface, Role-Based Access & Demo Personas

#### User Prompt 2
> "Implement all pages required by the PRD: Login, Dashboard, Inbox, Sent, Completed, Drafts, New Memo, Memo Detail, Delegations, Notifications, Search, Profile, and all Admin pages."

#### AI Action & Response Summary
- **Pages Implemented:**
  - `/login`: Clean login with 1-click demo persona cards.
  - `/dashboard`: User overview, pending action previews, urgent flags, and administrative metrics.
  - `/memos/inbox`: Action Required queue with pending wait-time indicators.
  - `/memos/sent`: Tracking view for submitted memos with live assignee indicators.
  - `/memos/completed`: Historical archive of approved/rejected memos.
  - `/memos/drafts`: Draft creator and editor with deletion support.
  - `/memos/new`: Memo creator with template selector and custom workflow pipeline builder.
  - `/memos/[id]`: Official letterhead layout, chronological step timeline, comments, file attachments, and print styling.
  - `/delegations`: Temporary authority delegation management.
  - `/notifications`: In-app notification center.
  - `/search`: Multi-parameter search filter.
  - `/admin/departments`, `/admin/users`, `/admin/categories`, `/admin/templates`, `/admin/audit-logs`, `/admin/reports`.
- **Quick Persona Switcher:** Embedded a 1-click evaluation switcher in the top navigation bar to seamlessly toggle between 11 seeded demo users across NSU and Apex Tech.

---

### Phase 3: Render Deployment & Build Pipeline Debugging

#### User Prompt 3
> "Deploy the project to Render."

#### AI Action & Response Summary
- **Issue 1 (Prisma at build time):** `prisma db push` was initially in `buildCommand`, but Render PostgreSQL databases are only accessible at runtime.
  - **Resolution:** Moved `prisma db push` and `node scripts/seed.js` to `startCommand` in `render.yaml`.
- **Issue 2 (Webpack CSS & DevDependencies):** `NODE_ENV=production` caused npm to skip `devDependencies`, failing Tailwind CSS compilation.
  - **Resolution:** Moved all build tools (`tailwindcss`, `postcss`, `autoprefixer`, `typescript`, `prisma`) to `dependencies` in `package.json`.
- **Issue 3 (Linux Path Resolution):** Linux build containers on Render encountered resolution issues with `@/...` path aliases.
  - **Resolution:** Built automated conversion script (`scripts/convert-to-relative.js`) to convert all 130 import statements into pure relative paths (`../../`).

---

### Phase 4: Email Verification, Resend Integration & Password Reset

#### User Prompt 4
> "How can I add an original Email login and verification system in this website?"

#### AI Action & Response Summary
- **Provider Integrated:** Resend SDK with API Key `[REDACTED]`.
- **Schema Updated:** Added `emailVerified`, `verifyToken`, `verifyTokenExpiry`, `resetToken`, and `resetTokenExpiry` to `User` model.
- **Routes Created:**
  - `src/lib/email.ts`: Email templates for invitation, password reset, and workflow assignment.
  - `src/app/api/auth/verify-email/route.ts`: Token verification endpoint.
  - `src/app/api/auth/reset-password/route.ts`: Password reset endpoint with token expiry check.
  - `src/app/reset-password/page.tsx`: Interactive reset password UI with live password strength meter.
  - `src/app/api/auth/login/route.ts`: Login guard blocking unverified accounts with informative feedback.
  - `src/app/admin/users/page.tsx`: Admin invite toggle, direct activation links, and manual 1-click verification.

---

### Phase 5: Mobile Responsiveness & Cold Start Optimization

#### User Prompt 5
> "Double check all bugs and fix the mobile view and database persistence."

#### AI Action & Response Summary
- **Responsive Navigation Drawer:** Updated `Sidebar.tsx` and `Navbar.tsx` to hide the fixed sidebar on viewports below 1024px and replace it with a mobile slide-over drawer with dark blur backdrop and a hamburger menu (`☰`).
- **Favicon 404 Resolution:** Added `src/app/icon.svg` and `public/icon.svg`.
- **Database Persistence & Cold Start Acceleration:** Modified `scripts/seed.js` to verify existing data on startup. Prevents wiping newly registered accounts across server restarts and eliminates 10+ seconds of cold start overhead.
- **Sandboxed Email Fallback:** In Resend's free tier, emails to non-owner addresses are restricted; the system now displays a direct copyable activation link in the Admin UI as an instant fallback.

---

## 3. Key Technical Decisions & Lessons Learned

1. **Sequential State Machine vs Ad-hoc Flags:**
   Using a formal sequential step index (`currentStepIndex` + `WorkflowStep[]`) guarantees deterministic progression without race conditions or out-of-turn approvals.
2. **Tenant Scoping at Database Query Level:**
   Injecting `organizationId` from authenticated JWT claims into every database query prevents cross-tenant data leakage by design.
3. **Non-Destructive Database Initialization:**
   Decoupling startup migration from seeding ensures customer-created data persists safely across cloud container restarts.
