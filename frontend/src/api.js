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

// Attach the admin token (if present) to every request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pmv_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const ADMIN_CONTACT_NUMBER = (import.meta.env.VITE_ADMIN_CONTACT_NUMBER || '917358523204').replace(/\D/g, '');

export default api;
