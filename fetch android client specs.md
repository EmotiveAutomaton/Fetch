# **FETCH: ANDROID CLIENT SPECIFICATIONS**

Module C: Client-Side Interaction & UI  
Classification: INTERNAL / PRIVATE  
Version: 3.0.0

# **1\. TECHNICAL STACK & ARCHITECTURE**

Axiom of Offline Sovereignty:  
The client must remain fully functional for read/review operations regardless of the connectivity state of Node A (Synology). Network latency must not block UI threads.

## **1.1. Core Frameworks**

* **Runtime:** **React Native (Expo SDK 50+)**.  
* **Routing:** **Expo Router v3** (File-system based routing).  
* **UI Primitives:** **Tamagui**. Selected for its optimizing compiler, minimizing the JS bridge traffic while providing consistent styling.  
* **Local Persistence:** **MMKV**. High-performance synchronous storage for caching the "Inbox State" and "Drafts."  
* **State Management:** **TanStack Query (React Query)** with persistQueryClient. Handles synchronization with Node A APIs, optimistic updates, and offline caching.

## **1.2. Directory Structure (Expo Router)**

/app  
  ├── \_layout.tsx        \# Root Provider (Auth, Theme, QueryClient)  
  ├── (auth)/            \# Login screens (Service Account masquerade)  
  ├── (tabs)/  
  │   ├── \_layout.tsx    \# Bottom/Gesture Navigation  
  │   ├── index.tsx      \# "The Dog House" (Chat Stream)  
  │   ├── inbox.tsx      \# "The Deck" (Swipe Interface)  
  │   └── health.tsx     \# System Status (Node A/B Health)  
  └── modal/  
      └── negotiation.tsx \# Calendar Conflict Resolution

# **2\. UI LAYOUT: "THE DOG HOUSE"**

**Design Philosophy:** Minimalist AI Chat Interface with subtle branding to reduce visual noise.

## **2.1. The Chrome (Shell)**

* **Header Left (Hamburger):** Opens SidebarDrawer containing:  
  * *House Controls:* Smart Home overrides.  
  * *Persona Settings:* "Sass Level" slider.  
  * *Admin:* Business Continuity Dashboard (Backup Health).  
* **Header Right (Bell):** Notification Center.  
  * *Red Dot:* Emergency Circuit Breaker triggered.  
  * *Green Dot:* Batch ready for review.  
* **Background:**  
  * Layered AbsolutePosition View.  
  * **Watermark:** SVG of Fetch/Archimedes silhouette.  
  * **Opacity:** 0.05 (Barely visible).  
  * **Behavior:** Static; does not scroll with chat bubbles to maintain depth perception.

## **2.2. The Chat Stream**

* **Component:** FlashList (Shopify) for performance.  
* **Bubble Types:**  
  * *Summary:* Markdown rendered text.  
  * *Draft Preview:* Collapsible card showing the proposed reply.  
  * *System Alert:* High-contrast (Red/Black) block for "Watchdog" failures.

# **3\. AVATAR LOGIC: ARCHIMEDES**

**Implementation:** **Rive** (preferred) or **Lottie**. State machine driven by DogState store.

## **3.1. Visual States**

* **Idle:** Cleaning wire-rimmed glasses or reading a small book.  
* **Alert:** Ears swivel forward. Head tilts. (Triggered by: Incoming Notification).  
* **Processing:** Furiously typing on a typewriter or digging a hole. (Triggered by: Network Request).  
* **Judgment:** Peering over glasses. (Triggered by: "Bad Dog" swipe).

## **3.2. Interaction (The "Poke")**

Event: onPress on the Avatar container.  
Logic: Context-aware response based on AuthSession.userId.

* **Context: Melissa (Primary User)**  
  * *Tone:* Service-oriented but sassy.  
  * *Reaction:* "Yes? I was just contemplating the thermodynamic waste of this inbox. Shall we clear it?"  
  * *Reaction (Anxious State):* "Breathe. The server is holding the load. You need only hold the coffee."  
* **Context: Husband (Admin/Secondary)**  
  * *Tone:* Conspiratorial/Technical.  
  * *Reaction:* "Node B's GPU temperature is nominal. The server hum is reassuring today, is it not?"  
  * *Reaction:* "I blocked three tracking pixels today. You're welcome."

# **4\. THE INBOX DECK (BATCH PROCESSING)**

Component: react-native-deck-swiper (or custom Reanimated implementation).  
Metaphor: High-speed triage.

## **4.1. Card Architecture**

* **Elevation:** 4px Shadow.  
* **Header:** Sender Name (Bold) \+ Timestamp (Relative).  
* **Body:**  
  * **Summary:** 2-line Llama 3.1 summary.  
  * **Draft Preview:** "Proposed Reply: \[First 50 chars\]..."  
* **Footer Indicators:**  
  * *Left Corner:* Red "Reject" Icon (Fade in on drag).  
  * *Right Corner:* Green "Approve" Icon (Fade in on drag).

## **4.2. Gestural Logic**

* **Swipe Right ("Good Boy"):**  
  * *Action:* Mark email as processed.  
  * *Side Effect:* If Draft exists \-\> Send via Node A.  
  * *Animation:* Card flies off-screen right; Avatar wags tail.  
* **Swipe Left ("Bad Dog"):**  
  * *Action:* Archive without reply OR Open "Edit Draft" modal.  
  * *Animation:* Card flies off-screen left; Avatar sighs (Haptic feedback).  
* **Tap Card:**  
  * *Action:* Expand card to full screen (Read raw email body).

# **5\. NEGOTIATION CARDS (CALENDAR)**

Use Case: Resolving AI-detected schedule intents.  
Layout: Vertical "Truth Sandwich" Stack.

## **5.1. Zone A: The Proposal (Top)**

* **Style:** Large Typography. High Contrast.  
* **Content:** "Book **Dentist** for **Tuesday @ 2:00 PM**?"  
* **Icon:** Calendar vector.

## **5.2. Zone B: The Evidence (Middle)**

* **Style:** Indented, italicized, distinct background (Paper color).  
* **Content:** Direct quote from source email.  
* **Text:** *"Dr. Smith has an opening Tuesday at 2\. Can you make it?"*  
* **Source:** Link to message\_id.

## **5.3. Zone C: The Reality (Bottom)**

* **Style:** Status Indicator.  
* **State: Clear:** "You are free. Gap: 1:00 PM \- 3:00 PM." (Green).  
* **State: Conflict:** "WARNING: Overlap with 'Client Session' (1:45 PM)." (Red).

## **5.4. Action Bar**

* **Button 1:** "Confirm" (Triggers Calendar Write).  
* **Button 2:** "Edit Proposal" (Opens Time Picker).  
* **Button 3:** "Reject" (Drafts 'Unavailable' reply).