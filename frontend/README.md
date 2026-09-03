# ConnectHub frontend

React + Vite client for the ConnectHub Spring backend. It talks to the API through a **dev-server proxy** so the browser never makes a cross-origin request during development.

## Run locally

1. Start the backend on `http://localhost:8080`.
2. From this folder:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

The Vite server forwards:

- `/api` → `http://localhost:8080/api`
- `/ws` → `http://localhost:8080/ws` (WebSocket upgrade)

All frontend Axios and STOMP calls use these **same-origin** paths.

## Production note (CORS)

The backend currently allowlists `http://localhost:5173`. This app still uses the Vite proxy so the browser stays same-origin and does not depend on that allowlist.

For a real deployment, do **not** rely on the Vite proxy. Serve the built frontend and the API on the **same origin** (nginx, Caddy, or another reverse proxy forwarding `/api` and `/ws`). This repo treats the backend as fixed, so CORS should not be expanded as the production strategy.

```bash
npm run build
```

## What this app does not include

There are no likes, saves, shares, notifications, events, resources, projects, feed category tabs, or admin interest tools. Those have no user-facing API to bind to.
