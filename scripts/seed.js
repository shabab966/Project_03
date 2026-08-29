const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const force = process.argv.includes('--force') || process.env.FORCE_SEED === 'true';

async function main() {
  console.log('🌱 Starting comprehensive database seed for Inter-Office Memo Management System...');

  const orgCount = await prisma.organization.count();
  if (orgCount > 0 && !force) {
    console.log(`✅ Database already contains ${orgCount} organization(s). Skipping automatic re-seed to preserve user data.`);
    return;
  }

  console.log('🔄 Seeding / resetting database tables...');

  // Clear existing database records
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.delegation.deleteMany();
  await prisma.memoAttachment.deleteMany();
  await prisma.memoComment.deleteMany();
  await prisma.workflowStep.deleteMany();
  await prisma.memoVersion.deleteMany();
  await prisma.memo.deleteMany();
  await prisma.workflowTemplate.deleteMany();
  await prisma.memoCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.organization.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('password123', 10);


  // ==========================================
  // ORGANIZATION 1: North South University (NSU)
  // ==========================================
  console.log('Creating Organization 1: North South University (NSU)...');
  const nsuOrg = await prisma.organization.create({
    data: {
      name: 'North South University',
      slug: 'nsu',
      logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=128&auto=format&fit=crop&q=80',
      contactEmail: 'contact@northsouth.edu',
      contactPhone: '+880-2-55668200',
      address: 'Plot 15, Block B, Bashundhara R/A, Dhaka-1229, Bangladesh',
      settingsJson: JSON.stringify({
        currency: 'BDT',
        fiscalYear: '2026-2027',
        allowDelegation: true,
        strictSequentialWorkflow: true,
      }),
    },
  });

  // Departments for NSU
  const eceDept = await prisma.department.create({
    data: {
      organizationId: nsuOrg.id,
      name: 'Electrical & Computer Engineering',
      code: 'ECE',
      description: 'Department of Electrical and Computer Engineering',
    },
  });

  const cseDept = await prisma.department.create({
    data: {
      organizationId: nsuOrg.id,
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Department of Computer Science and Engineering',
    },
  });

  const finDept = await prisma.department.create({
    data: {
      organizationId: nsuOrg.id,
      name: 'Finance & Accounts Office',
      code: 'FIN',
      description: 'Central Financial Management and Procurement Services',
    },
  });

  const regDept = await prisma.department.create({
    data: {
      organizationId: nsuOrg.id,
      name: 'Office of the Registrar',
      code: 'REG',
      description: 'Academic records, governance, and regulatory office',
    },
  });

  const execDept = await prisma.department.create({
    data: {
      organizationId: nsuOrg.id,
      name: 'Office of the Vice Chancellor',
      code: 'EXEC',
      description: 'Executive leadership and chancellor office',
    },
  });

  // Users for NSU
  const nsuAdmin = await prisma.user.create({
    data: {
      organizationId: nsuOrg.id,
      departmentId: eceDept.id,
      name: 'Dr. M. Admin',
      email: 'admin@nsu.edu',
      passwordHash: defaultPasswordHash,
      designation: 'Director of IT & System Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const nsuVC = await prisma.user.create({
    data: {
      organizationId: nsuOrg.id,
      departmentId: execDept.id,
      name: 'Prof. Atiqul Islam',
      email: 'vc@nsu.edu',
      passwordHash: defaultPasswordHash,
      designation: 'Vice Chancellor',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  const nsuDean = await prisma.user.create({
    data: {
      organizationId: nsuOrg.id,
      departmentId: eceDept.id,
      name: 'Prof. Dr. Rajesh Palit',
      email: 'dean.seps@nsu.edu',
      passwordHash: defaultPasswordHash,
      designation: 'Dean, School of Engineering & Physical Sciences',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  const nsuChairECE = await prisma.user.create({
    data: {
      organizationId: nsuOrg.id,
      departmentId: eceDept.id,
      name: 'Dr. Shazzad Hossein',
      email: 'chair.ece@nsu.edu',
      passwordHash: defaultPasswordHash,
      designation: 'Chairperson, Department of ECE',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  const nsuFinanceDirector = await prisma.user.create({
    data: {
      organizationId: nsuOrg.id,
      departmentId: finDept.id,
      name: 'Mr. Tanvir Ahmed',
      email: 'finance@nsu.edu',
      passwordHash: defaultPasswordHash,
      designation: 'Director of Finance & Procurement',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  const nsuFacultyAlice = await prisma.user.create({
    data: {
      organizationId: nsuOrg.id,
      departmentId: eceDept.id,
      name: 'Alice Johnson',
      email: 'alice.ece@nsu.edu',
      passwordHash: defaultPasswordHash,
      designation: 'Assistant Professor of ECE',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  const nsuFacultyBob = await prisma.user.create({
    data: {
      organizationId: nsuOrg.id,
      departmentId: cseDept.id,
      name: 'Dr. Robert Rahman',
      email: 'bob.cse@nsu.edu',
      passwordHash: defaultPasswordHash,
      designation: 'Associate Professor of CSE',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const nsuFacultyShabab = await prisma.user.create({
    data: {
      organizationId: nsuOrg.id,
      departmentId: cseDept.id,
      name: 'Shabab (Real Email Verified)',
      email: 'tshabab26@gmail.com',
      passwordHash: defaultPasswordHash,
      designation: 'Senior Lecturer of CSE',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });


  // NSU Memo Categories
  const catProcurement = await prisma.memoCategory.create({
    data: {
      organizationId: nsuOrg.id,
      name: 'Procurement & Lab Equipment',
      description: 'Procurement of laboratory items, research computing hardware, and equipment.',
    },
  });

  const catAcademic = await prisma.memoCategory.create({
    data: {
      organizationId: nsuOrg.id,
      name: 'Academic Affairs & Curriculum',
      description: 'Course syllabi, curriculum modernization, and academic scheduling.',
    },
  });

  const catFinancial = await prisma.memoCategory.create({
    data: {
      organizationId: nsuOrg.id,
      name: 'Financial & Budgetary',
      description: 'Budget allocations, research grants, reimbursements, and funds.',
    },
  });

  const catHR = await prisma.memoCategory.create({
    data: {
      organizationId: nsuOrg.id,
      name: 'HR & Faculty Affairs',
      description: 'Leaves, conference sponsorships, duty travels, and staffing.',
    },
  });

  const catAdmin = await prisma.memoCategory.create({
    data: {
      organizationId: nsuOrg.id,
      name: 'Administrative & Governance',
      description: 'Official policies, university notices, and executive decisions.',
    },
  });

  // NSU Workflow Templates
  await prisma.workflowTemplate.create({
    data: {
      organizationId: nsuOrg.id,
      name: 'Lab Equipment / Purchase Requisition',
      description: 'Standard 4-step sequential approval for research equipment and procurement.',
      stepsJson: JSON.stringify([
        { stepOrder: 0, title: 'Department Chairperson', stepType: 'APPROVAL', defaultRole: 'CHAIR' },
        { stepOrder: 1, title: 'Director of Finance', stepType: 'APPROVAL', defaultRole: 'FINANCE' },
        { stepOrder: 2, title: 'Dean of School', stepType: 'APPROVAL', defaultRole: 'DEAN' },
        { stepOrder: 3, title: 'Vice Chancellor', stepType: 'APPROVAL', defaultRole: 'VC' },
      ]),
    },
  });

  await prisma.workflowTemplate.create({
    data: {
      organizationId: nsuOrg.id,
      name: 'Faculty Duty Travel & Leave Approval',
      description: 'Approval pipeline for international conference travels and special leaves.',
      stepsJson: JSON.stringify([
        { stepOrder: 0, title: 'Department Chairperson', stepType: 'APPROVAL', defaultRole: 'CHAIR' },
        { stepOrder: 1, title: 'Dean of School', stepType: 'APPROVAL', defaultRole: 'DEAN' },
        { stepOrder: 2, title: 'Office of the Registrar', stepType: 'APPROVAL', defaultRole: 'REGISTRAR' },
      ]),
    },
  });

  // Active Delegation in NSU: Dean delegates to Chair ECE
  const now = new Date();
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.delegation.create({
    data: {
      organizationId: nsuOrg.id,
      delegatorId: nsuDean.id,
      delegateId: nsuChairECE.id,
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // active since yesterday
      endDate: nextMonth,
      reason: 'Attending IEEE Global Academic Summit & International Research Delegation',
      isActive: true,
    },
  });

  // NSU Sample Memo 1: In-Progress Approval (Currently at Finance Director)
  const memo1 = await prisma.memo.create({
    data: {
      organizationId: nsuOrg.id,
      referenceNumber: 'NSU-2026-0001',
      title: 'Requisition for AI & Robotics Research Lab High-Performance GPU Cluster',
      body: `Dear Authorities,\n\nWe urgently request approval for the acquisition of 4x NVIDIA RTX 6000 Ada Generation GPU workstations for the ECE Graduate AI & Deep Learning Research Facility (Room SAC-402).\n\nKey Highlights:\n1. 4x NVIDIA Workstations with 48GB VRAM each.\n2. Total Estimated Budget: BDT 4,200,000 (Funded by Sub-Project Research Fund).\n3. Essential for upcoming graduate thesis completions and Summer 2026 capstone projects.\n\nQuotations from three certified vendors have been attached for financial evaluation.\n\nThank you.\n\nSincerely,\nAlice Johnson\nAssistant Professor, ECE`,
      richTextHtml: `<p>Dear Authorities,</p><p>We urgently request approval for the acquisition of <strong>4x NVIDIA RTX 6000 Ada Generation GPU workstations</strong> for the ECE Graduate AI &amp; Deep Learning Research Facility (Room SAC-402).</p><p><strong>Key Highlights:</strong></p><ul><li>4x High-Performance Workstations with 48GB VRAM each.</li><li>Total Estimated Budget: <strong>BDT 4,200,000</strong> (Allocated under University Research Grant).</li><li>Essential for upcoming graduate thesis and Summer 2026 capstone projects.</li></ul><p>Quotations from three certified local vendors have been attached for review.</p>`,
      authorId: nsuFacultyAlice.id,
      departmentId: eceDept.id,
      categoryId: catProcurement.id,
      priority: 'URGENT',
      status: 'PENDING_APPROVAL',
      currentStepIndex: 1, // Step 1 is Finance Director
      currentAssigneeId: nsuFinanceDirector.id,
      submittedAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
    },
  });

  await prisma.memoVersion.create({
    data: {
      memoId: memo1.id,
      versionNumber: 1,
      title: memo1.title,
      body: memo1.body,
      richTextHtml: memo1.richTextHtml,
      authorId: memo1.authorId,
      changeSummary: 'Initial Memo Submission',
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
    },
  });

  // Step 0: Chair ECE (Approved)
  await prisma.workflowStep.create({
    data: {
      memoId: memo1.id,
      stepOrder: 0,
      stepType: 'APPROVAL',
      assignedUserId: nsuChairECE.id,
      status: 'APPROVED',
      actionTaken: 'APPROVED',
      actionTimestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      comments: 'Strongly endorsed. The GPU computing infrastructure is urgently needed for ECE research publications.',
    },
  });

  // Step 1: Finance Director (In Progress)
  await prisma.workflowStep.create({
    data: {
      memoId: memo1.id,
      stepOrder: 1,
      stepType: 'APPROVAL',
      assignedUserId: nsuFinanceDirector.id,
      status: 'IN_PROGRESS',
    },
  });

  // Step 2: Dean SEPS (Pending)
  await prisma.workflowStep.create({
    data: {
      memoId: memo1.id,
      stepOrder: 2,
      stepType: 'APPROVAL',
      assignedUserId: nsuDean.id,
      status: 'PENDING',
    },
  });

  // Step 3: VC (Pending)
  await prisma.workflowStep.create({
    data: {
      memoId: memo1.id,
      stepOrder: 3,
      stepType: 'APPROVAL',
      assignedUserId: nsuVC.id,
      status: 'PENDING',
    },
  });

  await prisma.memoComment.create({
    data: {
      memoId: memo1.id,
      authorId: nsuChairECE.id,
      type: 'APPROVAL',
      content: '[Approved] Strongly endorsed. The GPU computing infrastructure is urgently needed for ECE research publications.',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  });

  // Notifications for Memo 1
  await prisma.notification.create({
    data: {
      organizationId: nsuOrg.id,
      userId: nsuFinanceDirector.id,
      memoId: memo1.id,
      title: 'Action Required: Urgent Memo Awaiting Your Approval',
      message: `Memo "${memo1.title}" (${memo1.referenceNumber}) has been approved by Dr. Shazzad Hossein and requires your financial approval.`,
      type: 'ACTION_REQUIRED',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  });

  // NSU Sample Memo 2: Changes Requested
  const memo2 = await prisma.memo.create({
    data: {
      organizationId: nsuOrg.id,
      referenceNumber: 'NSU-2026-0002',
      title: 'Duty Travel & Sponsorship Request for IEEE INFOCOM 2026 Conference',
      body: `Respected Authorities,\n\nI have been invited to present our peer-reviewed paper titled "Decentralized Multi-Tenant Workflows in Heterogeneous Networks" at IEEE INFOCOM 2026.\n\nI request duty leave from September 10 to September 18, 2026, and partial travel grant sponsorship of BDT 180,000.\n\nAttached please find the acceptance notice.`,
      authorId: nsuFacultyBob.id,
      departmentId: cseDept.id,
      categoryId: catHR.id,
      priority: 'HIGH',
      status: 'CHANGES_REQUESTED',
      currentStepIndex: 0,
      currentAssigneeId: nsuFacultyBob.id, // assigned back to author
      submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
  });

  await prisma.memoVersion.create({
    data: {
      memoId: memo2.id,
      versionNumber: 1,
      title: memo2.title,
      body: memo2.body,
      authorId: memo2.authorId,
      changeSummary: 'Initial Request',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
  });

  await prisma.workflowStep.create({
    data: {
      memoId: memo2.id,
      stepOrder: 0,
      stepType: 'APPROVAL',
      assignedUserId: nsuChairECE.id,
      status: 'CHANGES_REQUESTED',
      actionTaken: 'CHANGES_REQUESTED',
      actionTimestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      comments: 'Please attach the official IEEE presentation session schedule and breakdown of flight quotation.',
    },
  });

  await prisma.workflowStep.create({
    data: {
      memoId: memo2.id,
      stepOrder: 1,
      stepType: 'APPROVAL',
      assignedUserId: nsuDean.id,
      status: 'PENDING',
    },
  });

  await prisma.memoComment.create({
    data: {
      memoId: memo2.id,
      authorId: nsuChairECE.id,
      type: 'CHANGES_REQUESTED',
      content: '[Changes Requested] Please attach the official IEEE presentation session schedule and breakdown of flight quotation.',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  });

  await prisma.notification.create({
    data: {
      organizationId: nsuOrg.id,
      userId: nsuFacultyBob.id,
      memoId: memo2.id,
      title: 'Changes Requested on Your Memo',
      message: `Dr. Shazzad Hossein requested changes on "${memo2.title}": Please attach the official IEEE presentation schedule.`,
      type: 'CHANGES_REQUESTED',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  });

  // NSU Sample Memo 3: Fully Approved & Completed
  const memo3 = await prisma.memo.create({
    data: {
      organizationId: nsuOrg.id,
      referenceNumber: 'NSU-2026-0003',
      title: 'Approval of ECE Curriculum Modernization & Generative AI Lab Modules for 2026-2027',
      body: `To: Academic Council & Executive Committee\nFrom: Department of ECE\nSubject: Curriculum Modernization\n\nThe Curriculum Committee has completed the comprehensive modernization of undergraduate elective modules for 2026-2027, integrating modern AI engineering and vibe coding methodologies.\n\nAll syllabus blueprints have been reviewed and approved by the academic sub-committee.`,
      richTextHtml: `<h3>Executive Memo: Curriculum Modernization</h3><p>The Curriculum Committee has successfully revised the undergraduate coursework for 2026-2027, adding modern AI engineering, hands-on LLM system design, and verified vibe coding principles.</p><p>We formally record the completion and ratification of this curriculum.</p>`,
      authorId: nsuChairECE.id,
      departmentId: eceDept.id,
      categoryId: catAcademic.id,
      priority: 'NORMAL',
      status: 'APPROVED',
      currentStepIndex: 2,
      currentAssigneeId: null,
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.memoVersion.create({
    data: {
      memoId: memo3.id,
      versionNumber: 1,
      title: memo3.title,
      body: memo3.body,
      richTextHtml: memo3.richTextHtml,
      authorId: memo3.authorId,
      changeSummary: 'Finalized Curriculum Draft',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.workflowStep.create({
    data: {
      memoId: memo3.id,
      stepOrder: 0,
      stepType: 'APPROVAL',
      assignedUserId: nsuDean.id,
      status: 'APPROVED',
      actionTaken: 'APPROVED',
      actionTimestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      comments: 'Recommended for adoption. Excellent modernization of foundational content.',
    },
  });

  await prisma.workflowStep.create({
    data: {
      memoId: memo3.id,
      stepOrder: 1,
      stepType: 'APPROVAL',
      assignedUserId: nsuVC.id,
      status: 'APPROVED',
      actionTaken: 'APPROVED',
      actionTimestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      comments: 'Approved. Proceed with Academic Council formal notification.',
    },
  });

  await prisma.memoComment.create({
    data: {
      memoId: memo3.id,
      authorId: nsuDean.id,
      type: 'APPROVAL',
      content: '[Approved] Recommended for adoption. Excellent modernization of foundational content.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.memoComment.create({
    data: {
      memoId: memo3.id,
      authorId: nsuVC.id,
      type: 'APPROVAL',
      content: '[Approved] Approved. Proceed with Academic Council formal notification.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // NSU Sample Memo 4: Draft Memo
  await prisma.memo.create({
    data: {
      organizationId: nsuOrg.id,
      referenceNumber: 'NSU-2026-0004',
      title: 'Server Room UPS Battery Bank Replacement & Emergency Power Backup',
      body: 'Draft proposal for periodic battery replacement of the main datacenter 40kVA UPS bank.',
      authorId: nsuAdmin.id,
      departmentId: eceDept.id,
      categoryId: catAdmin.id,
      priority: 'HIGH',
      status: 'DRAFT',
      currentStepIndex: 0,
    },
  });

  // NSU Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        organizationId: nsuOrg.id,
        userId: nsuFacultyAlice.id,
        action: 'MEMO_CREATED',
        entityType: 'MEMO',
        entityId: memo1.id,
        detailsJson: JSON.stringify({ referenceNumber: memo1.referenceNumber, priority: memo1.priority }),
        createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
      },
      {
        organizationId: nsuOrg.id,
        userId: nsuChairECE.id,
        action: 'WORKFLOW_APPROVED',
        entityType: 'MEMO',
        entityId: memo1.id,
        detailsJson: JSON.stringify({ step: 1, action: 'APPROVED', user: 'Dr. Shazzad Hossein' }),
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        organizationId: nsuOrg.id,
        userId: nsuDean.id,
        action: 'DELEGATION_CREATED',
        entityType: 'DELEGATION',
        detailsJson: JSON.stringify({ delegate: 'Dr. Shazzad Hossein', duration: '30 Days' }),
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        organizationId: nsuOrg.id,
        userId: nsuVC.id,
        action: 'WORKFLOW_APPROVED',
        entityType: 'MEMO',
        entityId: memo3.id,
        detailsJson: JSON.stringify({ step: 2, action: 'FINAL_APPROVAL', completed: true }),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // ==========================================
  // ORGANIZATION 2: Apex Global Technologies (Tenant Isolation Verification)
  // ==========================================
  console.log('Creating Organization 2: Apex Global Technologies (Tenant Isolation)...');
  const apexOrg = await prisma.organization.create({
    data: {
      name: 'Apex Global Technologies',
      slug: 'apex',
      logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80',
      contactEmail: 'security@apexglobal.tech',
      contactPhone: '+1-415-555-0199',
      address: '500 Howard Street, San Francisco, CA 94105, USA',
      settingsJson: JSON.stringify({
        currency: 'USD',
        fiscalYear: '2026',
        allowDelegation: true,
      }),
    },
  });

  const apexEngDept = await prisma.department.create({
    data: {
      organizationId: apexOrg.id,
      name: 'Core Engineering & Cloud Infra',
      code: 'ENG',
      description: 'Distributed systems, backend services, and cloud infra',
    },
  });

  const apexFinDept = await prisma.department.create({
    data: {
      organizationId: apexOrg.id,
      name: 'Corporate Finance & Ops',
      code: 'FIN',
      description: 'Corporate finance and operations',
    },
  });

  const apexAdmin = await prisma.user.create({
    data: {
      organizationId: apexOrg.id,
      departmentId: apexEngDept.id,
      name: 'Sarah Connor',
      email: 'admin@apex.io',
      passwordHash: defaultPasswordHash,
      designation: 'VP of Operations & Org Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const apexCEO = await prisma.user.create({
    data: {
      organizationId: apexOrg.id,
      departmentId: apexEngDept.id,
      name: 'David Apex',
      email: 'ceo@apex.io',
      passwordHash: defaultPasswordHash,
      designation: 'Chief Executive Officer',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  const apexVPEng = await prisma.user.create({
    data: {
      organizationId: apexOrg.id,
      departmentId: apexEngDept.id,
      name: 'Elena Rostova',
      email: 'vp.eng@apex.io',
      passwordHash: defaultPasswordHash,
      designation: 'VP of Engineering',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  const apexDev = await prisma.user.create({
    data: {
      organizationId: apexOrg.id,
      departmentId: apexEngDept.id,
      name: 'John Doe',
      email: 'john.doe@apex.io',
      passwordHash: defaultPasswordHash,
      designation: 'Staff Software Architect',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  const apexCatCloud = await prisma.memoCategory.create({
    data: {
      organizationId: apexOrg.id,
      name: 'Cloud Infrastructure & Architecture',
      description: 'Architecture decision records and cloud budget changes.',
    },
  });

  // Apex Memo 1 (Isolated to Apex tenant)
  const apexMemo1 = await prisma.memo.create({
    data: {
      organizationId: apexOrg.id,
      referenceNumber: 'APEX-2026-1001',
      title: 'Architectural Approval for Kubernetes Multi-Region Disaster Recovery Cluster',
      body: 'Proposal to deploy active-passive failover cluster across AWS us-east-1 and us-west-2.',
      authorId: apexDev.id,
      departmentId: apexEngDept.id,
      categoryId: apexCatCloud.id,
      priority: 'HIGH',
      status: 'PENDING_APPROVAL',
      currentStepIndex: 0,
      currentAssigneeId: apexVPEng.id,
      submittedAt: new Date(),
    },
  });

  await prisma.memoVersion.create({
    data: {
      memoId: apexMemo1.id,
      versionNumber: 1,
      title: apexMemo1.title,
      body: apexMemo1.body,
      authorId: apexDev.id,
      changeSummary: 'Initial proposal',
    },
  });

  await prisma.workflowStep.create({
    data: {
      memoId: apexMemo1.id,
      stepOrder: 0,
      stepType: 'APPROVAL',
      assignedUserId: apexVPEng.id,
      status: 'IN_PROGRESS',
    },
  });

  await prisma.workflowStep.create({
    data: {
      memoId: apexMemo1.id,
      stepOrder: 1,
      stepType: 'APPROVAL',
      assignedUserId: apexCEO.id,
      status: 'PENDING',
    },
  });

  // ==========================================
  // ORGANIZATION 3: Dhaka General Hospital (DGH)
  // ==========================================
  console.log('Creating Organization 3: Dhaka General Hospital (DGH)...');
  const dghOrg = await prisma.organization.create({
    data: {
      name: 'Dhaka General Hospital',
      slug: 'dgh',
      logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=128&auto=format&fit=crop&q=80',
      contactEmail: 'contact@dgh-hospital.org',
      contactPhone: '+880-2-9876543',
      address: 'Plot 12, Gulshan-2, Dhaka-1212, Bangladesh',
      settingsJson: JSON.stringify({
        currency: 'BDT',
        fiscalYear: '2026-2027',
        allowDelegation: true,
        strictSequentialWorkflow: true,
      }),
    },
  });

  const dghSurgeryDept = await prisma.department.create({
    data: {
      organizationId: dghOrg.id,
      name: 'Department of Surgery & OT',
      code: 'SURG',
      description: 'Surgical suites, operating theaters, and surgical patient care',
    },
  });

  const dghICUDept = await prisma.department.create({
    data: {
      organizationId: dghOrg.id,
      name: 'Emergency & Critical Care ICU',
      code: 'ICU',
      description: 'Intensive care, trauma resuscitation, and critical life support',
    },
  });

  const dghAdmin = await prisma.user.create({
    data: {
      organizationId: dghOrg.id,
      departmentId: dghSurgeryDept.id,
      name: 'Dr. Robert Admin',
      email: 'admin@dgh.org',
      passwordHash: defaultPasswordHash,
      designation: 'Medical Director & Chief Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const dghSurgeon = await prisma.user.create({
    data: {
      organizationId: dghOrg.id,
      departmentId: dghSurgeryDept.id,
      name: 'Dr. Emily Watson',
      email: 'surgeon@dgh.org',
      passwordHash: defaultPasswordHash,
      designation: 'Chief of Surgery',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const dghICULead = await prisma.user.create({
    data: {
      organizationId: dghOrg.id,
      departmentId: dghICUDept.id,
      name: 'Dr. Kevin Vance',
      email: 'icu@dgh.org',
      passwordHash: defaultPasswordHash,
      designation: 'Head of Critical Care Medicine',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const dghCatEmergency = await prisma.memoCategory.create({
    data: {
      organizationId: dghOrg.id,
      name: 'Critical Medical Requisition',
      description: 'Life-saving medical equipment, ICU supplies, and emergency pharmaceuticals',
    },
  });

  // DGH Demo Memo (Isolated to DGH tenant)
  const dghMemo1 = await prisma.memo.create({
    data: {
      organizationId: dghOrg.id,
      referenceNumber: 'DGH-2026-3001',
      title: 'Emergency Procurement of 5x Advanced High-Flow ICU Ventilators',
      body: 'Urgent requisition to upgrade Critical Care ICU ventilator capacity ahead of seasonal respiratory admission surge.',
      authorId: dghICULead.id,
      departmentId: dghICUDept.id,
      categoryId: dghCatEmergency.id,
      priority: 'URGENT',
      status: 'PENDING_APPROVAL',
      currentStepIndex: 0,
      currentAssigneeId: dghSurgeon.id,
      submittedAt: new Date(),
    },
  });

  await prisma.memoVersion.create({
    data: {
      memoId: dghMemo1.id,
      versionNumber: 1,
      title: dghMemo1.title,
      body: dghMemo1.body,
      authorId: dghICULead.id,
      changeSummary: 'Emergency ICU Requisition',
    },
  });

  await prisma.workflowStep.create({
    data: {
      memoId: dghMemo1.id,
      stepOrder: 0,
      stepType: 'APPROVAL',
      assignedUserId: dghSurgeon.id,
      status: 'IN_PROGRESS',
    },
  });

  await prisma.workflowStep.create({
    data: {
      memoId: dghMemo1.id,
      stepOrder: 1,
      stepType: 'APPROVAL',
      assignedUserId: dghAdmin.id,
      status: 'PENDING',
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('=============================================');
  console.log('DEMO ACCOUNTS READY (Password: "password123"):');
  console.log('🏢 Organization 1: North South University (nsu)');
  console.log('  • Admin: admin@nsu.edu');
  console.log('  • Vice Chancellor: vc@nsu.edu');
  console.log('  • Dean SEPS: dean.seps@nsu.edu');
  console.log('  • Chair ECE: chair.ece@nsu.edu');
  console.log('  • Finance Director: finance@nsu.edu');
  console.log('  • Faculty ECE: alice.ece@nsu.edu');
  console.log('  • Faculty CSE: bob.cse@nsu.edu');
  console.log('🏢 Organization 2: Apex Global Technologies (apex)');
  console.log('  • Admin: admin@apex.io');
  console.log('  • CEO: ceo@apex.io');
  console.log('  • VP Engineering: vp.eng@apex.io');
  console.log('  • Staff Dev: john.doe@apex.io');
  console.log('🏢 Organization 3: Dhaka General Hospital (dgh)');
  console.log('  • Admin: admin@dgh.org');
  console.log('  • Chief of Surgery: surgeon@dgh.org');
  console.log('  • ICU Head: icu@dgh.org');
  console.log('=============================================');

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
