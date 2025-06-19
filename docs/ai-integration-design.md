# AI Integration Technical Design

**Version:** 1.0  
**Date:** 2025-06-19  
**Author:** Tech Lead  
**Status:** Draft

## Executive Summary

This document outlines the technical design for integrating AI capabilities into MetaCortex, specifically OpenAI GPT-4 for natural language processing and Pinecone for vector search. The AI Assistant will provide intelligent task management, autonomous execution, and context-aware recommendations.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│                    (Chat/Command Bar/Voice)                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                    AI Service Layer                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Intent    │  │   Context    │  │     Action       │  │
│  │ Recognition │  │  Retrieval   │  │    Executor      │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                    External Services                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  OpenAI     │  │   Pinecone   │  │    MetaCortex    │  │
│  │   GPT-4     │  │  Vector DB   │  │       APIs       │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. AI Service Layer

```python
# backend/ai/service.py
class AIService:
    def __init__(
        self,
        openai_client: OpenAIClient,
        vector_store: VectorStore,
        action_executor: ActionExecutor
    ):
        self.openai = openai_client
        self.vectors = vector_store
        self.executor = action_executor
    
    async def process_request(
        self,
        user_id: str,
        message: str,
        context: Optional[Dict] = None
    ) -> AIResponse:
        # 1. Understand intent
        intent = await self.recognize_intent(message)
        
        # 2. Retrieve relevant context
        context_data = await self.retrieve_context(
            user_id, message, intent
        )
        
        # 3. Generate response
        response = await self.generate_response(
            message, intent, context_data
        )
        
        # 4. Execute actions if needed
        if intent.requires_action:
            actions = await self.executor.execute(
                intent, context_data, user_id
            )
            response.actions = actions
        
        return response
```

### 2. Vector Store Integration

```python
# backend/ai/vector_store.py
class PineconeVectorStore:
    def __init__(self, api_key: str, environment: str):
        self.pc = pinecone.Pinecone(
            api_key=api_key,
            environment=environment
        )
        self.index = self.pc.Index("metacortex-main")
    
    async def store_embedding(
        self,
        id: str,
        vector: List[float],
        metadata: Dict
    ):
        """Store document embedding with metadata"""
        await self.index.upsert(
            vectors=[(id, vector, metadata)]
        )
    
    async def search(
        self,
        query_vector: List[float],
        filter: Dict,
        top_k: int = 10
    ) -> List[SearchResult]:
        """Search for similar documents"""
        results = await self.index.query(
            vector=query_vector,
            filter=filter,
            top_k=top_k,
            include_metadata=True
        )
        return [
            SearchResult(
                id=match.id,
                score=match.score,
                metadata=match.metadata
            )
            for match in results.matches
        ]
```

### 3. Embedding Pipeline

```python
# backend/ai/embeddings.py
class EmbeddingService:
    def __init__(self, openai_client: OpenAIClient):
        self.openai = openai_client
        self.model = "text-embedding-3-small"
    
    async def generate_embedding(
        self, 
        text: str
    ) -> List[float]:
        """Generate embedding for text"""
        response = await self.openai.embeddings.create(
            input=text,
            model=self.model
        )
        return response.data[0].embedding
    
    async def process_document(
        self,
        document: Document,
        user_id: str
    ):
        """Process and store document embeddings"""
        # Chunk document for better retrieval
        chunks = self.chunk_document(document)
        
        for i, chunk in enumerate(chunks):
            # Generate embedding
            embedding = await self.generate_embedding(
                chunk.text
            )
            
            # Store in vector database
            await self.vector_store.store_embedding(
                id=f"{document.id}_chunk_{i}",
                vector=embedding,
                metadata={
                    "user_id": user_id,
                    "document_id": document.id,
                    "document_type": document.type,
                    "chunk_index": i,
                    "created_at": datetime.utcnow()
                }
            )
```

## AI Features Implementation

### 1. Natural Language Task Creation

```python
# backend/ai/features/task_creation.py
class NaturalLanguageTaskCreator:
    def __init__(self, ai_service: AIService):
        self.ai = ai_service
        
    async def parse_task_request(
        self,
        user_input: str,
        user_id: str
    ) -> TaskCreate:
        """Parse natural language into task object"""
        
        prompt = f"""
        Extract task details from this request:
        "{user_input}"
        
        Return a JSON object with:
        - title: string
        - description: string (optional)
        - due_date: ISO datetime (optional)
        - priority: "low"|"medium"|"high"
        - tags: array of strings
        - assignee: "self"|"ai"|email (optional)
        """
        
        response = await self.ai.openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_input}
            ],
            response_format={"type": "json_object"}
        )
        
        task_data = json.loads(response.choices[0].message.content)
        return TaskCreate(**task_data)
```

### 2. Intelligent Task Prioritization

```python
# backend/ai/features/prioritization.py
class TaskPrioritizer:
    async def analyze_and_prioritize(
        self,
        tasks: List[Task],
        user_context: UserContext
    ) -> List[PrioritizedTask]:
        """Analyze tasks and suggest priorities"""
        
        # Retrieve user's historical patterns
        patterns = await self.get_user_patterns(user_context.user_id)
        
        # Build context for AI
        context = {
            "tasks": [task.dict() for task in tasks],
            "user_patterns": patterns,
            "current_time": datetime.utcnow(),
            "user_goals": user_context.goals
        }
        
        prompt = """
        Analyze these tasks and suggest prioritization based on:
        1. Urgency (due dates)
        2. Importance (user goals alignment)
        3. Dependencies
        4. User's historical completion patterns
        5. Effort estimation
        
        Return prioritized list with reasoning.
        """
        
        response = await self.ai.process_request(
            user_context.user_id,
            prompt,
            context
        )
        
        return self.parse_prioritization(response)
```

### 3. Context-Aware Reminders

```python
# backend/ai/features/smart_reminders.py
class SmartReminderService:
    async def generate_contextual_reminder(
        self,
        task: Task,
        user_id: str
    ) -> Reminder:
        """Generate context-aware reminder"""
        
        # Retrieve relevant context
        context_items = await self.vector_store.search(
            query_vector=await self.embed(task.title),
            filter={"user_id": user_id},
            top_k=5
        )
        
        # Find related notes, past tasks, etc.
        related_content = await self.fetch_related_content(
            context_items
        )
        
        # Generate reminder with context
        prompt = f"""
        Create a helpful reminder for this task:
        Task: {task.title}
        Due: {task.due_date}
        
        Related context:
        {json.dumps(related_content, indent=2)}
        
        Make the reminder:
        1. Actionable
        2. Include relevant context
        3. Suggest next steps
        """
        
        response = await self.ai.generate_response(prompt)
        
        return Reminder(
            task_id=task.id,
            content=response.content,
            context_links=response.links
        )
```

### 4. Autonomous Task Execution

```python
# backend/ai/features/task_execution.py
class AITaskExecutor:
    def __init__(self):
        self.actions = {
            "research": ResearchAction(),
            "schedule": ScheduleAction(),
            "draft_email": EmailDraftAction(),
            "find_service": ServiceFinderAction(),
            "book_appointment": AppointmentAction()
        }
    
    async def execute_task(
        self,
        task: Task,
        user_id: str,
        confirmation_required: bool = True
    ) -> ExecutionResult:
        """Execute a delegated task"""
        
        # Determine action type
        action_type = await self.classify_task(task)
        
        if action_type not in self.actions:
            return ExecutionResult(
                success=False,
                error="Cannot execute this type of task"
            )
        
        # Prepare execution plan
        plan = await self.create_execution_plan(
            task, action_type, user_id
        )
        
        # Request confirmation if required
        if confirmation_required:
            confirmation = await self.request_confirmation(
                user_id, plan
            )
            if not confirmation.approved:
                return ExecutionResult(
                    success=False,
                    error="User declined execution"
                )
        
        # Execute action
        action = self.actions[action_type]
        result = await action.execute(plan)
        
        # Log execution
        await self.log_execution(task.id, result)
        
        return result
```

## Data Flow

### 1. Document Indexing Flow

```
User creates/updates document
            ↓
    Document saved to DB
            ↓
    Background job triggered
            ↓
    Generate embeddings
            ↓
    Store in Pinecone
            ↓
    Update search index
```

### 2. AI Query Flow

```
User sends query
        ↓
Parse intent & extract entities
        ↓
Generate query embedding
        ↓
Search vector database
        ↓
Retrieve relevant documents
        ↓
Build context for LLM
        ↓
Generate response with GPT-4
        ↓
Execute actions (if any)
        ↓
Return response to user
```

## Security & Privacy

### 1. Data Isolation

```python
# Ensure user data isolation in vector searches
class SecureVectorStore(PineconeVectorStore):
    async def search(
        self,
        query_vector: List[float],
        user_id: str,
        **kwargs
    ):
        # Always filter by user_id
        filter = kwargs.get("filter", {})
        filter["user_id"] = user_id
        kwargs["filter"] = filter
        
        return await super().search(query_vector, **kwargs)
```

### 2. Rate Limiting

```python
# Rate limiting for AI requests
from slowapi import Limiter

limiter = Limiter(key_func=get_user_id)

@router.post("/ai/chat")
@limiter.limit("20/minute")
async def chat_endpoint(request: ChatRequest):
    return await ai_service.process_request(
        request.user_id,
        request.message
    )
```

### 3. Cost Management

```python
# Track and limit AI usage
class AIUsageTracker:
    async def check_usage_limit(
        self,
        user_id: str,
        operation: str
    ) -> bool:
        # Check user's plan limits
        limits = await self.get_user_limits(user_id)
        usage = await self.get_current_usage(user_id)
        
        if usage[operation] >= limits[operation]:
            raise UsageLimitExceeded(
                f"Monthly limit for {operation} reached"
            )
        
        return True
    
    async def track_usage(
        self,
        user_id: str,
        operation: str,
        tokens: int,
        cost: float
    ):
        await self.db.ai_usage.insert({
            "user_id": user_id,
            "operation": operation,
            "tokens": tokens,
            "cost": cost,
            "timestamp": datetime.utcnow()
        })
```

## Performance Optimization

### 1. Caching Strategy

```python
# Cache frequently accessed embeddings
@cache(expire=3600)
async def get_cached_embedding(text: str) -> List[float]:
    return await embedding_service.generate_embedding(text)

# Cache AI responses for similar queries
@cache(expire=1800)
async def get_cached_response(
    query_hash: str,
    user_id: str
) -> Optional[AIResponse]:
    return await cache.get(f"ai_response:{user_id}:{query_hash}")
```

### 2. Batch Processing

```python
# Batch embedding generation
async def generate_embeddings_batch(
    texts: List[str]
) -> List[List[float]]:
    # OpenAI supports batch embedding
    response = await openai.embeddings.create(
        input=texts,
        model="text-embedding-3-small"
    )
    return [item.embedding for item in response.data]
```

### 3. Async Processing

```python
# Process AI requests asynchronously
@router.post("/ai/task/delegate")
async def delegate_task(
    task_id: str,
    background_tasks: BackgroundTasks
):
    # Immediate response
    background_tasks.add_task(
        process_ai_delegation,
        task_id
    )
    
    return {
        "status": "processing",
        "task_id": task_id
    }
```

## Integration Points

### 1. Task Manager Integration

```python
# backend/modules/tasks/ai_integration.py
class TaskAIIntegration:
    async def on_task_created(self, task: Task):
        # Generate embedding for search
        await self.index_task(task)
        
        # Analyze for smart suggestions
        if task.delegated_to == "ai":
            await self.queue_ai_execution(task)
    
    async def on_task_updated(self, task: Task):
        # Re-index for search
        await self.update_task_index(task)
```

### 2. Notes Integration

```python
# backend/modules/notes/ai_integration.py
class NotesAIIntegration:
    async def on_note_created(self, note: Note):
        # Index for semantic search
        await self.index_note(note)
        
        # Extract actionable items
        actions = await self.extract_actions(note)
        if actions:
            await self.create_suggested_tasks(actions)
```

## Monitoring & Analytics

### 1. AI Performance Metrics

```python
# Track AI performance
class AIMetrics:
    metrics = {
        "response_time": Histogram(
            "ai_response_time_seconds",
            "AI response time"
        ),
        "accuracy": Counter(
            "ai_accuracy_score",
            "AI response accuracy"
        ),
        "usage": Counter(
            "ai_usage_total",
            "Total AI usage",
            ["operation", "user_tier"]
        )
    }
```

### 2. Cost Tracking Dashboard

```sql
-- Daily AI costs by operation
SELECT 
    DATE(timestamp) as date,
    operation,
    SUM(tokens) as total_tokens,
    SUM(cost) as total_cost
FROM ai_usage
GROUP BY DATE(timestamp), operation
ORDER BY date DESC;
```

## Migration Plan

### Phase 1: Infrastructure Setup (Week 1)
- Set up Pinecone account and indexes
- Configure OpenAI API access
- Implement basic embedding service
- Create cost tracking system

### Phase 2: Core Features (Week 2)
- Natural language task creation
- Basic semantic search
- Context retrieval system
- Simple AI responses

### Phase 3: Advanced Features (Week 3)
- Task prioritization
- Smart reminders
- Autonomous execution (limited)
- Performance optimization

### Phase 4: Full Integration (Week 4)
- Complete module integration
- Advanced AI features
- User feedback loop
- Production deployment

## Cost Estimation

### Monthly Costs (1000 active users)
- OpenAI GPT-4: ~$2,000 (20 requests/user/day)
- Pinecone: ~$70 (1M vectors)
- Compute for processing: ~$200
- Total: ~$2,270/month

### Cost Optimization Strategies
1. Use GPT-3.5 for simple tasks
2. Cache common responses
3. Batch embedding generation
4. Implement usage tiers
5. Pre-filter with local search

## Conclusion

This AI integration design provides a scalable foundation for intelligent features in MetaCortex. The architecture supports the PRD vision while maintaining security, performance, and cost efficiency. The phased implementation allows for iterative improvements based on user feedback.