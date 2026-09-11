// POST /api/send  { "sellsy_id": "12345678" }
// Relaie vers le webhook Make stocké dans la variable Vercel `webhook_make`.
// L'URL ne quitte jamais le serveur.

const WEBHOOK_URL = process.env.webhook_make || process.env.WEBHOOK_MAKE;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  if (!WEBHOOK_URL) {
    return res.status(500).json({
      error: "La variable d'environnement webhook_make n'est pas définie sur ce déploiement.",
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Corps de requête illisible.' });
    }
  }

  const sellsyId = String(body?.sellsy_id ?? '').trim();
  if (!/^\d+$/.test(sellsyId)) {
    return res.status(400).json({ error: "ID Sellsy invalide." });
  }

  try {
    const upstream = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellsy_id: Number(sellsyId), sentAt: new Date().toISOString() }),
    });

    const text = (await upstream.text()).slice(0, 300);

    if (!upstream.ok) {
      return res.status(502).json({
        error: `Make a répondu ${upstream.status}.`,
        detail: text,
      });
    }

    return res.status(200).json({ ok: true, sellsy_id: sellsyId, makeResponse: text });
  } catch (err) {
    return res.status(502).json({ error: `Appel du webhook impossible : ${err.message}` });
  }
}
