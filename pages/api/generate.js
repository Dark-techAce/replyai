export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { review, stars, profile } = req.body;

  if (!review || !stars) {
    return res.status(400).json({ error: "Missing review or stars" });
  }

  const biz  = profile?.name?.trim() || "our business";
  const type = profile?.type  || "Restaurant";
  const tone = profile?.tone  || "Friendly & Warm";

  const prompt = `You are an expert review response writer. Generate 3 personalized reply variations for this business review.

Business:
- Name: ${biz}
- Type: ${type}
- Tone: ${tone}

Review received:
- Stars: ${stars}/5
- Text: "${review}"

Rules:
- Detect sentiment accurately
- NEVER use filler like "We appreciate your feedback" or "Thank you for taking the time"
- Sound genuinely human, warm, and specific to what the reviewer mentioned
- Reference specific details from the review when possible
- ${stars <= 2 ? "For this negative review: sincerely acknowledge the issue, apologize, offer a real solution, invite them to contact you" : "For this positive review: express real gratitude, echo what they loved, invite them back"}
- Each reply must reflect the ${tone} tone

Return ONLY valid JSON, no markdown, no extra text:
{
  "sentiment": "positive|negative|mixed|neutral",
  "sentimentLabel": "short mood phrase",
  "variations": [
    {"label":"Short",    "reply":"1-2 sentences, punchy and warm"},
    {"label":"Medium",   "reply":"3-4 sentences, balanced and personal"},
    {"label":"Detailed", "reply":"5-6 sentences, thorough and empathetic"}
  ]
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data  = await response.json();
    const raw   = data.content?.[0]?.text || "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate replies" });
  }
}
