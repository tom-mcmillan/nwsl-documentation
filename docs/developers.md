# Developers

Technical documentation for integrating with NWSL Data APIs, database, and AI services.

## Quick Start

Choose your integration approach:

- **REST API** - HTTP endpoints for applications
- **Direct Database** - PostgreSQL access for data science
- **MCP Server** - Advanced AI analytics integration
- **Client Libraries** - Pre-built language wrappers

## REST API

### Base URL
```
https://nwsl-database-proxy-78453984015.us-central1.run.app
```

### Authentication
Currently open for research use. No API key required.

### Core Endpoints

**SQL Queries** `POST /sql`
Execute read-only SQL queries against the database.

```bash
curl -X POST "https://nwsl-database-proxy-78453984015.us-central1.run.app/sql" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT COUNT(*) FROM events_2025 WHERE event_type_id = 16"}'
```

**Natural Language Analytics** `POST /query`
AI-powered analysis using natural language questions.

```bash
curl -X POST "https://nwsl-database-proxy-78453984015.us-central1.run.app/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "Who scored the most goals in 2025?"}'
```

**Health Check** `GET /health`
```bash
curl "https://nwsl-database-proxy-78453984015.us-central1.run.app/health"
```

### Response Formats

**SQL Response**
```json
{
  "results": [
    {"player_name": "Sophia Smith", "goals": 16},
    {"player_name": "Trinity Rodman", "goals": 14}
  ],
  "row_count": 2,
  "columns": ["player_name", "goals"]
}
```

**Analytics Response**
```json
{
  "analysis": "Based on the 2025 NWSL season data, Sophia Smith leads...",
  "summary": "Sophia Smith leads with 16 goals in 2025",
  "execution_time": "2.3s"
}
```

## Client Libraries

### Python Client
```python
import requests
import pandas as pd

class NWSLClient:
    def __init__(self, base_url="https://nwsl-database-proxy-78453984015.us-central1.run.app"):
        self.base_url = base_url

    def query(self, sql):
        """Execute SQL query and return DataFrame"""
        response = requests.post(f"{self.base_url}/sql", json={"query": sql})
        response.raise_for_status()
        return pd.DataFrame(response.json()['results'])

    def ask(self, question):
        """Ask natural language question"""
        response = requests.post(f"{self.base_url}/query", json={"query": question})
        response.raise_for_status()
        return response.json()

# Usage
client = NWSLClient()
df = client.query("SELECT player_name, COUNT(*) as goals FROM events_2025 e JOIN players p ON e.player_id = p.id WHERE e.event_type_id = 16 GROUP BY player_name ORDER BY goals DESC LIMIT 10")
```

### JavaScript/Node.js Client
```javascript
class NWSLClient {
    constructor(baseURL = 'https://nwsl-database-proxy-78453984015.us-central1.run.app') {
        this.baseURL = baseURL;
    }

    async query(sql) {
        const response = await fetch(`${this.baseURL}/sql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: sql })
        });
        return response.json();
    }

    async ask(question) {
        const response = await fetch(`${this.baseURL}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: question })
        });
        return response.json();
    }
}

// Usage
const client = new NWSLClient();
const data = await client.query("SELECT COUNT(*) FROM events_2025");
```

## Direct Database Access

### Connection Details
- **Host**: `34.72.26.89`
- **Port**: `5432`
- **Database**: `nwsl`
- **SSL Mode**: `prefer`

### Python Connection
```python
import psycopg2
import pandas as pd

conn = psycopg2.connect(
    host="34.72.26.89",
    port="5432",
    database="nwsl",
    user="notebookuser",  # Contact for credentials
    password="[password]",
    sslmode="prefer"
)

# Query with pandas
df = pd.read_sql("SELECT * FROM players LIMIT 10", conn)
```

### Connection Security
- Read-only database user with limited permissions
- SSL encryption for all connections
- Connection pooling recommended for applications
- Use Cloud SQL Proxy for enhanced security in production

## Database Schema

### Core Tables

**matches** - Match metadata
```sql
SELECT id, season, match_date, home_contestant_id, away_contestant_id
FROM matches
WHERE season = 2025;
```

**events_YYYY** - Match events (partitioned by year)
```sql
-- Available partitions: events_2022, events_2023, events_2024, events_2025
SELECT player_id, minute, x, y, event_type_id, team_id
FROM events_2025
WHERE match_id = 12345;
```

**players** - Player registry (auto-discovered from events)
```sql
SELECT id, player_name, first_known_name, last_known_name
FROM players
WHERE player_name ILIKE '%smith%';
```

**contestants** - Teams
```sql
SELECT id, name, country_id, type
FROM contestants;
```

### Analytics Tables

**shot_xg_analysis** - Expected Goals calculations
```sql
SELECT event_id, xg_value, shot_angle, distance_to_goal
FROM shot_xg_analysis
WHERE match_id = 12345;
```

**player_action_values** - VAEP metrics
```sql
SELECT player_id, action_id, vaep_offensive, vaep_defensive
FROM player_action_values
WHERE match_id = 12345;
```

### Event Types (Key IDs)
- `1` - Pass
- `13` - Miss (shot off target)
- `14` - Post (shot hit post/crossbar)
- `15` - Save (shot saved by keeper)
- `16` - Goal

## MCP Server Integration

For advanced AI analytics capabilities, integrate with the NWSL MCP server.

### Direct MCP Connection
```bash
# MCP server endpoint
https://mcp.nwsldata.com/mcp
```

### Available Tools
- `get_nwsl_player_rankings` - Player stats and rankings
- `analyze_spatial_patterns` - Shot patterns, positioning analysis
- `analyze_player_intelligence` - Player performance in context
- `analyze_tactical_effectiveness` - Formation and tactical analysis
- `compare_player_performance` - Multi-player comparisons

### MCP Request Example
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "analyze_spatial_patterns",
    "arguments": {"team": "Portland Thorns", "season": "2025"}
  },
  "id": 1
}
```

## Common Query Patterns

### Player Statistics
```sql
-- Top goal scorers
SELECT
    p.player_name,
    COUNT(*) as goals,
    AVG(e.x) as avg_shot_x,
    AVG(e.y) as avg_shot_y
FROM events_2025 e
JOIN players p ON e.player_id = p.id
WHERE e.event_type_id = 16
GROUP BY p.player_name
ORDER BY goals DESC
LIMIT 10;
```

### Team Performance
```sql
-- Team win/loss records
SELECT
    c.name as team_name,
    COUNT(*) as matches_played,
    SUM(CASE WHEN md.winner_id = c.id THEN 1 ELSE 0 END) as wins
FROM matches m
JOIN match_details md ON m.id = md.match_id
JOIN match_contestants mc ON m.id = mc.match_id
JOIN contestants c ON mc.contestant_id = c.id
WHERE m.season = 2025
GROUP BY c.name
ORDER BY wins DESC;
```

### Event Analysis with Qualifiers
```sql
-- Pass completion with end coordinates
SELECT
    e.id,
    e.minute,
    e.x as start_x,
    e.y as start_y,
    eq_end_x.value as end_x,
    eq_end_y.value as end_y,
    eq_success.value as successful
FROM events_2025 e
LEFT JOIN event_qualifiers_2025 eq_end_x ON e.id = eq_end_x.event_id AND eq_end_x.qualifier_id = 140
LEFT JOIN event_qualifiers_2025 eq_end_y ON e.id = eq_end_y.event_id AND eq_end_y.qualifier_id = 141
LEFT JOIN event_qualifiers_2025 eq_success ON e.id = eq_success.event_id AND eq_success.qualifier_id = 1
WHERE e.event_type_id = 1  -- Passes
  AND e.match_id = 12345
ORDER BY e.minute;
```

## Performance Optimization

### Query Best Practices
- Use year-partitioned event tables (`events_2025` vs `events_2024`)
- Include `LIMIT` clauses for large result sets
- Filter by `match_id` or `team_id` when possible
- Use indexes on `player_id`, `event_type_id`, and `minute`

### Rate Limits
- **SQL Endpoint**: 100 requests/hour per IP
- **Analytics Endpoint**: 50 requests/hour per IP
- **MCP Server**: 100 requests/hour per token

### Error Handling
```python
import time

def robust_query(client, sql, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.query(sql)
        except requests.HTTPError as e:
            if e.response.status_code == 429:  # Rate limit
                time.sleep(60)
                continue
            elif e.response.status_code == 408:  # Timeout
                # Simplify query or add more filters
                raise
            else:
                raise
```

## Integration Examples

### React Application
```jsx
import React, { useState, useEffect } from 'react';

function PlayerStats({ playerName }) {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetch('https://nwsl-database-proxy-78453984015.us-central1.run.app/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `Show me ${playerName}'s 2025 season statistics`
            })
        })
        .then(res => res.json())
        .then(setStats);
    }, [playerName]);

    return stats ? <div>{stats.summary}</div> : <div>Loading...</div>;
}
```

### Jupyter Notebook
```python
# Install dependencies
# !pip install pandas matplotlib seaborn requests

import pandas as pd
import matplotlib.pyplot as plt

# Fetch and visualize data
client = NWSLClient()
goals = client.query("""
    SELECT c.name as team, COUNT(*) as goals
    FROM events_2025 e
    JOIN match_contestants mc ON e.match_id = mc.match_id AND e.team_id = mc.contestant_id
    JOIN contestants c ON mc.contestant_id = c.id
    WHERE e.event_type_id = 16
    GROUP BY c.name
    ORDER BY goals DESC
""")

plt.figure(figsize=(12, 6))
plt.bar(goals['team'], goals['goals'])
plt.xticks(rotation=45)
plt.title('Goals by Team - 2025 Season')
plt.tight_layout()
plt.show()
```

## Testing & Development

### Health Checks
Always verify API connectivity before starting development:
```bash
curl "https://nwsl-database-proxy-78453984015.us-central1.run.app/health"
```

### Sample Queries for Testing
```sql
-- Quick connectivity test
SELECT COUNT(*) FROM matches;

-- Data availability check
SELECT season, COUNT(*) FROM matches GROUP BY season ORDER BY season;

-- Recent events sample
SELECT * FROM events_2025 ORDER BY id DESC LIMIT 5;
```

## Support & Resources

### Documentation
- Database schema details in the [Architecture](architecture.md) section
- Usage examples in [Use Cases](use-cases.md)
- Access methods in [Getting Started](getting-started.md)

### Getting Help
- Check API health endpoint first
- Verify query syntax with simple test queries
- Review rate limits if getting 429 errors
- Use natural language endpoint for complex analysis questions

### Contributing
The NWSL Data platform is built across multiple repositories:
- `nwsl-loader` - Data pipeline and processing
- `nwsl-mcp` - MCP server and AI analytics
- `nwsl-api` - Gateway API service
- `nwsl-nextjs-web` - Web application frontend
- `nwsl-documentation` - This documentation site

Ready to build with NWSL Data? Start with the REST API for simple integration, or dive into direct database access for advanced analytics capabilities.