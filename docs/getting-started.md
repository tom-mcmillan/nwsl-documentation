# Getting Started

There are several ways to access NWSL data, depending on your needs and technical comfort level. Choose the option that works best for you.

## Quick Access (No Setup Required)

### ChatGPT
The easiest way to start exploring NWSL data.

**Access**: [NWSL Data GPT](https://chatgpt.com/g/g-your-gpt-id)

**Best for**: Quick questions, casual exploration, fans

**Example questions**:
- "Who are the top 5 goal scorers in 2024?"
- "How did Portland Thorns perform at home vs away?"
- "Show me Sophia Smith's shooting stats"

### Claude (with MCP)
Advanced AI analysis with direct database access.

**Setup**: Add MCP server to Claude Desktop configuration

**Best for**: Deep analysis, tactical insights, researchers

**Example queries**:
- "Compare Rose Lavelle and Sofia Smith field positioning effectiveness"
- "Analyze Kansas City Current's defensive patterns in the final third"
- "Formation effectiveness when teams are trailing by 1 goal"

[Full Claude setup instructions →](https://docs.claude.com/en/docs/claude-code/claude_code_docs_map.md)

## Interactive Analysis

### Jupyter Notebooks
Run your own analysis with pre-built notebooks.

**Google Colab** (browser-based, no installation):
1. Open [NWSL Starter Notebook](https://colab.research.google.com/your-notebook-url)
2. Click "Run All" to connect to the database
3. Modify queries and create visualizations

**Local Jupyter** (Python required):
```bash
pip install jupyter pandas matplotlib plotly psycopg2
jupyter notebook nwsl_analysis.ipynb
```

**Best for**: Custom analysis, visualizations, data science projects

## Direct Database Access

### REST API
Programmatic access for applications and advanced users.

**Endpoint**: `https://api.nwsldata.com`

**Natural language queries**:
```bash
curl -X POST "https://api.nwsldata.com/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "Top scorers by team in 2024"}'
```

**Direct SQL** (for data scientists):
```bash
curl -X POST "https://api.nwsldata.com/sql" \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT player_name, goals FROM player_stats ORDER BY goals DESC LIMIT 10"}'
```

**Best for**: Applications, automated analysis, integration projects

### Web Application
User-friendly interface for data exploration.

**Access**: [nwsldata.com](https://nwsldata.com)

**Features**:
- Interactive charts and visualizations
- Team and player comparison tools
- Download capabilities for further analysis
- Mobile-responsive design

**Best for**: Visual exploration, sharing insights, presentation-ready charts

## Which Option Should I Choose?

| User Type | Recommended Access | Why |
|-----------|-------------------|-----|
| **Fans** | ChatGPT or Web App | Quick answers, no technical setup |
| **Players/Coaches** | Claude + Web App | Deep tactical analysis + visual tools |
| **Analysts/Researchers** | Claude + Jupyter | Advanced analysis capabilities |
| **Data Scientists** | API + Jupyter | Full programmatic control |
| **Developers** | REST API | Integration with existing systems |
| **Business Users** | Web App + ChatGPT | Professional visualizations + quick insights |

## Getting Help

- **Quick questions**: Use ChatGPT for immediate answers
- **Technical issues**: Check the [Developers](developers.md) section
- **Use case examples**: See [Use Cases](use-cases.md) for inspiration
- **System details**: Review [Architecture](architecture.md) for technical overview

Ready to explore NWSL data? Pick your preferred access method above and start asking questions!