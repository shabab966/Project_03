23. Deployment Requirements
The completed application must be deployed and accessible through a publicly reachable URL.
Students shall provide:
Deployed System URL: [Insert URL]
The deployed system must be functional at the time of submission.
Students should provide appropriate demonstration accounts if the system requires authen
tication.
If administrator functionality is part of the demonstration, an administrator demonstration
account should also be provided.
Students are responsible for ensuring that the deployed application remains accessible for
evaluation.
24. Source Code Submission
Students shall submit a link to a ZIP archive containing the complete source code.
Source Code ZIP URL: [Insert URL]
The ZIP archive shall contain:
• Complete source code
• Configuration files required to run the application
• Database schema/migrations
• Seed/demo data where applicable
• Dependency definitions
• Environment-variable template
• Installation instructions
• Build instructions
• Run instructions
The ZIP archive must contain everything necessary for another developer to understand and
set up the system, except for secrets such as passwords, API keys, private keys, or production
credentials.
25. Installation and Setup Documentation
The submitted source code must include clear installation instructions.
The instructions shall describe:
1. Required software and versions.
2. How to install dependencies.
12
3. How to configure environment variables.
4. How to configure the database.
5. How to initialize the database.
6. How to create or seed demonstration data.
7. How to start the application locally.
8. How to build the application for production, where applicable.
9. Any external services required by the application.
10. Any additional configuration required to reproduce the deployed system.
An evaluator should be able to follow the instructions and run the application without
requiring undocumented steps.
26. Project Documentation Submission
In addition to the source code, students shall submit a document describing their implementa
tion.
The document shall include:
26.1. System Overview
A brief description of the implemented system and its major functionality.
26.2. Requirements Implemented
Identify which requirements from this specification have been implemented.
26.3. Technology Stack
Describe:
• Programming languages
• Frontend framework
• Backend framework
• Database
• Authentication mechanism
• Hosting/deployment platform
• External services
• AI/vibe-coding tools used
26.4. System Architecture
Provide a high-level description and preferably a diagram showing:
• Frontend
• Backend
• Database
• Authentication
• File storage
• External services
• Major system components
26.5. Database Design
Describe the main entities and relationships.
The documentation should explain how multi-tenancy is implemented.
13
26.6. Workflow Design
Explain how the sequential memo approval/review workflow is represented and implemented.
26.7. Security
Describe how the system handles:
• Authentication
• Authorization
• Tenant isolation
• File security
• Password security
• Other relevant security considerations
26.8. Vibe-Coding Process
Students shall describe how AI-assisted/vibe coding was used during development.
This should include:
• AI tools used
• How requirements were communicated to the AI
• How generated code was evaluated
• How errors were identified and corrected
• How the students verified that the generated system actually satisfied the requirements
26.9. Known Limitations
Students should identify functionality that was not implemented, known bugs, limitations, or
technical compromises.
26.10. Deployment Information
The document must include:
Live System: [Insert deployed-system URL]
Source Code ZIP: [Insert source-code ZIP URL]
Installation Instructions:
instructions.
Describe or provide the location of the installation
27. AI Prompt and Response History
Because this is a course on Vibe Coding, the use of AI during development must be documented
transparently.
Students shall submit the complete prompt and response history of their AI-assisted
development process.
This requirement applies to every AI coding assistant or AI system used substantially during
the development of the project.
The submission shall contain, as applicable:
• Every significant prompt provided by the student to an AI system.
• The corresponding AI-generated responses.
• Prompts used to generate application code.
14
• Prompts used to modify or refactor code.
• Prompts used to debug errors.
• Prompts used to diagnose deployment problems.
• Prompts used to design or modify the database.
• Prompts used to design the user interface.
• Prompts used to implement or modify authentication and authorization.
• Prompts used to implement the memo workflow.
• Prompts used to test or validate functionality.
• Subsequent prompts used to correct or improve AI-generated code.
The history should preserve the chronological order of the interaction.
The submission should make it possible to understand how the system evolved through the
interaction between the student and the AI system.
Where the AI tool provides a facility for exporting conversation history, students should
submit the exported conversation directly rather than manually rewriting it.
If multiple AI tools were used, the history from each tool shall be included.
The prompt and response history shall not be replaced by a summary. A summary of AI
usage may be included in the project documentation, but it does not satisfy the requirement to
submit the actual interaction history.
Students should not intentionally omit relevant AI interactions merely because those in
teractions produced incorrect, incomplete, or unusable code. Debugging, failed approaches,
corrections, and revisions are part of the development history and should be retained.
The prompt and response history may be submitted as one or more files, such as:
• PDF
• HTML
• Markdown
• Plain text
• Exported AI conversation format
The submitted history should be readable and clearly associated with the student or group
submitting the project.
Students must not include passwords, API keys, private keys, access tokens, or other con
fidential credentials in the submitted prompt and response history. If such information was
accidentally included in an AI interaction, the student should redact the secret while preserving
the surrounding interaction and clearly indicating that a credential has been redacted.
27.1. AI History Submission Location
The project documentation shall contain a link to the complete AI prompt and response history.
AI Prompt/Response History URL: [Insert URL]
The linked material must remain accessible for evaluation.
28. Demonstration Requirements
The deployed system should be capable of demonstrating at least the following scenario:
1. Create an organization.
2. Create multiple users belonging to that organization.
3. Create a memo.
4. Define a sequential workflow involving multiple users.
5. Submit the memo.
15
6. Log in as the first workflow participant.
7. Comment, approve, reject, or request changes.
8. Demonstrate the memo moving to the next participant.
9. Demonstrate the complete workflow history.
10. Demonstrate final approval or rejection.
11. Demonstrate notifications.
12. Demonstrate search and filtering.
13. Demonstrate administrative functionality.
14. Demonstrate that a user from another organization cannot access the memo.
The evaluator may use the deployed application to test functionality beyond the demonstra
tion scenario.
29. Submission Requirements
Each student or group shall submit the following before the deadline.
A. Deployed Application
A publicly accessible URL to the completed system.
URL: [Insert URL]
B. Project Documentation
A document describing:
• What was implemented
• How it was implemented
• Technology stack
• Architecture
• Database design
• Workflow design
• Security considerations
• Vibe-coding/AI-assisted development process
• Known limitations
C. Source Code
A link to a ZIP file containing:
• Complete source code
• Database schema/migrations
• Configuration files
• Dependency definitions
• Installation instructions
• Setup instructions
• Required supporting files
ZIP URL: [Insert URL]
16
D. AI Prompt and Response History
A link containing the complete prompt and response history from the AI systems used during
development.
AI History URL: [Insert URL]
E. Demonstration Credentials
Where authentication is required, students shall provide suitable demonstration credentials for
evaluating the application.
Production secrets must never be included in the submission document, source code archive,
or AI prompt/response history.
30. General Technical Expectations
Students are free to select their own technology stack.
There is no prescribed requirement regarding:
• Programming language
• Frontend framework
• Backend framework
• Database technology
• Cloud provider
• AI coding assistant
• Development environment
However, the final system must be functional, maintainable, reasonably secure, and demon
strably compliant with the requirements in this specification.
The use of AI coding assistants is expected as part of the course. However, students remain
responsible for understanding, testing, debugging, integrating, and validating the code produced
with AI assistance.
A system that merely presents a convincing user interface but does not correctly implement
the underlying functionality, data persistence, authorization, workflow, or tenant isolation will
not satisfy the requirements.
The submitted AI interaction history may be used to evaluate the student’s development
process, including how requirements were communicated, how AI generated solutions were eval
uated, and how problems were identified and resolved.
31. Submission Deadline
Midnight, 29 August 2026
All required submission links and documentation must be submitted by the stated deadline.
The deployed application must be accessible for evaluation, the submitted source-code
archive must be complete and accompanied by sufficient installation instructions, and the com
plete AI prompt and response history must be accessible through the submitted link