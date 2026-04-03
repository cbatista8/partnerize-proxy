export default async function handler(req, res) {
  // Allow requests from any origin (CORS fix)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { campaignId } = req.query;
  if (!campaignId) return res.status(400).json({ error: "campaignId is required" });

  const APP_KEY = process.env.PARTNERIZE_APP_KEY;
  const USER_KEY = process.env.PARTNERIZE_USER_KEY;

  if (!APP_KEY || !USER_KEY) {
    return res.status(500).json({ error: "API keys not configured on server" });
  }

  try {
    const url = `https://api.partnerize.com/v2/brand/campaigns/${campaignId}/partners?limit=300`;
    const response = await fetch(url, {
      headers: {
        "Authorization": "Basic " + Buffer.from(`${APP_KEY}:${USER_KEY}`).toString("base64"),
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
