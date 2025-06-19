# Data Engineer

## Role Overview
The Data Engineer is responsible for designing, building, and maintaining the data infrastructure that powers MetaCortex's analytics, reporting, and data-driven features. This role focuses on creating robust data pipelines, ensuring data quality, and enabling data accessibility across the platform.

## Key Responsibilities

### Data Pipeline Development
- Design and implement ETL/ELT pipelines for data ingestion from various sources
- Build real-time streaming data pipelines for user activity and system metrics
- Create data transformation workflows for analytics and reporting
- Implement data validation and quality checks at each pipeline stage
- Optimize pipeline performance and resource utilization

### Data Infrastructure Management
- Design and maintain data warehouse architecture (PostgreSQL, data marts)
- Implement data partitioning and indexing strategies
- Manage data retention policies and archival processes
- Set up monitoring and alerting for data pipeline health
- Ensure data infrastructure scalability and reliability

### Analytics Infrastructure
- Build and maintain analytics databases and OLAP cubes
- Create materialized views for common analytics queries
- Implement data aggregation strategies for performance
- Design fact and dimension tables for business intelligence
- Support real-time analytics requirements

### Data Integration
- Integrate external data sources (Plaid, health APIs, calendar systems)
- Build connectors for third-party services
- Implement data synchronization mechanisms
- Handle data format conversions and mappings
- Manage API rate limits and data quotas

### Data Quality & Governance
- Implement data quality monitoring and reporting
- Create data lineage tracking systems
- Enforce data governance policies
- Build data catalog and metadata management
- Ensure data consistency across systems

## Technical Requirements

### Core Technologies
- **Languages**: Python (primary), SQL, Bash
- **Databases**: PostgreSQL, Redis, TimescaleDB
- **ETL Tools**: Apache Airflow, dbt, Pandas
- **Streaming**: Apache Kafka, Redis Streams
- **Cloud**: AWS (S3, Redshift, Glue), GCP (BigQuery, Dataflow)

### Data Processing
- Experience with batch and stream processing
- Proficiency in SQL optimization and query tuning
- Understanding of data modeling (dimensional, normalized)
- Knowledge of data compression and storage formats
- Experience with distributed computing frameworks

### Infrastructure Skills
- Container orchestration (Kubernetes, Docker)
- Infrastructure as Code (Terraform, CloudFormation)
- CI/CD for data pipelines
- Monitoring tools (Datadog, Prometheus)
- Version control for data schemas and pipelines

## Key Metrics
- Pipeline uptime and reliability (99.9% target)
- Data freshness and latency metrics
- Pipeline processing time and throughput
- Data quality score and error rates
- Cost per GB of data processed
- Time to implement new data sources

## Collaboration Points

### Works Closely With
- **Backend Developer**: API data requirements, database schemas
- **AI/ML Engineer**: Feature engineering, training data pipelines
- **Data Analyst**: Analytics requirements, data accessibility
- **DevOps Engineer**: Infrastructure provisioning, monitoring
- **Product Manager**: Data requirements for new features

### Boundaries
- **Does NOT**: Perform business analysis or create reports (Data Analyst)
- **Does NOT**: Build ML models or AI features (AI/ML Engineer)
- **Does NOT**: Design application APIs (Backend Developer)
- **Does NOT**: Manage production servers (DevOps Engineer)
- **Does NOT**: Define data strategy (Product Manager)

## Deliverables

### Documentation
- Data pipeline architecture diagrams
- ETL process documentation
- Data dictionary and catalog
- Pipeline monitoring runbooks
- Data quality reports

### Code Artifacts
- ETL pipeline code (Airflow DAGs, dbt models)
- Data validation scripts
- Schema migration scripts
- Performance optimization queries
- Monitoring and alerting configurations

### Regular Tasks
- Daily pipeline monitoring and troubleshooting
- Weekly data quality reviews
- Monthly performance optimization
- Quarterly architecture reviews
- Ad-hoc data integration projects

## Success Criteria
- All critical data pipelines maintain 99.9% uptime
- Data freshness SLAs consistently met
- Zero data loss incidents
- Successful integration of all planned data sources
- Analytics queries perform within defined SLAs
- Comprehensive data documentation maintained

## Growth Path
- Junior Data Engineer → Data Engineer → Senior Data Engineer
- Specialization: Analytics Engineer, ML Engineer, Data Architect
- Leadership: Data Engineering Manager, Head of Data Platform
- Adjacent: Solutions Architect, ML Platform Engineer

## Interview Focus Areas
- SQL optimization and complex query writing
- ETL/ELT design patterns and best practices
- Data modeling (star schema, normalization)
- Python data processing (Pandas, PySpark)
- System design for data pipelines
- Troubleshooting data quality issues

## Tools & Resources

### Development Tools
- Apache Airflow for workflow orchestration
- dbt for data transformation
- Great Expectations for data validation
- Metabase for data exploration
- Git for version control

### Monitoring Tools
- Datadog for pipeline monitoring
- Grafana for metrics visualization
- PagerDuty for alerting
- Sentry for error tracking

### Learning Resources
- "Designing Data-Intensive Applications" by Martin Kleppmann
- Apache Airflow documentation
- dbt best practices guide
- PostgreSQL performance tuning resources
- Data engineering communities and conferences