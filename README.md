# Fetch: Development Workspace

> **Status**: MVP / Recovery Release v0.2.0
> **Phase**: 3 (Mobile Interface MVP)

This repository contains **Fetch**, a privacy-sovereign executive assistant designed to draft email responses using local AI.

Fetch features "Archimedes"—a wise, slightly sassy academic dog persona who helps triage your inbox with intellectual rigor and emotional empathy.

**⚠️ Note**: This is the v0.2.0 recovery release. Core functionality is implemented. See [CHANGELOG.md](CHANGELOG.md) for details.

## Project Structure

- `src/`: Python backend (FastAPI + SQLModel + Ollama).
- `mobile/`: Mobile client (Expo + Tamagui + TypeScript).
- `docs/`: Project documentation and execution plans.
- `data/`: Local database and storage.

## Getting Started

### Backend (Python)

1.  **Environment**: Ensure Python 3.11+ and Ollama are installed.
2.  **Install**: `pip install -r requirements.txt`
3.  **Run**:
    ```powershell
    uvicorn src.main:app --reload --host 0.0.0.0
    ```

### Mobile Client (Expo)

1.  **Environment**: Ensure Node.js is installed.
2.  **Install**:
    ```powershell
    cd mobile
    npm install
    ```
3.  **Run**:
    ```powershell
    npx expo start --clear
    ```
    *Note: If you encounter OOM errors, see `docs/mobile_connectivity_diagnostics.md`.*

## Features (Current State)

- **Draft Generation**: Ingests emails and generates drafts using local LLMs.
- **Mobile Review**: "Tinder-style" card stack UI for reviewing, approving, and rejecting drafts.
- **Local-Only**: Designed to run entirely on the local network for privacy.

## Roadmap

- [x] Phase 1: Core Backend & RAG
- [x] Phase 2: Mobile Interface Prototype
- [ ] Phase 3: Refinement & Polish (MVP)
