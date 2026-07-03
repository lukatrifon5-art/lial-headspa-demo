const { getFile, putFile } = require('./_github');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { password, date, time } = req.body || {};

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Parolă incorectă.' });
    return;
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !time || !/^\d{2}:\d{2}$/.test(time)) {
    res.status(400).json({ error: 'Date invalide.' });
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) {
    res.status(500).json({ error: 'Configurare lipsă pe server.' });
    return;
  }

  try {
    const { content, sha } = await getFile(repo, token, 'data/bookings.json');
    const bookings = Array.isArray(content.bookings) ? content.bookings : [];
    const next = bookings.filter((b) => !(b.date === date && b.time === time));
    if (next.length === bookings.length) {
      res.status(404).json({ error: 'Rezervarea nu a fost găsită (poate a fost deja ștearsă).' });
      return;
    }
    await putFile(repo, token, 'data/bookings.json', { bookings: next }, sha, `Anulare rezervare: ${date} ${time}`);
    res.status(200).json({ ok: true, bookings: next });
  } catch (err) {
    res.status(502).json({ error: err.message || 'Nu am putut anula rezervarea.' });
  }
};
