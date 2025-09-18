# Claude MCP Connector

Set up Claude to access NWSL data through a Model Context Protocol (MCP) connector. This enables direct integration with Claude Desktop, Claude Code, or custom Claude implementations.

## Overview

The NWSL MCP server provides Claude with direct access to the comprehensive NWSL database through natural language queries. Unlike the pre-built ChatGPT assistant, this requires technical setup but offers more flexibility and integration options.

## MCP Server Details

### Endpoint Information
- **Server URL**: `https://nwsl-mcp-78453984015.us-central1.run.app/mcp`
- **Protocol**: HTTP with streamable transport
- **Authentication**: Service token based
- **Response Format**: JSON-RPC 2.0

### Available Tools
- `soccer_analytics_query`: Natural language NWSL data queries
- `inspect_database`: Database schema inspection

## Claude Desktop Setup

### 1. Configuration File
Add the NWSL MCP server to your Claude Desktop configuration:

**Location**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)

```json
{
  "mcpServers": {
    "nwsl-analytics": {
      "command": "node",
      "args": ["/path/to/mcp-client.js"],
      "env": {
        "MCP_SERVER_URL": "https://nwsl-mcp-78453984015.us-central1.run.app/mcp",
        "SVC_TOKEN": "[contact for token]"
      }
    }
  }
}
```

### 2. Client Implementation
Create `mcp-client.js`:

```javascript
import { HttpTransport } from '@modelcontextprotocol/transport-http';
import { Client } from '@modelcontextprotocol/client';

const transport = new HttpTransport({
  endpoint: process.env.MCP_SERVER_URL,
  headers: {
    'Authorization': `Bearer ${process.env.SVC_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

const client = new Client(transport);

// Initialize connection
await client.initialize();

// Export for Claude Desktop
export default client;
```

### 3. Restart Claude Desktop
After configuration, restart Claude Desktop to load the new MCP server.

## Claude Code Integration

### VS Code Extension Setup
For Claude Code users, configure the MCP server in your workspace:

```json
// .vscode/settings.json
{
  "claude.mcpServers": {
    "nwsl": {
      "command": "npx",
      "args": ["@nwsl/mcp-client"],
      "env": {
        "NWSL_MCP_URL": "https://nwsl-mcp-78453984015.us-central1.run.app/mcp"
      }
    }
  }
}
```

## Custom Implementation

### Direct HTTP Requests
For custom integrations, query the MCP server directly:

```python
import requests
import json

def query_nwsl_data(question):
    url = "https://nwsl-mcp-78453984015.us-central1.run.app/mcp"

    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "soccer_analytics_query",
            "arguments": {
                "query": question
            }
        }
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer [your-token]"
    }

    response = requests.post(url, json=payload, headers=headers)
    return response.json()

# Example usage
result = query_nwsl_data("Who scored the most goals in 2025?")
print(result["result"]["content"][0]["text"])
```

### JavaScript Implementation
```javascript
async function queryNWSL(question) {
    const response = await fetch('https://nwsl-mcp-78453984015.us-central1.run.app/mcp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer [your-token]'
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
                name: 'soccer_analytics_query',
                arguments: { query: question }
            }
        })
    });

    const data = await response.json();
    return data.result.content[0].text;
}

// Example usage
const answer = await queryNWSL('Compare Sophia Smith and Trinity Rodman shot accuracy');
console.log(answer);
```

## Available Queries

### Simple Analytics
```
"Top 5 goal scorers in 2025"
"Portland Thorns home record this season"
"Average attendance at Providence Park"
```

### Complex Analysis
```
"Compare Rose Lavelle and Sofia Smith field positioning effectiveness"
"Analyze Kansas City Current's defensive patterns in the final third"
"Show formation effectiveness for teams in high-pressure situations"
```

### Database Exploration
```
"What tables are available in the database?"
"Show me the schema for player events"
"What event types are tracked?"
```

## Response Format

The MCP server returns structured responses:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Based on the 2025 NWSL season data:\n\n1. Sophia Smith (Portland Thorns): 16 goals\n2. Trinity Rodman (Washington Spirit): 14 goals\n3. Alex Morgan (San Diego Wave): 12 goals\n..."
      }
    ]
  }
}
```

## Authentication

### Service Token
Contact the NWSL Data team for a service token:
- Tokens are issued for legitimate research and analysis use
- Rate limits apply based on usage patterns
- Tokens can be revoked if misused

### Token Usage
```bash
# Environment variable
export NWSL_SVC_TOKEN="your_token_here"

# In requests
Authorization: Bearer your_token_here
```

## Error Handling

### Common Errors
```json
// Invalid query
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Invalid query parameters"
  }
}

// Authentication failed
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32001,
    "message": "Authentication required"
  }
}
```

### Error Recovery
```python
def safe_query(question):
    try:
        result = query_nwsl_data(question)
        if "error" in result:
            return f"Error: {result['error']['message']}"
        return result["result"]["content"][0]["text"]
    except Exception as e:
        return f"Connection error: {str(e)}"
```

## Performance Considerations

### Query Optimization
- Be specific in your questions for faster responses
- Complex multi-part queries may take 10-30 seconds
- Simple statistical queries return in 1-3 seconds

### Rate Limits
- 100 requests per hour per token
- Complex queries count as 2-3 requests
- Database inspection queries are rate limited separately

### Caching
The MCP server includes intelligent caching:
- Repeated identical queries return cached results
- Cache invalidation happens on data updates
- Cache TTL is 15 minutes for statistical queries

## Troubleshooting

### Connection Issues
1. Verify the MCP server URL is correct
2. Check your service token is valid
3. Ensure network connectivity to Google Cloud

### Query Problems
1. Start with simple questions to test connectivity
2. Use the `inspect_database` tool to explore available data
3. Check query syntax and be specific about time periods

### Integration Issues
1. Restart Claude Desktop after configuration changes
2. Check console logs for MCP initialization errors
3. Verify environment variables are set correctly

*[Screenshot placeholder: Claude Desktop with NWSL MCP server successfully connected]*

## Next Steps

Once configured, you can:
- Ask natural language questions about NWSL data
- Integrate responses into your analysis workflows
- Build custom applications using the MCP protocol
- Combine with other MCP servers for enhanced capabilities

The Claude MCP connector provides the most flexible access to NWSL data, enabling custom integrations and advanced analysis workflows.