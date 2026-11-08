export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const APP_ID = process.env.ONESIGNAL_APP_ID;
  const REST_KEY = process.env.ONESIGNAL_REST_KEY;
  const { senderName, text, room } = req.body || {};

  if (!APP_ID || !REST_KEY || !text) return res.status(400).json({ error: 'Missing data' });

  try {
    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${REST_KEY}`, // The secret is safe here on Vercel
      },
      body: JSON.stringify({
        app_id: APP_ID,
        included_segments: ['Subscribed Users'],
        headings: { en: `${senderName} · ${room}` },
        contents: { en: text },
      }),
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Push failed' });
  }
}