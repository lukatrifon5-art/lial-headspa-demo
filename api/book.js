const fs = require('fs');
const path = require('path');
const { getFile, putFile } = require('./_github');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, phone, service, date, time, message } = req.body || {};

  const NAME_RE = /^[A-Za-zĂÂÎȘȚăâîșțŞŢşţ]{2,}(\s+[A-Za-zĂÂÎȘȚăâîșțŞŢşţ]{2,})+$/;
  const PHONE_RE = /^\+373[0-9]{8}$/;
  const TIME_RE = /^\d{2}:\d{2}$/;

  if (!name || !NAME_RE.test(String(name).trim())) {
    res.status(400).json({ error: 'Introdu numele și prenumele complet.' });
    return;
  }
  const cleanPhone = String(phone || '').replace(/[\s()-]/g, '');
  if (!PHONE_RE.test(cleanPhone)) {
    res.status(400).json({ error: 'Numărul de telefon nu este valid.' });
    return;
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    res.status(400).json({ error: 'Alege o dată pentru rezervare.' });
    return;
  }
  if (!time || !TIME_RE.test(String(time))) {
    res.status(400).json({ error: 'Alege o oră pentru rezervare.' });
    return;
  }
  // Compute "today" in Moldova's timezone explicitly — the server may run in a
  // different region than the client, so neither UTC nor the server's local
  // time is guaranteed to match the calendar date a Chișinău visitor expects.
  const todayISO = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Chisinau' }).format(new Date());
  if (String(date) < todayISO) {
    res.status(400).json({ error: 'Data preferată nu poate fi în trecut.' });
    return;
  }
  try {
    const closedPath = path.join(process.cwd(), 'data', 'closed-dates.json');
    const closed = JSON.parse(fs.readFileSync(closedPath, 'utf-8')).dates || [];
    if (closed.includes(String(date))) {
      res.status(400).json({ error: 'Această zi este nelucrătoare. Te rugăm să alegi altă dată.' });
      return;
    }
  } catch (err) {
    // If the file can't be read, don't block a legitimate booking over it
  }

  const ghToken = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  if (!ghToken || !repo) {
    res.status(500).json({ error: 'Configurare lipsă pe server.' });
    return;
  }

  // Reserve the exact date+time slot, reading live from GitHub (not the bundled
  // snapshot) so two near-simultaneous bookings can't both slip through. If a
  // concurrent booking landed first, the sha check on save fails and we retry.
  let attempt = 0;
  let reserved = false;
  while (attempt < 3 && !reserved) {
    attempt++;
    try {
      const { content, sha } = await getFile(repo, ghToken, 'data/bookings.json');
      const bookings = Array.isArray(content.bookings) ? content.bookings : [];
      const taken = bookings.some((b) => b.date === date && b.time === time);
      if (taken) {
        res.status(409).json({ error: 'Acest interval orar este deja rezervat. Te rugăm să alegi altă oră.' });
        return;
      }
      bookings.push({ date, time, name, phone, service: service || '', message: message || '' });
      await putFile(repo, ghToken, 'data/bookings.json', { bookings }, sha, `Rezervare nouă: ${date} ${time}`);
      reserved = true;
    } catch (err) {
      console.error('booking reservation attempt failed:', err.message);
      if (attempt >= 3) {
        res.status(502).json({ error: 'Nu am putut verifica disponibilitatea. Încearcă din nou.' });
        return;
      }
      await new Promise((r) => setTimeout(r, 150 * attempt));
    }
  }

  // Telegram notifications aren't configured yet — best-effort only, never
  // blocks or fails the booking itself once it's safely persisted above.
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHAT_ID;
  if (tgToken && tgChatId) {
    const text = [
      '💆 Cerere nouă de rezervare — Lia L Head Spa',
      '',
      `Nume: ${name}`,
      `Telefon: ${phone}`,
      service ? `Pachet: ${service}` : null,
      `Data: ${date}`,
      `Ora: ${time}`,
      message ? `Mesaj: ${message}` : null,
    ].filter(Boolean).join('\n');
    try {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tgChatId, text }),
      });
    } catch (err) {
      // Notification failure shouldn't fail a booking that's already saved.
    }
  }

  res.status(200).json({ ok: true });
};
