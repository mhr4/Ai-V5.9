// Vercel Serverless Function: POST /api/analyze  body: { prompt }  ->  { text }
// Key is read from the Vercel environment variable GEMINI_API_KEY (never sent to the browser).
// Optional: GEMINI_MODEL (default below). Prompt content is NOT logged.

const DEFAULT_MODEL = "gemini-2.5-flash";
const MAX_PROMPT_CHARS = 6000;
const TIMEOUT_MS = 25000;

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "کلید GEMINI_API_KEY در Vercel تنظیم نشده است." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }
  const prompt = body && typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return res.status(400).json({ error: "prompt خالی است." });
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return res.status(413).json({ error: "متن درخواست بیش از حد طولانی است." });
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent";

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      const msg = (data && data.error && data.error.message) || "خطا از سرویس هوش مصنوعی";
      const status = upstream.status === 429 ? 429 : 502;
      return res.status(status).json({
        error: status === 429 ? "سهمیه رایگان امروز تمام شده است. بعداً امتحان کن." : "سرویس هوش مصنوعی خطا داد: " + msg,
      });
    }

    const parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
    const text = parts.map((p) => p.text || "").join("").trim();
    if (!text) {
      return res.status(502).json({ error: "پاسخ خالی از سرویس هوش مصنوعی دریافت شد." });
    }
    return res.status(200).json({ text });
  } catch (err) {
    const timeout = err && (err.name === "TimeoutError" || err.name === "AbortError");
    return res.status(504).json({ error: timeout ? "پاسخ سرویس دیر رسید. دوباره امتحان کن." : "ارتباط با سرویس هوش مصنوعی برقرار نشد." });
  }
};
