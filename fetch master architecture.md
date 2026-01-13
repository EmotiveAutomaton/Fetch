# **FETCH: MASTER ARCHITECTURE**

Module B: Systems Architecture & Infrastructure  
Classification: INTERNAL / PRIVATE  
Version: 2.0.0

# **1\. HARDWARE TOPOLOGY & SEGMENTATION**

Axiom of Role Separation:  
To resolve the conflict between High Availability (HA) and High Compute (HC) within a consumer hardware environment, the infrastructure is bifurcated into two distinct nodes.

## **1.1. Node A: The Nervous System (Synology NAS)**

* **Role:** Persistence, Orchestration, API Gateway.  
* **Availability:** 24/7/365.  
* **Constraint:** **IOPS Saturation.** Standard RAID-5 HDD arrays cannot sustain the random I/O required by PostgreSQL vector indexing (pgvector), leading to iowait spikes \>90%.  
* **Correction (NVMe Pinning):**  
  * The PostgreSQL data volume (/var/lib/postgresql/data) MUST be mounted on a dedicated **NVMe Storage Pool** (not just read/write cache).  
  * **Throughput Target:** \>3,000 Random Read IOPS for vector similarity search.

## **1.2. Node B: The Brain (Gaming PC)**

* **Role:** Inference, Vectorization, OCR.  
* **Availability:** On-Demand (Sleep state S3 when idle).  
* **Hardware Spec:**  
  * **GPU:** NVIDIA RTX 30-series or higher (CUDA cores required for Llama 3.1 8B quantization).  
  * **VRAM:** Minimum 8GB for simultaneous model loading.  
* **Service Lifecycle:**  
  * Awakened by Node A via Magic Packet.  
  * Auto-suspends after t=15m of queue inactivity.

# **2\. NETWORK CONTROL PROTOCOLS**

Constraint: UDP Broadcasts (Wake-on-LAN) are non-deterministic ($P(loss) \> 0$).  
Correction: Closed-Loop Watchdog Protocol.

## **2.1. The Watchdog Loop**

The Orchestrator (Node A) executes the following state machine when the batch\_queue \> 0:

1. **State T0 (Trigger):** Send UDP Magic Packet to Node B MAC.  
2. **State T+5s (Verify):** Attempt TCP handshake on Node B Port 8000 (/health endpoint).  
3. **Branch:**  
   * **ACK Received:** Proceed to payload transmission.  
   * **No ACK:** Enter **Polling Loop** ($t=60s$, interval=5s).  
4. **Failure State:** If $t \> 60s$ and no ACK, trigger **Physical Intervention Alert** (Critical Priority Push Notification via Pushover/Firebase).

## **2.2. Zero Trust Perimeter**

* **Ingress:** **0 Open Ports** on the physical router.  
* **Overlay Network:** All inter-node and client-server traffic is encapsulated via **Tailscale** (WireGuard).  
* **ACLs:**  
  * tag:fetch-server can access tag:fetch-brain on port 8000\.  
  * tag:fetch-client (Android) can access tag:fetch-server on port 3000\.

# **3\. AUTHENTICATION ARCHITECTURE**

Correction: \[Policy Permanence Fallacy\] detected.  
Reliance on "Internal App" status in Google Workspace is fragile against policy shifts regarding "Less Secure Apps."

## **3.1. Service Account Delegation**

* **Mechanism:** Server-to-Server authentication using RSA-2048 private keys.  
* **Configuration:**  
  1. Create Google Cloud Service Account (SA).  
  2. Enable **Domain-Wide Delegation** in Workspace Admin Console.  
  3. Grant scopes: https://www.googleapis.com/auth/gmail.modify, https://www.googleapis.com/auth/calendar.  
* **Flow:**  
  * Node A signs a JWT with the SA private key.  
  * Node A exchanges JWT for an access token, *impersonating* user@domain.com.  
* **Benefit:** Tokens are generated programmatically. No manual re-authentication or 7-day expiry (OAuth Refresh Token limits).

# **4\. DATA SCHEMA (PostgreSQL)**

Database: fetch\_db  
Extensions: vector, pg\_cron, uuid-ossp

## **4.1. Core Tables**

\-- 1\. EMAILS: The raw communication log \+ Embeddings  
CREATE TABLE emails (  
    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    message\_id TEXT UNIQUE NOT NULL, \-- Gmail Message-ID header  
    thread\_id TEXT NOT NULL,  
    body\_hash CHAR(64) UNIQUE NOT NULL, \-- SHA-256 for Anti-Cannibalization  
    sender TEXT NOT NULL,  
    subject TEXT,  
    raw\_body TEXT, \-- Sanitized plain text  
    summary TEXT, \-- Llama 3.1 Generated  
    embedding VECTOR(768), \-- all-MiniLM-L6-v2 representation  
    priority\_score INTEGER CHECK (priority\_score BETWEEN 0 AND 100),  
    received\_at TIMESTAMPTZ DEFAULT NOW(),  
    is\_processed BOOLEAN DEFAULT FALSE  
);

\-- Index for Semantic Search (HNSW)  
CREATE INDEX ON emails USING hnsw (embedding vector\_cosine\_ops);

\-- 2\. DRAFTS: The output buffer  
CREATE TABLE drafts (  
    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    email\_id UUID REFERENCES emails(id),  
    status TEXT CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SENT')),  
    proposed\_body TEXT,  
    reasoning\_trace TEXT, \-- DeepSeek-R1's internal monologue  
    archimedes\_remark TEXT, \-- The persona's commentary  
    created\_at TIMESTAMPTZ DEFAULT NOW()  
);

\-- 3\. CALENDAR NEGOTIATIONS: Staging area for schedule changes  
CREATE TABLE calendar\_negotiations (  
    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    email\_id UUID REFERENCES emails(id),  
    proposed\_start TIMESTAMPTZ NOT NULL,  
    proposed\_end TIMESTAMPTZ NOT NULL,  
    event\_title TEXT,  
    justification\_quote TEXT, \-- The exact text from the email triggering this  
    confidence\_score FLOAT,  
    user\_action TEXT CHECK (user\_action IN ('GOOD\_BOY', 'BAD\_DOG', 'PENDING'))  
);

# **5\. RAG PROTOCOL: ANTI-CANNIBALIZATION**

**Objective:** Prevent "Model Collapse" (Perplexity Degradation) caused by the AI training on its own outputs.

## **5.1. Cryptographic CAS Strategy**

Instead of relying on fragile headers (which are stripped in replies/forwards), we use **Content-Addressable Storage (CAS)** principles.

* **Table:** ai\_exclusions  
  * hash (CHAR(64) PRIMARY KEY): SHA-256 hash of the normalized text body.  
  * source (TEXT): 'ARCHIMEDES\_GENERATION'  
* **Ingestion Logic:**  
  def vectorize\_email(body\_text):  
      \# 1\. Normalize  
      norm\_text \= normalize(body\_text) \# Lowercase, strip whitespace/signatures

      \# 2\. Hash  
      body\_hash \= sha256(norm\_text)

      \# 3\. Check Exclusion  
      if db.exists("SELECT 1 FROM ai\_exclusions WHERE hash \= ?", body\_hash):  
          return None \# ABORT: Do not learn from this.

      \# 4\. Proceed to Vectorize  
      return model.encode(norm\_text)

* **Registration:** Whenever Archimedes successfully sends a draft, the hash of that draft is immediately inserted into ai\_exclusions.