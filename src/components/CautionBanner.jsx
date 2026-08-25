import React from 'react';

// Persistent disclaimer shown on every authenticated page. Content here reflects
// real-time notes taken during meetings and one member's interpretations — it is
// not the official record and may contain transcription or interpretation errors.
// Always verify against FSA source documents before acting on anything shown.
export default function CautionBanner() {
  return (
    <div
      role="note"
      aria-label="Information disclaimer"
      style={{
        background: 'rgba(240, 173, 78, 0.12)',
        border: '1px solid rgba(240, 173, 78, 0.45)',
        borderLeft: '4px solid var(--warning, #f0ad4e)',
        color: 'var(--text-primary)',
        padding: '8px 14px',
        borderRadius: 6,
        marginBottom: 16,
        fontSize: '0.82rem',
        lineHeight: 1.45,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '1rem', lineHeight: 1 }}>⚠</span>
      <span>
        <strong>Caution:</strong> Content on this site is <em>meeting notes and one member's
        interpretations</em>, not an official FSA record. Determinations, rates, citations,
        and case details may contain transcription or interpretation errors. Verify against
        the official case file, handbook, or FSA source documents before relying on any
        information here.
      </span>
    </div>
  );
}
