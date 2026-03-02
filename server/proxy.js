import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import http from 'http';
import WebSocket from 'ws';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// In-memory event cache (recent events only)
const EVENTS = new Map(); // id -> event
const MAX_EVENT_AGE_MS = 1000 * 60 * 60 * 6; // keep 6 hours

// Polling config
let POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS) || 60_000; // 60s default
let backoffFactor = 1;

// Normalize ACLED-like records into {id,ts,source,country,lat,lng,type,severity,headline,url}
function normalizeAcledItem(item) {
  try {
    const id = item?.id || item?.event_id || `${item.latitude}:${item.longitude}:${item.date}`;
    const lat = parseFloat(item.latitude || item.lat || 0);
    const lng = parseFloat(item.longitude || item.lon || item.lng || 0);
    const ts = item.date ? Date.parse(item.date) : Date.now();
    const country = item.country || item.admin1 || item.location || item.country_name || '';
    const headline = item.notes || item.event_type || item.text || `${item.actor1_name || ''} vs ${item.actor2_name || ''}`;
    const severity = Math.min(10, Math.max(1, Math.floor((item?.fatalities || 0) / 5) + 3));
    const type = (item.event_type || '').toLowerCase().includes('attack') ? 'strike' : 'skirmish';
    return { id, ts, source: 'acled', country, lat, lng, type, severity, headline, url: item.source || '' };
  } catch (e) {
    return null;
  }
}

async function pollProviderOnce() {
  const base = process.env.ACLED_BASE_URL;
  const key = process.env.ACLED_KEY;
  if (!base || !key) return;
  try {
    const qs = new URLSearchParams();
    // Example: fetch last 1 day, adapt per provider
    qs.set('limit', '100');
    qs.set('fields', 'event_id,date,actor1,actor2,event_type,latitude,longitude,country,fatalities,notes,source');
    qs.set('key', key);
    const url = `${base}?${qs.toString()}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`provider ${r.status}`);
    const body = await r.json();
    const raw = Array.isArray(body) ? body : (body.data || body.results || []);
    let added = 0;
    raw.forEach(it => {
      const ev = normalizeAcledItem(it);
      if (!ev || !ev.id) return;
      if (!EVENTS.has(ev.id)) {
        EVENTS.set(ev.id, ev);
        added++;
        // broadcast to ws clients
        broadcastWS(ev);
      }
    });
    // prune old
    const cutoff = Date.now() - MAX_EVENT_AGE_MS;
    for (const [id, ev] of EVENTS) if ((ev.ts || Date.now()) < cutoff) EVENTS.delete(id);
    // reset backoff on success
    backoffFactor = 1;
    return added;
  } catch (e) {
    console.error('provider poll failed', e);
    backoffFactor = Math.min(8, backoffFactor * 2);
    return 0;
  }
}

// start polling loop
let _pollTimer = null;
function startPolling() {
  if (_pollTimer) clearInterval(_pollTimer);
  _pollTimer = setInterval(async () => {
    await pollProviderOnce();
  }, POLL_INTERVAL * backoffFactor);
}

// HTTP & WS server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws/events' });

function broadcastWS(ev) {
  const msg = JSON.stringify(ev);
  wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(msg); });
}

wss.on('connection', ws => {
  console.log('ws client connected');
  // send recent events
  for (const ev of EVENTS.values()) ws.send(JSON.stringify(ev));
});

// API endpoint
app.get('/api/events', (req, res) => {
  // if provider not configured, return 501 with helpful message
  const base = process.env.ACLED_BASE_URL;
  const key = process.env.ACLED_KEY;
  if (!base || !key) return res.status(501).json({ error: 'ACLED not configured on server. Set ACLED_BASE_URL and ACLED_KEY in env.' });
  const arr = Array.from(EVENTS.values()).sort((a,b) => (b.ts||0) - (a.ts||0));
  res.json(arr.slice(0, 500));
});

// health
app.get('/api/health', (req, res) => res.json({ ok: true, events: EVENTS.size }));

// start initial poll then server
(async () => {
  try {
    await pollProviderOnce();
    startPolling();
  } catch (e) { console.warn('initial poll failed', e); }
})();

server.listen(PORT, () => console.log(`WARNET proxy/poller running on http://localhost:${PORT}`));

