# Database Overview

The NWSL database contains comprehensive match data from the National Women's Soccer League, processed from OPTA Sports feeds and structured for analytics.



### Architecture
- **Platform**: PostgreSQL 17 on Google Cloud SQL
- **Size**: ~50GB with indexes
- **Tables**: 47+ tables with year-partitioned event data
- **Access**: Read-only connections for security

### Data Sources
- **Primary**: OPTA Sports API (complete match feeds)
- **Coverage**: 1,092 matches from 2013-2025 seasons
- **Processing**: Zero data loss pipeline preserving all source information

## Core Tables

### Match Information
```sql
-- Core match metadata
SELECT * FROM matches LIMIT 5;

-- Match details with live status
SELECT * FROM match_details WHERE status = 'FullTime';

-- Period timing information
SELECT * FROM match_periods WHERE period_name = '1st Half';
```

### Event Data (Year-Partitioned)
Events are partitioned by year for performance:

- `events_2022`: 241K events
- `events_2023`: 7K events
- `events_2024`: 133K events
- `events_2025`: 177K events

```sql
-- Get all goals from 2025
SELECT player_id, minute, x, y, team_id
FROM events_2025
WHERE event_type_id = 16;  -- Goals

-- Shot locations for a specific player
SELECT minute, x, y, event_type_id
FROM events_2025
WHERE player_id = 123456
  AND event_type_id IN (13, 14, 15, 16);  -- Shot events
```

### Event Qualifiers (Year-Partitioned)
Detailed context for each event:

- `event_qualifiers_2022`: 1.08M qualifiers
- `event_qualifiers_2023`: 32K qualifiers
- `event_qualifiers_2024`: 600K qualifiers
- `event_qualifiers_2025`: 815K qualifiers

```sql
-- Get pass accuracy qualifiers
SELECT eq.event_id, eq.qualifier_id, eq.value
FROM event_qualifiers_2025 eq
WHERE eq.qualifier_id = 212;  -- Pass accuracy percentage
```

### Reference Tables

```sql
-- Teams and venues
SELECT * FROM contestants;   -- 17 teams
SELECT * FROM venues;        -- 39 stadiums with coordinates

-- Players (auto-discovered from events)
SELECT * FROM players WHERE player_name ILIKE '%smith%';

-- Event and qualifier type references
SELECT * FROM event_type;     -- 67 event types
SELECT * FROM qualifier_type; -- 272 qualifier types
```

## Advanced Analytics Tables

### Expected Goals (xG)
```sql
-- Player xG summary
SELECT player_name, total_shots, total_xg, goals_scored
FROM player_xg_summary
ORDER BY total_xg DESC;

-- Shot-level xG analysis
SELECT shot_id, xg_value, outcome, shot_type
FROM shot_xg_analysis
WHERE match_id = 12345;
```

### VAEP Analysis
```sql
-- Valuing Actions by Estimating Probabilities
SELECT action_id, vaep_offensive, vaep_defensive, total_vaep
FROM vaep_actions
WHERE player_id = 123456
ORDER BY total_vaep DESC;
```

### Spatial Analysis
```sql
-- Field position zones
SELECT zone_id, zone_name, avg_success_rate
FROM spatial_zones
WHERE action_type = 'pass';
```

## Data Access Patterns

### Common Queries

**Team Performance**
```sql
-- Team's home vs away performance
SELECT
    c.name as team_name,
    md.venue_type,
    COUNT(*) as matches,
    SUM(CASE WHEN md.winner_id = c.id THEN 1 ELSE 0 END) as wins
FROM matches m
JOIN match_details md ON m.id = md.match_id
JOIN match_contestants mc ON m.id = mc.match_id
JOIN contestants c ON mc.contestant_id = c.id
WHERE m.season = 2025
GROUP BY c.name, md.venue_type;
```

**Player Statistics**
```sql
-- Top goal scorers by season
WITH goals AS (
    SELECT
        p.player_name,
        COUNT(*) as goals,
        m.season
    FROM events_2025 e
    JOIN players p ON e.player_id = p.id
    JOIN matches m ON e.match_id = m.id
    WHERE e.event_type_id = 16  -- Goals
    GROUP BY p.player_name, m.season
)
SELECT * FROM goals
ORDER BY goals DESC
LIMIT 10;
```

**Formation Analysis**
```sql
-- Team formation usage
SELECT
    c.name,
    formation,
    COUNT(*) as times_used
FROM match_contestants mc
JOIN contestants c ON mc.contestant_id = c.id
WHERE mc.formation IS NOT NULL
  AND season = 2025
GROUP BY c.name, formation
ORDER BY c.name, times_used DESC;
```

## Connection Information

### Direct Database Access
```python
import psycopg2
import pandas as pd

# Read-only connection
conn = psycopg2.connect(
    host="[contact for host]",
    port="5432",
    database="nwsl",
    user="notebookuser",
    password="[contact for access]",
    sslmode="prefer"
)

# Query example
df = pd.read_sql("""
    SELECT player_name, COUNT(*) as goals
    FROM events_2025 e
    JOIN players p ON e.player_id = p.id
    WHERE event_type_id = 16
    GROUP BY player_name
    ORDER BY goals DESC
    LIMIT 10
""", conn)
```

### Through API
```python
import requests

response = requests.post(
    "https://nwsl-database-proxy-78453984015.us-central1.run.app/sql",
    json={"query": "SELECT COUNT(*) FROM events_2025"}
)
data = response.json()
```

## Data Quality

### Completeness
- **Match Coverage**: 80.4% success rate (1,092/1,358 URLs processed)
- **Event Granularity**: Sub-second timestamps with x,y coordinates
- **Missing Data**: Identified and tracked in processing logs

### Validation
- Duplicate event detection and handling
- Cross-reference validation between tables
- Automated quality checks during ingestion

## Schema Documentation

### Event Types (Sample)
| ID | Name | Description |
|----|------|-------------|
| 1  | Pass | Attempted pass |
| 13 | Miss | Shot off target |
| 14 | Post | Shot hit post/crossbar |
| 15 | Save | Shot saved by keeper |
| 16 | Goal | Successful goal |

### Qualifier Types (Sample)
| ID | Name | Description |
|----|------|-------------|
| 140 | Pass End X | Pass destination x-coordinate |
| 141 | Pass End Y | Pass destination y-coordinate |
| 212 | Pass Accuracy | Pass completion percentage |

*[Screenshot placeholder: Database schema diagram showing table relationships]*

## Performance Considerations

### Indexing Strategy
- Primary keys on all tables
- Composite indexes on (match_id, minute) for events
- Indexes on player_id and team_id for performance

### Query Optimization
- Use year-partitioned tables for date ranges
- Limit result sets with appropriate WHERE clauses
- Consider EXPLAIN ANALYZE for complex queries

### Best Practices
- Use prepared statements for repeated queries
- Batch operations when possible
- Monitor query execution time