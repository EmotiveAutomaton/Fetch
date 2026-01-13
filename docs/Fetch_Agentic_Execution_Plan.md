# **FETCH: AGENTIC EXECUTION PLAN**

Module D: Engineering Roadmap & Agent Tooling  
Classification: INTERNAL / PRIVATE  
Version: 4.0.0 (The "Terrier" Revision)

# **1\. PHASED ROLLOUT STRATEGY**

**Axiom of Dependency:** We build the Body (Client) first to visualize the requirements, then the Brain (Server) to fulfill them.

## **Phase 1: The Shell (Client Foundation)**

**Objective:** Establish the visual identity and network discovery layer.

* **Deliverables:**  
  1. **React Native Shell:** Expo Router v3 structure with app/(home) and app/modal.  
  2. **Visual System:** Implementation of "Terrier Monochrome" theme in Tamagui.  
  3. **Discovery:** Integration of mDNS (react-native-zeroconf) to resolve fetch-server.local.  
  4. **The Dog House:** A functional Chat Interface (FlashList) with the specific Header (Hamburger, Model Toggle, Notification Badge).  
* **Validation:** App launches, connects to a mock server via mDNS name, and displays the static Chat UI.

## **Phase 2: The Brain (Cortex & Routing)**

**Objective:** robust backend logic and Model Switching.

* **Deliverables:**  
  1. **FastAPI Gateway:** Python service exposing port 8000\.  
  2. **Service Discovery:** Python zeroconf broadcasting \_fetch-api.\_tcp.local.  
  3. **The Router:** Logic to send "Public" requests to Google Gemini (Wrapper) and "Private" requests to Ollama (DeepSeek-R1).  
  4. **Database:** PostgreSQL schema migration (Emails, Drafts, Exclusions).  
  5. **The Ingestion Pipeline:** Background worker to process incoming emails: Normalize -> Hash -> Check Exclusion -> Summarize (Llama 3.1) -> Vectorize -> Insert.
* **Validation:** Android client can toggle models and receive distinct responses from Cloud vs. Local LLMs.

## **Phase 3: The Deck (Decision Engine)**

**Objective:** The core email processing loop.

* **Deliverables:**  
  1. **The Deck UI:** Tinder-style swipe interface in the React Native Modal (Draft Cards).  
  2. **State Management:** TanStack Query logic to fetch pending drafts.  
  3. **Action Handlers:** Swipe Right \-\> API Approve; Swipe Left \-\> API Reject.  
* **Validation:** User can swipe through a stack of mock drafts; backend logs the state changes.

## **Phase 4: The Eyes (Perception & Hardware)**

**Objective:** Advanced sensors and real-world hooks.

* **Deliverables:**  
  1. **Financial OCR:** Pipeline to ingest PDFs and extract bill data (Bill Pay Cards).  
  2. **Smart Home:** Hooks into Home Assistant for "Meeting Mode" lights.  
  3. **Coop Cam:** RTSP stream viewer in the "House Tools" drawer.

# **2\. AGENT WORKSTREAMS & PROMPTS**

Use the following prompts to initialize the AI Agents (Cursor/Windsurf) for specific tasks.

## **2.1. Workstream A: Mobile Foundry (Phase 1\)**

Context: Expo SDK 50+, Tamagui, TypeScript.  
Prompt:  
ROLE: Senior React Native Engineer.  
TASK: Initialize the "Fetch" client shell.  
VISUAL THEME: "Terrier Monochrome". Use strictly White (\#FFFFFF), Off-White (\#F9F9F7), and Jet Black (\#1A1A1A). NO Colors except semantic alerts (Red/Yellow/Green).  
REQUIREMENTS:

1. **Navigation:** Use Expo Router v3. Create app/(home)/index.tsx (The Dog House) and app/modal/deck.tsx (The Deck).  
2. **Header Component:** Build a custom header with:  
   * *Left:* Hamburger Icon (opens generic Drawer).  
   * *Center:* A Dropdown to toggle between "Fetch Public" and "Fetch Private".  
   * *Right:* A Notification Badge (Stack Icon) with a colored status dot.  
3. **Network:** Implement react-native-zeroconf to scan for fetch-server.local. Do not use hardcoded IPs.  
4. Chat UI: Implement a FlashList for the chat stream.  
   OUTPUT: The directory structure and key component files.

## **2.2. Workstream B: Cortex Engineering (Phase 2\)**

Context: Python 3.11, FastAPI, Ollama, Llama 3.1.  
Prompt:  
ROLE: AI Backend Architect.  
TASK: Build the Fetch API Gateway with Hybrid Routing.  
REQUIREMENTS:

1. **Discovery:** Use python zeroconf to broadcast the service as \_fetch-api.\_tcp.local on port 8000 on startup.  
2. **The Router:** Create an endpoint POST /chat.  
   * Input: { message: str, mode: 'public' | 'private' }  
   * Logic:  
     * If public: Call google.generativeai (Gemini Flash). Wrap this in a system prompt that sanitizes PII.  
     * If private: Call ollama.chat (DeepSeek-R1). Use the "Archimedes" system prompt.  
3. Database: Define SQLModel classes for Email, Draft, and AiExclusion (SHA-256 hash primary key).  
4. **Ingestion:** Implement the IngestionService to handle email processing and vectorization.
   OUTPUT: main.py, router.py, models.py, and ingestion.py.

## **2.3. Workstream C: Creative Director (Assets)**

Context: Generating UI assets via DALL-E 3 or Midjourney.  
Prompt:  
ROLE: UI/UX Designer.  
TASK: Generate the prompt descriptions for the application assets.  
IDENTITY: "Fetch" is a white/off-white Terrier mix with wire-rimmed glasses.  
ASSETS TO DEFINE:

1. **Avatar:** A minimalist line-art style illustration of the dog. Clean, vector-like, suitable for a circle avatar.  
2. **Notification Icon:** A speech bubble formed by a stack of playing cards.  
3. **Watermark:** A very faint (3% opacity) geometric outline of the terrier head for the chat background.