// Sends an instant notification to the admin whenever a customer submits
// "Post your Property", "I need a Property", or enquires about a specific
// property — so you can open WhatsApp/call them back right away.
//
// Two channels, both OPTIONAL (each is skipped silently if not configured
// in .env), and both run in parallel and never throw — a notification
// failure must never block or fail the customer's enquiry submission:
//
//   1. Telegram — a free instant push notification straight to your phone.
//   2. Email    — a fallback that lands in your Gmail inbox / phone.
//
// See backend/README.md for how to get a TELEGRAM_BOT_TOKEN + CHAT_ID
// (takes about 2 minutes, completely free).

const nodemailer = require('nodemailer');

let cachedTransporter;
function getTransporter() {
  if (cachedTransporter !== undefined) return cachedTransporter;
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    cachedTransporter = null;
    return cachedTransporter;
  }
  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return cachedTransporter;
}

const TYPE_LABELS = {
  'post-property': 'Post your Property',
  'need-property': 'I need a Property',
  'property-enquiry': 'Property Enquiry',
};

function typeLabel(type) {
  return TYPE_LABELS[type] || type;
}

// Builds an India-friendly wa.me link (adds 91 prefix for bare 10-digit numbers)
function whatsappLink(phone) {
  const digits = String(phone || '').replace(/[^\d]/g, '');
  const withCountryCode = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCountryCode}`;
}

function buildMessage(enquiry) {
  const lines = [`New enquiry — ${typeLabel(enquiry.type)}`, '', `Name: ${enquiry.name}`, `Phone: ${enquiry.phone}`];
  if (enquiry.email) lines.push(`Email: ${enquiry.email}`);
  if (enquiry.property?.title) lines.push(`Property: ${enquiry.property.title}`);
  if (enquiry.message) lines.push(`Message: ${enquiry.message}`);
  lines.push('', `WhatsApp: ${whatsappLink(enquiry.phone)}`, `Call: tel:${enquiry.phone}`);
  return lines.join('\n');
}

async function sendTelegram(enquiry) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `🔔 ${buildMessage(enquiry)}`,
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) console.error('[notify] Telegram API responded', res.status, await res.text());
  } catch (err) {
    console.error('[notify] Telegram send failed:', err.message);
  }
}

async function sendEmail(enquiry) {
  const to = process.env.NOTIFY_EMAIL_TO || process.env.ADMIN_EMAIL;
  const transporter = getTransporter();
  if (!transporter || !to) return;
  try {
    await transporter.sendMail({
      from: `"PMV Properties" <${process.env.SMTP_USER}>`,
      to,
      subject: `New enquiry — ${typeLabel(enquiry.type)} — ${enquiry.name}`,
      text: buildMessage(enquiry),
    });
  } catch (err) {
    console.error('[notify] Email send failed:', err.message);
  }
}

// Fire both channels in parallel. Deliberately never rejects.
async function notifyAdmin(enquiry) {
  await Promise.allSettled([sendTelegram(enquiry), sendEmail(enquiry)]);
}

module.exports = notifyAdmin;
