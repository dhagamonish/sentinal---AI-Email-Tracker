# Sentinal AI: Autonomous Follow-up Engine

Sentinal has been upgraded to a **Zero-Input Autonomous System**. It is no longer a manual tracker; it is an intelligence layer that watches your Gmail silently.

---

## 1. The Autonomous Flow
Sentinal operates on a "Set and Forget" principle. Once connected to Gmail, the following cycle happens automatically:

1.  **Sent Mail Detection**: Every email you send from your Gmail account (on your phone, desktop, or browser) is automatically detected by Sentinal.
2.  **Invisible Queueing**: These sent emails enter an internal "Waiting" queue. They are NOT shown on the main "General" tab yet because they don't need action.
3.  **The 24-Hour Threshold**: Sentinal waits 24 hours. If the recipient does not reply within this window:
    -   The email automatically appears on the Sentinal website.
    -   It is marked as **ACTION NEEDED** (Red).
4.  **Auto-Archive**: If the recipient replies at any time, Sentinal detects it and **automatically removes** the email from the "General" list. You can still see these in the "REPLIED" tab.

---

## 2. User Guide: The New "One-Click" Experience

### Step 1: Initial Setup (Once)
1. Click **Settings**.
2. Enter your **Google Client ID** and **Gemini API Key**.
3. Click **Connect Gmail**.
*That’s it. You are done with the setup.*

### Step 2: Normal Gmail Usage
Just go to Gmail and send your emails as you normally would. You do NOT need to open Sentinal or "Add Lead" manually.

### Step 3: Check Sentinal (Daily)
Open Sentinal once a day. You will only see the emails that **haven't received a reply** and are due for a follow-up.

### Step 4: The 2-Second Follow-up
1. For any item in your list, click **Write Follow-up**.
2. Review the AI-generated message (which has read the entire conversation thread).
3. Click **Send & Record**.
*The follow-up is sent through your Gmail, and the item disappears from your actionable list until another 24 hours pass.*

---

## 3. Product Principles
- **Gmail is Source of Truth**: We don't manage leads; we manage conversation states.
- **Mental Model**: "Sentinal watches my back so I don't miss a reply."
- **Privacy**: All thread tracking and state logic happen locally in your browser.

---

*Sentinal v1.5 - Autonomous follow-up technology.*
