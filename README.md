# PMV Properties — Full Stack Real Estate App

Stack: **React (Vite) + Tailwind** frontend, **Node/Express** backend, **MongoDB** database.

```
pmv-properties/
├── frontend/     React app (customer app + admin panel), deploy to Vercel
│   ├── vercel.json         SPA rewrite (see note below — required for Vercel)
│   └── public/
│       ├── robots.txt      crawlers allowed everywhere except /admin/
│       └── sitemap.xml     update the domain here once you have one
├── backend/      Express API, deploy to Render
└── README.md     (this file)
```

**`frontend/vercel.json` — do not delete.** Without it, opening any URL other
than the homepage directly (e.g. sharing a link to `/property/abc123`, or
just refreshing the page on `/category/rent`) 404s on Vercel, because Vercel
serves static files by default and doesn't know this is a client-routed
single-page app. The rewrite rule sends every request that isn't a real file
(`.png`, `.xml`, `.webmanifest`, etc.) to `index.html` so React Router can
take over.

## 1. Run locally (localhost + VS Code Live Server style workflow)

**Backend**
```bash
cd backend
npm install
cp .env.example .env        # fill MONGO_URI (Atlas or local), JWT_SECRET, ADMIN_EMAIL/PASSWORD
npm run seed:admin          # creates your admin login once
npm run dev                 # http://localhost:5000
```

**Frontend** (in a second terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev                 # http://localhost:5173
```
Open `http://localhost:5173` for the customer app, and `http://localhost:5173/admin/login` for the admin panel.

## 2. Deploy live
- **MongoDB Atlas** — create a free cluster, whitelist all IPs (0.0.0.0/0), copy the connection string into `backend/.env` → `MONGO_URI`.
- **Backend → Render** — push `backend/` to GitHub, create a Web Service, root dir `backend`, build `npm install`, start `npm start`, add the env vars from `.env.example`, then run `npm run seed:admin` once.
- **Frontend → Vercel** — push `frontend/` to GitHub, import the project (root dir `frontend`), set `VITE_API_BASE_URL` to your Render URL + `/api`.
- **Images (important)** — property photos must live in the cloud, not on the server's disk. Create a free Cloudinary account and set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` on Render (and in `backend/.env` locally). With those set, the same code works on localhost and live: photos are uploaded to Cloudinary and the database stores permanent URLs. On a live host without them, the admin gets a clear error instead of photos that silently disappear later. Every uploaded image is auto-resized to 1000×750 and compressed.
  - Already uploaded photos while Cloudinary was empty? Put the Cloudinary keys and the *live* `MONGO_URI` in `backend/.env`, then run `npm run migrate:images -- --dry` (preview) and `npm run migrate:images` on the computer that still has `backend/uploads/`. Photos whose files are gone are listed so you can re-upload them from Admin → Edit.
  - Frontend on Vercel: set `VITE_API_BASE_URL` to your Render URL + `/api`, and add your Vercel address to `CLIENT_ORIGINS` on Render.

Full details are in `backend/README.md`.

## 3. What was built vs. your mockup, and why

**Kept exactly as asked**
- Same red/white "PMV Properties" look, same rounded mobile-card style, icon language, fonts (Poppins, close to the mockup's rounded sans-serif).
- Splash screen kept; **Welcome/Onboarding screen removed** — splash goes straight to Home.
- One reusable **Home → Category Listing → Property Details** flow powers all 5 requested categories (Buy/Sale, Land/Plot, Flat, Shop/Commercial, Lease) plus Rent — instead of 30+ near-duplicate hand-built screens, it's one flexible template driven by `category`, so it's easier to maintain and every category behaves identically.
- **Rent Property Details**: label changed to "Rent Amount", **Facing** and **Lease Duration** removed.
- **Buy/Sale Property Details**: no "Loan Available" field anywhere.
- **"Contact for Details" button removed everywhere** — every property details page only shows **Call** and **WhatsApp**, and both always dial/message the **admin number (7358523204)**, never the owner's number.
- Owner phone number is stored (`ownerPhone`) but marked private in the schema/API — it is **never** returned to the public/customer API, only visible to a logged-in admin.
- Skipped, as instructed: Rent-Details (dup.), Admin Dashboard/Land Property/Add Property/Property Listing Management/Property Details(Admin)/Shop-Flat Details as separate *customer-side* screens — the real Admin Panel (Login, Dashboard, Property Listing Management, Add/Edit form, Enquiries) is built once, properly, per your Admin Panel screenshot.
- No customer login (as requested) — only Admin has a login.
- Image upload: max 5 images per property, JPG/PNG/WEBP only (no video option), server-side auto-compress + fixed-size resize for a consistent, fast, responsive gallery.
- Fully responsive: the customer app uses a centered "phone frame" (max-width 480px) that scales down to real mobile widths and up gracefully on desktop; the Admin Panel is a responsive sidebar dashboard (collapses to a hamburger menu on mobile).
- SEO: per-page `<title>`/meta description/canonical URL/Open Graph tags via `react-helmet-async` (`frontend/src/utils/seo.js` builds these from the real browser URL, so they're correct on localhost, a Vercel preview, or your final domain with zero code changes), semantic headings, `alt` text on images, mobile-responsive meta viewport, `robots.txt`, and `sitemap.xml`. **Update the placeholder domain** (`https://pmv-properties.vercel.app`) in `frontend/public/robots.txt` and `frontend/public/sitemap.xml` once you know your real production URL — these two files can't detect it automatically the way the in-app tags do.

**My own additions/decisions you should know about**
- **Logo & theme:** the full "PMV Properties" wordmark (transparent WebP: `src/assets/logo.webp` large, `logo-sm.webp` small) is used on Splash, Home header, and Admin Login/sidebar. The favicon / home-screen icons (`frontend/public/favicon-*.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`) use the compact "P house" mark instead — cropped tight and flattened onto a plain white background so it reads clearly at 16–32px; the earlier version of these files had a stray black background that showed as a black square favicon in some browsers. To change either logo again, replace those files at the same filenames. The whole app uses the logo's colours: **green** (`brand` in `tailwind.config.js`) for headers, main buttons, active states and prices; **red** (`accent`) for badges and the "Post Your Property" button.
- **Category icons (Home page "What are you looking for?")** and the **bottom nav icons** (Home / Properties / Post Property / Enquiry / Admin) are now real full-colour artwork (`frontend/src/assets/icons/*.png` and `frontend/src/assets/icons/nav/*.png`) instead of single-colour icon-font glyphs, sized responsively with plain `<img>` tags rather than a fixed pixel size, so they scale cleanly from small phones up to desktop.
- **Home banners are advertisements only** (offers, discounts, announcements) — not property photos. Edit `frontend/src/data/banners.js` and drop images in `frontend/src/assets/banners/`. They are bundled with the app, so they load the same locally and live.
- **Call / WhatsApp:** a sticky bar at the bottom of every Property Details page, plus a small WhatsApp icon in the Home header. Taps are counted per property (Admin → Properties → "Call / WhatsApp taps"), so you can see interest even when a customer doesn't fill a form.
- "Post your Property" and "I need a Property" don't let a customer self-publish a listing (that would let anyone add fake data) — they submit a lead which lands in **Admin → Enquiries**, and admin turns it into a real listing after verifying it. This matches "admin only intermediary" from your notes.
- Every Call/WhatsApp tap deep-links to `tel:` / `wa.me` with the admin number pre-filled with the property name in the WhatsApp message, so the admin instantly knows which property the enquiry is about.
- Basic security included: rate limiting, Mongo injection sanitization, Helmet headers, JWT-protected admin routes, bcrypt password hashing — reasonable defaults for a public real-estate site.

**Scope note (please read)**
This is a complete, working MVP you can run today and extend — not a pixel-for-pixel trace of all 36 mockup frames. The customer flow (all 6 categories × listing × details), the full CRUD Admin Panel, image handling, and the Call/WhatsApp-to-admin rule are all implemented end-to-end. Visual polish (micro-animations, exact spacing/icons per screen, category-specific filters beyond the ones included) is easy to refine from here — happy to keep iterating on any specific screen if you tell me which one to prioritize.
