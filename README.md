# ESPJ QR Project

Docker instructions

## Build and run (development)

Make sure you have a `server/.env` file with required env vars (copy from `.env.example`).

Build and run with docker-compose:

```bash
# from repository root
docker-compose up --build
```

This will build the `server` and `client` images and expose:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## Notes
- The server reads env vars from `server/.env` (not committed).
- To run in production behind a reverse proxy, adjust ports or nginx config as needed.
