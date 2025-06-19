# Metacortex Team Roles

This document outlines the various team roles required for developing, launching, and maintaining the Metacortex product. Each role is designed to be mutually exclusive in responsibilities while collectively covering all aspects of the product lifecycle.

## Core Team Roles

### Leadership & Management
1. **[Project Manager](roles/01-project-manager.md)** - Project coordination, timeline management, and stakeholder communication
2. **[Tech Lead](roles/02-tech-lead.md)** - Technical leadership, architecture decisions, and engineering standards

### Product & Design
3. **[Product Designer](roles/03-product-designer.md)** - UX/UI design, user research, and design systems

### Engineering
4. **[Frontend Engineer](roles/04-frontend-engineer.md)** - React web application and user interface implementation
5. **[Backend Engineer](roles/05-backend-engineer.md)** - FastAPI development, database operations, and integrations
6. **[DevOps Engineer](roles/06-devops-engineer.md)** - Infrastructure, CI/CD, monitoring, and deployment
7. **[QA Engineer](roles/07-qa-engineer.md)** - Testing strategies, test automation, and quality assurance
8. **[Database Administrator](roles/08-database-administrator.md)** - PostgreSQL optimization, schema design, and data integrity
9. **[Mobile Engineer](roles/09-mobile-engineer.md)** - React Native development for iOS and Android
10. **[Security Engineer](roles/10-security-engineer.md)** - Security architecture, vulnerability assessment, and threat mitigation

### Data & AI
11. **[Data Engineer](roles/11-data-engineer.md)** - Data pipelines, ETL processes, and analytics infrastructure
12. **[AI/ML Engineer](roles/12-ai-ml-engineer.md)** - GPT-4 integration, vector databases, and NLP features
16. **[Data Analyst](roles/16-data-analyst.md)** - Product analytics, user behavior analysis, and KPI tracking

### Operations & Support
13. **[Technical Writer](roles/13-technical-writer.md)** - Documentation, API docs, and user guides
14. **[Customer Success Manager](roles/14-customer-success-manager.md)** - User onboarding, support, and feedback collection
17. **[Community Manager](roles/17-community-manager.md)** - Community building, social media, and user engagement

### Business & Growth
15. **[Marketing Manager](roles/15-marketing-manager.md)** - Marketing strategy, content, and growth initiatives
18. **[Sales Engineer](roles/18-sales-engineer.md)** - Technical sales support and enterprise integration

### Infrastructure & Compliance
19. **[Compliance Officer](roles/19-compliance-officer.md)** - Privacy regulations, GDPR, and security compliance
20. **[Infrastructure Architect](roles/20-infrastructure-architect.md)** - System design, scalability, and performance optimization

## Role Principles

1. **Mutual Exclusivity**: Each role has distinct responsibilities that don't overlap with other roles
2. **Collective Exhaustiveness**: Together, all roles cover every aspect of product development and maintenance
3. **Clear Boundaries**: Each role document defines what the role does and explicitly what it doesn't do
4. **Collaboration Points**: Each role document identifies key interfaces with other roles
5. **Autonomy**: Roles are designed to operate independently within their domain while collaborating effectively

## Using These Role Guidelines

These role documents are designed to guide Claude Code agents operating in specific capacities. When working with a Claude Code agent:

1. Specify the role you want the agent to assume
2. The agent will follow the guidelines, constraints, and best practices defined for that role
3. The agent will respect role boundaries and suggest involving other roles when appropriate
4. The agent will maintain the perspective and priorities specific to that role

## Role Assignment Matrix

| Domain | Primary Roles | Supporting Roles |
|--------|--------------|------------------|
| Technical Architecture | CTO, Backend Engineer | DevOps, Security Engineer |
| User Experience | Frontend Engineer, UX/UI Designer | Mobile Engineer, CPO |
| Product Development | Product Manager, Engineers | QA, Technical Writer |
| Data & Intelligence | AI/ML Engineer, Data Engineer | Data Analyst, Backend Engineer |
| Quality Assurance | QA Engineer | All Engineers, Product Manager |
| Security & Compliance | Security Engineer | DevOps, Backend Engineer |
| User Growth | Marketing Manager, Community Manager | Customer Success, Data Analyst |
| Business Operations | Business Analyst, Sales Engineer | CPO, Customer Success |