# Changelog

All notable changes to this project will be documented in this file.

## [v0.2.0] - 2026-01-12 (Recovery Release)

### Added
- **Mobile:**
    - "The Deck" tab: Tinder-style swipe interface for approving/rejecting email drafts.
    - Tab navigation between Chat and The Deck.
    - Archimedes persona greeting in chat.
    - HMP-style Android release build scripts (`npm run android:release`).
- **Documentation:**
    - `docs/SETUP_GUIDE.md` for Android build workflow.
    - Updated `app.json` with Fetch branding and `com.emotiveautomaton.fetch` package.

### Changed
- Updated to Expo SDK 54.
- App version bumped to 0.2.0.
- App name changed from "mobile" to "Fetch".

### Fixed
- Resolved Tamagui configuration issues (patches preserved).

---

## [v0.1.0] - 2025-11-28

### Added
- **Backend:**
    - `GmailClient` with `send_email` capability.
    - `Email` model updated with `is_sent` flag for style learning.
    - `ingest.py` updated to fetch sent emails.
    - `inference.py` updated to use RAG for both context (received emails) and style (sent emails).
    - Database migration script `src/migrate.py`.
- **Mobile:**
    - `api.ts` configured for physical device (LAN IP) and Android Emulator (10.0.2.2).
    - Added error handling and timeout to API requests.
    - Fixed `app.json` scheme warning.
- **Documentation:**
    - `docs/phase_3_walkthrough.md` for verification instructions.
    - Updated `docs/fetch agentic execution plan.md` to reflect MVP completion.

### Fixed
- **Mobile:** Infinite loading screen when API is unreachable.
- **Backend:** `main.py` now uses real database and Gmail client instead of mock data.
