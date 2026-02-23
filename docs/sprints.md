# Moodly Sprint Plan (v2)

Cadence: 2-week sprints
Total: 4 sprints (8 weeks)
Start date: 2026-02-24

Assumptions:
- This plan targets the v2 work described in the README.
- Frontend is Vite + React; backend is Flask.
- Deployment target is Vercel (frontend) plus a hosted API.

Definition of Done (all sprints):
- Feature is implemented, tested (basic happy path), and reviewed.
- No blocking console errors in the UI.
- Docs updated (README or relevant doc).

## Sprint 1: Foundations and Core UX
Focus: App shell, routing, auth basics, baseline data flows.
Deliverables:
- App layout stabilized (sidebar, top nav, routing).
- Auth flows wired to Supabase (sign up, login, logout).
- Mood entry form with sliders and daily notes.
- Mood entries persisted to backend (local or API stub if needed).
- CI/dev scripts verified; app runs with npm run dev.

## Sprint 2: Mood Tracking and Analytics MVP
Focus: tracking model, charts, and trend views.
Deliverables:
- Mood history list with filters (date range, mood range).
- Analytics dashboard with at least 2 charts (mood trend, sleep vs mood).
- Basic wellness score calculation.
- Export or download of mood entries (CSV or JSON).

## Sprint 3: Journaling and Breathing
Focus: journaling MVP and breathing module.
Deliverables:
- Rich text journal editor with tagging.
- Journal list view, search, and favorites.
- Breathing exercises page with 4 techniques and timer.
- Session history stored per user.

## Sprint 4: Music, Profiles, and Release
Focus: music integration, profile management, polish and release.
Deliverables:
- Spotify integration for mood-based search with fallback playlists.
- Profile settings (avatar upload, preferences, privacy toggles).
- Bug bash and UI polish pass.
- Deployment to production and release notes.

## Risks and Mitigations
- API keys and OAuth setup: start early in Sprint 2.
- Data model churn: lock schema after Sprint 2.
- Deployment blockers: establish a staging deploy by Sprint 3.
