# Project Submission Package
## Inter-Office Memo Management System

- **Student Name**: Al Shabab
- **Student ID**: 2523255630
- **Course Code**: CSE226
- **Course Title**: Foundations of Vibe Coding
- **Institution**: North South University
- **Semester**: Summer 2026
- **Submission Deadline**: Midnight, 29 August 2026


---

## 1. Submission Links (As per Section 29)

| Requirement | Description | Submission Link |
|---|---|---|
| **A. Deployed Application URL** | Publicly accessible live deployment on Render (HTTPS) | **[https://inter-office-memo-system.onrender.com](https://inter-office-memo-system.onrender.com)** |
| **B. Project Documentation** | Comprehensive 26-section technical documentation & architecture report | **[`SYSTEM_DOCUMENTATION.md`](file:///c:/Users/assha/OneDrive/Desktop/Cse_226_Project_03/SYSTEM_DOCUMENTATION.md)** / [GitHub Documentation Link](https://github.com/shabab966/Project_03/blob/main/SYSTEM_DOCUMENTATION.md) |
| **C. Source Code Repository** | Complete Git repository with commit history and setup instructions | **[https://github.com/shabab966/Project_03](https://github.com/shabab966/Project_03)** |
| **C. Source Code ZIP URL** | Direct download link to complete source code archive | **[https://github.com/shabab966/Project_03/archive/refs/heads/main.zip](https://github.com/shabab966/Project_03/archive/refs/heads/main.zip)** *(Local archive also generated on Desktop)* |
| **D. AI Prompt & Response History** | Chronological record of vibe-coding prompts, responses, refactorings, and fixes | **[`AI_PROMPT_RESPONSE_HISTORY.md`](file:///c:/Users/assha/OneDrive/Desktop/Cse_226_Project_03/AI_PROMPT_RESPONSE_HISTORY.md)** / [GitHub AI History Link](https://github.com/shabab966/Project_03/blob/main/AI_PROMPT_RESPONSE_HISTORY.md) |

---

## 2. Demonstration Accounts & Credentials (As per Section 23 & 29.E)

All accounts share the default password: **`password123`**
*(Or use the 1-Click **"Switch Persona (Demo)"** menu in the top navigation bar of the live site)*

### Organization 1: North South University (`NSU`)

| Name | Email Address | Role | Department / Designation |
|---|---|---|---|
| **Dr. M. Admin** | `admin@nsu.edu` | **ADMIN** | Central Admin / Chief Information Officer |
| **Prof. Dr. A. VC** | `vc@nsu.edu` | USER | Executive Office / Vice Chancellor |
| **Prof. Dr. Rajesh Palit** | `dean.seps@nsu.edu` | USER | ECE Dept / Dean, SEPS |
| **Dr. Chair ECE** | `chair.ece@nsu.edu` | USER | ECE Dept / Department Chair |
| **Mr. Finance Director** | `director.finance@nsu.edu` | USER | Finance Office / Director of Finance |
| **Dr. Alice Faculty** | `alice.faculty@nsu.edu` | USER | CSE Dept / Associate Professor |
| **Dr. Bob Faculty** | `bob.faculty@nsu.edu` | USER | ECE Dept / Assistant Professor |

### Organization 2: Apex Global Tech (`APEX`) — *Tenant Isolation Proof*

| Name | Email Address | Role | Designation |
|---|---|---|---|
| **Sarah Admin** | `admin@apex.io` | **ADMIN** | Head of Operations |
| **David CEO** | `ceo@apex.io` | USER | Chief Executive Officer |
| **Elena VP** | `vp.eng@apex.io` | USER | VP of Engineering |
| **John Developer** | `john.doe@apex.io` | USER | Staff Software Architect |

### Organization 3: Dhaka General Hospital (`DGH`) — *Multi-Tenant Scalability Proof*

| Name | Email Address | Role | Designation |
|---|---|---|---|
| **Dr. Robert Admin** | `admin@dgh.org` | **ADMIN** | Medical Director & Chief Admin |
| **Dr. Emily Watson** | `surgeon@dgh.org` | USER | Chief of Surgery |
| **Dr. Kevin Vance** | `icu@dgh.org` | USER | Head of Critical Care Medicine |


---

## 3. Step-by-Step Evaluator Demonstration Scenario (As per Section 28)

Follow these steps on the live application to evaluate all 14 mandatory demonstration milestones:

1. **Log in as Author**:
   - Go to [https://inter-office-memo-system.onrender.com/login](https://inter-office-memo-system.onrender.com/login)
   - Click the **"Dr. Alice Faculty"** demo card (or enter `alice.faculty@nsu.edu` / `password123`).
2. **Create a Multi-Stage Memo**:
   - Click **"Create Office Memo"** in the sidebar.
   - Title: `Procurement of High-Performance GPU Cluster for Deep Learning Lab`.
   - Category: `Procurement` | Priority: `Urgent`.
   - Workflow: Select **"Procurement Request"** template (Chair ECE $\rightarrow$ Dean SEPS $\rightarrow$ Finance Director $\rightarrow$ Vice Chancellor).
   - Click **"Submit Office Memo"**.
3. **Step 1 Review (Chair ECE)**:
   - Click **"Switch Persona (Demo)"** in the top navbar $\rightarrow$ Select **"Dr. Chair ECE"**.
   - Navigate to **"Inbox (Action)"** $\rightarrow$ Open the submitted memo.
   - Click **"Approve & Forward"** with comment: *"Approved from departmental budget perspective."*
4. **Step 2 Change Request (Dean SEPS)**:
   - Switch persona to **"Prof. Dr. Rajesh Palit"** (Dean).
   - Open memo from Inbox $\rightarrow$ Click **"Request Changes"** with comment: *"Please specify exact model specifications (NVIDIA H100 vs A100)."*
   - Note the status changes to `CHANGES_REQUESTED` and returns to author.
5. **Revision & Resubmission (Author)**:
   - Switch persona back to **"Dr. Alice Faculty"**.
   - Go to **"Sent Memos"** $\rightarrow$ Open the memo $\rightarrow$ Click **"Edit & Resubmit"**.
   - Update body text with model details $\rightarrow$ Enter change summary: *"Updated to 4x NVIDIA H100 SXM5."* $\rightarrow$ Click **"Resubmit Memo"**.
   - Notice that **Version 2** is created and the timeline preserves Version 1 history.
6. **Final Approval Chain**:
   - Switch to **Dr. Chair ECE** $\rightarrow$ Approve.
   - Switch to **Prof. Dr. Rajesh Palit** $\rightarrow$ Approve.
   - Switch to **Mr. Finance Director** $\rightarrow$ Approve.
   - Switch to **Prof. Dr. A. VC** $\rightarrow$ Final **Approve**.
   - Note that status is now `APPROVED` with official completion timestamp and read-only mode.
7. **Delegation Demonstration**:
   - Switch to **Prof. Dr. Rajesh Palit** $\rightarrow$ Navigate to **"Delegations"**.
   - Create a delegation granting authority to **"Dr. Bob Faculty"** for the next 7 days.
   - Switch to **Dr. Bob Faculty** $\rightarrow$ Note the navbar banner: *"Acting as Delegate for: Prof. Dr. Rajesh Palit"*.
8. **Tenant Isolation Verification**:
   - Switch persona to **"David CEO"** (Apex Global Tech).
   - Check Dashboard, Inbox, Sent, Search, and Audit Logs $\rightarrow$ Confirm **0 items** from North South University are visible.

---

## 4. Local Setup Instructions (As per Section 25)

```bash
# 1. Clone repository
git clone https://github.com/shabab966/Project_03.git
cd Project_03

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local

# 4. Generate Prisma client & initialize database
npx prisma generate
npx prisma db push
node scripts/seed.js

# 5. Start development server
npm run dev
# Open http://localhost:3000
```

---

## 5. The Vibe-Coding Process (As per Section 26.8)

### 5.1 AI Tools & Environment
The system was engineered using **Google Antigravity** (powered by Gemini 2.5 Pro and Claude 3.5 Sonnet) operating directly as an autonomous pair-programmer with terminal, filesystem, and code execution tools.

### 5.2 Requirement Communication & Step-by-Step Prompting
Development was executed through structured architectural prompts rather than monolithic generations:
1. **Schema & Multi-Tenant Scoping**: Designed Prisma data models with mandatory `organizationId` keys across all entities.
2. **Deterministic State Machine**: Engineered sequential step transitions ($A \rightarrow B \rightarrow C \rightarrow D$) with turn-based server validation.
3. **Dual-Datasource Database Portability**: Created `scripts/prepare-db.js` to automatically detect environment and switch between local SQLite (`dev.db`) and Render PostgreSQL (`DATABASE_URL`).
4. **Email Authentication & Sandbox Fallback**: Integrated Resend API with direct activation links for offline evaluation.

### 5.3 Error Diagnosis & AI-Assisted Debugging
- **Prisma Datasource Protocol Mismatch**: Fixed runtime error where local SQLite received `postgresql://` validation by building an automatic pre-build datasource switcher.
- **Mobile Responsive Drawer Layout**: Diagnosed viewport squishing on mobile screens and rebuilt `Sidebar.tsx` into a responsive slide-over drawer with backdrop blur.
- **Resend Sandbox 403 Delivery Constraint**: Handled sandbox mode restrictions by adding 1-click direct activation and password-reset link cards in the UI.

### 5.4 Verification & Validation
- Automated full-stack static page compilation (`npm run build`).
- Automated database migrations and multi-tenant seeding (`node scripts/seed.js`).
- Complete live end-to-end evaluation scenario walkthrough on Render.

---

## 6. Known Limitations & Technical Compromises (As per Section 26.9)

1. **Email Delivery in Free Sandbox Mode**: Outbound emails via Resend free tier are restricted to the registered developer address (`tshabab26@gmail.com`). To accommodate academic evaluation accounts (`@nsu.edu`), the UI displays instant copyable activation and password-reset links.
2. **Ephemeral Disk Storage on Free Cloud Dynos**: File attachments are stored locally under `/public/uploads/{orgId}/`. On Render's free tier, local disk files reset when the dyno spins down after 15 minutes of inactivity (Recommended production upgrade: Amazon S3 / Cloudflare R2).
3. **HTTP State Refresh vs. WebSockets**: Notifications and inbox counts update via route navigation and API refetches rather than persistent WebSocket connections to preserve zero-cost serverless compatibility.
4. **Single Active Proxy Delegation**: A user can designate one active delegate per date window. Nested or multi-hop delegations ($A \rightarrow B \rightarrow C$) are restricted to prevent circular authorization loops.

