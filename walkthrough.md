# Walkthrough: In-Island Drop Bot & Dodo Webhook Flow on `/order`

We refined the In-Island Drop Bot feature on `/order` to follow the exact 3-step sequence:
1. **Select Destination Sub Island**: Pick from active Sub Member islands you own subscription access to.
2. **Get Dodo Flight Pass & Log Webhook**: Clicking **Get Dodo Code** calls `POST /api/islands/<name>/dodo`, triggering the backend Discord `_fire_dodo_webhook` audit log and decrypting the boarding pass.
3. **Drop Selected Items**: Spawns items once the flight pass is active and items are loaded in the 9-slot pocket grid.

---

## 🌟 Step-by-Step Flow:

### 1. 🏝️ Step 1 — Select Destination Sub Member Island
- Shows active Sub Member islands with map banners, live gate traffic (`visitors/7`), and access checks.
- Selecting an island resets the Dodo code state and prepares the flight pass.

### 2. 🎫 Step 2 — Get Dodo Flight Pass (Logs via Webhook)
- Displays **"Get Dodo Code"** action button.
- When clicked:
  - Executes `POST /api/islands/${island.name}/dodo` with Discord `Bearer ${token}`.
  - Backend executes `_fire_dodo_webhook(username, nickname, dodo_code, target)` in Discord.
  - Reveals the monospaced Dodo code chip with 1-click clipboard copy and audio chime feedback.
  - Shows verified status badge: `✓ Flight pass verified & logged via Discord webhook.`

### 3. 📦 Step 3 — Select Drop Items & Dispatch
- 9-Slot Drop Grid with quantity steppers and quick presets (`Royal Crowns`, `NMTs`, `Bells`, `Gold Nuggets`).
- **Gated Protection**: The **"Drop Items on [Island]"** dispatch CTA remains disabled with a prompt until Step 2's Dodo code is logged and retrieved.

---

## 🧪 Verification Results
- **TypeScript & Vite Production Bundle**: `✓ built in 10.28s` with 0 errors.
- **Backend Logging**: Fully wired to `POST /api/islands/<name>/dodo`.
