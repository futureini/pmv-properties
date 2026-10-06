import axios from 'axios';

// ---------------------------------------------------------------------------
// Where is the API?
//   * Live server  -> set VITE_API_BASE_URL (e.g. https://pmv-api.onrender.com/api)
//                     in your host's environment variables (Vercel/Netlify).
//   * Local dev    -> nothing to set. We use the SAME host the page was loaded
//                     from, on port 5000, so it also works when you open the
//                     app on your phone via your PC's LAN IP (192.168.x.x).
// ---------------------------------------------------------------------------
const envBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

const devBase =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:5000/api`
    : 'http://localhost:5000/api';

// In a production build with no VITE_API_BASE_URL we fall back to the same
// origin's /api (works behind a reverse proxy) and warn loudly in the console.
const prodFallback = typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api';

export const API_BASE_URL = envBase || (import.meta.env.DEV ? devBase : prodFallback);

// "https://host/api" -> "https://host". Used to turn "/uploads/x.jpg" (images
// saved on the API server's own disk) into a full URL.
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

if (!envBase && !import.meta.env.DEV && typeof console !== 'undefined') {
  console.warn(
    '[PMV] VITE_API_BASE_URL is not set. Add it in your hosting dashboard (e.g. https://your-api.onrender.com/api) and redeploy.'
  );
}

// Kept for any older import.
export const defaultApiBase = API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ---------------------------------------------------------------------------
// Render free-plan cold starts
// The API sleeps after ~15 min without traffic and takes ~1 min to wake. To
// hide that from customers we:
//   1. warm the server up the moment the site opens (warmUpApi, called in main.jsx)
//   2. retry GET requests that fail while the server is still starting
//   3. show cached data instantly while fresh data loads (cachedGet below)
//   4. tell the visitor "server is starting" if a request is slow (ServerWakeNotice)
// ---------------------------------------------------------------------------

// Fire-and-forget ping so the server starts waking before any page asks for data.
export function warmUpApi() {
  axios.get(`${API_BASE_URL}/health`, { timeout: 90000 }).catch(() => {});
}

// Tiny pub/sub so the UI can react to slow GET requests.
let pendingGets = 0;
const pendingListeners = new Set();
const emitPending = () => pendingListeners.forEach((fn) => fn(pendingGets));
export function subscribePending(fn) {
  pendingListeners.add(fn);
  fn(pendingGets);
  return () => pendingListeners.delete(fn);
}

const MAX_RETRIES = 3;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Attach the admin token (if present) and track slow GETs.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pmv_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.method === 'get') {
    if (!config.timeout) config.timeout = 45000; // a cold start can take ~1 min
    if (!config.__counted) {
      // (a retried request is already counted — it stays "pending" across retries)
      config.__counted = true;
      pendingGets += 1;
      emitPending();
    }
  }
  return config;
});

const settle = (config) => {
  if (config && config.__counted) {
    config.__counted = false;
    pendingGets = Math.max(0, pendingGets - 1);
    emitPending();
  }
};

api.interceptors.response.use(
  (res) => {
    settle(res.config);
    return res;
  },
  async (err) => {
    const config = err.config;
    const status = err.response?.status;
    // Retry GETs that failed because the server was asleep / still starting.
    const retryable =
      config &&
      config.method === 'get' &&
      !axios.isCancel(err) &&
      (!err.response || [502, 503, 504].includes(status)) &&
      (config.__retry || 0) < MAX_RETRIES;
    if (retryable) {
      config.__retry = (config.__retry || 0) + 1;
      await sleep(2000 * config.__retry);
      return api.request(config);
    }
    settle(config);
    return Promise.reject(err);
  }
);

// ---------------------------------------------------------------------------
// Stale-while-revalidate GET: if we've loaded this URL before, hand the saved
// copy to onData() immediately (so the page paints in ~0 ms, even while the
// server is waking up), then fetch fresh data and call onData() again.
// The returned promise only rejects when there was NO cached copy to show.
// ---------------------------------------------------------------------------
const CACHE_PREFIX = 'pmv_cache_v1:';
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function cachedGet(url, config, onData) {
  const key = CACHE_PREFIX + url + JSON.stringify(config?.params || {});
  let hadCache = false;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const { t, d } = JSON.parse(raw);
      if (Date.now() - t < CACHE_MAX_AGE_MS) {
        hadCache = true;
        onData(d, true);
      }
    }
  } catch {
    /* corrupt / unavailable storage — just fetch normally */
  }

  return api
    .get(url, config)
    .then(({ data }) => {
      try {
        localStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data }));
      } catch {
        /* storage full / private mode — ignore */
      }
      onData(data, false);
      return data;
    })
    .catch((err) => {
      if (!hadCache) throw err;
    });
}

export const ADMIN_CONTACT_NUMBER = (import.meta.env.VITE_ADMIN_CONTACT_NUMBER || '917358523204').replace(/\D/g, '');

export default api;
