# Inter-Office Memo Management System

An enterprise-grade, secure, multi-tenant web application for managing internal organizational communications, multi-step sequential approval/review workflows, rich text memos, versioning, audit logging, delegation, real-time in-app notifications, and official PDF exports.

Developed for **CSE226 - Foundations of Vibe Coding**, Department of Electrical & Computer Engineering, North South University.

---

## 🌟 Key Features

1. **Multi-Tenant Organization Management**:
   - Multiple independent tenants (e.g. *North South University* and *Apex Global Technologies*).
   - Strict data isolation enforced at both application middleware and database query levels.
   - Comprehensive administrative tools for managing departments, categories, and users.

2. **Sequential Workflow State Machine**:
   - Turn-based, sequential approval pipelines ($A \rightarrow B \rightarrow C \rightarrow D$).
   - Strict turn enforcement: only the designated active user (or their active authorized delegate) can act.
   - Four distinct workflow actions: **Approve / Forward**, **Reject** (mandatory reason), **Request Changes** (mandatory instructions), and **Discussion Comment**.
   - Completed memos become locked/read-only with immutable history.

3. **Memo Versioning & Revisions**:
   - When changes are requested by any reviewer, the memo is returned to the author.
   - Resubmission automatically snapshots a new version (v1, v2, v3...) along with author modification summaries.
   - Side-by-side / interactive revision viewer to inspect historical changes.

4. **Workflow Authority Delegation**:
   - Users can temporarily delegate approval and review authority to colleagues for custom date ranges.
   - Full non-repudiation audit trail identifying both the delegate and delegating officer (*"Acted by delegate [Name] on behalf of [Officer]"*).

5. **Official Letterhead & Client-Side PDF Export**:
   - Crisp institutional letterhead with logo, reference numbers, workflow metadata, and status stamps.
   - 1-click **Download Official PDF** for archiving and physical record keeping.

6. **In-App Notification Center**:
   - Real-time workflow notifications on action required, approvals, rejections, change requests, and comments with unread badges.

7. **Immutable Audit Trail & Analytics**:
   - Tamper-resistant audit log capturing all system activities, logins, and workflow transitions.
   - Executive reports tracking throughput, turnaround times, and departmental volume.

8. **Interactive Demo Persona Switcher**:
   - Top banner quick-switcher allowing evaluators to instantly switch between roles in both tenants in 1-click.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language**: TypeScript (Strict typing)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Lucide React Icons
- **Database & ORM**: SQLite with [Prisma ORM](https://www.prisma.io/) (Zero-configuration local setup)
- **Authentication & Security**: JWT session cookies (`jose`), bcrypt password hashing, and server-side RBAC + tenant isolation guards
- **PDF Generation**: HTML2Canvas & jsPDF

---

## 🚀 Quickstart & Installation Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher (tested on Node.js v24)
- **npm**: `v9.0.0` or higher

### 1. Clone or Extract Source Code
```bash
cd Cse_226_Project_03
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
A default `.env` file is already created:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="cse226-vibe-coding-secure-jwt-secret-key-2026-nsu"
NODE_ENV="development"
```

### 4. Initialize Database Schema & Seed Demo Data
```bash
npx prisma db push
node scripts/seed.js
```

### 5. Run the Local Development Server
```bash
npm run dev
```

The application will be live at: **http://localhost:3000**

---

## 👥 Demonstration Accounts Table

All demonstration accounts use the default password: **`password123`**

### Organization 1: North South University (`slug: "nsu"`)

| Name | Email | Designation | Role | Purpose in Demo |
| :--- | :--- | :--- | :--- | :--- |
| **Dr. M. Admin** | `admin@nsu.edu` | Director of IT & Org Admin | `ADMIN` | Department, user, category & audit log admin |
| **Prof. Atiqul Islam** | `vc@nsu.edu` | Vice Chancellor | `USER` | Final executive approver |
| **Prof. Dr. Rajesh Palit** | `dean.seps@nsu.edu` | Dean of SEPS | `USER` | High-level approver (delegated to Chair ECE) |
| **Dr. Shazzad Hossein** | `chair.ece@nsu.edu` | Chairperson, ECE | `USER` | First-line approver & active delegate for Dean |
| **Mr. Tanvir Ahmed** | `finance@nsu.edu` | Director of Finance | `USER` | Financial approver |
| **Alice Johnson** | `alice.ece@nsu.edu` | Assistant Professor, ECE | `USER` | Author of active Urgent GPU Requisition memo |
| **Dr. Robert Rahman** | `bob.cse@nsu.edu` | Associate Professor, CSE | `USER` | Author of Travel Grant memo with changes requested |

### Organization 2: Apex Global Technologies (`slug: "apex"`) *(Tenant Isolation Test)*

| Name | Email | Designation | Role | Purpose in Demo |
| :--- | :--- | :--- | :--- | :--- |
| **Sarah Connor** | `admin@apex.io` | VP of Operations | `ADMIN` | Apex tenant admin |
| **David Apex** | `ceo@apex.io` | Chief Executive Officer | `USER` | Apex executive |
| **Elena Rostova** | `vp.eng@apex.io` | VP of Engineering | `USER` | Engineering approver |
| **John Doe** | `john.doe@apex.io` | Staff Software Architect | `USER` | Apex memo author |

---

## 🧪 Demonstration Walkthrough Scenario (PRD Section 28)

1. **Step 1: Multi-Tenant Data Isolation**
   - Log in as `john.doe@apex.io` (Apex Global).
   - Notice that zero North South University memos, departments, or users are visible.
2. **Step 2: Review In-Progress Approval**
   - Click the top **"Switch Persona (Demo)"** button and switch to `finance@nsu.edu` (Director of Finance).
   - In the **Inbox**, open memo **`NSU-2026-0001`** (*AI & Robotics Lab GPU Cluster*).
   - Click **"Take Workflow Action"** $\rightarrow$ select **"Approve / Forward"** with comment *"Approved. Budget allocated."*
   - Notice the memo moves immediately to the next sequential step (Dean SEPS).
3. **Step 3: Test Delegation Authority**
   - Switch persona to `chair.ece@nsu.edu` (Dr. Shazzad Hossein).
   - Dr. Shazzad has active delegation from Dean Rajesh Palit.
   - Open memo **`NSU-2026-0001`** in his inbox $\rightarrow$ notice the badge: *"Acting as Delegate for: Prof. Dr. Rajesh Palit"*.
   - Approve on behalf of the Dean. Notice the timeline records the delegate action.
4. **Step 4: Final Approval & PDF Export**
   - Switch persona to `vc@nsu.edu` (Vice Chancellor).
   - Approve the final step. Memo is marked **Approved / Completed**.
   - Click **"Download Official PDF"** to generate the finalized document.
5. **Step 5: Change Request & Versioning Cycle**
   - Switch persona to `bob.cse@nsu.edu`.
   - Open memo **`NSU-2026-0002`** (Changes Requested).
   - Click **"Revise & Resubmit Memo"** $\rightarrow$ add requested session details and submit revision.
   - Observe **Version 2** created and the memo returned to the reviewer!

---

## 📜 Build & Production Commands

- **Build Application**: `npm run build`
- **Start Production Server**: `npm start`
- **Reset Database**: `npm run db:seed` or click **"Reset Demo Data"** in the sidebar.
