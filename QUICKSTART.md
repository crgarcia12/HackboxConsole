# Quick Start Guide

This guide will help you run HackBox Console quickly with Docker Compose.

## Prerequisites
- Docker
- Docker Compose

## Quick Start (Standalone Mode - No Azure Required)

1. **Start the application:**
   ```bash
   docker compose up -d
   ```

2. **Access the application:**
   Open your browser and navigate to: `http://localhost:8000`

3. **Login with default credentials:**
   - **Coach account:**
     - Username: `admin`
     - Password: `admin`
   - **Hacker account:**
     - Username: `user`
     - Password: `user`

## Stopping the Application

```bash
docker compose down
```

## Customizing Users

Edit the `users.json` file to add or modify users. Each user needs:
- `username`: Login username
- `password`: Login password  
- `role`: Either `hacker`, `coach`, or `techlead`
- `tenant`: Team name (optional, defaults to "Default")

Example:
```json
[
    {
        "username": "coach1",
        "password": "securePassword123",
        "role": "coach",
        "tenant": "Team1"
    },
    {
        "username": "hacker1",
        "password": "securePassword456",
        "role": "hacker",
        "tenant": "Team1"
    }
]
```

After modifying `users.json`, restart the application:
```bash
docker compose restart
```

## Adding Challenges and Solutions

1. Add challenge files to `hack_console/challenges/` directory
   - Name them `challenge-*.md` (e.g., `challenge-3.md`)
   
2. Add solution files to `hack_console/solutions/` directory
   - Name them `solution-*.md` (e.g., `solution-3.md`)

3. Restart the application to pick up new files:
   ```bash
   docker compose restart
   ```

## Features

### For Hackers:
- View unlocked challenges
- Access credentials
- Track progress with timer

### For Coaches:
- View all challenges and solutions
- Unlock challenges for teams
- Manage team progress
- Control timer

### For Tech Leads:
- Manage multiple teams
- Control timers and challenges across all teams

## Troubleshooting

### Application won't start
- Check if port 8000 is already in use
- Check Docker logs: `docker compose logs -f`

### Can't login
- Verify `users.json` file exists and is valid JSON
- Check the logs for error messages

### Changes not appearing
- Restart the container: `docker compose restart`

## Development Mode

For development with live code reloading:

```bash
docker compose -f docker compose.dev.yml up
```

## Azure Integration (Optional)

If you want to use Azure Table Storage instead of local file storage, set these environment variables in `docker compose.yml`:

```yaml
environment:
  - HACKBOX_CONNECTION_STRING=your_azure_storage_connection_string
  # OR
  - HACKBOX_TABLE_ENDPOINT=your_table_endpoint
```

## Data Persistence

Application data is stored in a Docker volume named `hackbox-data`. This persists:
- Challenge progress
- Timer state
- Credentials (if added via API)

To reset all data:
```bash
docker compose down -v
```

## Support

For issues or questions, please visit the [GitHub repository](https://github.com/crgarcia12/HackboxConsole).
