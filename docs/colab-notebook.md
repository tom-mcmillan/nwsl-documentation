# Colab Notebook

Access and analyze NWSL data using pre-configured Google Colab notebooks. This is the fastest way to start working with the data using Python, pandas, and soccer visualization libraries.

## Quick Start

### Direct Access
Open the starter notebook directly in Google Colab:
[https://colab.research.google.com/#fileId=https%3A//storage.googleapis.com/nwsldata-notebooks/nwsl_database_v4.ipynb](https://colab.research.google.com/#fileId=https%3A//storage.googleapis.com/nwsldata-notebooks/nwsl_database_v4.ipynb)

### Requirements
- Google account (free)
- No local installation required
- All libraries pre-installed in the notebook

*[Screenshot placeholder: Google Colab interface with NWSL notebook loaded]*

## What's Included

### Pre-configured Environment
The notebook includes all necessary libraries:

```python
# Data analysis
import pandas as pd
import numpy as np

# Visualization
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go

# Soccer-specific
import mplsoccer as mpl
from mplsoccer import Pitch

# Database connection
import requests
import json
```

### Database Connection
Simple API wrapper for querying NWSL data:

```python
class NWSLDatabase:
    def __init__(self):
        self.api_url = "https://nwsl-database-proxy-78453984015.us-central1.run.app"

    def query(self, sql):
        """Execute SQL query and return pandas DataFrame"""
        response = requests.post(
            f"{self.api_url}/sql",
            json={"query": sql}
        )
        data = response.json()
        return pd.DataFrame(data['results'])

    def ask(self, question):
        """Ask natural language question"""
        response = requests.post(
            f"{self.api_url}/query",
            json={"query": question}
        )
        return response.json()

# Initialize database connection
db = NWSLDatabase()
```

### Sample Analyses
The notebook includes ready-to-run examples:

**Player Performance Analysis**
```python
# Top goal scorers in 2025
goal_scorers = db.query("""
    SELECT
        p.player_name,
        COUNT(*) as goals,
        c.name as team_name
    FROM events_2025 e
    JOIN players p ON e.player_id = p.id
    JOIN matches m ON e.match_id = m.id
    JOIN match_contestants mc ON m.id = mc.match_id AND e.team_id = mc.contestant_id
    JOIN contestants c ON mc.contestant_id = c.id
    WHERE e.event_type_id = 16  -- Goals
    GROUP BY p.player_name, c.name
    ORDER BY goals DESC
    LIMIT 10
""")

print(goal_scorers)
```

**Shot Location Analysis**
```python
# Shot map for a specific player
shots = db.query("""
    SELECT
        e.x, e.y, e.event_type_id,
        CASE WHEN e.event_type_id = 16 THEN 'Goal'
             WHEN e.event_type_id = 15 THEN 'Save'
             WHEN e.event_type_id = 14 THEN 'Post'
             ELSE 'Miss' END as outcome
    FROM events_2025 e
    JOIN players p ON e.player_id = p.id
    WHERE p.player_name = 'Sophia Smith'
      AND e.event_type_id IN (13, 14, 15, 16)
""")

# Create shot map
fig, ax = plt.subplots(figsize=(12, 8))
pitch = Pitch(pitch_type='opta', pitch_color='grass', line_color='white')
pitch.draw(ax=ax)

# Plot shots colored by outcome
for outcome in shots['outcome'].unique():
    data = shots[shots['outcome'] == outcome]
    pitch.scatter(data['x'], data['y'],
                 s=100, label=outcome, ax=ax, alpha=0.7)

ax.legend()
ax.set_title('Sophia Smith - Shot Locations 2025')
plt.show()
```

## Available Data

### Tables You Can Query
```python
# Explore available tables
tables = db.query("""
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
""")
print(tables)
```

### Key Tables
- `events_2025`, `events_2024`, etc. - Match events with coordinates
- `matches` - Match information
- `players` - Player profiles
- `contestants` - Team information
- `venues` - Stadium details
- `player_xg_summary` - Expected goals analysis
- `shot_xg_analysis` - Shot-level xG data

## Advanced Visualizations

### Team Formation Heatmap
```python
# Average positions for a team
positions = db.query("""
    SELECT
        p.player_name,
        AVG(e.x) as avg_x,
        AVG(e.y) as avg_y,
        COUNT(*) as events
    FROM events_2025 e
    JOIN players p ON e.player_id = p.id
    JOIN matches m ON e.match_id = m.id
    JOIN match_contestants mc ON m.id = mc.match_id
        AND e.team_id = mc.contestant_id
    JOIN contestants c ON mc.contestant_id = c.id
    WHERE c.name = 'Portland Thorns FC'
      AND m.match_date >= '2025-01-01'
    GROUP BY p.player_name
    HAVING COUNT(*) > 50  -- Minimum events
""")

# Create formation visualization
fig, ax = plt.subplots(figsize=(12, 8))
pitch = Pitch(pitch_type='opta')
pitch.draw(ax=ax)

# Plot average positions
for _, player in positions.iterrows():
    pitch.scatter(player['avg_x'], player['avg_y'],
                 s=200, ax=ax, alpha=0.8)
    ax.text(player['avg_x'], player['avg_y'] + 2,
           player['player_name'].split()[-1],  # Last name only
           ha='center', fontsize=8)

ax.set_title('Portland Thorns - Average Player Positions 2025')
plt.show()
```

### Pass Network Analysis
```python
# Pass connections between players
pass_network = db.query("""
    SELECT
        passer.player_name as passer,
        receiver.player_name as receiver,
        COUNT(*) as passes
    FROM events_2025 e1
    JOIN events_2025 e2 ON e1.match_id = e2.match_id
        AND e1.team_id = e2.team_id
        AND e2.event_id = e1.event_id + 1
    JOIN players passer ON e1.player_id = passer.id
    JOIN players receiver ON e2.player_id = receiver.id
    WHERE e1.event_type_id = 1  -- Pass
      AND e2.event_type_id != 1  -- Next event is not pass
    GROUP BY passer.player_name, receiver.player_name
    HAVING COUNT(*) >= 5
    ORDER BY passes DESC
""")

# Visualize as network graph
import networkx as nx

G = nx.from_pandas_edgelist(pass_network,
                           source='passer',
                           target='receiver',
                           edge_attr='passes')

pos = nx.spring_layout(G)
nx.draw(G, pos, with_labels=True, node_color='lightblue',
        node_size=1000, font_size=8, font_weight='bold')
plt.title('Pass Network - Team Connections')
plt.show()
```

## Natural Language Queries

### Using the AI Assistant
```python
# Ask questions in natural language
response = db.ask("Who has the best shot accuracy in the penalty box?")
print(response['analysis'])

# Complex analysis
response = db.ask("Compare Portland and Seattle's defensive effectiveness")
print(response['summary'])
```

## Data Export

### Save Results
```python
# Export data to CSV for further analysis
goal_scorers.to_csv('nwsl_goal_scorers_2025.csv', index=False)

# Save to Google Drive (if connected)
from google.colab import drive
drive.mount('/content/drive')
goal_scorers.to_csv('/content/drive/My Drive/nwsl_analysis.csv', index=False)
```

### Share Analysis
```python
# Create shareable visualization
fig = px.bar(goal_scorers.head(10),
             x='player_name', y='goals',
             color='team_name',
             title='Top 10 NWSL Goal Scorers 2025')
fig.show()

# Save as HTML for sharing
fig.write_html('/content/drive/My Drive/goal_scorers_chart.html')
```

## Performance Tips

### Query Optimization
```python
# Use specific date ranges
recent_matches = db.query("""
    SELECT * FROM matches
    WHERE match_date >= '2025-01-01'
    LIMIT 100
""")

# Limit result size for large queries
all_events = db.query("""
    SELECT * FROM events_2025
    WHERE match_id IN (SELECT id FROM matches ORDER BY match_date DESC LIMIT 10)
""")
```

### Memory Management
```python
# For large datasets, process in chunks
chunk_size = 1000
for i in range(0, total_matches, chunk_size):
    chunk = db.query(f"""
        SELECT * FROM events_2025
        WHERE match_id BETWEEN {i} AND {i + chunk_size}
    """)
    # Process chunk
    process_chunk(chunk)
```

## Common Use Cases

### Player Scouting Report
```python
def player_report(player_name, season=2025):
    """Generate comprehensive player analysis"""

    # Basic stats
    stats = db.query(f"""
        SELECT
            COUNT(CASE WHEN event_type_id = 16 THEN 1 END) as goals,
            COUNT(CASE WHEN event_type_id = 1 THEN 1 END) as passes,
            AVG(x) as avg_x, AVG(y) as avg_y
        FROM events_{season} e
        JOIN players p ON e.player_id = p.id
        WHERE p.player_name = '{player_name}'
    """)

    # Shot analysis
    shots = db.query(f"""
        SELECT x, y, event_type_id
        FROM events_{season} e
        JOIN players p ON e.player_id = p.id
        WHERE p.player_name = '{player_name}'
          AND event_type_id IN (13, 14, 15, 16)
    """)

    return {
        'stats': stats,
        'shots': shots
    }

# Generate report
report = player_report('Sophia Smith')
print(f"Goals: {report['stats']['goals'].iloc[0]}")
print(f"Total shots: {len(report['shots'])}")
```

### Match Analysis
```python
def match_analysis(team1, team2, date):
    """Analyze specific match between teams"""

    match_events = db.query(f"""
        SELECT e.*, p.player_name, c.name as team_name
        FROM events_2025 e
        JOIN players p ON e.player_id = p.id
        JOIN matches m ON e.match_id = m.id
        JOIN match_contestants mc ON m.id = mc.match_id AND e.team_id = mc.contestant_id
        JOIN contestants c ON mc.contestant_id = c.id
        WHERE m.match_date = '{date}'
          AND ((c.name = '{team1}') OR (c.name = '{team2}'))
        ORDER BY e.minute, e.second
    """)

    return match_events

# Analyze specific match
match = match_analysis('Portland Thorns FC', 'Seattle Reign FC', '2025-05-15')
print(f"Total events in match: {len(match)}")
```

## Troubleshooting

### Common Issues
```python
# Check database connection
try:
    test = db.query("SELECT 1 as test")
    print("✅ Database connected successfully")
except Exception as e:
    print(f"❌ Database connection failed: {e}")

# Handle query errors
def safe_query(sql):
    try:
        return db.query(sql)
    except Exception as e:
        print(f"Query failed: {e}")
        return pd.DataFrame()
```

### Getting Help
```python
# Explore table structure
def describe_table(table_name):
    return db.query(f"""
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = '{table_name}'
        ORDER BY ordinal_position
    """)

print(describe_table('events_2025'))
```

*[Screenshot placeholder: Colab notebook running NWSL analysis with visualizations]*

## Next Steps

After exploring the data in Colab:
- Export findings for presentations
- Build custom analysis functions
- Combine with other datasets
- Share notebooks with colleagues
- Move to production environments for automated analysis

The Colab notebook provides the perfect environment for interactive NWSL data exploration and analysis.