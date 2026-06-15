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

## Summary

- A React/Vite app where an agent enters a label's application data (Brand Name, Class/Type, Alcohol Content, Net Contents) and uploads a photo. The photo is sent to Claude for text extraction, then compared field-by-field against the application data, plus a strict check of the Government Warning statement (wording, caps, bold). Results are shown as a stamp (Verified / Needs Review / Rejected) with a per-field breakdown. A batch mode runs this for multiple labels at once.

**Tools used**

- React + Vite, plain CSS
- Anthropic API (`claude-sonnet-4-6`) via a serverless function (`api/analyze.js`)
- Deployed to Vercel

**Assumptions**

- Standalone prototype, not integrated with COLA or case management systems
- No data is stored or logged; everything is per-session
- Only the four core fields plus the Government Warning are checked; other label elements are out of scope


