# NWSL Data Platform

The NWSL Data Platform provides comprehensive access to National Women's Soccer League analytics through multiple interfaces designed for different user needs.

## What This Platform Offers

### For Research Consumers
- **Published Research**: Analysis and insights at [research.nwsldata.com](https://research.nwsldata.com)
- **AI Assistant**: Natural language queries through our custom ChatGPT integration
- **Interactive Analysis**: Direct access to data through guided notebooks

### For Technical Users
- **Complete Database**: 558K+ events from 1,092 matches (2013-2025)
- **Direct SQL Access**: Query the full PostgreSQL database
- **Advanced Analytics**: Expected goals, VAEP scores, spatial analysis
- **Python Integration**: Jupyter notebooks with soccer-specific libraries

## Platform Architecture

The platform consists of four integrated layers:

1. **Database**: PostgreSQL with complete OPTA match data
2. **API**: RESTful interface for SQL queries and analytics
3. **MCP Server**: AI-powered analytics through Claude integration
4. **Web Interface**: Three access methods for different use cases

## Data Coverage

- **Matches**: 1,092 complete matches processed
- **Events**: 558K+ individual match events with coordinates
- **Players**: 770+ unique player profiles
- **Venues**: 39 stadium locations
- **Seasons**: 2013-2025 (updated regularly)

## Getting Started

Choose your access method based on your needs:

- **New to NWSL data?** → Start with [ChatGPT](chatgpt.md)
- **Want to analyze data?** → Use [Colab Notebook](colab-notebook.md)
- **Building applications?** → See [API](api.md) documentation
- **Using Claude?** → Configure [MCP](mcp.md) integration