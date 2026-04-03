export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { campaignId, path, startDate, endDate } = req.query;
  if (!campaignId && !path) return res.status(400).json({ error: "campaignId or path is required" });

  const APP_KEY = process.env.PARTNERIZE_APP_KEY;
  const USER_KEY = process.env.PARTNERIZE_USER_KEY;

  if (!APP_KEY || !USER_KEY) {
    return res.status(500).json({ error: "API keys not configured on server" });
  }

  // Use credentials in URL exactly like the working Python tool
  const base = `https://${APP_KEY}:${USER_KEY}@api.partnerize.com`;

  let endpoint;
  if (path) {
    endpoint = `${base}/${path}`;
  } else {
    const start = startDate || "2025-01-01 00:00:00";
    const end = endDate || "2026-12-31 23:59:59";
    endpoint = `${base}/reporting/report_advertiser/campaign/${campaignId}/conversion.json?start_date=${encodeURIComponent(start)}&end_date=${encodeURIComponent(end)}&limit=300`;
  }

  try {
    const response = await fetch(endpoint, {
      headers: { "Accept": "application/json" }
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
