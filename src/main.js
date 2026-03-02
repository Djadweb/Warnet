import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { startRealtime } from './realtime.js';

'use strict';

// ═══════════════════════════════════════════════════
//  NATIONS DATA
// ═══════════════════════════════════════════════════
const NATIONS = [
  { id:'usa',     name:'United States', flag:'🇺🇸', power:100, budget:'$886B', nukes:5500,  lat:38.9,  lng:-77.0,  camLat:35,   camLng:-100,  camAlt:12e6,
    mil:{ icbm:400, tomahawk:4000, f35:450, carrier:11, destroyer:68, submarine:68, drone:10000, patriot:160, thaad:7 } },
  { id:'russia',  name:'Russia',        flag:'🇷🇺', power:92,  budget:'$86B',  nukes:6257,  lat:55.7,  lng:37.6,   camLat:55,   camLng:80,    camAlt:12e6,
    mil:{ icbm:1185, iskander:700, su57:76, carrier:1, destroyer:11, submarine:64, drone:3000, s400:400, kinzhal:200 } },
  { id:'china',   name:'China',         flag:'🇨🇳', power:90,  budget:'$224B', nukes:410,   lat:39.9,  lng:116.4,  camLat:35,   camLng:110,   camAlt:10e6,
    mil:{ icbm:350, df41:24, j20:200, carrier:3, destroyer:50, submarine:79, drone:50000, hq9:400 } },
  { id:'uk',      name:'United Kingdom',flag:'🇬🇧', power:72,  budget:'$68B',  nukes:225,   lat:51.5,  lng:-0.1,   camLat:50,   camLng:0,     camAlt:6e6,
    mil:{ trident:215, tomahawk:1000, typhoon:160, carrier:2, destroyer:6, submarine:11, drone:300, starstreak:400 } },
  { id:'france',  name:'France',        flag:'🇫🇷', power:73,  budget:'$53B',  nukes:290,   lat:48.8,  lng:2.3,    camLat:48,   camLng:5,     camAlt:5e6,
    mil:{ icbm:290, scalp:1200, rafale:254, carrier:1, destroyer:11, submarine:10, drone:800, crotale:500 } },
  { id:'algeria', name:'Algeria',       flag:'🇩🇿', power:58,  budget:'$45B',  nukes:0,     lat:36.7,  lng:3.2,    camLat:34,   camLng:2,     camAlt:5e6,
    mil:{ icbm:0, tomahawk:0, f35:0, carrier:0, destroyer:3, submarine:4, drone:500, patriot:20 } },
  { id:'iran',    name:'Iran',          flag:'🇮🇷', power:55,  budget:'$10B',  nukes:0,     lat:35.7,  lng:51.4,   camLat:32,   camLng:55,    camAlt:5e6,
    mil:{ shahab:300, cruise:400, f14:20, destroyer:3, submarine:33, drone:3000, bavar373:4 } },
  { id:'nkorea',  name:'North Korea',   flag:'🇰🇵', power:45,  budget:'$4B',   nukes:50,    lat:39.0,  lng:125.7,  camLat:37,   camLng:126,   camAlt:4e6,
    mil:{ icbm:50, hwasong:100, mig29:35, destroyer:3, submarine:70, drone:800, kn06:200 } },
  { id:'india',   name:'India',         flag:'🇮🇳', power:76,  budget:'$72B',  nukes:164,   lat:28.6,  lng:77.2,   camLat:22,   camLng:80,    camAlt:8e6,
    mil:{ agni5:100, brahmos:3000, rafale:36, carrier:2, destroyer:10, submarine:16, drone:6000, akash:400 } },
  { id:'pakistan',name:'Pakistan',      flag:'🇵🇰', power:52,  budget:'$9B',   nukes:165,   lat:33.7,  lng:73.1,   camLat:30,   camLng:70,    camAlt:5e6,
    mil:{ shaheen:200, raad:400, f16:76, destroyer:8, submarine:8, drone:1000, hq9:40 } },
];

// ═══════════════════════════════════════════════════
//  CONFLICTS DATA (real 2025-2026)
// ═══════════════════════════════════════════════════
const CONFLICTS = [
  { id:'ukraine', name:'Russia–Ukraine War',    parties:'Russia vs Ukraine',      status:'active',   label:'ACTIVE WAR',    lat:49.0,  lng:31.0,  casualties:'750,000+',          desc:'Full-scale invasion, drone warfare, Kharkiv & Zaporizhzhia fronts' },
  { id:'gaza',    name:'Israel–Gaza War',        parties:'Israel vs Hamas/PIJ',    status:'active',   label:'ACTIVE WAR',    lat:31.5,  lng:34.4,  casualties:'47,000+ killed',     desc:'Urban warfare, IDF ground & air operations, Rafah offensive' },
  { id:'sudan',   name:'Sudan Civil War',        parties:'SAF vs RSF',             status:'active',   label:'ACTIVE WAR',    lat:15.5,  lng:32.5,  casualties:'150,000+ killed',    desc:'RSF controls Darfur, Khartoum contested, humanitarian collapse' },
  { id:'myanmar', name:'Myanmar Civil War',      parties:'Junta vs Resistance',    status:'active',   label:'ACTIVE WAR',    lat:19.8,  lng:96.1,  casualties:'50,000+ killed',     desc:'PDFs seize territory, junta airstrike campaign intensifies' },
  { id:'ethiopia',name:'Ethiopia Conflicts',     parties:'Govt vs OLA/Fano',       status:'active',   label:'ACTIVE WAR',    lat:9.0,   lng:38.7,  casualties:'500,000+',           desc:'Amhara Fano insurgency, Oromo Liberation Army operations' },
  { id:'congo',   name:'DR Congo–M23',           parties:'Congo vs M23/Rwanda',    status:'active',   label:'ACTIVE WAR',    lat:-1.7,  lng:29.2,  casualties:'Millions displaced', desc:'M23 seized Goma, Rwanda backing accused, UN evacuates' },
  { id:'usiran',  name:'USA–Iran Tensions',      parties:'USA & Israel vs Iran',   status:'tensions', label:'HIGH TENSIONS',  lat:27.0,  lng:52.0,  casualties:'Proxy ongoing',      desc:'Strait of Hormuz blockade threat, US carrier groups deployed, nuclear talks collapsed' },
  { id:'taiwan',  name:'China–Taiwan Strait',    parties:'PLA vs Taiwan + USA',    status:'tensions', label:'HIGH TENSIONS',  lat:24.0,  lng:121.0, casualties:'No combat yet',      desc:'PLA blockade rehearsals, ADIZ violations daily, US arms sales surge' },
  { id:'nkorea',  name:'North Korea ICBM',       parties:'DPRK vs USA/S.Korea',    status:'tensions', label:'HIGH TENSIONS',  lat:39.0,  lng:127.5, casualties:'Tests ongoing',      desc:'Hwasong-19 ICBM test over Pacific, DMZ artillery incidents, EMP warnings' },
  { id:'indopak', name:'India–Pakistan LoC',     parties:'India vs Pakistan',      status:'tensions', label:'TENSIONS',       lat:33.0,  lng:74.0,  casualties:'Skirmishes ongoing', desc:'Kashmir LoC violations, surgical strike threats, nuclear posturing' },
  { id:'somalia', name:'Somalia Conflict',       parties:'Govt+AU vs Al-Shabaab',  status:'ongoing',  label:'ONGOING',        lat:5.1,   lng:46.2,  casualties:'Tens of thousands',  desc:'US drone strikes, suicide bombings in Mogadishu, Al-Shabaab expanding' },
  { id:'sahel',   name:'Sahel Insurgency',       parties:'Wagner/Juntas vs IS',    status:'ongoing',  label:'ONGOING',        lat:14.0,  lng:-1.5,  casualties:'25,000+ since 2015', desc:'Wagner-backed juntas Mali/Niger/Burkina Faso, jihadist expansion' },
  { id:'haiti',   name:'Haiti Gang War',         parties:'Gangs vs Government',    status:'ongoing',  label:'ONGOING',        lat:18.5,  lng:-72.3, casualties:'5,000+ in 2024',     desc:'Gang coalition controls Port-au-Prince, state collapse, Kenyan mission' },
  { id:'westbank',name:'West Bank Violence',     parties:'IDF vs Palestinians',    status:'ongoing',  label:'ONGOING',        lat:32.0,  lng:35.2,  casualties:'800+ killed 2024',   desc:'Jenin, Tulkarm, Nablus raids, PA authority collapsing' },
  { id:'armenia', name:'Armenia–Azerbaijan',     parties:'Armenia vs Azerbaijan',  status:'tensions', label:'TENSIONS',       lat:40.2,  lng:46.0,  casualties:'Post-Karabakh',      desc:'Border demarcation disputes, Turkish-Russian influence conflict' },
];

// ═══════════════════════════════════════════════════
//  UNIT METADATA
// ═══════════════════════════════════════════════════
const UL = { icbm:'ICBM',df41:'DF-41 ICBM',hwasong:'Hwasong ICBM',shahab:'Shahab Ballistic',agni5:'Agni-5 ICBM',jericho:'Jericho III',shaheen:'Shaheen-III',trident:'Trident SLBM',tomahawk:'Tomahawk Cruise',iskander:'Iskander-M',brahmos:'BrahMos',raad:"Ra'ad Cruise",scalp:'SCALP-EG',cruise:'Cruise Missile',f35:'F-35 Strike',j20:'J-20 Stealth',su57:'Su-57 Strike',f14:'F-14 Strike',mig29:'MiG-29',rafale:'Rafale Strike',typhoon:'Eurofighter',f16:'F-16 Strike',carrier:'Carrier Strike',destroyer:'Destroyer Salvo',submarine:'Sub Launch',drone:'Drone Swarm',spike:'Spike ATGM',kinzhal:'Kinzhal Hypers.',patriot:'Patriot SAM',thaad:'THAAD System',s400:'S-400 SAM',hq9:'HQ-9 SAM',ironDome:'Iron Dome',bavar373:'Bavar-373',kn06:'KN-06 SAM',akash:'Akash SAM',crotale:'Crotale NG',starstreak:'Starstreak HVM' };
const UC = { icbm:1200,df41:1200,hwasong:800,shahab:400,agni5:900,jericho:600,shaheen:600,trident:1000,tomahawk:300,iskander:400,brahmos:350,raad:200,scalp:300,cruise:250,f35:500,j20:600,su57:550,f14:200,mig29:150,rafale:500,typhoon:400,f16:300,carrier:800,destroyer:350,submarine:600,drone:50,spike:80,kinzhal:900,patriot:400,thaad:800,s400:600,hq9:500,ironDome:200,bavar373:300,kn06:200,akash:250,crotale:300,starstreak:100 };
const UD = { icbm:100,df41:100,hwasong:90,shahab:40,agni5:90,jericho:70,shaheen:70,trident:95,tomahawk:45,iskander:55,brahmos:50,raad:35,scalp:40,cruise:35,f35:60,j20:65,su57:65,f14:30,mig29:25,rafale:55,typhoon:50,f16:45,carrier:85,destroyer:60,submarine:75,drone:20,spike:40,kinzhal:80 };
const UI = { icbm:'☢',df41:'☢',hwasong:'☢',shahab:'🚀',agni5:'☢',jericho:'☢',shaheen:'☢',trident:'☢',tomahawk:'🎯',iskander:'💥',brahmos:'💥',raad:'🚀',scalp:'🚀',cruise:'🚀',f35:'✈',j20:'✈',su57:'✈',f14:'✈',mig29:'✈',rafale:'✈',typhoon:'✈',f16:'✈',carrier:'⚓',destroyer:'🛳',submarine:'🐟',drone:'🔺',spike:'⚡',kinzhal:'⚡',patriot:'🛡',thaad:'🔶',s400:'🛡',hq9:'🛡',ironDome:'🔵',bavar373:'🛡',kn06:'🔶',akash:'🛡',crotale:'🔵',starstreak:'⬆' };
const OFF = ['icbm','df41','hwasong','shahab','agni5','jericho','shaheen','trident','tomahawk','iskander','brahmos','raad','scalp','cruise','f35','j20','su57','f14','mig29','rafale','typhoon','f16','carrier','destroyer','submarine','drone','spike','kinzhal'];
const DEF = ['patriot','thaad','s400','hq9','ironDome','bavar373','kn06','akash','crotale','starstreak'];
const NUKE_UNITS = ['icbm','df41','hwasong','agni5','jericho','shaheen','trident'];

// Naval unit list
const NAV = ['carrier','destroyer','frigate','submarine'];

const SHIP_TYPES = {
  carrier: { displayName: 'Carrier', cost: 2000, speed: 12, modelUrl: '', icon: '⛴' },
  destroyer: { displayName: 'Destroyer', cost: 900, speed: 18, modelUrl: '', icon: '🛳' },
  frigate: { displayName: 'Frigate', cost: 600, speed: 20, modelUrl: '', icon: '🚢' },
  submarine: { displayName: 'Submarine', cost: 1200, speed: 10, modelUrl: '', icon: '🐟' },
};

// ═══════════════════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════════════════
let G = {
  player: null, hp:100, credits:10000, strikes:0, score:0, defcon:5,
  mode: null,
  selUnit: null,
  pendCoords: null,
  pendName: '',
  defenses: [],
  gameActive: true,
  viewer: null,
  conflictEntities: [],
  trajectories: [],
  cesiumReady: false,
  ships: [], // deployed ships
  destroyedAreas: [], // persistent strike scars
};

// Persistent destroyed-area helpers
function saveDestroyedAreas() {
  try {
    localStorage.setItem('warnet_destroyed', JSON.stringify(G.destroyedAreas));
  } catch (e) {
    console.warn('WARNET: could not save destroyed areas', e);
  }
}

function loadDestroyedAreas() {
  try {
    const raw = localStorage.getItem('warnet_destroyed');
    if (!raw) return;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return;
    G.destroyedAreas = arr;
    if (G.viewer) arr.forEach(renderDestroyedArea);
  } catch (e) {
    console.warn('WARNET: could not load destroyed areas', e);
  }
}

function renderDestroyedArea(area) {
  if (!area || typeof area.lat !== 'number' || typeof area.lng !== 'number') return;
  const id = `destroyed-${area.id}`;
  // remove existing
  try { const ex = G.viewer.entities.getById(id); if (ex) G.viewer.entities.remove(ex); } catch (e){}
  const ent = G.viewer.entities.add({
    id,
    position: Cesium.Cartesian3.fromDegrees(area.lng, area.lat, 0),
    ellipse: {
      semiMajorAxis: area.radiusMeters || 5000,
      semiMinorAxis: area.radiusMeters || 5000,
      material: Cesium.Color.fromCssColorString('#1a1a1a').withAlpha(0.85),
      height: 0,
      outline: true,
      outlineColor: Cesium.Color.fromCssColorString('#4b2f2f').withAlpha(0.8),
      outlineWidth: 1.5,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      classificationType: Cesium.ClassificationType.BOTH,
    }
  });
  return ent;
}

function clearDestroyedAreas() {
  (G.destroyedAreas || []).forEach(a => { try { const e = G.viewer.entities.getById(`destroyed-${a.id}`); if (e) G.viewer.entities.remove(e); } catch(e){} });
  G.destroyedAreas = [];
  saveDestroyedAreas();
}

// ------------------ Full game state persistence ------------------
function safeSetItem(k, v) {
  try { localStorage.setItem(k, v); } catch (e) { console.warn('WARNET: localStorage.setItem failed', e); }
}
function safeGetItem(k) {
  try { return localStorage.getItem(k); } catch (e) { console.warn('WARNET: localStorage.getItem failed', e); return null; }
}

function saveGameState() {
  try {
    const state = {
      version: 1,
      ts: Date.now(),
      selectedNationId: G.player?.id || null,
      player: { mil: G.player?.mil || {}, credits: G.credits, score: G.score, defcon: G.defcon, strikes: G.strikes },
      selUnit: G.selUnit || null,
      destroyedAreas: G.destroyedAreas || [],
      deployedShips: (G.ships || []).map(s => ({ id: s.id, type: s.type, lat: s.lat, lng: s.lng, owner: s.owner }))
    };
    safeSetItem(STATE_KEY, JSON.stringify(state));
  } catch (e) { console.warn('WARNET: saveGameState failed', e); }
}

// Debounced autosave to batch frequent writes
let _autosaveTimer = null;
function autosave(delay = 350) {
  if (_autosaveTimer) clearTimeout(_autosaveTimer);
  _autosaveTimer = setTimeout(() => {
    try { saveGameState(); } catch (e) { console.warn('WARNET: autosave failed', e); }
  }, delay);
}

function clearGameState() {
  try { localStorage.removeItem(STATE_KEY); clearDestroyedAreas(); } catch (e) { console.warn('WARNET: clearGameState', e); }
}

function loadGameState() {
  try {
    const raw = safeGetItem(STATE_KEY);
    if (!raw) return false;
    const st = JSON.parse(raw);
    if (!st || typeof st !== 'object') return false;
    // If there's a selected nation, start game with that nation and defer detailed restore until Cesium ready
    if (st.selectedNationId) {
      const n = NATIONS.find(x => x.id === st.selectedNationId);
      if (!n) return false;
      // stash pending state to apply later after Cesium initialized
      G._pendingLoad = st;
      startGame(n);
      return true;
    }
    return false;
  } catch (e) { console.warn('WARNET: loadGameState failed', e); return false; }
}

function applyPendingLoad() {
  const st = G._pendingLoad; if (!st) return;
  try {
    // restore player inventory and numeric fields
    G.player.mil = Object.assign({}, G.player.mil || {}, st.player?.mil || {});
    G.credits = st.player?.credits ?? G.credits;
    G.score = st.player?.score ?? G.score;
    G.defcon = st.player?.defcon ?? G.defcon;
    G.strikes = st.player?.strikes ?? G.strikes;
    if (st.selUnit) selUnit(st.selUnit);

    // restore destroyed areas
    if (Array.isArray(st.destroyedAreas)) {
      G.destroyedAreas = st.destroyedAreas.slice();
      G.destroyedAreas.forEach(renderDestroyedArea);
    }

    // restore deployed ships
    if (Array.isArray(st.deployedShips)) {
      G.ships = [];
      st.deployedShips.forEach(rec => {
        try {
          const ent = spawnShipEntityFromRecord(rec);
          G.ships.push({ id: rec.id, type: rec.type, lat: rec.lat, lng: rec.lng, entity: ent, owner: rec.owner || 'player' });
        } catch (e) { console.warn('WARNET: failed restoring ship', rec, e); }
      });
    }

    buildUnitList(G.player);
    updateHUD();
  } catch (e) { console.warn('WARNET: applyPendingLoad failed', e); }
  delete G._pendingLoad;
}

// Create a ship entity from a saved record (does not deduct inventory/credits)
function spawnShipEntityFromRecord(rec) {
  const v = G.viewer;
  const info = SHIP_TYPES[rec.type] || {};
  const spawnHeight = 5;

  // Recreate canvas image (simple small silhouette)
  const shipCanvas = (() => {
    const SIZE = 96; const c = document.createElement('canvas'); c.width = c.height = SIZE; const ctx = c.getContext('2d');
    const cx = SIZE/2, cy = SIZE/2;
    const tints = { carrier:'#00d4ff', destroyer:'#ff7800', frigate:'#00ff88', submarine:'#bf5fff' };
    const col = tints[rec.type] || '#00d4ff';
    ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 18; ctx.strokeStyle = col; ctx.lineWidth = 1.2;
    ctx.beginPath(); if (rec.type === 'submarine') ctx.ellipse(cx,cy,9,26,0,0,Math.PI*2); else { ctx.moveTo(cx,cy-28); ctx.bezierCurveTo(cx+12,cy-10,cx+12,cy+10,cx+10,cy+28); ctx.lineTo(cx-10,cy+28); ctx.bezierCurveTo(cx-12,cy+10,cx-12,cy-10,cx,cy-28); }
    ctx.fillStyle = col + '40'; ctx.fill(); ctx.stroke();
    if (rec.type !== 'submarine') { ctx.fillStyle = col + 'aa'; ctx.fillRect(cx-5,cy-10,10,14); ctx.beginPath(); ctx.arc(cx,cy-4,2.5,0,Math.PI*2); ctx.fillStyle = col; ctx.fill(); } else { ctx.fillStyle = col + 'cc'; ctx.fillRect(cx-3,cy-7,6,10); ctx.beginPath(); ctx.arc(cx,cy-7,3,0,Math.PI*2); ctx.fill(); }
    ctx.shadowBlur = 8; ctx.lineWidth = 0.7; ctx.strokeStyle = col + '60'; ctx.setLineDash([3,4]); ctx.beginPath(); ctx.arc(cx,cy,42,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    return c;
  })();

  const entity = v.entities.add({
    id: rec.id,
    position: Cesium.Cartesian3.fromDegrees(rec.lng, rec.lat, spawnHeight),
    billboard: { image: shipCanvas, width:64, height:64, verticalOrigin: Cesium.VerticalOrigin.CENTER, horizontalOrigin: Cesium.HorizontalOrigin.CENTER, scaleByDistance: new Cesium.NearFarScalar(1e5,1.4,8e6,0.3), translucencyByDistance: new Cesium.NearFarScalar(5e5,1,8e6,0.2) },
    label: { text: info.displayName || rec.type, font: '9px Share Tech Mono, monospace', fillColor: Cesium.Color.fromCssColorString('#00d4ff'), outlineColor: Cesium.Color.BLACK, outlineWidth:2, style: Cesium.LabelStyle.FILL_AND_OUTLINE, pixelOffset: new Cesium.Cartesian2(0,38) }
  });

  // Patrol callback
  const radiusMeters = (info.speed || 10) * 2000; const speed = info.speed || 10; const start = Date.now(); const lat = rec.lat; const lng = rec.lng;
  entity.position = new Cesium.CallbackProperty(() => {
    const t = ((Date.now() - start) / 1000) * (speed / 8000);
    const ang = t * Math.PI * 2;
    const latOffset = (radiusMeters / 111000) * Math.cos(ang);
    const lngOffset = (radiusMeters / (111000 * Math.cos(Cesium.Math.toRadians(lat)))) * Math.sin(ang);
    return Cesium.Cartesian3.fromDegrees(lng + lngOffset, lat + latOffset, spawnHeight);
  }, false);

  return entity;
}

// ═══════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyNzg0NTE4Mn0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk';

window.addEventListener('load', handleStartup);

const STATE_KEY = 'warnet_v1_state';

function handleStartup() {
  const restored = loadGameState();
  if (!restored) buildCSel();
}

// ═══════════════════════════════════════════════════
//  COUNTRY SELECT
// ═══════════════════════════════════════════════════
function buildCSel() {
  const g = document.getElementById('cgrid');
  NATIONS.forEach(n => {
    const d = document.createElement('div');
    d.className = 'cc';
    const pc = n.power > 80 ? 'var(--red)' : n.power > 60 ? 'var(--orange)' : 'var(--yellow)';
    d.innerHTML = `<div class="cc-flag">${n.flag}</div>
      <div class="cc-name">${n.name}</div>
      <div class="cc-pw">PWR<div class="pw-bar"><div class="pw-fill" style="width:${n.power}%;background:${pc}"></div></div>${n.power}</div>
      <div class="cc-stat">☢ ${n.nukes.toLocaleString()} warheads · ${n.budget}</div>`;
    d.onclick = () => startGame(n);
    g.appendChild(d);
  });
}

// ═══════════════════════════════════════════════════
//  CESIUM INIT
// ═══════════════════════════════════════════════════
function initCesium(nation) {
  // Use a dark basemap (CartoDB Dark Matter) for "earth dark mode"
  const osmProvider = new Cesium.UrlTemplateImageryProvider({
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    maximumLevel: 19,
    tilingScheme: new Cesium.WebMercatorTilingScheme(),
    credit: new Cesium.Credit('© CartoDB, OpenStreetMap', false),
  });

  const viewer = new Cesium.Viewer('cesiumContainer', {
    baseLayer: new Cesium.ImageryLayer(osmProvider),
    terrainProvider: new Cesium.EllipsoidTerrainProvider(),
    sceneMode: Cesium.SceneMode.SCENE3D,
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    vrButton: false,
    creditContainer: document.createElement('div'),
    skyAtmosphere: new Cesium.SkyAtmosphere(),
    contextOptions: { requestWebgl2: true },
  });

  G.viewer = viewer;

  viewer.scene.globe.show = true;
  viewer.scene.globe.depthTestAgainstTerrain = false;
  // Dark-mode styling
  viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#000010');
  try {
    if (viewer.scene.globe.baseColor) viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#000011');
    // reduce ocean brightness by tinting the water surface if available
    if (viewer.scene.globe._surface && viewer.scene.globe._surface._surfaceMaterial) {
      // best-effort: lower alpha/tint the surface material
      try { viewer.scene.globe._surface._surfaceMaterial.uniforms.color = Cesium.Color.fromCssColorString('#001026').withAlpha(0.85); } catch(e){}
    }
  } catch (e) {}
  // 3D globe — full rotation, tilt and zoom
  viewer.scene.screenSpaceCameraController.enableRotate = true;
  viewer.scene.screenSpaceCameraController.enableTilt = true;
  viewer.scene.screenSpaceCameraController.enableZoom = true;

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(nation.camLng, nation.camLat, nation.camAlt),
    duration: 2,
  });

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  handler.setInputAction(movement => {
    const cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
    if (cartesian) {
      const carto = Cesium.Cartographic.fromCartesian(cartesian);
      const lat = Cesium.Math.toDegrees(carto.latitude).toFixed(2);
      const lng = Cesium.Math.toDegrees(carto.longitude).toFixed(2);
      document.getElementById('coords-hud').textContent =
        `${Math.abs(lat)}°${lat >= 0 ? 'N' : 'S'} / ${Math.abs(lng)}°${lng >= 0 ? 'E' : 'W'}`;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction(click => {
    if (!G.mode) return;
    const ray = viewer.camera.getPickRay(click.position);
    const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    if (!cartesian) return;
    const carto = Cesium.Cartographic.fromCartesian(cartesian);
    const lat = Cesium.Math.toDegrees(carto.latitude);
    const lng = Cesium.Math.toDegrees(carto.longitude);
    G.pendCoords = { lat, lng };

    let best = null, bd = 9999;
    CONFLICTS.forEach(c => {
      const d = Math.hypot(c.lat - lat, c.lng - lng);
      if (d < bd) { bd = d; best = c; }
    });
    G.pendName = bd < 15 ? best.name : `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'} / ${Math.abs(lng).toFixed(1)}°${lng >= 0 ? 'E' : 'W'}`;

    if (G.mode === 'strike') {
      showModal();
    } else if (G.mode === 'deployShip') {
      // Attempt to deploy selected naval unit at clicked location
      if (!G.selUnit || !NAV.includes(G.selUnit)) { clog('SELECT A NAVAL UNIT FIRST', 'r'); return; }
      // Heuristic to detect water: try globe.getHeight (terrain) and treat low/undefined as water
      try {
        const carto2 = Cesium.Cartographic.fromDegrees(lng, lat);
        const h = viewer.scene.globe.getHeight(carto2);
        const isWater = (typeof h === 'undefined') || (h !== null && h < 2);
        if (!isWater) console.warn('WARNET: deployShip heuristic: ground height suggests land at', lat.toFixed(4), lng.toFixed(4), 'height:', h);
      } catch (e) {
        console.warn('WARNET: deployShip water-check failed', e);
      }
      deployShip(G.selUnit, lat, lng);
    } else {
      deployDefenseAt(lat, lng);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  plotConflicts();
  plotPlayerBase(nation);
  G.cesiumReady = true;
  // Restore any persisted destroyed areas
  try { loadDestroyedAreas(); } catch(e) { console.warn('WARNET: loadDestroyedAreas failed', e); }
  // If a full game state was pending from loadGameState(), apply it now
  try { if (G._pendingLoad) applyPendingLoad(); } catch(e) { console.warn('WARNET: applyPendingLoad failed', e); }
  // start realtime feed (falls back to demo events if no server)
  try { startRealtime(CONFLICTS, ev => handleRealtimeEvent(ev)); } catch(e) { console.warn('WARNET: realtime init failed', e); }
}

function showBreakingAlert(headline, url) {
  try {
    const el = document.getElementById('breaking-alert');
    if (!el) return;
    el.innerHTML = headline + (url?` <a href="${url}" target="_blank">SOURCE</a>`:'');
    el.style.display = 'block';
    setTimeout(() => { try { el.style.display = 'none'; } catch(e){} }, 8000);
  } catch (e) { console.warn('showBreakingAlert', e); }
}

function handleRealtimeEvent(ev) {
  // ev: { id, ts, source, country, lat, lng, type, severity, headline, url }
  if (!ev || !ev.type) return;
  addIntel(ev.headline || 'Realtime event', 'w');
  if (ev.type === 'strike') {
    // show top alert
    showBreakingAlert(ev.headline || 'Strike reported', ev.url || '');
    // choose an origin — if source provides attacker coords, use it; otherwise use event country centroid
    const targetLat = Number(ev.lat) || 0;
    const targetLng = Number(ev.lng) || 0;
    // spawn a small missile animation from offset origin
    const fromLat = (targetLat || 0) + (Math.random() - 0.5) * 6.0 + 10.0; // crude offset
    const fromLng = (targetLng || 0) + (Math.random() - 0.5) * 6.0 + 10.0;
    try { launchMissile(fromLat, fromLng, targetLat, targetLng, 'icbm', false, Math.max(10, (ev.severity||3)*10), true); } catch(e){ console.warn('launch realtime missile failed', e); }
  } else {
    // non-strike: create a pulsing marker
    try {
      const pos = Cesium.Cartesian3.fromDegrees(Number(ev.lng)||0, Number(ev.lat)||0);
      const col = Cesium.Color.fromCssColorString('#ff7800');
      const ent = G.viewer.entities.add({ position: pos, ellipse: { semiMajorAxis: 60000, semiMinorAxis: 60000, material: col.withAlpha(0.18), height: 1000 } });
      setTimeout(() => { try { G.viewer.entities.remove(ent); } catch(e){} }, 9000);
    } catch (e) { console.warn('render non-strike failed', e); }
  }
}

// ═══════════════════════════════════════════════════
//  PLOT CONFLICT MARKERS
// ═══════════════════════════════════════════════════
function plotConflicts() {
  const v = G.viewer;
  CONFLICTS.forEach(c => {
    const col = c.status === 'active'
      ? Cesium.Color.fromCssColorString('#ff1a3c')
      : c.status === 'tensions'
      ? Cesium.Color.fromCssColorString('#ffd700')
      : Cesium.Color.fromCssColorString('#ff7800');

    const outerRadius = c.status === 'active' ? 180000 : 120000;

    v.entities.add({
      name: c.name,
      position: Cesium.Cartesian3.fromDegrees(c.lng, c.lat),
      ellipse: {
        semiMinorAxis: new Cesium.CallbackProperty(() => {
          const t = (Date.now() % 2000) / 2000;
          const base = outerRadius * (0.5 + 0.5 * Math.sin(t * Math.PI * 2));
          const minor = Math.max(1, Math.round(base * 0.6));
          return minor;
        }, false),
        semiMajorAxis: new Cesium.CallbackProperty(() => {
          const t = (Date.now() % 2000) / 2000;
          const base = outerRadius * (0.5 + 0.5 * Math.sin(t * Math.PI * 2));
          const major = Math.max(1, Math.round(base));
          return major;
        }, false),
        material: col.withAlpha(0.25),
        height: 1000,
      }
    });

    v.entities.add({
      position: Cesium.Cartesian3.fromDegrees(c.lng, c.lat),
      ellipse: {
        semiMinorAxis: outerRadius * 0.35,
        semiMajorAxis: outerRadius * 0.35,
        material: col.withAlpha(0.85),
        outline: true,
        outlineColor: col,
        outlineWidth: 2,
        height: 2000,
      }
    });

    v.entities.add({
      position: Cesium.Cartesian3.fromDegrees(c.lng, c.lat + 1.2),
      label: {
        text: c.name,
        font: '10px Share Tech Mono, monospace',
        fillColor: col,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -20),
        scaleByDistance: new Cesium.NearFarScalar(5e5, 1.2, 8e6, 0),
        translucencyByDistance: new Cesium.NearFarScalar(1e6, 1, 10e6, 0),
      }
    });
  });
}

function plotPlayerBase(nation) {
  const v = G.viewer;
  v.entities.add({
    position: Cesium.Cartesian3.fromDegrees(nation.lng, nation.lat, 50000),
    cylinder: {
      length: 300000,
      topRadius: 0,
      bottomRadius: 80000,
      material: Cesium.Color.fromCssColorString('#00d4ff').withAlpha(0.5),
      outline: true,
      outlineColor: Cesium.Color.fromCssColorString('#00d4ff'),
    }
  });
  v.entities.add({
    position: Cesium.Cartesian3.fromDegrees(nation.lng, nation.lat),
    label: {
      text: `⚑ ${nation.name.toUpperCase()}`,
      font: 'bold 12px Orbitron, monospace',
      fillColor: Cesium.Color.fromCssColorString('#00d4ff'),
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -40),
      scaleByDistance: new Cesium.NearFarScalar(1e5, 1.5, 1e7, 0.3),
    }
  });
}

// ═══════════════════════════════════════════════════
//  GAME START
// ═══════════════════════════════════════════════════
function startGame(nation) {
  G.player = nation;
  document.getElementById('csel').style.display = 'none';
  document.getElementById('app').classList.add('show');

  document.getElementById('pflag').textContent = nation.flag;
  document.getElementById('pname').textContent = nation.name;
  document.getElementById('spow').textContent = nation.power;
  document.getElementById('sbud').textContent = nation.budget;
  document.getElementById('snuk').textContent = nation.nukes.toLocaleString();
  document.getElementById('cin-pr').textContent = `${nation.id.toUpperCase()}://> `;

  initCesium(nation);
  buildUnitList(nation);
  buildConflictList();
  startClock();
  setTimeout(startRandomEvents, 10000);

  clog(`WARNET ONLINE — PLAYING AS ${nation.name.toUpperCase()}`, 'c');
  clog(`CesiumJS 2D MAP INITIALIZING…`, 'y');
  clog(`${CONFLICTS.length} ACTIVE GLOBAL CONFLICTS PLOTTED ON MAP`, 'y');
  clog(`SELECT UNIT → LAUNCH STRIKE → CLICK ANYWHERE ON MAP`, 'c');
  clog(`DRAG TO PAN · SCROLL TO ZOOM`, 'g');
  addIntel(`${nation.name} command online. Monitoring ${CONFLICTS.length} global flashpoints.`, 'n');
  setTimeout(() => addIntel('WARNING: Multiple hostile nations tracking your movements.', 'w'), 5000);
  setTimeout(() => addIntel('SIGINT: Encrypted burst from DPRK facility — decoding.', 'y'), 11000);
  // persist selected nation and initial state
  try { autosave(); } catch (e) { console.warn('WARNET: autosave on startGame failed', e); }
}

// ═══════════════════════════════════════════════════
//  UNIT LIST
// ═══════════════════════════════════════════════════
function buildUnitList(nation) {
  const ul = document.getElementById('ulist');
  const m = nation.mil;
  const off = Object.entries(m).filter(([k]) => OFF.includes(k));
  const def = Object.entries(m).filter(([k]) => DEF.includes(k));
  let h = '';
  if (off.length) {
    h += '<div class="usect"><div class="usect-t">// Offensive Arsenal</div>';
    off.forEach(([k, v]) => {
      const cl = v < 20 ? 'lo' : v < 100 ? 'md' : 'hi';
      h += `<div class="urow" id="ur-${k}" onclick="window.selUnit('${k}')"><div class="uico">${UI[k]||'🔫'}</div><div class="uin"><div class="uname">${UL[k]||k}</div><div class="usub">DMG ${UD[k]||50} · ${UC[k]||200}cr</div></div><div class="ucnt ${cl}" id="uc-${k}">${Number(v).toLocaleString()}</div></div>`;
    });
    h += '</div>';
  }
  if (def.length) {
    h += '<div class="usect"><div class="usect-t">// Defense Systems</div>';
    def.forEach(([k, v]) => {
      h += `<div class="urow" id="ur-${k}" onclick="window.selUnit('${k}')"><div class="uico">${UI[k]||'🛡'}</div><div class="uin"><div class="uname">${UL[k]||k}</div><div class="usub">INTERCEPT 85% · ${UC[k]||200}cr</div></div><div class="ucnt hi" id="uc-${k}">${Number(v).toLocaleString()}</div></div>`;
    });
    h += '</div>';
  }
  // Naval Forces
  const nav = Object.entries(m).filter(([k]) => NAV.includes(k));
  if (nav.length) {
    h += '<div class="usect"><div class="usect-t">// Naval Forces</div>';
    nav.forEach(([k, v]) => {
      const info = SHIP_TYPES[k] || { icon: '🚢' };
      const cl = v < 2 ? 'lo' : v < 5 ? 'md' : 'hi';
      h += `<div class="urow" id="ur-${k}" onclick="window.selUnit('${k}')"><div class="uico">${info.icon}</div><div class="uin"><div class="uname">${info.displayName||k}</div><div class="usub">DEPLOY · ${info.cost||300}cr</div></div><div class="ucnt ${cl}" id="uc-${k}">${Number(v).toLocaleString()}</div></div>`;
    });
    h += '</div>';
  }
  ul.innerHTML = h;
}

function selUnit(k) {
  document.querySelectorAll('.urow').forEach(r => r.classList.remove('sel'));
  const el = document.getElementById(`ur-${k}`);
  if (el) el.classList.add('sel');
  G.selUnit = k;
  console.log('selUnit ->', k);
  document.getElementById('selp').textContent = UL[k] || k;
  clog(`UNIT: ${(UL[k]||k).toUpperCase()} | DMG:${UD[k]||50} | COST:${UC[k]||200}cr`, 'c');
  try { autosave(); } catch(e){}
}

// ═══════════════════════════════════════════════════
//  CONFLICT LIST
// ═══════════════════════════════════════════════════
function buildConflictList() {
  const list = document.getElementById('cfl-list');
  list.innerHTML = CONFLICTS.map(c => {
    const cls = c.status === 'active' ? 'hot' : c.status === 'tensions' ? 'cool' : 'warm';
    const bdg = c.status === 'active' ? 'active' : c.status === 'tensions' ? 'tensions' : 'ongoing';
    return `<div class="cfl ${cls}" onclick="window.flyToConflict(${c.lat},${c.lng})">
      <div class="cfl-hdr"><div class="cfl-name">${c.name}</div><div class="cfl-bdg ${bdg}">${c.label}</div></div>
      <div class="cfl-pt">${c.parties}</div>
      <div class="cfl-cas">⚠ ${c.casualties}</div>
    </div>`;
  }).join('');
}

function flyToConflict(lat, lng) {
  if (!G.viewer) return;
  G.viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lng, lat, 3000000),
    duration: 2.5,
  });
  const c = CONFLICTS.find(x => x.lat === lat && x.lng === lng);
  if (c) addIntel(`${c.name}: ${c.desc} — ${c.casualties}`, 'n');
}

// ═══════════════════════════════════════════════════
//  STRIKE / DEFEND MODES
// ═══════════════════════════════════════════════════
function enterStrike() {
  console.log('enterStrike called', { cesiumReady: G.cesiumReady, selUnit: G.selUnit });
  if (!G.cesiumReady) { clog('Map not ready yet', 'r'); return; }
  // If no offensive unit selected, auto-select the first available offensive unit
  if (!G.selUnit || DEF.includes(G.selUnit)) {
    const du = Object.keys(G.player.mil).find(k => OFF.includes(k) && G.player.mil[k] > 0);
    if (du) {
      selUnit(du);
      console.log('enterStrike: auto-selected offensive unit', du);
    } else {
      if (!G.selUnit) clog('SELECT A UNIT FIRST', 'r');
      else clog('DEFENSE UNIT — USE DEPLOY DEFENSE', 'y');
      return;
    }
  }
  G.mode = 'strike';
  const b = document.getElementById('mode-banner');
  b.className = 's'; b.textContent = `⚡ STRIKE MODE — ${UL[G.selUnit]} — CLICK TARGET ON MAP`;
  b.style.display = 'block';
  document.getElementById('target-hud').style.display = 'block';
  document.getElementById('cesiumContainer').style.cursor = 'crosshair';
  clog(`STRIKE MODE — [${UL[G.selUnit]||G.selUnit}] — CLICK TARGET ON THE MAP`, 'r');
}

// ═══════════════════════════════════════════════════
// DEPLOY SHIP MODE
// ═══════════════════════════════════════════════════
function enterDeployShip() {
  if (!G.cesiumReady) { clog('Map not ready yet', 'r'); return; }
  // Auto-select a naval unit if none selected OR current unit is depleted
  if (!G.selUnit || !NAV.includes(G.selUnit) || !(G.player.mil[G.selUnit] > 0)) {
    const du = Object.keys(G.player.mil || {}).find(k => NAV.includes(k) && G.player.mil[k] > 0);
    if (du) {
      selUnit(du);
      console.log('enterDeployShip: auto-selected naval unit', du);
    } else {
      clog('NO NAVAL UNITS AVAILABLE', 'r');
      return;
    }
  }
  G.mode = 'deployShip';
  const b = document.getElementById('mode-banner');
  const remaining = G.player.mil[G.selUnit] || 0;
  b.className = 'd'; b.textContent = `⛴ DEPLOY SHIP — ${SHIP_TYPES[G.selUnit]?.displayName || G.selUnit} (${remaining} left) — CLICK SEA ON MAP`;
  b.style.display = 'block';
  document.getElementById('cesiumContainer').style.cursor = 'crosshair';
  clog(`DEPLOY SHIP MODE — ${G.selUnit}`, 'g');
}

function deployShip(type, lat, lng) {
  const v = G.viewer;
  if (!type || !SHIP_TYPES[type]) { clog('UNKNOWN SHIP TYPE', 'r'); return; }
  const info = SHIP_TYPES[type];
  // Cost check
  const cost = info.cost || 300;
  if (G.credits < cost) { clog('INSUFFICIENT CREDITS', 'r'); cancelMode(); return; }
  if (!(G.player.mil[type] > 0)) { clog('NO UNITS AVAILABLE TO DEPLOY', 'r'); cancelMode(); return; }

  // Deduct and update UI
  G.credits -= cost;
  G.player.mil[type] = Math.max(0, (G.player.mil[type] || 0) - 1);
  const uc = document.getElementById(`uc-${type}`);
  if (uc) uc.textContent = G.player.mil[type].toLocaleString();
  updateHUD();
  try { autosave(); } catch(e){}

  const id = `ship-${Date.now()}-${Math.floor(Math.random()*1000)}`;
  const spawnHeight = 5;

  // === Draw ship on an offscreen canvas for the billboard ===
  const shipCanvas = (() => {
    const SIZE = 96;
    const c = document.createElement('canvas');
    c.width = c.height = SIZE;
    const ctx = c.getContext('2d');
    const cx = SIZE / 2, cy = SIZE / 2;

    // Type-specific tint: carrier=cyan, destroyer=orange, frigate=lime, submarine=purple
    const tints = { carrier:'#00d4ff', destroyer:'#ff7800', frigate:'#00ff88', submarine:'#bf5fff' };
    const col = tints[type] || '#00d4ff';

    ctx.save();
    ctx.shadowColor = col;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.2;

    // ——— Ship hull (top-down, bow pointing up) ———
    ctx.beginPath();
    if (type === 'submarine') {
      // elongated cigar shape
      ctx.ellipse(cx, cy, 9, 26, 0, 0, Math.PI * 2);
    } else {
      // pointed bow hull
      ctx.moveTo(cx, cy - 28);          // bow point
      ctx.bezierCurveTo(cx + 12, cy - 10, cx + 12, cy + 10, cx + 10, cy + 28); // starboard flare
      ctx.lineTo(cx - 10, cy + 28);      // stern
      ctx.bezierCurveTo(cx - 12, cy + 10, cx - 12, cy - 10, cx, cy - 28); // port flare
    }
    ctx.fillStyle = col + '40'; // hull fill at ~25% alpha
    ctx.fill();
    ctx.stroke();

    // ——— Superstructure ———
    if (type !== 'submarine') {
      // bridge block
      ctx.fillStyle = col + 'aa';
      ctx.fillRect(cx - 5, cy - 10, 10, 14);
      // carrier flight deck line
      if (type === 'carrier') {
        ctx.beginPath();
        ctx.moveTo(cx - 11, cy - 20); ctx.lineTo(cx + 11, cy - 20);
        ctx.lineWidth = 2; ctx.stroke();
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx - 11, cy + 16); ctx.lineTo(cx + 11, cy + 16);
        ctx.stroke();
      }
      // mast dot
      ctx.beginPath();
      ctx.arc(cx, cy - 4, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
    } else {
      // conning tower
      ctx.fillStyle = col + 'cc';
      ctx.fillRect(cx - 3, cy - 7, 6, 10);
      ctx.beginPath(); ctx.arc(cx, cy - 7, 3, 0, Math.PI * 2); ctx.fill();
    }

    // ——— Scan ring ———
    ctx.shadowBlur = 8;
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = col + '60';
    ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.arc(cx, cy, 42, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    return c;
  })();

  let entity;
  if (info.modelUrl) {
    try {
      entity = v.entities.add({
        id,
        position: Cesium.Cartesian3.fromDegrees(lng, lat, spawnHeight),
        model: { uri: info.modelUrl, scale: 1.0 },
      });
    } catch (e) {
      console.warn('WARNET: ship model failed, falling back to canvas billboard', e);
    }
  }
  if (!entity) {
    entity = v.entities.add({
      id,
      position: Cesium.Cartesian3.fromDegrees(lng, lat, spawnHeight),
      billboard: {
        image: shipCanvas,
        width: 64,
        height: 64,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        scaleByDistance: new Cesium.NearFarScalar(1e5, 1.4, 8e6, 0.3),
        translucencyByDistance: new Cesium.NearFarScalar(5e5, 1, 8e6, 0.2),
      },
      label: {
        text: info.displayName || type,
        font: '9px Share Tech Mono, monospace',
        fillColor: Cesium.Color.fromCssColorString('#00d4ff'),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, 38),
        scaleByDistance: new Cesium.NearFarScalar(1e4, 1.3, 8e6, 0),
        translucencyByDistance: new Cesium.NearFarScalar(5e5, 1, 8e6, 0),
      },
    });
  }
  console.log('deployShip: created entity', id, 'at', lat, lng);

  // Patrol movement: circular around spawn with CallbackProperty
  const radiusMeters = 20000; // 20km patrol radius
  const speed = (info.speed || 10); // m/s angular speed approx
  const start = Date.now();
  entity.position = new Cesium.CallbackProperty(() => {
    const t = ((Date.now() - start) / 1000) * (speed / 8000); // slow rotation factor
    const ang = t * Math.PI * 2;
    const latOffset = (radiusMeters / 111000) * Math.cos(ang);
    const lngOffset = (radiusMeters / (111000 * Math.cos(Cesium.Math.toRadians(lat)))) * Math.sin(ang);
    return Cesium.Cartesian3.fromDegrees(lng + lngOffset, lat + latOffset, spawnHeight);
  }, false);

  G.ships.push({ id, type, lat, lng, entity, owner: 'player' });
  addIntel(`${info.displayName || type} deployed at ${Math.abs(lat).toFixed(2)}°${lat>=0?'N':'S'} ${Math.abs(lng).toFixed(2)}°${lng>=0?'E':'W'}`, 'ok');
  clog(`${info.displayName || type} DEPLOYED`, 'g');
  try { autosave(); } catch (e) { console.warn('WARNET: autosave after deployShip failed', e); }

  // Stay in deploy mode if more units are available (same type or switch to next)
  const remaining = G.player.mil[type] || 0;
  if (remaining > 0 && G.credits >= cost) {
    // Same type still available
    const b = document.getElementById('mode-banner');
    b.className = 'd';
    b.textContent = `⛴ DEPLOY SHIP — ${info.displayName || type} (${remaining} left) — CLICK AGAIN OR ESC TO CANCEL`;
    b.style.display = 'block';
  } else {
    // Try to switch to another available naval unit
    const nextType = Object.keys(G.player.mil || {}).find(k => k !== type && NAV.includes(k) && G.player.mil[k] > 0 && G.credits >= (SHIP_TYPES[k]?.cost || 300));
    if (nextType) {
      selUnit(nextType);
      const nextInfo = SHIP_TYPES[nextType];
      const nextRemaining = G.player.mil[nextType] || 0;
      G.mode = 'deployShip';
      const b = document.getElementById('mode-banner');
      b.className = 'd';
      b.textContent = `⛴ DEPLOY SHIP — ${nextInfo?.displayName || nextType} (${nextRemaining} left) — CLICK AGAIN OR ESC TO CANCEL`;
      b.style.display = 'block';
      clog(`SWITCHED TO ${(nextInfo?.displayName || nextType).toUpperCase()}`, 'y');
    } else {
      cancelMode();
      if (remaining <= 0) clog(`ALL ${(info.displayName || type).toUpperCase()}S DEPLOYED`, 'y');
    }
  }
}

function enterDefend() {
  if (!G.cesiumReady) { clog('Map not ready yet', 'r'); return; }
  const du = Object.keys(G.player.mil).find(k => DEF.includes(k) && G.player.mil[k] > 0);
  if (!du) { clog('NO DEFENSE SYSTEMS AVAILABLE', 'r'); return; }
  if (!G.selUnit || !DEF.includes(G.selUnit)) selUnit(du);
  G.mode = 'defend';
  const b = document.getElementById('mode-banner');
  b.className = 'd'; b.textContent = `🛡 DEPLOY — ${UL[G.selUnit]} — CLICK POSITION ON MAP`;
  b.style.display = 'block';
  document.getElementById('cesiumContainer').style.cursor = 'crosshair';
  clog(`DEPLOY MODE — ${UL[G.selUnit]||G.selUnit}`, 'g');
}

function cancelMode() {
  G.mode = null;
  document.getElementById('mode-banner').style.display = 'none';
  document.getElementById('target-hud').style.display = 'none';
  document.getElementById('cesiumContainer').style.cursor = '';
}

function showModal() {
  const k = G.selUnit, cost = UC[k]||200, dmg = UD[k]||50, avail = G.player.mil[k]||0;
  document.getElementById('mbod').innerHTML =
    `UNIT: <span>${UL[k]||k}</span><br>
     TARGET: <span>${G.pendName}</span><br>
     COORDS: <span>${G.pendCoords.lat.toFixed(2)}°N / ${G.pendCoords.lng.toFixed(2)}°E</span><br>
     DAMAGE: <span>${dmg}</span> &nbsp;&nbsp; COST: <span>${cost} credits</span><br>
     AVAILABLE: <span>${avail.toLocaleString()} units</span>`;
  document.getElementById('modal').classList.add('show');
}

function closeModal() {
  document.getElementById('modal').classList.remove('show');
  cancelMode();
}

// ═══════════════════════════════════════════════════
//  EXECUTE STRIKE
// ═══════════════════════════════════════════════════
function doStrike() {
  console.log('doStrike called', { selUnit: G.selUnit, pendCoords: G.pendCoords, credits: G.credits });
  const k = G.selUnit, cost = UC[k]||200, dmg = UD[k]||50;
  document.getElementById('modal').classList.remove('show');
  if (G.credits < cost) { clog('INSUFFICIENT CREDITS', 'r'); cancelMode(); return; }
  if (!(G.player.mil[k] > 0)) { clog('UNIT DEPLETED', 'r'); cancelMode(); return; }

  G.player.mil[k]--;
  G.credits -= cost;
  G.strikes++;
  G.score += dmg * 15;
  const uc = document.getElementById(`uc-${k}`);
  if (uc) uc.textContent = G.player.mil[k].toLocaleString();
  updateHUD();

  const isNuke = NUKE_UNITS.includes(k);
  // If naval unit selected and a deployed ship exists, use nearest ship as launch origin
  let fromLat = G.player.lat, fromLng = G.player.lng;
  if (NAV.includes(k) && G.ships && G.ships.length) {
    // find nearest deployed ship of matching type, otherwise any ship
    let best = null, bd = Infinity;
    G.ships.forEach(s => {
      if (s.owner !== 'player') return;
      const d = Math.hypot(s.lat - G.pendCoords.lat, s.lng - G.pendCoords.lng);
      if (d < bd) { bd = d; best = s; }
    });
    if (best) { fromLat = best.lat; fromLng = best.lng; }
  }
  launchMissile(fromLat, fromLng, G.pendCoords.lat, G.pendCoords.lng, k, isNuke, dmg, false);

  cancelMode();
  updateDefcon();
  scheduleRetaliation();
}

// ═══════════════════════════════════════════════════
//  MISSILE ANIMATION
// ═══════════════════════════════════════════════════
function launchMissile(fromLat, fromLng, toLat, toLng, unit, isNuke, dmg, isEnemy) {
  const v = G.viewer;
  const color = isEnemy
    ? Cesium.Color.fromCssColorString('#ff1a3c')
    : isNuke
      ? Cesium.Color.ORANGE
      : Cesium.Color.fromCssColorString('#00d4ff');

  const start = Cesium.Cartesian3.fromDegrees(fromLng, fromLat);
  const end   = Cesium.Cartesian3.fromDegrees(toLng, toLat);
  const numPts = 80;
  const arcPts = [];
  const dist = Cesium.Cartesian3.distance(start, end);
  const peakAlt = isNuke ? Math.max(1500000, dist * 0.35) : Math.max(500000, dist * 0.2);

  for (let i = 0; i <= numPts; i++) {
    const t = i / numPts;
    const lat = fromLat + (toLat - fromLat) * t;
    const lng = fromLng + (toLng - fromLng) * t;
    const alt = peakAlt * Math.sin(t * Math.PI);
    arcPts.push(Cesium.Cartesian3.fromDegrees(lng, lat, alt));
  }

  const startTime = Cesium.JulianDate.now();
  const duration = isNuke ? 4.0 : 2.5;
  const stopTime = Cesium.JulianDate.addSeconds(startTime, duration, new Cesium.JulianDate());

  const sampledPos = new Cesium.SampledPositionProperty();
  arcPts.forEach((pt, i) => {
    const t = Cesium.JulianDate.addSeconds(startTime, (i / numPts) * duration, new Cesium.JulianDate());
    sampledPos.addSample(t, pt);
  });
  sampledPos.setInterpolationOptions({ interpolationDegree:5, interpolationAlgorithm: Cesium.LagrangePolynomialApproximation });

  const missileEntity = v.entities.add({
    availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({ start: startTime, stop: stopTime })]),
    position: sampledPos,
    orientation: new Cesium.VelocityOrientationProperty(sampledPos),
    point: {
      pixelSize: isNuke ? 10 : 7,
      color: color,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 1,
      scaleByDistance: new Cesium.NearFarScalar(1e3, 2, 2e7, 0.5),
    },
  });

  const trailEntity = v.entities.add({
    polyline: {
      positions: new Cesium.CallbackProperty(() => {
        const now = Cesium.JulianDate.now();
        const elapsed = Cesium.JulianDate.secondsDifference(now, startTime);
        const frac = Math.min(1, elapsed / duration);
        const count = Math.floor(frac * numPts);
        return arcPts.slice(0, Math.max(2, count));
      }, false),
      width: isNuke ? 2.5 : 1.5,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.25,
        color: color.withAlpha(0.7),
      }),
    }
  });

  setTimeout(() => {
    v.entities.remove(missileEntity);
    v.entities.remove(trailEntity);
    createExplosion(toLat, toLng, isNuke, color, dmg, isEnemy);
  }, duration * 1000);
}

// ═══════════════════════════════════════════════════
//  EXPLOSION
// ═══════════════════════════════════════════════════
function createExplosion(lat, lng, isNuke, color, dmg, isEnemy) {
  const v = G.viewer;
  const pos = Cesium.Cartesian3.fromDegrees(lng, lat);
  const baseRadius = isNuke ? 300000 : 80000;

  let r = 1000;
  const sphere = v.entities.add({
    position: pos,
    ellipsoid: {
      radii: new Cesium.CallbackProperty(() => new Cesium.Cartesian3(r, r, r), false),
      material: color.withAlpha(0.6),
    }
  });

  const flashDur = isNuke ? 2500 : 1200;
  const startT = Date.now();

  const ring1 = v.entities.add({
    position: pos,
    ellipse: { semiMajorAxis: 1000, semiMinorAxis: 1000, material: color.withAlpha(0.3), outline: true, outlineColor: color, outlineWidth: 2, height: 500 }
  });
  const ring2 = v.entities.add({
    position: pos,
    ellipse: { semiMajorAxis: 1000, semiMinorAxis: 1000, material: Cesium.Color.TRANSPARENT, outline: true, outlineColor: color.withAlpha(0.4), outlineWidth: 1.5, height: 500 }
  });

  let mushroom;
  if (isNuke) {
    mushroom = v.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lng, lat, 150000),
      cylinder: { length: 400000, topRadius: 250000, bottomRadius: 20000, material: Cesium.Color.fromCssColorString('#ff7700').withAlpha(0.35), outline: true, outlineColor: Cesium.Color.fromCssColorString('#ff3300').withAlpha(0.5) }
    });
    setTimeout(() => { try { v.entities.remove(mushroom); } catch(e){} }, flashDur + 3000);
  }

  const interval = setInterval(() => {
    const frac = (Date.now() - startT) / flashDur;
    if (frac >= 1) {
      clearInterval(interval);
      try { v.entities.remove(sphere); } catch(e){}
      try { v.entities.remove(ring1); } catch(e){}
      try { v.entities.remove(ring2); } catch(e){}
      return;
    }
    r = baseRadius * Math.sqrt(frac);
    try {
      const s1 = Math.max(1, baseRadius * 1.5 * frac);
      const s2 = Math.max(1, baseRadius * 3.0 * frac);
      if (ring1 && ring1.ellipse) {
        ring1.ellipse.semiMajorAxis = s1;
        ring1.ellipse.semiMinorAxis = s1;
      }
      if (ring2 && ring2.ellipse) {
        ring2.ellipse.semiMajorAxis = s2;
        ring2.ellipse.semiMinorAxis = s2;
      }
    } catch (e) {
      // defensive: ignore transient errors modifying entity properties
    }
  }, 16);

  screenFlash(isNuke);

  // Check for ships damaged by this explosion (best-effort)
  try {
    const explPos = pos;
    setTimeout(() => {
      if (!G.ships || !G.ships.length) return;
      const removed = [];
      G.ships.forEach((s, idx) => {
        try {
          const sPos = Cesium.Cartesian3.fromDegrees(s.lng, s.lat, 0);
          const d = Cesium.Cartesian3.distance(explPos, sPos);
          if (d < baseRadius * 0.6) {
            // ship destroyed
            try { v.entities.remove(s.entity); } catch (e) {}
            removed.push(idx);
            clog(`SHIP DESTROYED: ${s.type}`, 'r');
            addIntel(`Ship destroyed near ${s.lat.toFixed(2)},${s.lng.toFixed(2)}.`, 'w');
          }
        } catch (e) {}
      });
      // remove from G.ships by index descending
      removed.sort((a,b) => b-a).forEach(i => G.ships.splice(i,1));
      try { autosave(); } catch(e){}
    }, 60);
  } catch (e) {}

  if (!isEnemy) {
    clog(`IMPACT: ${G.pendName || 'target'} — damage ${dmg}`, 'r');
    addIntel(`Strike confirmed on ${G.pendName}. Estimated damage: ${dmg}.`, 'w');
  }

  // Record persistent destroyed area and render it
  try {
    const radiusMeters = Math.max(1000, Math.round(baseRadius * 0.6));
    const area = { id: `e${Date.now()}${Math.floor(Math.random()*9999)}`, lat, lng, radiusMeters, ts: Date.now(), weapon: isNuke ? 'nuke' : 'conventional' };
    G.destroyedAreas = G.destroyedAreas || [];
    G.destroyedAreas.push(area);
    // prune oldest if too many
    const MAX_AREAS = 300;
    if (G.destroyedAreas.length > MAX_AREAS) {
      const removed = G.destroyedAreas.splice(0, G.destroyedAreas.length - MAX_AREAS);
      removed.forEach(a => { try { const e = G.viewer.entities.getById(`destroyed-${a.id}`); if (e) G.viewer.entities.remove(e); } catch(e){} });
    }
    renderDestroyedArea(area);
    saveDestroyedAreas();
    try { autosave(); } catch (e) { console.warn('WARNET: autosave after createExplosion failed', e); }
  } catch (e) {
    console.warn('WARNET: failed to record destroyed area', e);
  }
}

function screenFlash(isNuke) {
  const div = document.createElement('div');
  div.className = 'expl-flash';
  div.style.setProperty('--ex', '50%');
  div.style.setProperty('--ey', '50%');
  if (isNuke) div.style.background = 'radial-gradient(circle at 50% 50%, rgba(255,255,200,.5) 0%, rgba(255,100,0,.2) 40%, transparent 70%)';
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 900);
}

// ═══════════════════════════════════════════════════
//  DEPLOY DEFENSE
// ═══════════════════════════════════════════════════
function deployDefenseAt(lat, lng) {
  const k = G.selUnit;
  if (!DEF.includes(k)) return;
  const cost = UC[k]||300;
  if (G.credits < cost) { clog('INSUFFICIENT CREDITS', 'r'); cancelMode(); return; }
  if (!(G.player.mil[k] > 0)) { clog('UNIT DEPLETED', 'r'); cancelMode(); return; }

  G.player.mil[k]--;
  G.credits -= cost;
  const uc = document.getElementById(`uc-${k}`);
  if (uc) uc.textContent = G.player.mil[k].toLocaleString();

  const v = G.viewer;
  const range = k === 'thaad' ? 350000 : k === 's400' ? 300000 : 150000;

  v.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lng, lat),
    ellipse: { semiMajorAxis: range, semiMinorAxis: range, material: Cesium.Color.fromCssColorString('#00ff88').withAlpha(0.08), outline: true, outlineColor: Cesium.Color.fromCssColorString('#00ff88').withAlpha(0.5), outlineWidth: 1.5, height: 1000, granularity: 0.01 }
  });
  v.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lng, lat),
    billboard: { text: '🛡', font: '20px sans-serif', scaleByDistance: new Cesium.NearFarScalar(1e4, 2, 2e7, 0.3) }
  });

  G.defenses.push({ lat, lng, unit: k, range });
  updateHUD();
  try { autosave(); } catch(e){}
  cancelMode();
  clog(`${UL[k]||k} DEPLOYED @ ${lat.toFixed(1)}°N ${lng.toFixed(1)}°E`, 'g');
  addIntel(`Defense battery active: ${UL[k]||k}.`, 'ok');
}

// ═══════════════════════════════════════════════════
//  SALVO STRIKE
// ═══════════════════════════════════════════════════
function launchSalvo() {
  if (!G.cesiumReady) return;
  if (G.credits < 3000) { clog('INSUFFICIENT CREDITS FOR SALVO (need 3000cr)', 'r'); return; }
  if (!G.selUnit || DEF.includes(G.selUnit)) { clog('SELECT AN OFFENSIVE UNIT FOR SALVO', 'y'); return; }

  G.credits -= 3000;
  const targets = [...CONFLICTS].sort(() => Math.random() - 0.5).slice(0, 3);
  targets.forEach((c, i) => {
    setTimeout(() => {
      const k = G.selUnit;
      const dmg = UD[k]||50;
      G.player.mil[k] = Math.max(0, G.player.mil[k] - 1);
      G.score += dmg * 12;
      G.strikes++;
      const uc = document.getElementById(`uc-${k}`);
      if (uc) uc.textContent = G.player.mil[k].toLocaleString();
      launchMissile(G.player.lat, G.player.lng, c.lat, c.lng, k, NUKE_UNITS.includes(k), dmg, false);
      G.pendName = c.name;
    }, i * 800);
  });

  setTimeout(() => {
    updateHUD(); updateDefcon();
    clog(`SALVO LAUNCHED — 3 STRIKES — TARGETS: ${targets.map(c=>c.name).join(' · ')}`, 'r');
    addIntel(`Salvo strike authorized. 3 warheads en route.`, 'w');
    scheduleRetaliation();
    try { autosave(); } catch(e){}
  }, 2400);
}

// ═══════════════════════════════════════════════════
//  ENEMY RETALIATION
// ═══════════════════════════════════════════════════
function scheduleRetaliation() {
  setTimeout(() => {
    if (!G.gameActive || !G.cesiumReady) return;
    const hostiles = CONFLICTS.filter(c => c.status === 'active' || c.status === 'tensions');
    const att = hostiles[Math.floor(Math.random() * hostiles.length)];
    if (!att) return;

    const tLat = G.player.lat + (Math.random() - 0.5) * 6;
    const tLng = G.player.lng + (Math.random() - 0.5) * 6;

    let intercepted = false;
    for (const d of G.defenses) {
      const dist = Math.hypot(d.lat - tLat, d.lng - tLng) * 111000;
      if (dist < d.range && Math.random() < 0.82) {
        intercepted = true;
        const iLat = (d.lat + tLat) / 2;
        const iLng = (d.lng + tLng) / 2;
        createExplosion(iLat, iLng, false, Cesium.Color.fromCssColorString('#00ff88'), 0, true);
        clog(`INTERCEPT: ${UL[d.unit]} neutralized enemy missile!`, 'g');
        addIntel('Enemy warhead neutralized by defense battery.', 'ok');
        break;
      }
    }

    if (!intercepted) {
      // Correct order: fromLat, fromLng, toLat, toLng
      launchMissile(att.lat, att.lng, tLat, tLng, 'icbm', Math.random() > 0.5, 0, true);
      const dmg = 15 + Math.floor(Math.random() * 25);
      G.hp = Math.max(0, G.hp - dmg);
      document.getElementById('hpn').textContent = G.hp;
      document.getElementById('hpf').style.width = G.hp + '%';
      document.getElementById('hpf').style.background = G.hp < 25 ? 'var(--red)' : G.hp < 55 ? 'var(--orange)' : 'var(--green)';
      clog(`ENEMY STRIKE HIT — ${dmg} DAMAGE — HP: ${G.hp}%`, 'r');
      addIntel(`Retaliation from ${att.parties.split(' ')[0]}. −${dmg} HP. Now ${G.hp}%.`, 'w');
      if (G.hp <= 0) endGame(false);
    }
  }, 5000 + Math.random() * 10000);
}

// ═══════════════════════════════════════════════════
//  RELOAD
// ═══════════════════════════════════════════════════
function reloadArsenal() {
  if (G.credits < 2000) { clog('INSUFFICIENT CREDITS', 'r'); return; }
  G.credits -= 2000;
  Object.keys(G.player.mil).forEach(k => {
    if (OFF.includes(k) && G.player.mil[k] < 500) {
      G.player.mil[k] += 30;
      const el = document.getElementById(`uc-${k}`);
      if (el) el.textContent = G.player.mil[k].toLocaleString();
    }
  });
  clog('ARSENAL RELOADED (+30 per type) — 2000cr deducted', 'y');
  updateHUD();
  try { autosave(); } catch(e){}
}

// ═══════════════════════════════════════════════════
//  HUD + DEFCON
// ═══════════════════════════════════════════════════
function updateHUD() {
  document.getElementById('hstr').textContent = G.strikes;
  document.getElementById('hsc').textContent = G.score.toLocaleString();
  document.getElementById('hcr').textContent = G.credits.toLocaleString();
}

function updateDefcon() {
  const prev = G.defcon;
  G.defcon = G.strikes >= 12 ? 1 : G.strikes >= 8 ? 2 : G.strikes >= 4 ? 3 : G.strikes >= 1 ? 4 : 5;
  const p = document.getElementById('dpill');
  p.textContent = G.defcon;
  const cols = { 1:'#ff1a3c', 2:'#ff4400', 3:'#ff7800', 4:'#ffaa00', 5:'#00ff88' };
  p.style.color = cols[G.defcon];
  p.style.borderColor = cols[G.defcon];
  if (G.defcon < prev) {
    clog(`⚠ DEFCON ELEVATED TO ${G.defcon}`, 'r');
    addIntel(`Global DEFCON now level ${G.defcon}.`, 'w');
  }
  if (G.score >= 10000) endGame(true);
}

// ═══════════════════════════════════════════════════
//  INTEL + CONSOLE
// ═══════════════════════════════════════════════════
const IPOOL = [
  'Satellite confirms military buildup near disputed border.',
  'Encrypted burst intercepted — decoding in progress.',
  'HUMINT: warhead transfer at undisclosed facility.',
  'Radar: unidentified aircraft bearing 045, FL450.',
  'Submarine surfaced 80nm off coast — unknown flag.',
  'Underground facility thermal anomaly detected.',
  'Air defense radar — possible hostile lock.',
  'Naval blockade — commercial shipping rerouted.',
  'Ballistic trajectory computed — 8min to impact.',
  'Drone swarm detected approaching eastern perimeter.',
  'Cyberattack on power grid — partial blackout.',
  'Carrier group repositioned to strike range.',
];

function addIntel(msg, type = 'n') {
  const el = document.getElementById('intel');
  const t = new Date().toUTCString().slice(17, 25);
  const d = document.createElement('div');
  d.className = `imsg ${type}`;
  d.innerHTML = `<span class="its">[${t}]</span>${msg}`;
  el.prepend(d);
  while (el.children.length > 22) el.removeChild(el.lastChild);
}

function clog(msg, type = '') {
  const out = document.getElementById('con-out');
  const t = new Date().toUTCString().slice(17, 25);
  const d = document.createElement('div');
  d.className = 'cl';
  d.innerHTML = `<span class="cts">[${t}]</span><span class="ctx ${type}">${msg}</span>`;
  out.appendChild(d);
  out.scrollTop = out.scrollHeight;
  while (out.children.length > 60) out.removeChild(out.firstChild);
}

document.getElementById('cmd').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const v = e.target.value.trim();
  e.target.value = '';
  if (!v) return;
  clog('> ' + v, '');
  handleCmd(v.toLowerCase());
});

function handleCmd(cmd) {
  const [c, ...a] = cmd.split(' ');
  const args = a.join(' ');
  const cmds = {
    help: () => clog('help · status · arsenal · conflicts · score · reload · clear · flyto [name] · cam [reset/top]', 'c'),
    status: () => clog(`HP:${G.hp}% | DEFCON:${G.defcon} | STRIKES:${G.strikes} | SCORE:${G.score} | CREDITS:${G.credits}`, 'c'),
    arsenal: () => Object.entries(G.player.mil).forEach(([k, v]) => clog(`${(UL[k]||k).padEnd(22)} ${v.toLocaleString()}`, 'c')),
    intel: () => addIntel(IPOOL[Math.floor(Math.random() * IPOOL.length)], 'n'),
    conflicts: () => CONFLICTS.forEach(cf => clog(`${cf.name.padEnd(30)} ${cf.label}`, cf.status === 'active' ? 'r' : cf.status === 'tensions' ? 'y' : 'c')),
    score: () => clog(`SCORE: ${G.score} | STRIKES: ${G.strikes} | DEFCON: ${G.defcon}`, 'c'),
    reload: () => reloadArsenal(),
    clear: () => { document.getElementById('con-out').innerHTML = ''; },
    flyto: () => {
      if (!G.viewer) return;
      const n = NATIONS.find(n => n.name.toLowerCase().includes(args) || n.id === args);
      const cf = CONFLICTS.find(c => c.name.toLowerCase().includes(args) || c.id.includes(args));
      if (n) {
        G.viewer.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(n.camLng, n.camLat, n.camAlt / 1.5), duration: 2.5 });
      } else if (cf) {
        flyToConflict(cf.lat, cf.lng);
      } else {
        clog(`NOT FOUND: ${args}`, 'r');
      }
    },
    cam: () => {
      if (!G.viewer) return;
      if (args === 'reset') {
        G.viewer.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(G.player.camLng, G.player.camLat, G.player.camAlt), duration: 2 });
      } else if (args === 'top') {
        G.viewer.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(0, 20, 25e6), duration: 3 });
      }
    },
  };
  if (cmds[c]) cmds[c]();
  else clog(`UNKNOWN: ${cmd} — type "help"`, 'r');
}

// ═══════════════════════════════════════════════════
//  CLOCK + RANDOM EVENTS
// ═══════════════════════════════════════════════════
function startClock() {
  setInterval(() => {
    const d = new Date();
    document.getElementById('hclock').textContent =
      `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}:${String(d.getUTCSeconds()).padStart(2,'0')}`;
  }, 1000);
}

function startRandomEvents() {
  function fire() {
    if (!G.gameActive) return;
    const evts = [
      () => addIntel(IPOOL[Math.floor(Math.random() * IPOOL.length)], Math.random() > 0.6 ? 'w' : 'n'),
      () => {
        if (!G.cesiumReady) return;
        const c = CONFLICTS[Math.floor(Math.random() * CONFLICTS.length)];
        const col = Cesium.Color.fromCssColorString(c.status === 'active' ? '#ff1a3c' : '#ff7800');
        createExplosion(c.lat + (Math.random()-0.5)*2, c.lng + (Math.random()-0.5)*2, false, col, 0, true);
        addIntel(`Activity spike detected: ${c.name}`, 'w');
      },
    ];
    evts[Math.floor(Math.random() * evts.length)]();
    setTimeout(fire, 6000 + Math.random() * 14000);
  }
  fire();
}

// ═══════════════════════════════════════════════════
//  GAME OVER
// ═══════════════════════════════════════════════════
function endGame(win) {
  G.gameActive = false;
  const sc = document.getElementById('go');
  sc.classList.add('show');
  document.getElementById('go-t').textContent = win ? 'VICTORY' : 'NATION DESTROYED';
  document.getElementById('go-t').style.color = win ? 'var(--green)' : 'var(--red)';
  document.getElementById('go-s').textContent = win ? 'GLOBAL DOMINANCE ACHIEVED' : 'YOUR TERRITORY HAS FALLEN';
  document.getElementById('go-stats').innerHTML =
    `FINAL SCORE: ${G.score.toLocaleString()}<br>
     STRIKES LAUNCHED: ${G.strikes}<br>
     DEFCON REACHED: ${G.defcon}<br>
     DEFENSES DEPLOYED: ${G.defenses.length}<br>
     CREDITS REMAINING: ${G.credits.toLocaleString()}`;
}

// ESC cancels mode
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cancelMode();
});

// ═══════════════════════════════════════════════════
//  EXPOSE GLOBALS (called from HTML onclick attributes)
// ═══════════════════════════════════════════════════
window.selUnit       = selUnit;
window.flyToConflict = flyToConflict;
window.enterStrike   = enterStrike;
window.enterDefend   = enterDefend;
window.launchSalvo   = launchSalvo;
window.reloadArsenal = reloadArsenal;
window.doStrike      = doStrike;
window.closeModal    = closeModal;
window.enterDeployShip = enterDeployShip;
window.deployShip = deployShip;
window.clearDestroyedAreas = clearDestroyedAreas;
window.clearGameState = clearGameState;
window.saveGameState = saveGameState;
window.loadGameState = loadGameState;
