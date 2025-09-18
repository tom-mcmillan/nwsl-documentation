# MCP Server

Technical documentation for the NWSL Analytics MCP (Model Context Protocol) server. This section covers server architecture, deployment, and development for those building on top of the platform.

## Server Overview

### Architecture
- **Platform**: Node.js 20+ with TypeScript
- **Protocol**: Model Context Protocol 1.0
- **Transport**: HTTP with JSON-RPC 2.0
- **Deployment**: Google Cloud Run with auto-scaling
- **Database**: PostgreSQL connection pooling (max 20 connections)

### Core Components
```
┌───────────────────┐
│ MCP Server (Node.js)  │
├───────────────────┤
│ Hybrid Intelligence   │
│ ├─ Layer 1: Direct     │
│ ├─ Layer 2: Knowledge  │
│ ├─ Layer 3: Orchestrate│
│ └─ Layer 4: Recovery   │
├───────────────────┤
│ Analytics Tools (13+) │
└───────────────────┘
           │
┌───────────────────┐
│ PostgreSQL Database  │
│ 47+ Tables, 558K+    │
│ Events, Partitioned  │
└───────────────────┘
```

## MCP Tools Implementation

### Primary Tool: soccer_analytics_query
```typescript
interface SoccerAnalyticsQuery {
  name: 'soccer_analytics_query';
  description: 'Natural language queries for comprehensive NWSL analytics';
  inputSchema: {
    type: 'object';
    properties: {
      query: {
        type: 'string';
        description: 'Natural language question about NWSL data';
        minLength: 3;
        maxLength: 2000;
      };
    };
    required: ['query'];
  };
}
```

### Implementation Example
```typescript
async function handleSoccerAnalyticsQuery(query: string): Promise<MCPResponse> {
  // 4-Layer Processing System
  try {
    // Layer 1: Direct queries (70% of requests)
    const directResult = await tryDirectQuery(query);
    if (directResult.success) {
      return formatResponse(directResult.data, 'direct');
    }

    // Layer 2: Knowledge base exploration
    const knowledgeResult = await tryKnowledgeQuery(query);
    if (knowledgeResult.success) {
      return formatResponse(knowledgeResult.data, 'knowledge');
    }

    // Layer 3: Full orchestration
    const orchestrationResult = await tryOrchestration(query);
    if (orchestrationResult.success) {
      return formatResponse(orchestrationResult.data, 'orchestration');
    }

    // Layer 4: Error recovery
    return await provideHelpfulGuidance(query);
  } catch (error) {
    return await handleGracefulDegradation(error, query);
  }
}
```

### Secondary Tool: inspect_database
```typescript
interface InspectDatabase {
  name: 'inspect_database';
  description: 'Database schema inspection for development';
  inputSchema: {
    type: 'object';
    properties: {
      table_pattern?: {
        type: 'string';
        description: 'Optional table name pattern to filter results';
      };
    };
  };
}
```

## Hybrid Intelligence System

### Layer 1: Direct Queries
Handles ~70% of requests with immediate database responses:

```typescript
const DIRECT_QUERY_PATTERNS = [
  /top \d+ goal scorers?/i,
  /\w+ (stats|statistics|record)/i,
  /league standings?/i,
  /matches? (at|in) \w+/i
];

async function tryDirectQuery(query: string): Promise<QueryResult> {
  for (const pattern of DIRECT_QUERY_PATTERNS) {
    if (pattern.test(query)) {
      const sql = await generateDirectSQL(query, pattern);
      return await executeQuery(sql);
    }
  }
  return { success: false };
}
```

### Layer 2: Knowledge Base
Intelligent database exploration for moderate complexity:

```typescript
async function tryKnowledgeQuery(query: string): Promise<QueryResult> {
  const entities = await extractEntities(query);
  const context = await gatherContext(entities);

  if (context.confidence > 0.7) {
    const analysis = await performKnowledgeAnalysis(query, context);
    return { success: true, data: analysis };
  }

  return { success: false };
}
```

### Layer 3: Full Orchestration
Multi-tool complex analysis:

```typescript
const ANALYTICS_TOOLS = [
  'spatial_analysis',
  'player_intelligence',
  'tactical_analysis',
  'sequence_analysis',
  'temporal_analysis',
  'formation_analysis'
];

async function tryOrchestration(query: string): Promise<QueryResult> {
  const plan = await createAnalysisPlan(query);
  const results = [];

  for (const step of plan.steps) {
    const tool = ANALYTICS_TOOLS.find(t => t === step.tool);
    if (tool) {
      const result = await executeTool(tool, step.params);
      results.push(result);
    }
  }

  return await synthesizeResults(results, query);
}
```

### Layer 4: Error Recovery
Graceful degradation with helpful guidance:

```typescript
async function provideHelpfulGuidance(query: string): Promise<MCPResponse> {
  const suggestions = await generateSuggestions(query);
  const availableData = await getAvailableDataSummary();

  return {
    content: [{
      type: 'text',
      text: `I couldn't process that exact query, but here's what I can help with:\n\n${suggestions}\n\nAvailable data: ${availableData}`
    }]
  };
}
```

## Analytics Tools

### Spatial Analysis Tool
```typescript
interface SpatialAnalysis {
  shotMaps(playerId: string, season: number): Promise<ShotData[]>;
  heatMaps(teamId: string, matchId: string): Promise<HeatMapData>;
  positionAnalysis(playerId: string): Promise<PositionData>;
}
```

### Player Intelligence Tool
```typescript
interface PlayerIntelligence {
  performanceMetrics(playerId: string): Promise<PlayerMetrics>;
  comparePlayers(playerIds: string[]): Promise<ComparisonData>;
  contextualPerformance(playerId: string, context: Context): Promise<ContextualData>;
}
```

### Tactical Analysis Tool
```typescript
interface TacticalAnalysis {
  formationEffectiveness(teamId: string): Promise<FormationData>;
  tacticalPatterns(matchId: string): Promise<TacticalPattern[]>;
  pressureAnalysis(teamId: string): Promise<PressureData>;
}
```

## Deployment Configuration

### Docker Configuration
```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 8080
CMD ["npm", "start"]
```

### Google Cloud Run Deployment
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: nwsl-mcp-server
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/memory: "1Gi"
        run.googleapis.com/cpu: "1000m"
    spec:
      containers:
      - image: gcr.io/PROJECT_ID/nwsl-mcp
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-url
              key: url
        - name: NODE_ENV
          value: "production"
```

### Environment Variables
```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/nwsl
NODE_ENV=production
PORT=8080

# Optional
SVC_TOKEN=your_service_token
JWT_ISS=your_jwt_issuer
JWKS_URI=your_jwks_endpoint
LOG_LEVEL=info
MAX_DB_CONNECTIONS=20
```

## Performance Optimization

### Connection Pooling
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: { rejectUnauthorized: false }
});

export async function query<T>(sql: string, params: any[] = []): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}
```

### Caching Strategy
```typescript
import { createHash } from 'crypto';

class QueryCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL = 15 * 60 * 1000; // 15 minutes

  generateKey(query: string): string {
    return createHash('sha256').update(query).digest('hex');
  }

  get(query: string): any | null {
    const key = this.generateKey(query);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data;
    }

    this.cache.delete(key);
    return null;
  }

  set(query: string, data: any): void {
    const key = this.generateKey(query);
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
```

### Query Optimization
```typescript
// Use prepared statements
const PREPARED_QUERIES = {
  topGoalScorers: `
    SELECT p.player_name, COUNT(*) as goals
    FROM events_$1 e
    JOIN players p ON e.player_id = p.id
    WHERE e.event_type_id = 16
    GROUP BY p.player_name
    ORDER BY goals DESC
    LIMIT $2
  `,
  playerStats: `
    SELECT
      COUNT(CASE WHEN event_type_id = 16 THEN 1 END) as goals,
      COUNT(CASE WHEN event_type_id = 1 THEN 1 END) as passes,
      AVG(x) as avg_x, AVG(y) as avg_y
    FROM events_$1 e
    JOIN players p ON e.player_id = p.id
    WHERE p.player_name = $2
  `
};
```

## Security Implementation

### Authentication Middleware
```typescript
import jwt from 'jsonwebtoken';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
```

### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

export const mcpRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each token to 100 requests per hour
  message: 'Too many requests from this token',
  standardHeaders: true,
  legacyHeaders: false,
});
```

## Health Monitoring

### Health Check Endpoint
```typescript
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      mcp: 'healthy'
    },
    version: process.env.npm_package_version || 'unknown'
  };

  try {
    await query('SELECT 1');
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### Logging
```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ]
});
```

## Development Setup

### Local Development
```bash
# Clone repository
git clone https://github.com/tom-mcmillan/nwsl-mcp.git
cd nwsl-mcp

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Testing
```typescript
// Test MCP tool functionality
describe('SoccerAnalyticsQuery', () => {
  it('should handle simple goal scorer queries', async () => {
    const result = await handleSoccerAnalyticsQuery('top 5 goal scorers 2025');
    expect(result.content[0].text).toContain('goal');
  });

  it('should handle complex tactical analysis', async () => {
    const result = await handleSoccerAnalyticsQuery('analyze Portland formation effectiveness');
    expect(result.content).toHaveLength(1);
  });
});
```

## API Reference

### MCP Methods
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "soccer_analytics_query",
        "description": "Natural language queries for comprehensive NWSL analytics",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Natural language question about NWSL data"
            }
          }
        }
      }
    ]
  }
}
```

### Tool Execution
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "soccer_analytics_query",
    "arguments": {
      "query": "Who scored the most goals in 2025?"
    }
  }
}
```

## Contributing

### Development Guidelines
1. All new analytics tools must implement the `AnalyticsTool` interface
2. Query responses must be cached for performance
3. Error handling must provide helpful guidance
4. All database queries must use parameterized statements
5. Rate limiting must be respected

### Adding New Tools
```typescript
// 1. Define tool interface
interface NewAnalyticsTool extends AnalyticsTool {
  name: string;
  analyze(params: NewToolParams): Promise<AnalysisResult>;
}

// 2. Implement tool
class NewAnalyticsToolImpl implements NewAnalyticsTool {
  // Implementation
}

// 3. Register tool
registerTool(new NewAnalyticsToolImpl());
```

The MCP server provides the foundation for AI-powered NWSL analytics, handling everything from simple queries to complex multi-tool orchestration while maintaining high performance and reliability.