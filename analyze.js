// Vercel serverless function: POST /api/analyze
// Receives a label photo (base64) from the browser, sends it to Claude for
// extraction, and returns the raw Messages API response. The Anthropic API
// key stays server-side and is never exposed to the browser.

const EXTRACTION_PROMPT = `You are assisting a TTB compliance agent reviewing an alcohol beverage label image.

Read the label in the image carefully and extract the fields listed below exactly as printed on the label. If a field is not visible or not present, return an empty string for it. Do not guess values that are not legible.

Return ONLY a single JSON object with this exact shape — no markdown, no code fences, no extra commentary:

{
  "brand_name": "",
  "class_type": "",
  "alcohol_content": "",
  "net_contents": "",
  "government_warning_text": "",
  "government_warning_all_caps": false,
  "government_warning_bold": false,
  "image_quality_issue": false,
  "image_quality_notes": ""
}

Field guidance:
- brand_name: the brand or product name, preserving capitalization exactly as printed.
- class_type: the class/type designation (e.g. "Kentucky Straight Bourbon Whiskey"), preserving capitalization exactly as printed.
- alcohol_content: the alcohol content statement as printed (e.g. "45% Alc./Vol. (90 Proof)").
- net_contents: the net contents statement as printed (e.g. "750 mL").
- government_warning_text: transcribe the full government health warning statement verbatim, including punctuation and capitalization, exactly as printed. If it is not present, return an empty string.
- government_warning_all_caps: true only if the heading "GOVERNMENT WARNING:" appears in all capital letters.
- government_warning_bold: true only if the heading "GOVERNMENT WARNING:" is visually bolder/heavier than the surrounding warning text.
- image_quality_issue: true if blur, glare, low resolution, extreme angle, or anything else makes any of the above fields hard to read with confidence.
- image_quality_notes: one short sentence describing the issue, or an empty string if there is none.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { imageBase64, mediaType } = req.body || {};
  if (!imageBase64 || !mediaType) {
    res.status(400).json({ error: 'Request must include imageBase64 and mediaType' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY. Set it in your deployment environment variables.' });
    return;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
              { type: 'text', text: EXTRACTION_PROMPT },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: `Anthropic API error: ${errText}` });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unexpected server error' });
  }
}
