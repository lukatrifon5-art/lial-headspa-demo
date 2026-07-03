const { getFile } = require('./_github');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { password } = req.body || {};
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Parolă incorectă.' });
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) {
    res.status(500).json({ error: 'Configurare lipsă pe server.' });
    return;
  }

  try {
    const { content } = await getFile(repo, token, 'data/bookings.json');
    res.status(200).json({ bookings: Array.isArray(content.bookings) ? content.bookings : [] });
  } catch (err) {
    res.status(502).json({ error: 'Nu am putut încărca rezervările.' });
  }
};
