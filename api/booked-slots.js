const { getFile } = require('./_github');

module.exports = async (req, res) => {
  const { date } = req.query || {};
  if (!date) {
    res.status(200).json({ times: [] });
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  if (!token || !repo) {
    res.status(200).json({ times: [] });
    return;
  }

  try {
    const { content } = await getFile(repo, token, 'data/bookings.json');
    const bookings = Array.isArray(content.bookings) ? content.bookings : [];
    const times = bookings.filter((b) => b.date === date).map((b) => b.time);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ times });
  } catch (err) {
    res.status(200).json({ times: [] });
  }
};
