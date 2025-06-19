# Technical Requirements

## Overview
The technical architecture of MetaCortex is designed to support its core product principles: modularity, security, and long-term extensibility. The chosen stack and architectural patterns aim to provide a scalable and reliable foundation, enabling a responsive user experience while allowing for the continuous addition of new features and integrations.

---

## 7.1 Stack – Detailed Breakdown

### Frontend (Web)
* **Framework:** React.
    * **Justification:** React's component-based model is a natural fit for MetaCortex's modular design, allowing UI elements from different modules to be composed seamlessly into dashboards. Its large ecosystem and community support ensure access to a wide range of libraries and talent.
* **State Management:** A predictable, centralized state management solution like Redux Toolkit or Zustand will be used to manage complex application state, especially for user settings, notifications, and cross-module data.
* **Styling:** A solution that supports theming and customization, such as CSS-in-JS (e.g., Styled Components) or a utility-first framework (e.g., Tailwind CSS), will be implemented to support light/dark modes and user personalization.

### Frontend (Mobile)
* **Framework:** React Native.
    * **Justification:** This choice enables significant code sharing (components, business logic) with the web application, accelerating development and ensuring feature parity across platforms. It also provides full access to native device capabilities required for features like push notifications and Health/HealthKit integrations.

### Backend
* **Framework:** FastAPI (Python)
    * **Justification:** FastAPI provides high performance with automatic data validation and API documentation through OpenAPI/Swagger. Its Python foundation enables seamless integration with AI/ML libraries for the AI Assistant module. The framework's async support and dependency injection system align well with the modular architecture requirements.
    * **Key Features:** Automatic request/response validation with Pydantic, built-in API documentation, async/await support, and excellent performance benchmarks.

### Database
* **Primary Database:** PostgreSQL.
    * **Justification:** PostgreSQL's reliability, powerful indexing, and support for extensions like PostGIS (for future location features) and full-text search make it a robust choice. Its relational nature is ideal for the highly structured data in the app (tasks, notes, financial transactions, etc.).
* **ORM (Object-Relational Mapper):** SQLAlchemy with async support.
    * **Justification:** SQLAlchemy is the most mature and feature-rich ORM for Python, with excellent PostgreSQL support. Its async capabilities (via asyncpg) align with FastAPI's async nature, enabling high-performance database operations. The ORM provides powerful query building, relationship management, and migration support through Alembic.

### AI Infrastructure
* **LLM Provider:** OpenAI GPT-4 is the specified model for advanced natural language understanding and generation.
* **Vector Database:** A vector DB such as Pinecone is required.
    * **Implementation:** This will be used to store vector embeddings of the user's notes, tasks, and other personal data. When a user queries the AI Assistant, the query is first used to perform a semantic search on this vector DB to retrieve relevant context. This context is then passed to the LLM, resulting in highly personalized and accurate responses while preventing the AI from accessing irrelevant data.

### Authentication
* **Strategy:** Implement OAuth2 for third-party logins (Google, Apple), passwordless magic links, and support for multi-factor authentication (2FA).
* **Implementation:** Clerk will be used as the managed authentication service.
    * **Justification:** Clerk provides a modern, developer-friendly authentication solution with excellent support for both React and FastAPI. It offers built-in user management UI components, webhook support for backend synchronization, comprehensive security features including 2FA, and seamless OAuth provider integration. Clerk's SDK reduces authentication complexity while maintaining security best practices.

---

## 7.2 Architecture – Detailed Breakdown

### Modular Plugin System
* **Description:** This is the core architectural concept. Each module (e.g., "Finance," "Health") will be developed as a self-contained package. This package will include its own API routes, database schema (migrations), and frontend components. The core application will act as a shell that dynamically loads and integrates these modules based on each user's settings, ensuring disabled modules consume no resources.

### Microservice-Compatible Backend
* **Description:** While likely starting as a "modular monolith" for development simplicity, the backend will be designed to be microservice-compatible. Code will be strictly separated by domain (e.g., `task-service`, `auth-service`, `notifications-service`). This clear separation of concerns ensures that if a specific domain experiences high load (e.g., AI processing), it can be broken out into its own independently scalable microservice without requiring a full application rewrite.

### Background Task Queue
* **System:** Celery with Redis as the message broker.
    * **Justification:** Celery is the de facto standard for Python task queues, with mature ecosystem support and excellent FastAPI integration. Redis provides fast, reliable message brokering and result storage. This combination is battle-tested and scales well.
* **Use Cases:** This is critical for offloading any long-running or asynchronous operations from the main application thread to maintain UI responsiveness. Key uses include:
    * Sending email and push notifications.
    * Processing data syncs with third-party APIs.
    * Generating AI summaries or performing other AI-related computations.
    * Running scheduled jobs with Celery Beat, like daily financial data aggregation or habit streak calculations.
    * Monitoring via Flower for task visibility and debugging.

### API-First Design
* **Description:** The entire backend will be built as a set of well-documented REST APIs using FastAPI's automatic OpenAPI documentation. The web and mobile applications are the primary "clients" of this API. This approach enforces a clean separation between the frontend and backend, allows for independent development cycles, and makes it straightforward to add new clients (e.g., a desktop app, third-party integrations) in the future.
* **Implementation:** FastAPI automatically generates interactive API documentation (Swagger UI and ReDoc), ensuring the API is self-documenting. All endpoints will follow RESTful conventions with consistent URL patterns (/api/v1/resource), standard HTTP methods, and Pydantic models for request/response validation.