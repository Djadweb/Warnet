// src/realtime.js
// Poll /api/events and call handler for each new event.
const POLL_MS = 30000;

// Prefer same-origin API; allow override via window.REALTIME_ENDPOINT
const DEFAULT_API = '/api/events';
const ENDPOINT = (window.REALTIME_ENDPOINT && String(window.REALTIME_ENDPOINT)) || DEFAULT_API;

let _timer = null;
let _seen = new Set();
let _ws = null;

async function fetchServerEvents() {
  try {
    const r = await fetch(ENDPOINT);
    if (!r.ok) throw new Error(`server returned ${r.status}`);
    const data = await r.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  } catch (e) {
    console.warn('realtime: server fetch failed, falling back to demo — endpoint:', ENDPOINT, e);
    return [];
  }
}

// Demo fallback: synthesize events from static CONFLICTS in client
function synthDemoEvents(CONFLICTS) {
  const evs = [];
  if (!CONFLICTS || !CONFLICTS.length) return evs;
  // randomly produce 0-2 events
  const n = Math.random() < 0.6 ? 0 : Math.floor(Math.random()*2)+1;
  for (let i=0;i<n;i++){
    const c = CONFLICTS[Math.floor(Math.random()*CONFLICTS.length)];
    evs.push({
      id: `demo-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      ts: Date.now(),
      source: 'demo',
      country: c.name,
      lat: c.lat + (Math.random()-0.5)*0.5,
      lng: c.lng + (Math.random()-0.5)*0.5,
      type: 'strike',
      severity: Math.floor(3 + Math.random()*7),
      headline: `${c.name}: reported strike at ${new Date().toUTCString().slice(17,25)}`,
      url: ''
    });
  }
  return evs;
}

export function startRealtime(CONFLICTS, onEvent) {
  if (_timer) clearInterval(_timer);
  // initial poll
  (async function poll(){
    let events = await fetchServerEvents();
    if (!events || events.length === 0) {
      // fallback to demo
      events = synthDemoEvents(CONFLICTS);
    }
    events.forEach(ev => {
      if (!_seen.has(ev.id)) {
        _seen.add(ev.id);
        try { onEvent(ev); } catch(e){console.warn('realtime handler error', e);}    
      }
    });
  })();
  _timer = setInterval(async () => {
    let events = await fetchServerEvents();
    if (!events || events.length === 0) events = synthDemoEvents(CONFLICTS);
    events.forEach(ev => { if (!_seen.has(ev.id)) { _seen.add(ev.id); try { onEvent(ev); } catch(e){} } });
  }, POLL_MS);

  // attempt websocket for real-time pushes (same-origin)
  try {
    const loc = window.location;
    const wsProtocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = (window.REALTIME_WS && String(window.REALTIME_WS)) || `${wsProtocol}//${loc.host}/ws/events`;
    _ws = new WebSocket(wsUrl);
    _ws.addEventListener('open', () => console.log('realtime: ws connected', wsUrl));
    _ws.addEventListener('message', e => {
      try {
        const ev = JSON.parse(e.data);
        if (ev && ev.id && !_seen.has(ev.id)) { _seen.add(ev.id); onEvent(ev); }
      } catch (err) { console.warn('realtime ws parse', err); }
    });
    _ws.addEventListener('close', () => { console.log('realtime: ws closed'); _ws = null; });
    _ws.addEventListener('error', err => { console.warn('realtime: ws error', err); _ws = null; });
  } catch (e) { console.warn('realtime: ws init failed', e); }
  return () => { if (_timer) clearInterval(_timer); };
}

export default { startRealtime };
