# MetaCortex Plugin Architecture Design

**Version:** 1.0  
**Date:** 2025-06-19  
**Author:** Tech Lead  
**Status:** Draft

## Executive Summary

This document outlines the plugin architecture for MetaCortex, enabling users to enable/disable features modularly. The design supports the PRD requirement for a "life OS" that adapts to individual user needs while preventing feature bloat.

## Design Principles

1. **Module Independence**: Each module operates independently with minimal cross-dependencies
2. **Zero Performance Impact**: Disabled modules consume no resources
3. **Clean Interfaces**: Well-defined contracts between core and modules
4. **Progressive Enhancement**: Core functionality works without any modules
5. **Security by Default**: Modules have limited access to user data

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
├─────────────────────────────────────────────────────────┤
│                  Module Registry                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Tasks   │  │  Notes   │  │ Finance  │  │  ...   │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
├─────────────────────────────────────────────────────────┤
│                  Core Application                        │
│  - Authentication  - Routing  - State  - API Client     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                      │
├─────────────────────────────────────────────────────────┤
│                  Module Registry                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Tasks   │  │  Notes   │  │ Finance  │  │  ...   │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
├─────────────────────────────────────────────────────────┤
│                  Core Services                           │
│  - Auth  - Database  - Events  - Background Tasks       │
└─────────────────────────────────────────────────────────┘
```

## Module Structure

### Backend Module Structure
```
modules/
├── tasks/
│   ├── __init__.py
│   ├── manifest.json      # Module metadata
│   ├── models.py          # SQLAlchemy models
│   ├── schemas.py         # Pydantic schemas
│   ├── repository.py      # Data access layer
│   ├── service.py         # Business logic
│   ├── api.py            # FastAPI routes
│   ├── events.py         # Event handlers
│   └── migrations/       # Module-specific migrations
├── notes/
├── finance/
└── ...
```

### Frontend Module Structure
```
src/modules/
├── tasks/
│   ├── index.ts          # Module export
│   ├── manifest.json     # Module metadata
│   ├── components/       # React components
│   ├── hooks/           # Custom hooks
│   ├── api/             # API client
│   ├── state/           # Module state
│   └── routes.tsx       # Module routes
├── notes/
├── finance/
└── ...
```

## Module Manifest

Each module includes a `manifest.json` file defining its metadata:

```json
{
  "id": "tasks",
  "name": "Task Manager",
  "version": "1.0.0",
  "description": "Manage tasks, projects, and delegation",
  "author": "MetaCortex Team",
  "category": "productivity",
  "dependencies": [],
  "permissions": ["user:read", "notifications:write"],
  "settings": {
    "defaultView": {
      "type": "select",
      "label": "Default View",
      "options": ["list", "board", "calendar"],
      "default": "list"
    }
  },
  "widgets": [
    {
      "id": "task-summary",
      "name": "Task Summary",
      "sizes": ["small", "medium"]
    }
  ]
}
```

## Core Application APIs

### Module Registry

```python
# backend/core/modules/registry.py
class ModuleRegistry:
    def register(self, module: Module) -> None:
        """Register a module with the system"""
        
    def get_enabled_modules(self, user_id: str) -> List[Module]:
        """Get modules enabled for a specific user"""
        
    def load_module(self, module_id: str) -> Module:
        """Dynamically load a module"""
        
    def unload_module(self, module_id: str) -> None:
        """Unload a module and cleanup resources"""
```

### Module Base Class

```python
# backend/core/modules/base.py
class BaseModule(ABC):
    @abstractmethod
    def initialize(self, app: FastAPI) -> None:
        """Initialize module with the app instance"""
        
    @abstractmethod
    def get_routes(self) -> APIRouter:
        """Return module's API routes"""
        
    @abstractmethod
    def get_models(self) -> List[Base]:
        """Return SQLAlchemy models"""
        
    @abstractmethod
    def on_enable(self, user_id: str) -> None:
        """Called when user enables the module"""
        
    @abstractmethod
    def on_disable(self, user_id: str) -> None:
        """Called when user disables the module"""
```

### Frontend Module Interface

```typescript
// frontend/src/core/modules/types.ts
interface Module {
  id: string;
  manifest: ModuleManifest;
  
  // Lifecycle hooks
  initialize(): Promise<void>;
  activate(context: ModuleContext): void;
  deactivate(): void;
  
  // Module exports
  getRoutes(): RouteConfig[];
  getComponents(): ComponentMap;
  getWidgets(): Widget[];
  getMenuItems(): MenuItem[];
}
```

## User Module Settings

### Database Schema

```sql
-- User module preferences
CREATE TABLE user_modules (
    user_id UUID REFERENCES users(id),
    module_id VARCHAR(50),
    enabled BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    enabled_at TIMESTAMP,
    PRIMARY KEY (user_id, module_id)
);

-- User dashboard configuration
CREATE TABLE user_dashboards (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name VARCHAR(100),
    is_default BOOLEAN DEFAULT false,
    layout JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

```
GET    /api/v1/modules              # List available modules
GET    /api/v1/modules/enabled      # Get user's enabled modules
PUT    /api/v1/modules/{id}/enable  # Enable a module
PUT    /api/v1/modules/{id}/disable # Disable a module
PUT    /api/v1/modules/{id}/settings # Update module settings
```

## Module Loading Process

### Backend Loading

```python
# Application startup
async def startup():
    # 1. Scan modules directory
    modules = scan_modules_directory()
    
    # 2. Validate and register modules
    for module_path in modules:
        module = load_module(module_path)
        if validate_module(module):
            registry.register(module)
    
    # 3. Initialize core modules
    for module_id in CORE_MODULES:
        module = registry.get_module(module_id)
        module.initialize(app)

# Per-request module loading
@app.middleware("http")
async def load_user_modules(request: Request, call_next):
    if user := request.state.user:
        # Load user's enabled modules
        enabled_modules = await get_user_enabled_modules(user.id)
        request.state.modules = enabled_modules
    return await call_next(request)
```

### Frontend Loading

```typescript
// Module loading on app initialization
export async function initializeModules(userId: string) {
  // 1. Fetch user's enabled modules
  const enabledModules = await api.getUserModules();
  
  // 2. Dynamically import enabled modules
  for (const moduleId of enabledModules) {
    const module = await import(`./modules/${moduleId}`);
    moduleRegistry.register(module.default);
  }
  
  // 3. Initialize modules
  await moduleRegistry.initializeAll();
}
```

## Inter-Module Communication

### Event System

```python
# backend/core/events.py
class EventBus:
    async def emit(self, event: str, data: Any) -> None:
        """Emit an event to all listeners"""
        
    def subscribe(self, event: str, handler: Callable) -> None:
        """Subscribe to an event"""

# Module usage
class TasksModule(BaseModule):
    def initialize(self, app: FastAPI):
        event_bus.subscribe("user.created", self.on_user_created)
        
    async def on_task_completed(self, task_id: str):
        await event_bus.emit("task.completed", {"task_id": task_id})
```

### Shared Services

```python
# backend/core/services.py
class CoreServices:
    auth: AuthService
    database: DatabaseService
    notifications: NotificationService
    search: SearchService
    storage: StorageService
    
# Module access
class FinanceModule(BaseModule):
    def get_transactions(self, user_id: str):
        # Use core search service
        return services.search.query(
            index="transactions",
            user_id=user_id
        )
```

## Widget System

### Widget Registration

```typescript
// frontend/src/modules/tasks/widgets/TaskSummary.tsx
export const TaskSummaryWidget: Widget = {
  id: 'task-summary',
  name: 'Task Summary',
  sizes: ['small', 'medium'],
  
  render: ({ size, settings }) => {
    const { tasks } = useTasks();
    return <TaskSummaryComponent tasks={tasks} size={size} />;
  },
  
  settingsSchema: {
    showCompleted: { type: 'boolean', default: false },
    maxItems: { type: 'number', default: 5 }
  }
};
```

### Dashboard Rendering

```typescript
// frontend/src/components/Dashboard.tsx
export function Dashboard({ layout }: DashboardProps) {
  return (
    <GridLayout layout={layout}>
      {layout.widgets.map(widget => {
        const WidgetComponent = widgetRegistry.get(widget.id);
        return (
          <GridItem key={widget.id} {...widget.position}>
            <WidgetComponent 
              size={widget.size}
              settings={widget.settings}
            />
          </GridItem>
        );
      })}
    </GridLayout>
  );
}
```

## Security Considerations

### Module Permissions

```python
# backend/core/permissions.py
class ModulePermissions:
    # Define granular permissions
    USER_READ = "user:read"
    USER_WRITE = "user:write"
    NOTIFICATIONS_WRITE = "notifications:write"
    STORAGE_READ = "storage:read"
    STORAGE_WRITE = "storage:write"
    
# Check permissions before module actions
def check_module_permission(module: Module, permission: str):
    if permission not in module.manifest.permissions:
        raise PermissionDeniedError()
```

### Data Isolation

```python
# Ensure modules can only access their own data
class ModuleRepository:
    def __init__(self, module_id: str):
        self.module_id = module_id
        
    def query(self, model: Type[Base]):
        # Automatically filter by module
        return db.query(model).filter(
            model.module_id == self.module_id
        )
```

## Migration Strategy

### Phase 1: Core Modules (Current)
- Implement Tasks, Notes, Habits as built-in modules
- No dynamic loading yet
- Establish module interfaces

### Phase 2: Module Abstraction
- Refactor existing features to use module system
- Implement module registry
- Add enable/disable functionality

### Phase 3: Dynamic Loading
- Implement dynamic module loading
- Add module marketplace infrastructure
- Support third-party modules

## Performance Considerations

1. **Lazy Loading**: Modules are only loaded when accessed
2. **Code Splitting**: Each module is a separate bundle
3. **Caching**: Module manifests are cached
4. **Database Queries**: Module-specific indexes
5. **API Routes**: Only enabled module routes are registered

## Example Implementation

### Creating a New Module

```python
# backend/modules/pomodoro/module.py
from backend.core.modules import BaseModule

class PomodoroModule(BaseModule):
    def __init__(self):
        self.manifest = load_manifest()
        
    def initialize(self, app: FastAPI):
        # Register routes
        app.include_router(
            self.get_routes(),
            prefix=f"/api/v1/modules/{self.manifest.id}"
        )
        
    def get_routes(self):
        router = APIRouter()
        
        @router.post("/sessions")
        async def start_session(data: SessionCreate):
            return await pomodoro_service.create_session(data)
            
        return router
```

## Next Steps

1. Implement core module interfaces
2. Refactor existing features to module structure
3. Create module management UI
4. Develop module development guidelines
5. Plan third-party module security review process

## Conclusion

This plugin architecture provides the foundation for MetaCortex's vision of a modular "life OS". It enables users to customize their experience while maintaining system performance and security. The phased implementation approach allows us to deliver value incrementally while building toward the full vision.