async function getFile(repo, token, filePath) {
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error('Nu am putut citi fișierul din GitHub.');
  const data = await res.json();
  const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
  return { content, sha: data.sha };
}

async function putFile(repo, token, filePath, content, sha, message) {
  const body = Buffer.from(JSON.stringify(content, null, 2) + '\n').toString('base64');
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    body: JSON.stringify({ message, content: body, sha }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Eroare la salvare în GitHub.');
  }
  return res.json();
}

module.exports = { getFile, putFile };
