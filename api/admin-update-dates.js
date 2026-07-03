const { getFile, putFile } = require('./_github');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { password, action, date } = req.body || {};

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Parolă incorectă.' });
    return;
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: 'Dată invalidă.' });
    return;
  }
  if (action !== 'add' && action !== 'remove') {
    res.status(400).json({ error: 'Acțiune invalidă.' });
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const filePath = 'data/closed-dates.json';

  if (!token || !repo) {
    res.status(500).json({ error: 'Configurare lipsă pe server.' });
    return;
  }

  try {
    const { content, sha } = await getFile(repo, token, filePath);
    let dates = Array.isArray(content.dates) ? content.dates : [];
    if (action === 'add' && !dates.includes(date)) dates.push(date);
    if (action === 'remove') dates = dates.filter((d) => d !== date);
    dates.sort();

    await putFile(repo, token, filePath, { dates }, sha, `Actualizare zile nelucrătoare (${action} ${date})`);

    res.status(200).json({ ok: true, dates });
  } catch (err) {
    res.status(502).json({ error: err.message || 'Nu am putut salva modificarea.' });
  }
};
