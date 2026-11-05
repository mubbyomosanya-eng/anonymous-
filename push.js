export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const APP_ID = process.env.ONESIGNAL_APP_ID;
  const REST_KEY = process.env.ONESIGNAL_REST_KEY;

  if (!APP_ID || !REST_KEY) {
    res.status(500).json({ error: 'Server not configured' });
    return;
  }

  const { senderName, text, room } = req.body || {};
  if (typeof senderName !== 'string' || typeof text !== 'string') {
    res.status(400).json({ error: 'Invalid body' });
    return;
  }

  const preview = text.length > 160 ? text.slice(0, 160) + '…' : text;
  const roomLabel = room === 'dm' ? 'Private message' : '/public';

  try {
    const r = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${REST_KEY}`,
      },
      body: JSON.stringify({
        app_id: APP_ID,
        included_segments: ['Subscribed Users'],
        headings: { en: `${senderName} · ${roomLabel}` },
        contents: { en: preview },
        chrome_web_icon: 'https://anonymous-sigma-pearl.vercel.app/icon-192.png',
        url: 'https://anonymous-sigma-pearl.vercel.app/',
      }),
    });
    const data = await r.json();
    res.status(200).json({ ok: r.ok, id: data.id || null });
  } catch (e) {
    res.status(500).json({ error: 'Push failed' });
  }
}