import React from 'react';
import { Navigate } from 'react-router-dom';
import meetingsRegistry from '../data/meetings_registry.json';

// The sidebar "Meeting Agenda" link points here. Historically this page held a
// hardcoded voting-guide baked in per meeting (e.g., April 23, 2026). That
// grew stale between meetings. Now this route redirects to the current
// upcoming meeting's detail view under /board-meetings/:date, which is
// driven by that meeting's index JSON (agenda items, pros/cons, staff recs,
// recusal flags, packet page anchors) and stays fresh automatically.
//
// Precedence for pick:
//   1. First registry entry with status === 'upcoming'
//   2. Otherwise, first (most recent) past meeting
//   3. Otherwise, land on /board-meetings index
export default function Summary() {
  const meetings = meetingsRegistry?.meetings || [];
  const upcoming = meetings.find(m => m.status === 'upcoming');
  const fallback = meetings.find(m => m.status !== 'upcoming');
  const target = upcoming?.date || fallback?.date;
  return <Navigate to={target ? `/board-meetings/${target}` : '/board-meetings'} replace />;
}
