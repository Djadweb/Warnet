# Warnet

<img width="1872" height="913" alt="Screenshot 2026-03-02 at 12 58 19 am" src="https://github.com/user-attachments/assets/70eeaa71-528b-4597-8da4-46b51c326807" />


Warnet is a small, browser-based interactive globe built with Cesium and Vite that visualizes simulated and live conflict events as strikes and ship deployments. It started as an experimental map-based game and includes persistence, autosave, and a simple server poller with WebSocket broadcasting for real-time event feeds.

## Features
- 3D globe visualization using CesiumJS
- Persistent game state (localStorage autosave)
- Visualized strikes and destroyed-area persistence
- Ship deployment and animated missiles
- Client fallback demo events when no live feed is available
- Optional server poller + WebSocket broadcaster that normalizes provider events

## Quick start (development)

1. Install dependencies

```bash
yarn install
```

2. (Optional) Configure a real events provider

Set these environment variables to enable the built-in poller for real conflict events (ACLED-compatible):

```bash
export ACLED_BASE_URL="https://api.acleddata.com/acled/read"
export ACLED_KEY="your_api_key_here"
```

3. Start the server poller (optional but required for real feeds)

```bash
yarn start:server
```

4. Run the Vite dev server

```bash
yarn dev
```

Open the app at http://localhost:5173/ (Vite dev server)

## Realtime notes
- The repository includes `server/proxy.js` which acts as a simple poller and WebSocket broadcaster. It expects ACLED-like JSON and normalizes a minimal event shape. The client connects to `/api/events` and `/ws/events` by default.
- `vite.config.js` contains a proxy so the client can use same-origin paths (`/api` and `/ws`) and forward them to the local poller during development.

## Project structure (high level)
- `index.html` — app shell and styles
- `src/main.js` — main client logic (persistence, UI, strike/ship logic)
- `src/realtime.js` — client poller + websocket fallback and demo events
- `server/proxy.js` — optional poller/WS broadcaster (ACLED-compatible normalization)

## Contributing
Bug fixes, improvements, or provider adapters are welcome. Open an issue or PR with a short description of the change.

## License
This repository is provided as-is. Add a license file (e.g., MIT) if you intend to publish publicly.

## Contact
If you want me to refine the provider normalization, add persistent storage, or improve the demo dataset, tell me which direction you prefer and I'll implement it.


