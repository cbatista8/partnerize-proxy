export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { campaignId, path } = req.query;
  if (!campaignId && !path) return res.status(400).json({ error: "campaignId or path is required" });

  const APP_KEY = process.env.PARTNERIZE_APP_KEY;
  const USER_KEY = process.env.PARTNERIZE_USER_KEY;

  if (!APP_KEY || !USER_KEY) {
    return res.status(500).json({ error: "API keys not configured on server" });
  }

  const base = "https://api.partnerize.com";
  const endpoint = path
    ? `${base}/${path}`
    : `${base}/reporting/report_advertiser/campaign/${campaignId}/publisher.json?limit=300`;

  const credentials = Buffer.from(`${APP_KEY}:${USER_KEY}`).toString("base64");

  try {
    const response = await fetch(endpoint, {
      headers: {
        "Authorization": `Basic ${credentials}`,
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
