import { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  MinusCircle,
  Image as ImageIcon,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

// 27 CFR 16.21 — the mandatory Alcoholic Beverage Health Warning Statement.
const GOVERNMENT_WARNING_TEXT =
  'GOVERNMENT WARNING: (1) According to the Surgeon General, women should not ' +
  'drink alcoholic beverages during pregnancy because of the risk of birth ' +
  'defects. (2) Consumption of alcoholic beverages impairs your ability to ' +
  'drive a car or operate machinery, and may cause health problems.';

// ---------------------------------------------------------------------------
// Visual design tokens (plain CSS — no Tailwind build step needed)
// ---------------------------------------------------------------------------

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

:root {
  --paper: #FBF7EF;
  --navy: #1E3A52;
  --navy-dark: #142A3C;
  --gold: #C19A49;
  --gold-soft: #F6EFDD;
  --ink: #2B2620;
  --muted: #8A7F6E;
  --muted-2: #6B6253;
  --border: #E5DCC9;
  --border-strong: #C9BCA4;
  --success: #2F6F4E;
  --success-soft: #E7F0EA;
  --warning: #B8762B;
  --warning-soft: #FBF0DC;
  --warning-border: #EBD9B4;
  --danger: #A8423D;
  --danger-soft: #F7E9E7;
}

* { box-sizing: border-box; }
html, body, #root { margin: 0; padding: 0; }

.ttb-app { font-family: 'IBM Plex Sans', system-ui, sans-serif; background: var(--paper); color: var(--ink); }
.font-display { font-family: 'Fraunces', Georgia, serif; }
.font-data { font-family: 'IBM Plex Mono', 'Courier New', monospace; }

.bg-paper { background-color: var(--paper); }
.bg-navy { background-color: var(--navy); }
.bg-gold-soft { background-color: var(--gold-soft); }
.bg-white-card { background-color: #ffffff; }
.text-navy { color: var(--navy); }
.text-gold { color: var(--gold); }
.text-ink { color: var(--ink); }
.text-muted { color: var(--muted); }
.text-muted-2 { color: var(--muted-2); }
.text-success { color: var(--success); }
.text-warning { color: var(--warning); }
.text-danger { color: var(--danger); }
.border-warm { border-color: var(--border); }
.border-warm-strong { border-color: var(--border-strong); }
.border-gold { border-color: var(--gold); }

.card { background: #fff; border: 1px solid var(--border); border-radius: 0.75rem; overflow: hidden; }
.card-head { background: var(--gold-soft); border-bottom: 1px solid var(--border); }

.field-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-strong);
  background: #fff;
  color: var(--ink);
  font-size: 0.9rem;
}
.field-input:focus-visible {
  outline: 2px solid var(--navy);
  outline-offset: 1px;
  border-color: var(--navy);
}
.field-label {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 0.3rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.6rem 1.25rem;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.btn:focus-visible { outline: 2px solid var(--navy); outline-offset: 2px; }
.btn-primary { background: var(--navy); color: var(--paper); }
.btn-primary:hover:not(:disabled) { background: var(--navy-dark); }
.btn-primary:disabled { background: var(--border); color: var(--muted); cursor: not-allowed; }
.btn-secondary { background: #fff; color: var(--navy); border-color: var(--border-strong); }
.btn-secondary:hover { background: var(--gold-soft); }

.mode-tabs { display: inline-flex; border: 1px solid var(--gold); border-radius: 999px; overflow: hidden; }
.mode-tab {
  padding: 0.45rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gold-soft);
  background: transparent;
  border: none;
  cursor: pointer;
}
.mode-tab.active { background: var(--gold); color: var(--navy-dark); }
.mode-tab:focus-visible { outline: 2px solid var(--gold-soft); outline-offset: 2px; }

.dropzone {
  border: 2px dashed var(--border-strong);
  border-radius: 0.75rem;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--paper);
  padding: 1rem;
  text-align: center;
}
.dropzone .upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--muted);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}
.dropzone .upload-trigger:hover { color: var(--navy); }

.stamp {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 8rem;
  height: 8rem;
  border-radius: 999px;
  border: 4px double currentColor;
  transform: rotate(-8deg);
  flex-shrink: 0;
  animation: stamp-in 0.35s ease-out;
}
@keyframes stamp-in {
  0% { opacity: 0; transform: scale(1.35) rotate(-8deg); }
  60% { opacity: 1; transform: scale(0.95) rotate(-8deg); }
  100% { opacity: 1; transform: scale(1) rotate(-8deg); }
}
.stamp-label {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-align: center;
  line-height: 1.2;
  margin-top: 0.35rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
.badge-success { background: var(--success-soft); color: var(--success); }
.badge-warning { background: var(--warning-soft); color: var(--warning); }
.badge-danger { background: var(--danger-soft); color: var(--danger); }
.badge-neutral { background: var(--border); color: var(--muted-2); }

.callout {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  border: 1px solid var(--warning-border);
  background: var(--warning-soft);
  color: var(--warning);
  border-radius: 0.5rem;
  padding: 0.65rem 0.85rem;
  font-size: 0.85rem;
}

.spin { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (min-width: 640px) {
  .entry-grid { grid-template-columns: 1fr 1fr; }
  .field-grid { grid-template-columns: 1fr 1fr; }
}
`;

// ---------------------------------------------------------------------------
// Comparison helpers
// ---------------------------------------------------------------------------

function normalize(s) {
  return (s || '').toString().trim().replace(/\s+/g, ' ');
}

function extractNumber(s) {
  const m = (s || '').match(/(\d+(\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

// Used for Brand Name and Class/Type — case differences are flagged for
// human review rather than auto-rejected (a formatting-only mismatch like
// "STONE'S THROW" vs "Stone's Throw" still needs a judgment call, not an
// automatic fail).
function compareFuzzy(expected, extracted) {
  const e = normalize(expected);
  const x = normalize(extracted);
  if (!e) return { status: 'skip', note: 'Not entered on application — not checked' };
  if (!x) return { status: 'fail', note: 'Not found on the label' };
  if (e === x) return { status: 'pass', note: 'Exact match' };
  if (e.toLowerCase() === x.toLowerCase()) {
    return { status: 'review', note: 'Same wording, different capitalization — confirm this is intentional' };
  }
  return { status: 'fail', note: 'Does not match the application' };
}

// Alcohol content — compares the leading numeric percentage, allowing a
// small tolerance for rounding between the application and label.
function compareAbv(expected, extracted) {
  const e = normalize(expected);
  const x = normalize(extracted);
  if (!e) return { status: 'skip', note: 'Not entered on application — not checked' };
  if (!x) return { status: 'fail', note: 'Not found on the label' };
  const eNum = extractNumber(e);
  const xNum = extractNumber(x);
  if (eNum === null || xNum === null) {
    return e.toLowerCase() === x.toLowerCase()
      ? { status: 'pass', note: 'Exact match' }
      : { status: 'fail', note: 'Does not match the application' };
  }
  const diff = Math.abs(eNum - xNum);
  if (diff < 0.05) return { status: 'pass', note: 'Matches within rounding' };
  if (diff <= 0.3) return { status: 'review', note: `Off by ${diff.toFixed(2)} percentage points — confirm` };
  return { status: 'fail', note: 'Alcohol content does not match the application' };
}

// Net contents — normalizes spacing/case (e.g. "750 mL" vs "750ml") then
// requires an exact match.
function compareNetContents(expected, extracted) {
  const e = normalize(expected);
  const x = normalize(extracted);
  if (!e) return { status: 'skip', note: 'Not entered on application — not checked' };
  if (!x) return { status: 'fail', note: 'Not found on the label' };
  const ePlain = e.toLowerCase().replace(/\s+/g, '');
  const xPlain = x.toLowerCase().replace(/\s+/g, '');
  if (ePlain === xPlain) return { status: 'pass', note: 'Exact match' };
  return { status: 'fail', note: 'Net contents do not match the application' };
}

// Government warning — must match the federal statement verbatim, with
// "GOVERNMENT WARNING:" in all caps and bold. No partial credit.
function compareWarning(extracted, allCaps, bold) {
  const canonical = normalize(GOVERNMENT_WARNING_TEXT);
  const x = normalize(extracted);
  if (!x) return { status: 'fail', note: 'Government warning statement was not found on the label' };
  if (x !== canonical) {
    if (x.toLowerCase() === canonical.toLowerCase()) {
      return { status: 'fail', note: 'Wording matches, but capitalization differs from the required statement' };
    }
    return { status: 'fail', note: 'Text does not match the required government warning statement' };
  }
  if (!allCaps) return { status: 'fail', note: '"GOVERNMENT WARNING:" must appear in all capital letters' };
  if (!bold) return { status: 'fail', note: '"GOVERNMENT WARNING:" must appear in bold type' };
  return { status: 'pass', note: 'Matches the required statement, including formatting' };
}

function computeVerdict(result) {
  const checks = [result.brandName, result.classType, result.abv, result.netContents, result.warning];
  if (checks.some((c) => c.status === 'fail')) return 'rejected';
  if (checks.some((c) => c.status === 'review') || result.imageQualityIssue) return 'review';
  return 'verified';
}

// ---------------------------------------------------------------------------
// Image + API helpers
// ---------------------------------------------------------------------------

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const match = result.match(/^data:(.*);base64,(.*)$/);
      if (!match) {
        reject(new Error('Unsupported file format'));
        return;
      }
      resolve({ mediaType: match[1], data: match[2], preview: result });
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

// Calls our own backend (api/analyze) which holds the Anthropic API key.
async function analyzeLabelImage(base64, mediaType) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64, mediaType }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Label analysis request failed (${response.status})`);
  }

  const data = await response.json();
  const textBlock = (data.content || []).find((b) => b.type === 'text');
  if (!textBlock) throw new Error('No analysis returned for this label');

  const cleaned = textBlock.text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

async function verifyEntry(entry) {
  const start = performance.now();
  const extracted = await analyzeLabelImage(entry.imageBase64, entry.mediaType);
  const elapsedMs = performance.now() - start;

  const result = {
    elapsedMs,
    imageQualityIssue: !!extracted.image_quality_issue,
    imageQualityNotes: extracted.image_quality_notes || '',
    brandName: {
      expected: entry.brandName,
      extracted: extracted.brand_name || '',
      ...compareFuzzy(entry.brandName, extracted.brand_name),
    },
    classType: {
      expected: entry.classType,
      extracted: extracted.class_type || '',
      ...compareFuzzy(entry.classType, extracted.class_type),
    },
    abv: {
      expected: entry.abv,
      extracted: extracted.alcohol_content || '',
      ...compareAbv(entry.abv, extracted.alcohol_content),
    },
    netContents: {
      expected: entry.netContents,
      extracted: extracted.net_contents || '',
      ...compareNetContents(entry.netContents, extracted.net_contents),
    },
    warning: {
      extracted: extracted.government_warning_text || '',
      allCaps: !!extracted.government_warning_all_caps,
      bold: !!extracted.government_warning_bold,
      ...compareWarning(extracted.government_warning_text, extracted.government_warning_all_caps, extracted.government_warning_bold),
    },
  };

  result.verdict = computeVerdict(result);
  return result;
}

// ---------------------------------------------------------------------------
// Small presentational components
// ---------------------------------------------------------------------------

function StatusIcon({ status }) {
  switch (status) {
    case 'pass':
      return <CheckCircle className="text-success" size={18} />;
    case 'review':
      return <AlertTriangle className="text-warning" size={18} />;
    case 'fail':
      return <XCircle className="text-danger" size={18} />;
    default:
      return <MinusCircle className="text-muted" size={18} />;
  }
}

const VERDICT_CONFIG = {
  verified: { label: 'VERIFIED', short: 'Verified', color: 'var(--success)', icon: CheckCircle, badge: 'badge-success' },
  review: { label: 'NEEDS REVIEW', short: 'Needs review', color: 'var(--warning)', icon: AlertTriangle, badge: 'badge-warning' },
  rejected: { label: 'REJECTED', short: 'Rejected', color: 'var(--danger)', icon: XCircle, badge: 'badge-danger' },
};

function VerdictStamp({ verdict }) {
  const config = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.review;
  const Icon = config.icon;
  return (
    <div className="stamp" style={{ color: config.color }}>
      <Icon size={28} />
      <div className="stamp-label">{config.label}</div>
    </div>
  );
}

function VerdictBadge({ verdict }) {
  const config = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.review;
  return <span className={`badge ${config.badge}`}>{config.short}</span>;
}

function FieldInput({ label, value, onChange, placeholder }) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input
        type="text"
        className="field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function FieldRow({ label, expected, extracted, status, note }) {
  return (
    <div className="border-warm" style={{ borderBottomWidth: 1, borderStyle: 'solid', padding: '0.75rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
        <div style={{ paddingTop: 2, flexShrink: 0 }}>
          <StatusIcon status={status} />
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }} className="field-grid">
          <div>
            <div className="field-label">{label}</div>
            <div style={{ fontSize: '0.9rem' }}>
              {expected ? expected : <span className="text-muted">Not entered</span>}
            </div>
          </div>
          <div>
            <div className="field-label">On label</div>
            <div className="font-data" style={{ fontSize: '0.85rem' }}>
              {extracted ? extracted : <span className="text-muted">Not found</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="text-muted-2" style={{ fontSize: '0.78rem', marginTop: '0.35rem', marginLeft: '1.85rem' }}>
        {note}
      </div>
    </div>
  );
}

function WarningRow({ warning }) {
  return (
    <div style={{ padding: '0.75rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
        <div style={{ paddingTop: 2, flexShrink: 0 }}>
          <StatusIcon status={warning.status} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="field-label">Government warning statement</div>
          {warning.extracted ? (
            <div
              className="font-data border-warm"
              style={{
                fontSize: '0.8rem',
                background: 'var(--paper)',
                borderWidth: 1,
                borderStyle: 'solid',
                borderRadius: '0.4rem',
                padding: '0.5rem',
                marginBottom: '0.35rem',
                whiteSpace: 'pre-wrap',
              }}
            >
              {warning.extracted}
            </div>
          ) : (
            <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              Not found on label
            </div>
          )}
          <div className="text-muted-2" style={{ fontSize: '0.78rem' }}>{warning.note}</div>
        </div>
      </div>
    </div>
  );
}

function ImageDropzone({ entry, onUpload, onClear }) {
  const inputId = `file-${entry.id}`;
  return (
    <div className="dropzone">
      {entry.imagePreview ? (
        <>
          <img
            src={entry.imagePreview}
            alt="Uploaded label"
            style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain', borderRadius: '0.4rem' }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: '0.6rem', fontSize: '0.8rem', padding: '0.35rem 0.9rem' }}
            onClick={onClear}
          >
            <Trash2 size={14} /> Remove photo
          </button>
        </>
      ) : (
        <>
          <label htmlFor={inputId} className="upload-trigger" style={{ cursor: 'pointer' }}>
            <ImageIcon size={28} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Upload a photo of the label</span>
            <span style={{ fontSize: '0.75rem' }}>JPG, PNG, or WEBP</span>
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => onUpload(e.target.files && e.target.files[0])}
          />
        </>
      )}
    </div>
  );
}

function ResultsPanel({ result }) {
  return (
    <div className="border-warm" style={{ borderTopWidth: 1, borderStyle: 'solid', padding: '1.25rem', background: 'var(--paper)' }}>
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <VerdictStamp verdict={result.verdict} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <FieldRow label="Brand name" {...result.brandName} />
          <FieldRow label="Class / type" {...result.classType} />
          <FieldRow label="Alcohol content" {...result.abv} />
          <FieldRow label="Net contents" {...result.netContents} />
          <WarningRow warning={result.warning} />
          {result.imageQualityIssue && (
            <div className="callout" style={{ marginTop: '0.75rem' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                {result.imageQualityNotes || 'Image quality may affect accuracy — consider requesting a clearer photo.'}
              </span>
            </div>
          )}
          <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.75rem' }}>
            Analyzed in {(result.elapsedMs / 1000).toFixed(1)}s
          </div>
        </div>
      </div>
    </div>
  );
}

function EntryCard({ entry, index, showRemove, onUpdate, onUpload, onClear, onRemove, onVerify }) {
  const canVerify = !!entry.imageBase64 && entry.status !== 'loading';
  return (
    <div className="card">
      <div className="card-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1.25rem' }}>
        <div className="font-display text-navy" style={{ fontWeight: 700, fontSize: '1rem' }}>
          {showRemove ? `Label ${index + 1}` : 'Application details'}
        </div>
        {showRemove && (
          <button type="button" className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }} onClick={onRemove} title="Remove this label">
            <Trash2 size={14} /> Remove
          </button>
        )}
      </div>
      <div style={{ padding: '1.25rem', display: 'grid', gap: '1.25rem' }} className="entry-grid">
        <div style={{ display: 'grid', gap: '0.9rem' }}>
          <FieldInput label="Brand name" value={entry.brandName} onChange={(v) => onUpdate({ brandName: v })} placeholder="OLD TOM DISTILLERY" />
          <FieldInput label="Class / type" value={entry.classType} onChange={(v) => onUpdate({ classType: v })} placeholder="Kentucky Straight Bourbon Whiskey" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
            <FieldInput label="Alcohol content" value={entry.abv} onChange={(v) => onUpdate({ abv: v })} placeholder="45% Alc./Vol." />
            <FieldInput label="Net contents" value={entry.netContents} onChange={(v) => onUpdate({ netContents: v })} placeholder="750 mL" />
          </div>
        </div>
        <ImageDropzone entry={entry} onUpload={(f) => onUpload(f)} onClear={onClear} />
      </div>
      <div style={{ padding: '0 1.25rem 1.25rem' }}>
        <button type="button" className="btn btn-primary" disabled={!canVerify} onClick={onVerify}>
          {entry.status === 'loading' ? (
            <>
              <Loader2 size={16} className="spin" /> Verifying…
            </>
          ) : entry.result ? (
            'Re-verify label'
          ) : (
            'Verify label'
          )}
        </button>
        {!entry.imageBase64 && (
          <span className="text-muted" style={{ fontSize: '0.8rem', marginLeft: '0.75rem' }}>
            Upload a label photo to enable verification
          </span>
        )}
        {entry.error && (
          <div className="text-danger" style={{ fontSize: '0.85rem', marginTop: '0.6rem' }}>
            {entry.error}
          </div>
        )}
      </div>
      {entry.result && <ResultsPanel result={entry.result} />}
    </div>
  );
}

function BatchSummary({ entries }) {
  const withResults = entries.filter((e) => e.result || e.status === 'loading' || e.status === 'error');
  if (withResults.length === 0) return null;
  return (
    <div className="card">
      <div className="card-head font-display text-navy" style={{ padding: '0.6rem 1.25rem', fontWeight: 700 }}>Batch summary</div>
      <div>
        {entries.map((e, i) => (
          <div
            key={e.id}
            className="border-warm"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              padding: '0.6rem 1.25rem',
              borderBottomWidth: i === entries.length - 1 ? 0 : 1,
              borderStyle: 'solid',
            }}
          >
            <div style={{ fontSize: '0.9rem' }}>
              <span className="text-muted" style={{ marginRight: '0.5rem' }}>#{i + 1}</span>
              {e.brandName || <span className="text-muted">Untitled label</span>}
            </div>
            <div>
              {e.status === 'loading' && (
                <span className="badge badge-neutral">
                  <Loader2 size={12} className="spin" style={{ marginRight: 4 }} /> Verifying
                </span>
              )}
              {e.status === 'error' && <span className="badge badge-danger">Error</span>}
              {e.result && <VerdictBadge verdict={e.result.verdict} />}
              {e.status === 'idle' && !e.result && <span className="badge badge-neutral">Not verified</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WarningReference({ open, onToggle }) {
  return (
    <div className="card">
      <button
        type="button"
        onClick={onToggle}
        className="card-head"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6rem 1.25rem',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span className="font-display text-navy" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
          Required government warning text
        </span>
        {open ? <ChevronUp size={18} className="text-navy" /> : <ChevronDown size={18} className="text-navy" />}
      </button>
      {open && (
        <div style={{ padding: '1rem 1.25rem' }}>
          <p className="text-muted-2" style={{ fontSize: '0.85rem', marginBottom: '0.6rem' }}>
            Every label must carry this statement verbatim, with "GOVERNMENT WARNING:" in bold, all-capital letters
            (27 CFR 16.21):
          </p>
          <div
            className="font-data border-warm"
            style={{
              fontSize: '0.85rem',
              background: 'var(--paper)',
              borderWidth: 1,
              borderStyle: 'solid',
              borderRadius: '0.4rem',
              padding: '0.75rem',
              lineHeight: 1.5,
            }}
          >
            {GOVERNMENT_WARNING_TEXT}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main app
// ---------------------------------------------------------------------------

function makeEntry() {
  return {
    id: Math.random().toString(36).slice(2),
    brandName: '',
    classType: '',
    abv: '',
    netContents: '',
    imageBase64: null,
    mediaType: null,
    imagePreview: null,
    status: 'idle',
    result: null,
    error: null,
  };
}

export default function App() {
  const [mode, setMode] = useState('single');
  const [entries, setEntries] = useState([makeEntry()]);
  const [refOpen, setRefOpen] = useState(false);

  function updateEntry(id, patch) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function addEntry() {
    setEntries((prev) => [...prev, makeEntry()]);
  }

  function removeEntry(id) {
    setEntries((prev) => (prev.length > 1 ? prev.filter((e) => e.id !== id) : prev));
  }

  async function handleUpload(id, file) {
    if (!file) return;
    try {
      const { mediaType, data, preview } = await fileToBase64(file);
      updateEntry(id, { imageBase64: data, mediaType, imagePreview: preview, result: null, status: 'idle', error: null });
    } catch {
      updateEntry(id, { error: 'Could not read that image file. Try a JPG, PNG, or WEBP.' });
    }
  }

  function handleClear(id) {
    updateEntry(id, { imageBase64: null, mediaType: null, imagePreview: null, result: null, status: 'idle', error: null });
  }

  async function handleVerify(id) {
    updateEntry(id, { status: 'loading', error: null });
    const entry = entries.find((e) => e.id === id);
    if (!entry || !entry.imageBase64) return;
    try {
      const result = await verifyEntry(entry);
      updateEntry(id, { status: 'done', result });
    } catch (err) {
      updateEntry(id, { status: 'error', error: 'Could not analyze this label. Please try again.', result: null });
    }
  }

  async function handleVerifyAll() {
    const targets = entries.filter((e) => e.imageBase64);
    await Promise.all(targets.map((e) => handleVerify(e.id)));
  }

  const visibleEntries = mode === 'single' ? entries.slice(0, 1) : entries;

  return (
    <div className="ttb-app" style={{ minHeight: '100vh' }}>
      <style>{STYLES}</style>

      <header className="bg-navy" style={{ borderBottom: '4px solid var(--gold)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '1.5rem 1.25rem', color: 'var(--paper)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <div className="text-gold" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>
                Alcohol and Tobacco Tax and Trade Bureau
              </div>
              <h1 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>
                Label Verification Prototype
              </h1>
            </div>
            <div className="mode-tabs">
              <button type="button" className={`mode-tab ${mode === 'single' ? 'active' : ''}`} onClick={() => setMode('single')}>
                Single label
              </button>
              <button type="button" className={`mode-tab ${mode === 'batch' ? 'active' : ''}`} onClick={() => setMode('batch')}>
                Batch upload
              </button>
            </div>
          </div>
          <p style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.9rem', maxWidth: 640, opacity: 0.9 }}>
            Enter the details from the application, upload a photo of the label, then select{' '}
            <strong>Verify label</strong> to check that everything matches.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: '0 auto', padding: '1.5rem 1.25rem 3rem', display: 'grid', gap: '1.25rem' }}>
        <WarningReference open={refOpen} onToggle={() => setRefOpen((v) => !v)} />

        {mode === 'batch' && <BatchSummary entries={entries} />}

        {visibleEntries.map((entry, i) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            index={i}
            showRemove={mode === 'batch' && entries.length > 1}
            onUpdate={(patch) => updateEntry(entry.id, patch)}
            onUpload={(file) => handleUpload(entry.id, file)}
            onClear={() => handleClear(entry.id)}
            onRemove={() => removeEntry(entry.id)}
            onVerify={() => handleVerify(entry.id)}
          />
        ))}

        {mode === 'batch' && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={addEntry}>
              + Add another label
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleVerifyAll}
              disabled={!entries.some((e) => e.imageBase64 && e.status !== 'loading')}
            >
              Verify all
            </button>
          </div>
        )}

        <p className="text-muted" style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '0.5rem' }}>
          Prototype only — nothing entered here is saved or sent anywhere except to the AI model for label analysis.
        </p>
      </main>
    </div>
  );
}
