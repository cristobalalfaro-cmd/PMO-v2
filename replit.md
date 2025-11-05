# Dashboard · Gestión de Proyectos

## Overview
This is a read-only Project Management Dashboard (in Spanish) that provides a comprehensive view of project tasks, deadlines, and status tracking. The application connects to Google Sheets for data via CSV export and provides interactive filtering, status breakdown, and executive summary with compliance metrics.

## Project Type
Static HTML/CSS/JavaScript website with:
- Vanilla JavaScript (no framework)
- External CDN libraries: PapaParse (CSV parsing), Chart.js (visualizations)
- Google Sheets integration for data storage
- Apps Script integration for updates

## Key Features
1. **Cascading Filters**: Type, Client, Project, Status, Owner - filters update dynamically based on previous selections
2. **Executive Summary**: KPI dashboard with 5 indicators:
   - Total Tareas
   - Total Tareas Finalizadas
   - Total Tareas Iniciadas
   - Total Tareas No Iniciadas / On Hold
   - Porcentaje de Cumplimiento (large indicator, calculated as finalizadas/totales)
   - Option to include/exclude finished tasks from small KPIs
3. **Visual Calendar**: 10-day upcoming calendar view showing:
   - Dates in DD-MMM format (e.g., 04-Nov)
   - Clients with events each day in colored boxes
   - Consistent color assignment per client
4. **Status Breakdown**: Accordion view with 5 mutually exclusive categories:
   - Finalizados: All tasks with "Finalizado" status
   - Atrasados: Tasks with deadline before yesterday (not finished)
   - Próximos vencimientos corto plazo (< 10 días): All tasks with deadline within next 10 days
   - En plazo: Initiated tasks with deadline > 10 days
   - Próximos vencimientos largo plazo (> 10 días): Non-initiated tasks with deadline > 10 days
5. **Date Format**: All dates displayed in DD/MM/AAAA (Chilean standard)
6. **Data Refresh**: Pull latest data from Google Sheets
7. **Share Links**: Generate filtered URLs with email-based access control
8. **Password Protection**: Access key "Tomi.2016" required

## Architecture
```
/
├── index.html          - Main HTML page
├── css/
│   └── styles.css      - Dark theme styling
├── js/
│   ├── app.js         - Main application logic
│   └── utils.js       - Helper functions
├── data/
│   ├── config.js      - Configuration (CSV URL, Apps Script URL, column mappings)
│   └── sample.csv     - Sample data file
├── scripts/
│   ├── apps_script_webapp_api.gs    - Apps Script for status updates
│   └── apps_script_pmo_emails.gs    - Apps Script for automated emails
└── server.py          - Simple HTTP server for Replit deployment
```

## Configuration
The application is configured via `data/config.js`:
- `csvUrl`: Published Google Sheets CSV endpoint
- `gsUpdateUrl`: Apps Script Web App URL for saving status changes
- `columns`: Column name mappings
- `estatusOptions`: Available status values

## Data Integration
- **Data Source**: Google Sheets (published as CSV)
- **Updates**: Via Apps Script Web App (POST requests)
  - Apps Script handles updates for: Tareas, Owner, Deadline, Estatus
  - Format: `{ changes: [{ id, changes: { fieldName: newValue } }] }`
  - See `INSTRUCCIONES_APPS_SCRIPT.md` for setup instructions
- **Automated Emails**: Apps Script triggers on Mon/Wed/Fri at 8:00 AM (America/Santiago timezone)

## Access Control
1. **Password Access**: Default password "Tomi.2016"
2. **Shared Links**: URL parameters with email validation
   - Format: `?cliente=<Client>&proyecto=<Project>&share=1&email=<email>`
   - Access granted if email exists in the Email column for that Client/Project

## Recent Changes
- **2025-11-05**: Enhanced status breakdown and added visual calendar
  - **New Calendar Visual Section**: Added 10-day calendar view between Executive Summary and Status Breakdown
    - Displays upcoming 10 days with dates in DD-MMM format (e.g., 04-Nov)
    - Shows clients with events each day in colored boxes
    - Each client assigned a unique, consistent color across the dashboard
  - **Expanded Status Breakdown Categories**: Reorganized into 5 mutually exclusive categories:
    - Finalizados: Tasks with "Finalizado" status
    - Atrasados: Tasks with deadline before yesterday (not finished)
    - Próximos vencimientos corto plazo (< 10 días): ALL tasks (initiated or not) with deadline within next 10 days
    - En plazo: Initiated tasks with deadline > 10 days
    - Próximos vencimientos largo plazo (> 10 días): Non-initiated tasks with deadline > 10 days
- **2025-11-05**: Removed all editing functionality - dashboard is now read-only
  - Removed "Editar tareas" button and all edit mode controls
  - Removed edit functionality from app.js (EDIT_MODE, bindEditTasks, trackChange, save/discard functions)
  - Simplified renderAperturaPorEstatus to display read-only tables only
  - Implemented Chilean date format (DD/MM/AAAA) using formatDateCL function in utils.js
  - Redesigned Executive Summary with 5 KPIs in new layout:
    - 4 small KPIs: Total Tareas, Total Finalizadas, Total Iniciadas, Total No Iniciadas/On Hold
    - 1 large KPI: Porcentaje de Cumplimiento (double size, spans 2 rows)
  - Fixed percentage calculation: always computes finalizadas/totales from full filtered dataset
  - Updated CSS grid layout: 4 small KPIs in 2 columns, 1 large KPI in column 3 spanning 2 rows
- **2025-11-03**: Enhanced features
  - Implemented cascading filters (filters update dynamically based on selections)
  - Added "Finalizados" category in Status Breakdown section
  - Modified "Atrasados" to only show tasks with deadline before yesterday (not finished)
- **2025-11-03**: Initial Replit setup
  - Created Python HTTP server (server.py) to serve static files
  - Configured workflow to run on port 5000
  - Added cache-control headers to prevent caching issues

## Deployment Notes
- Server binds to 0.0.0.0:5000 for Replit compatibility
- Cache-Control headers added to ensure updates are visible
- No backend processing - all logic runs client-side
- External dependencies loaded via CDN

## Development
- Run: `python3 server.py`
- The server serves all files from the root directory
- No build process required
