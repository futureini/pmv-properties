# PMV Properties — Backend (Node + Express + MongoDB)

## Local setup
```bash
cd backend
npm install
cp .env.example .env      # then fill in MONGO_URI, JWT_SECRET, ADMIN_EMAIL/PASSWORD
npm run dev                # http://localhost:5000
```
The admin login is created/fixed **automatically every time the server starts** (see `utils/ensureAdmin.js`) — it always matches whatever `ADMIN_EMAIL` / `ADMIN_PASSWORD` you have set in `.env`. There's nothing to run manually.

Forgot the password or can't log in? Just change `ADMIN_PASSWORD` in `.env` and restart the server (`npm run dev` / redeploy on the live server) — it will reset the account to match on the next boot. `npm run seed:admin` / `npm run reset:admin` still exist if you ever want to do it without restarting the server.

## Deploying (Render + MongoDB Atlas)
1. Create a free MongoDB Atlas cluster, allow network access from anywhere (0.0.0.0/0) or Render's IPs, and copy the connection string into `MONGO_URI`. **This step is the #1 cause of "invalid email or password" on a live server** — if Atlas can't be reached, the admin account never gets created and every login fails.
2. Push this `backend/` folder to GitHub.
3. On Render: New → Web Service → connect the repo → Root Directory `backend` → Build Command `npm install` → Start Command `npm start`.
4. Add all variables from `.env.example` in Render's Environment tab (use your real values). Set `CLIENT_ORIGINS` to your Vercel frontend URL.
5. Nothing else to do — the admin account is created/reset automatically on boot (step 1). Check the Render logs for `[ensureAdmin] Created admin login for ...` to confirm it worked.
6. **Images**: Render's disk is wiped on every deploy, so for production set the `CLOUDINARY_*` variables (free tier is enough). Without them the API still works and stores images under `/uploads`, but they will be lost on redeploy — fine for local/dev only.

## Instant admin notifications (Telegram + email)

Whenever a customer submits **Post your Property**, **I need a Property**, or enquires about a specific property, the admin gets notified immediately so they can call/WhatsApp the customer back right away. Two channels, both optional and independent — set up either or both.

### Telegram (recommended — real push notification to your phone, free)
1. In Telegram, message **[@BotFather](https://t.me/BotFather)** → send `/newbot` → give it a name → BotFather replies with a **bot token** like `123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`. Put that in `TELEGRAM_BOT_TOKEN`.
2. Message your new bot anything (e.g. "hi") so it knows about you — a bot can't message you first.
3. Open this URL in your browser (replace `<TOKEN>`): `https://api.telegram.org/bot<TOKEN>/getUpdates` — find `"chat":{"id":123456789,...}` in the response and put that number in `TELEGRAM_CHAT_ID`.
4. Restart the backend. New enquiries now arrive as Telegram push notifications, complete with a `wa.me` link to open WhatsApp with that customer directly.

### Email (fallback)
1. In your Gmail account, go to **Google Account → Security → 2-Step Verification → App passwords**, create one for "Mail", and copy the 16-character password (not your normal Gmail password).
2. Set `SMTP_USER` to your Gmail address and `SMTP_PASS` to that app password. Set `NOTIFY_EMAIL_TO` to whichever inbox should receive them (you'll get it on your phone via the Gmail app).
3. Restart the backend.

Both channels are skipped silently if not configured — the enquiry form always works either way, and a failed notification never blocks the customer's submission.

## API summary
- `POST /api/auth/login` — admin login → `{ token }`
- `GET  /api/properties` — public list, filters: `category, propertyType, listingType, q, minPrice, maxPrice, location, page, limit`
- `GET  /api/properties/featured` — home page featured rail
- `GET  /api/properties/:id` — public details (owner phone never included)
- `POST /api/properties` *(admin)* — multipart form, field `images` (max 5)
- `PUT  /api/properties/:id` *(admin)*
- `DELETE /api/properties/:id` *(admin)*
- `GET  /api/properties/admin/all` / `/admin/stats` / `/admin/:id` *(admin)*
- `POST /api/enquiries` — property enquiries, "Post your Property", "I need a Property"
- `GET/PUT/DELETE /api/enquiries` *(admin)*

`category` values: `buy-sale`, `rent`, `land-plot`, `flat`, `shop-commercial`, `lease`
