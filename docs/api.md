# API

Direct access to NWSL data through RESTful API endpoints. The API provides both SQL query execution and intelligent analytics capabilities.

## Base URL
```
https://nwsl-database-proxy-78453984015.us-central1.run.app
```

## Authentication
The API is currently open for research and analysis use. No authentication required for basic access.

## Endpoints

### SQL Queries
**POST** `/sql`

Execute read-only SQL queries against the NWSL database.

#### Request Format
```json
{
  "query": "SELECT player_name, COUNT(*) as goals FROM events_2025 e JOIN players p ON e.player_id = p.id WHERE event_type_id = 16 GROUP BY player_name ORDER BY goals DESC LIMIT 10"
}
```

#### Response Format
```json
{
  "results": [
    {"player_name": "Sophia Smith", "goals": 16},
    {"player_name": "Trinity Rodman", "goals": 14},
    {"player_name": "Alex Morgan", "goals": 12}
  ],
  "row_count": 10,
  "columns": ["player_name", "goals"]
}
```

#### Query Restrictions
- Only `SELECT` and `WITH` statements allowed
- Maximum query length: 50,000 characters
- Read-only database access
- No DDL or DML operations

### Natural Language Analytics
**POST** `/query`

Submit natural language questions for AI-powered analysis.

#### Request Format
```json
{
  "query": "Who scored the most goals for Portland Thorns in 2025?"
}
```

#### Response Format
```json
{
  "analysis": "Based on the 2025 NWSL season data, Sophia Smith scored the most goals for Portland Thorns with 16 goals...",
  "summary": "Sophia Smith leads Portland Thorns with 16 goals in 2025",
  "data_points": 156,
  "execution_time": "2.3s"
}
```

### Health Check
**GET** `/health`

Check API and database connectivity status.

#### Response Format
```json
{
  "status": "healthy",
  "database": "connected",
  "mcp_server": "available",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## Client Libraries

### Python
```python
import requests
import pandas as pd

class NWSLClient:
    def __init__(self, base_url="https://nwsl-database-proxy-78453984015.us-central1.run.app"):
        self.base_url = base_url

    def query(self, sql):
        """Execute SQL query and return DataFrame"""
        response = requests.post(
            f"{self.base_url}/sql",
            json={"query": sql},
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        return pd.DataFrame(data['results'])

    def ask(self, question):
        """Ask natural language question"""
        response = requests.post(
            f"{self.base_url}/query",
            json={"query": question},
            timeout=60
        )
        response.raise_for_status()
        return response.json()

    def health(self):
        """Check API health"""
        response = requests.get(f"{self.base_url}/health")
        return response.json()

# Usage example
client = NWSLClient()

# SQL query
goal_scorers = client.query("""
    SELECT p.player_name, COUNT(*) as goals
    FROM events_2025 e
    JOIN players p ON e.player_id = p.id
    WHERE e.event_type_id = 16
    GROUP BY p.player_name
    ORDER BY goals DESC
    LIMIT 10
""")
print(goal_scorers)

# Natural language query
analysis = client.ask("Compare Sophia Smith and Trinity Rodman's performance")
print(analysis['summary'])
```

### JavaScript/Node.js
```javascript
const axios = require('axios');

class NWSLClient {
    constructor(baseURL = 'https://nwsl-database-proxy-78453984015.us-central1.run.app') {
        this.baseURL = baseURL;
        this.client = axios.create({
            baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async query(sql) {
        try {
            const response = await this.client.post('/sql', { query: sql });
            return response.data;
        } catch (error) {
            throw new Error(`Query failed: ${error.message}`);
        }
    }

    async ask(question) {
        try {
            const response = await this.client.post('/query', { query: question });
            return response.data;
        } catch (error) {
            throw new Error(`Analysis failed: ${error.message}`);
        }
    }

    async health() {
        const response = await this.client.get('/health');
        return response.data;
    }
}

// Usage example
const client = new NWSLClient();

// SQL query
client.query(`
    SELECT player_name, COUNT(*) as goals
    FROM events_2025 e
    JOIN players p ON e.player_id = p.id
    WHERE event_type_id = 16
    GROUP BY player_name
    ORDER BY goals DESC
    LIMIT 5
`).then(data => {
    console.log('Top goal scorers:', data.results);
}).catch(console.error);

// Natural language query
client.ask('What teams have the best home record?')
    .then(result => console.log(result.summary))
    .catch(console.error);
```

### cURL Examples
```bash
# SQL Query
curl -X POST https://nwsl-database-proxy-78453984015.us-central1.run.app/sql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT COUNT(*) as total_matches FROM matches WHERE season = 2025"
  }'

# Natural Language Query
curl -X POST https://nwsl-database-proxy-78453984015.us-central1.run.app/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Who won the most games at home in 2025?"
  }'

# Health Check
curl https://nwsl-database-proxy-78453984015.us-central1.run.app/health
```

## Common Queries

### Player Statistics
```sql
-- Top goal scorers by season
SELECT
    p.player_name,
    c.name as team_name,
    COUNT(*) as goals
FROM events_2025 e
JOIN players p ON e.player_id = p.id
JOIN matches m ON e.match_id = m.id
JOIN match_contestants mc ON m.id = mc.match_id AND e.team_id = mc.contestant_id
JOIN contestants c ON mc.contestant_id = c.id
WHERE e.event_type_id = 16  -- Goals
GROUP BY p.player_name, c.name
ORDER BY goals DESC
LIMIT 10;
```

### Team Performance
```sql
-- Team win/loss records
SELECT
    c.name as team_name,
    COUNT(*) as matches_played,
    SUM(CASE WHEN md.winner_id = c.id THEN 1 ELSE 0 END) as wins,
    SUM(CASE WHEN md.winner_id IS NULL THEN 1 ELSE 0 END) as draws,
    COUNT(*) - SUM(CASE WHEN md.winner_id = c.id THEN 1 ELSE 0 END) -
        SUM(CASE WHEN md.winner_id IS NULL THEN 1 ELSE 0 END) as losses
FROM matches m
JOIN match_details md ON m.id = md.match_id
JOIN match_contestants mc ON m.id = mc.match_id
JOIN contestants c ON mc.contestant_id = c.id
WHERE m.season = 2025
GROUP BY c.name
ORDER BY wins DESC;
```

### Match Events
```sql
-- Goals in a specific match
SELECT
    e.minute,
    e.second,
    p.player_name,
    c.name as team_name,
    e.x, e.y
FROM events_2025 e
JOIN players p ON e.player_id = p.id
JOIN match_contestants mc ON e.match_id = mc.match_id AND e.team_id = mc.contestant_id
JOIN contestants c ON mc.contestant_id = c.id
WHERE e.match_id = 12345
  AND e.event_type_id = 16  -- Goals
ORDER BY e.minute, e.second;
```

### Advanced Analytics
```sql
-- Shot locations and outcomes
SELECT
    p.player_name,
    e.x, e.y,
    CASE
        WHEN e.event_type_id = 16 THEN 'Goal'
        WHEN e.event_type_id = 15 THEN 'Save'
        WHEN e.event_type_id = 14 THEN 'Post'
        ELSE 'Miss'
    END as outcome,
    sxa.xg_value
FROM events_2025 e
JOIN players p ON e.player_id = p.id
LEFT JOIN shot_xg_analysis sxa ON e.id = sxa.event_id
WHERE e.event_type_id IN (13, 14, 15, 16)  -- Shot events
  AND e.match_id = 12345;
```

## Rate Limits
- **SQL Endpoint**: 100 requests per hour per IP
- **Query Endpoint**: 50 requests per hour per IP (higher computational cost)
- **Health Endpoint**: No rate limit

## Error Handling

### HTTP Status Codes
- `200 OK`: Request successful
- `400 Bad Request`: Invalid query or malformed request
- `408 Request Timeout`: Query execution timeout (>300s)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Database or server error
- `503 Service Unavailable`: Database unavailable

### Error Response Format
```json
{
  "error": {
    "code": "QUERY_ERROR",
    "message": "Invalid SQL syntax near 'SELECTT'",
    "details": {
      "line": 1,
      "column": 1
    }
  }
}
```

### Common Error Types
```python
# Handle API errors
try:
    result = client.query("SELECT * FROM invalid_table")
except requests.HTTPError as e:
    if e.response.status_code == 400:
        error_data = e.response.json()
        print(f"Query error: {error_data['error']['message']}")
    elif e.response.status_code == 429:
        print("Rate limit exceeded. Please wait before retrying.")
    else:
        print(f"API error: {e}")
except requests.Timeout:
    print("Request timeout. Query may be too complex.")
except requests.ConnectionError:
    print("Unable to connect to API. Check your internet connection.")
```

## Performance Considerations

### Query Optimization
- Use specific WHERE clauses to limit result sets
- Leverage year-partitioned event tables (events_2025, events_2024, etc.)
- Include LIMIT clauses for large datasets
- Use appropriate indexes (player_id, match_id, event_type_id)

### Best Practices
```python
# Good: Specific and limited
client.query("""
    SELECT player_name, COUNT(*) as goals
    FROM events_2025 e
    JOIN players p ON e.player_id = p.id
    WHERE e.event_type_id = 16
      AND e.match_id IN (SELECT id FROM matches WHERE season = 2025 LIMIT 100)
    GROUP BY player_name
    ORDER BY goals DESC
    LIMIT 10
""")

# Avoid: Unbounded queries
# client.query("SELECT * FROM events_2025")  # Don't do this
```

### Timeout Handling
```python
import time

def robust_query(client, sql, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.query(sql)
        except requests.Timeout:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
                continue
            raise
        except requests.HTTPError as e:
            if e.response.status_code == 429:  # Rate limit
                time.sleep(60)  # Wait 1 minute
                continue
            raise
```

## Integration Examples

### Jupyter Notebook Integration
```python
# In Jupyter/Colab cell
import matplotlib.pyplot as plt
import seaborn as sns

# Fetch data
client = NWSLClient()
goal_data = client.query("""
    SELECT
        c.name as team_name,
        COUNT(*) as goals_scored
    FROM events_2025 e
    JOIN match_contestants mc ON e.match_id = mc.match_id AND e.team_id = mc.contestant_id
    JOIN contestants c ON mc.contestant_id = c.id
    WHERE e.event_type_id = 16
    GROUP BY c.name
    ORDER BY goals_scored DESC
""")

# Visualize
plt.figure(figsize=(12, 6))
sns.barplot(data=goal_data, x='team_name', y='goals_scored')
plt.xticks(rotation=45)
plt.title('Goals Scored by Team - 2025 Season')
plt.tight_layout()
plt.show()
```

### Web Application Integration
```javascript
// React component example
import React, { useState, useEffect } from 'react';

function PlayerStats({ playerName }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const client = new NWSLClient();
        client.ask(`Show me ${playerName}'s season statistics`)
            .then(result => {
                setStats(result);
                setLoading(false);
            })
            .catch(console.error);
    }, [playerName]);

    if (loading) return <div>Loading stats...</div>;

    return (
        <div>
            <h3>{playerName} Statistics</h3>
            <p>{stats.summary}</p>
        </div>
    );
}
```

## Support

### Getting Help
- Check the [Database](database.md) documentation for schema information
- Use the `/health` endpoint to verify API connectivity
- Try simpler queries if complex ones fail
- Check rate limits if requests are being rejected

### Reporting Issues
For API issues, please provide:
- Request URL and payload
- Response status code and error message
- Timestamp of the request
- Expected vs actual behavior

The API provides programmatic access to the complete NWSL dataset, enabling integration with custom applications, data science workflows, and automated analysis systems.