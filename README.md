# TTB Label Verification Prototype

An AI-assisted tool that checks a photo of an alcohol beverage label against
the data submitted on a label application.

## What it does

For each label, the agent enters the four core fields from the application
(Brand Name, Class/Type, Alcohol Content, Net Contents), uploads a photo of
the label, and selects **Verify label**. The app sends the image to Claude
for extraction, then compares what's on the label to what's on the
application and shows:

- A large **stamp** — VERIFIED, NEEDS REVIEW, or REJECTED — for an
  at-a-glance result.
- A side-by-side comparison of each field ("on application" vs. "on label")
  with a pass / review / fail status and a plain-language note.
- A dedicated check for the **Government Warning Statement**, including the
  exact wording, all-caps heading, and bold formatting required by 27 CFR
  16.21.
- A flag when the photo itself looks blurry, glared, or skewed enough that
  results may be unreliable.

A **Batch upload** mode lets an agent stack up multiple labels (each with its
own fields and photo) and run them all with one **Verify all** click, with a
summary list at the top showing each label's result.

## How the comparison logic works

- **Brand Name / Class & Type** — exact match passes. A match that's
  identical except for capitalization (e.g. "STONE'S THROW" vs. "Stone's
  Throw") is flagged **Needs Review** rather than auto-rejected. Anything
  else is a **Fail**.
- **Alcohol Content** — the numeric percentage is compared with a small
  tolerance for rounding.
- **Net Contents** — compared after normalizing spacing and case (so
  "750 mL" and "750ml" are treated the same), but otherwise must match
  exactly.
- **Government Warning** — the strictest check. The transcribed text must
  match the required statement word-for-word, "GOVERNMENT WARNING:" must be
  in all capital letters, and it must be bold. Any deviation is a **Fail**,
  with no partial credit.
- Any field left blank on the application is marked **Not checked** rather
  than counted against the label.
- If the model flags the photo as hard to read (blur, glare, angle), that's
  surfaced as a callout.

Overall verdict: **Rejected** if any check fails, **Needs Review** if nothing
fails but something needs a human look (including image-quality flags),
otherwise **Verified**.

## Tech stack & architecture

- **React + Vite**, plain CSS (no Tailwind build step).
- **Anthropic API** (`claude-sonnet-4-6`) for label extraction, called from a
  small serverless function (`api/analyze.js`) so the API key never reaches
  the browser.
- All matching/scoring logic runs client-side in `src/App.jsx`.

```
ttb-label-verifier/
├── api/
│   └── analyze.js     ← serverless function, holds the API key
├── src/
│   ├── App.jsx         ← UI + comparison logic
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── .env.example
```

## Assumptions & scope

- Standalone prototype, not integrated with COLA or any case management
  system.
- **No data is stored.** Everything happens client-side for a single
  session; the serverless function only relays the image to the model and
  returns the result — nothing is written to a database or log.
- Only the four fields called out (Brand Name, Class/Type, Alcohol Content,
  Net Contents) plus the Government Warning are checked. Other label
  elements (bottler address, country of origin, beer/wine net-contents
  exemptions, etc.) are out of scope.
- CSV-based batch import is a likely next step, not part of this prototype —
  the current batch mode covers "many labels at once" via the UI directly.

## Trade-offs & limitations

- Extraction quality depends on the underlying vision model and the photo
  itself — outputs are an aid to the agent's review, not a final
  determination.
- Latency depends on the model provider and network conditions; the
  single-call-per-label design is the main lever for keeping this fast.
- No authentication, audit trail, or write-back to any system of record.

---

## Running it locally

```bash
npm install
npm run dev
```

`npm run dev` serves the front end, but `/api/analyze` won't work without a
function runtime. For full local testing (front end + serverless function
together), use the Vercel CLI instead:

```bash
npm install -g vercel
vercel dev
```

Either way, create a `.env` file (copy `.env.example`) with your own
`ANTHROPIC_API_KEY` for local testing.

## Deploying to Vercel (get a shareable URL)

1. Push this project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com), sign in, and click **Add New →
   Project**, then import that repository. Vercel auto-detects the Vite
   framework and the `api/` folder.
3. Before deploying, add an environment variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your Anthropic API key
4. Click **Deploy**. Vercel will give you a URL like
   `https://your-project-name.vercel.app` — that's the link to share.

Any time you push a new commit, Vercel redeploys automatically.

## Deploying to Netlify (alternative)

Netlify works the same way, with two differences:
- Move `api/analyze.js` to `netlify/functions/analyze.js` and add a redirect
  in `netlify.toml`:
  ```toml
  [[redirects]]
    from = "/api/analyze"
    to = "/.netlify/functions/analyze"
    status = 200
  ```
- Set `ANTHROPIC_API_KEY` under **Site settings → Environment variables**.

## Notes on the API key

Never commit a real API key to the repository or put it in front-end code —
that would expose it to anyone who opens the site. The serverless function in
`api/analyze.js` is what keeps it private; the browser only ever talks to
your own `/api/analyze` endpoint.
