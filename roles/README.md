# Metacortex Team Roles Documentation

This directory contains detailed role specifications for all team members involved in developing, launching, and maintaining the Metacortex product. Each role is designed to be mutually exclusive in core responsibilities while defining clear collaboration points.

## 📋 Role Categories

### Leadership & Management
- [01-project-manager.md](01-project-manager.md) - Project coordination and stakeholder management
- [02-tech-lead.md](02-tech-lead.md) - Technical leadership and architecture guidance

### Product & Design
- [03-product-designer.md](03-product-designer.md) - UX/UI design and user research

### Engineering
- [04-frontend-engineer.md](04-frontend-engineer.md) - React web application development
- [05-backend-engineer.md](05-backend-engineer.md) - FastAPI and server-side development
- [06-devops-engineer.md](06-devops-engineer.md) - Infrastructure and deployment
- [07-qa-engineer.md](07-qa-engineer.md) - Quality assurance and testing
- [08-database-administrator.md](08-database-administrator.md) - Database optimization and management
- [09-mobile-engineer.md](09-mobile-engineer.md) - React Native mobile development
- [10-security-engineer.md](10-security-engineer.md) - Security architecture and compliance

### Data & AI
- [11-data-engineer.md](11-data-engineer.md) - Data pipelines and ETL
- [12-ai-ml-engineer.md](12-ai-ml-engineer.md) - AI/ML features and integrations
- [16-data-analyst.md](16-data-analyst.md) - Analytics and insights

### Operations & Support
- [13-technical-writer.md](13-technical-writer.md) - Documentation and guides
- [14-customer-success-manager.md](14-customer-success-manager.md) - User support and success
- [17-community-manager.md](17-community-manager.md) - Community engagement

### Business & Growth
- [15-marketing-manager.md](15-marketing-manager.md) - Marketing and growth
- [18-sales-engineer.md](18-sales-engineer.md) - Technical sales support

### Infrastructure & Compliance
- [19-compliance-officer.md](19-compliance-officer.md) - Regulatory compliance
- [20-infrastructure-architect.md](20-infrastructure-architect.md) - System architecture

## 🎯 Using These Role Guidelines

### For Claude Code Agents

When working with a Claude Code agent in a specific role:

1. **Specify the role** you want the agent to assume (e.g., "Act as a Backend Engineer")
2. The agent will follow the **guidelines and constraints** defined for that role
3. The agent will **respect role boundaries** and suggest involving other roles when needed
4. The agent will maintain the **perspective and priorities** specific to that role

### 📬 Inter-Agent Communication Protocol

Each role has its own workspace with the following structure:
```
roles/[role-name]/
├── inbox/          # New messages from other agents
│   └── archive/    # Processed messages
└── tasks.md        # Role-specific tasks
```

#### Sending Messages
When an agent needs to communicate with another role:
1. Create a markdown file in the target role's inbox: `roles/[target-role]/inbox/`
2. Use the naming convention: `YYYY-MM-DD-HH-MM-SS-from-[sender-role]-[subject].md`
3. Include clear context, requirements, and any deadlines

#### Message Format
```markdown
# [Subject]

**From:** [Sender Role]
**To:** [Recipient Role]
**Date:** [ISO 8601 timestamp]
**Priority:** [High/Medium/Low]
**Response Required By:** [Date/Time or N/A]

## Context
[Brief background information]

## Request/Information
[Detailed content of the message]

## Expected Outcome
[What you need from the recipient]

## Attachments/References
[Links to relevant files or documents]
```

#### Processing Messages
Each agent should:
1. Regularly check their `inbox/` folder
2. Process messages based on priority and deadlines
3. After processing, move the message to `inbox/archive/`
4. Send acknowledgments or responses as new messages to the sender's inbox
5. Update their `tasks.md` file with any new tasks from messages

#### Message Types
- **Task Request**: Request for work to be done
- **Information Request**: Need for specific information
- **Update Notification**: Status updates or changes
- **Review Request**: Request for review or approval
- **Collaboration Request**: Need for joint work
- **Escalation**: Issues requiring attention

### Document Structure

Each role document includes:
- **Role Overview**: Primary purpose and responsibility
- **Key Responsibilities**: 5-8 specific duties
- **Required Skills**: Technical and soft skills needed
- **Tools & Technologies**: Specific to MetaCortex stack
- **Key Deliverables**: Tangible outputs expected
- **Success Metrics**: How performance is measured
- **Interfaces**: Which roles they collaborate with
- **Does NOT Do**: Clear boundaries to prevent overlap
- **Best Practices**: Guidelines for Claude Code agents
- **Common Tasks**: Typical workflows and procedures
- **Decision Authority**: What they can decide independently

## 🤝 Collaboration Matrix

| When Working On | Lead Role | Supporting Roles |
|----------------|-----------|------------------|
| New Features | Frontend/Backend Engineer | Product Designer, QA Engineer |
| Infrastructure | DevOps Engineer | Infrastructure Architect, Security Engineer |
| User Experience | Product Designer | Frontend Engineer, Mobile Engineer |
| Data Features | Data Engineer | Backend Engineer, AI/ML Engineer |
| AI Features | AI/ML Engineer | Backend Engineer, Data Engineer |
| Security | Security Engineer | DevOps Engineer, Compliance Officer |
| Documentation | Technical Writer | All Engineers, Product Designer |
| User Growth | Marketing Manager | Data Analyst, Community Manager |

## 📊 RACI Matrix Example

For major feature development:

| Role | Feature Design | Implementation | Testing | Deployment |
|------|---------------|----------------|---------|------------|
| Product Designer | R | C | I | I |
| Frontend Engineer | C | R | C | I |
| Backend Engineer | C | R | C | I |
| QA Engineer | I | C | R | C |
| DevOps Engineer | I | C | C | R |

**R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed

## 🚀 Getting Started

1. Review the role you'll be working in
2. Understand your key responsibilities and boundaries
3. Identify your collaboration points with other roles
4. Follow the best practices for Claude Code agents
5. Respect decision-making authorities

## 📈 Role Evolution

These role definitions will evolve as MetaCortex grows. Key principles:
- Roles may split as complexity increases
- New roles may be added for specialized needs
- Responsibilities may shift based on team size
- Core boundaries should remain clear

## 🔒 Security Note

All roles must follow MetaCortex security principles:
- Never expose sensitive data
- Follow encryption requirements
- Respect user privacy
- Maintain compliance standards