# HackNova Backend

## Overview
The backend for HackNova's AgentGuard project. It uses FastAPI to provide API services for the frontend dashboard.

## Requirements
- Python 3.10 or later (use a version compatible with the project's dependencies)
- pip

## Setup Instructions

### 1. Open the backend directory

```bash
cd backend
```

### 2. Install dependencies

On Windows, run:

```powershell
py -m pip install -r requirements.txt
```

### 3. Start the backend server

```powershell
py -m uvicorn app.main:app --reload --port 8000
```

When the server starts successfully, the API will be available at:

- **API base URL:** http://127.0.0.1:8000
- **Interactive API documentation:** http://127.0.0.1:8000/docs

Keep the terminal running while using the application.

## Frontend Connection

Start the frontend separately by following the instructions in the frontend directory's README file.

The frontend must be configured to send API requests to the running backend. The local backend URL is `http://127.0.0.1:8000`.

## Troubleshooting

- **Python not found:** Use `py` instead of `python` on Windows, or install Python and configure it correctly.
- **Missing dependencies:** Run `py -m pip install -r requirements.txt` from the backend directory.
- **Port already in use:** Stop the other process using port 8000 or configure a different port.
- **Frontend reports "Failed to fetch":** Confirm the backend is running, check the frontend API URL, and inspect browser developer tools for network or CORS errors.

## Security Notes

- Never commit API keys, passwords, or real `.env` files to GitHub.
- Store secrets in environment variables or a local environment file excluded from version control.
- Do not expose secret keys in frontend code.