const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'data', 'closed-dates.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.status(200).json({ dates: Array.isArray(data.dates) ? data.dates : [] });
  } catch (err) {
    res.status(200).json({ dates: [] });
  }
};
