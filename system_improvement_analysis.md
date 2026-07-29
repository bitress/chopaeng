# Chobot System — Improvement & Feature Analysis

A thorough review of all system layers: Flask API, Discord bots (DiscordCommandBot, FlightLogger, FreeFlight), utilities, and configuration.

---

## 🔴 High Priority — Correctness / Security / Reliability

### 1. Dodo code revealed to the wrong thread (`_fire_dodo_webhook` & `reveal_dodo`)
The webhook fires in a background thread with no rate-limit or deduplication guard.  
A user who spam-clicks "Reveal Dodo" will trigger multiple webhook fires and multiple log entries before the first response arrives.
**Fix:** Add a per-user-per-island debounce (e.g., `_last_reveal: dict[str, float]`) that ignores requests within 60 s of the last reveal.

---

### 2. `asyncio.run()` inside a Flask route (`/api/v1/villager/<name>`)
`asyncio.run()` on line 2519 creates a new event loop per HTTP request and is a well-known performance trap (and will raise `RuntimeError` on Python ≥ 3.12 in some environments).
**Fix:** Cache the Nookipedia result in a `threading.local`-safe dict with a short TTL, and make the call synchronous with `requests`, or run async via an already-existing event loop via `asyncio.get_event_loop().run_until_complete()`.

---

### 3. Duplicate, redundant helper definitions in `flask_api.py`
`_is_mod`, `_has_island_access`, `_configured_subscription_role_ids`, etc. are fully defined (lines ~458–700) **and then immediately overwritten** (lines 696–708) with references to `island_access.*`. The shadow definitions are dead code but they are long and confuse readers.
**Fix:** Delete the shadow definitions entirely.

---

### 4. `Config.validate()` still requires `TWITCH_TOKEN` / `TWITCH_CHANNEL` even when Twitch service is not started
If you run `python main.py flask discord`, it will still abort because `TWITCH_TOKEN` is missing from `.env`.
**Fix:** Make validation conditional on which services are actually being started (pass `services` into `Config.validate()`).

---

### 5. Flask WAL + SQLite contention under concurrent requests
The `flask_api.py` opens many short-lived `get_db()` connections per-request. SQLite in WAL mode can still deadlock when multiple threads write simultaneously. The code has no retry wrapper around `conn.execute` writes.
**Fix:** Add a simple `sqlite3.OperationalError` retry loop (3 attempts, 50 ms backoff) around every write path, or switch to `check_same_thread=False` with a connection pool.

---

## 🟠 Medium Priority — Features / UX / Observability

### 6. No API rate limiting on public endpoints
`/api/find`, `/api/villager`, `/api/islands`, `/api/islands/<name>/dodo` are entirely open. A user or scraper can hammer them at hundreds of RPS.
**Fix:** Add `flask-limiter` with Redis or an in-memory store. Start with generous limits (e.g., 60 rpm per IP for public, 10 rpm per user for dodo reveal).

---

### 7. Dodo queue (`/api/islands/<name>/queue`) has no expiry or cleanup job
Queue entries with status `waiting` or `called` live forever in the DB. A mod who never updates an entry will leave the queue polluted indefinitely.
**Fix:** Add a background thread (or extend the backup scheduler) that sets entries to `expired` when `updated_at` is older than a configurable TTL (e.g., 4 hours).

---

### 8. Auth token refresh races on high-traffic
`_current_auth_user()` calls `refresh_user_payload()` synchronously inside a Flask request. If Discord is slow, this adds 1-3 s to every authenticated request. There is also no lock, so two concurrent requests for the same user can both trigger a refresh.
**Fix:** Cache the refreshed payload for at least `AUTH_DISCORD_REFRESH_SECONDS` using a `threading.Lock` per-token, or perform refresh in a background thread and serve the stale payload until refresh completes.

---

### 9. `CommandSearchEvent` table is written but never read from the Flask API
The table logs every search but there is no public or dashboard endpoint to surface it.  
This is analytics gold — failed searches tell you what new items/villagers to add to the alias table.
**Fix:** Expose `GET /api/admin/search-analytics?top_misses=20&days=7` in the dashboard blueprint.

---

### 10. `SearchAlias` table is writable from the dashboard but not surfaced in the Discord bot
A mod creates an alias in the dashboard, but `!find` and `/find` in Discord go straight to the raw cache and never resolve aliases.
**Fix:** Call `_resolve_search_alias()` (or a shared version of it) inside `DiscordCommandCog.find_item()` and `find_villager()` before doing the fuzzy search.

---

### 11. `DodoQueueEntry` webhook notifications not implemented
When a queue entry status changes to `called`, there is no mechanism to ping the user in Discord or send them a notification.
**Fix:** Add a lightweight webhook/DM dispatcher in the dashboard API: when `status` is set to `called`, fire a Discord DM to the `user_id` stored in the entry.

---

### 12. Island monitor loop checks Discord message history instead of `island_bot_status` DB table
`_compute_island_status()` scans recent message history (up to 25 messages per channel) for each island every loop iteration. This is expensive and unreliable.  
The `island_bot_status` table already exists and is populated by `_upsert_bot_status()` in real time.
**Fix:** In `_compute_island_status()`, read from `island_bot_status` first (it is fresh); only fall back to message-history scanning if the DB row is missing or stale (> 5 min old).

---

### 13. `ACNH_TRIVIA_QUESTIONS` has a duplicate: "What species is Marshal?" appears twice (lines 113 and 169)
**Fix:** Remove the duplicate entry.

---

### 14. Free Dodo Board sends up to 10 embeds per message but does not gracefully handle islands going offline mid-render
If an island goes offline between the start of `free_dodo_board_loop` and when the embed is sent, the data shown will be stale.
**Fix:** Re-read dodo files immediately before building each embed, or use a consistent snapshot taken at the start of the loop.

---

### 15. `chopaeng_ai.py` — rolling chat log is persisted to disk but never pruned
`chat_log.json` grows unboundedly. Each conversation entry is appended; there is no max-file-size or max-age trim.
**Fix:** After each write, trim the JSON to the last N conversations (e.g., 100) or prune entries older than 30 days.

---

## 🟡 Low Priority — Code Quality / Developer Experience

### 16. `flask_api.py` is a 2 600-line monolith
The file combines: auth routes, search routes, island routes, Patreon routes, dodo reveal, queue, profile, subscriptions, webhook firing, and caching helpers.
**Fix:** Split into Flask blueprints:
- `auth_bp.py` — OAuth, `/api/auth/*`
- `islands_bp.py` — island CRUD, dodo reveal, queue, visitors
- `search_bp.py` — `/api/find`, `/api/villager`, `/api/search/*`
- `patreon_bp.py` — `/api/patreon/*`
- `admin_bp.py` — refresh, health, status, analytics

---

### 17. `discord_command_bot.py` is a 4 800-line single-file cog
The cog mixes: item search, villager search, island status, island monitor loop, free-dodo board, sticky status, slash commands, prefix commands, trivia, nickname, AI chat, OTA update, moderation helpers, and more.
**Fix:** Split into separate Cog files in a `bots/cogs/` directory:
- `SearchCog` — find, villager, random
- `IslandCog` — islands, status, monitor
- `ModerationCog` — nick, warnings
- `FunCog` — trivia, ask
- `AdminCog` — update, reload, backup

---

### 18. `Config` class uses class-level assignments with side effects
`IS_PRODUCTION` is evaluated at import time, and the `if IS_PRODUCTION:` branch sets module-level channel IDs. This makes testing and env-override extremely fragile.
**Fix:** Use `@classmethod` property-style accessors or move the branch inside `validate()`.

---

### 19. No structured log rotation
`bot.log` grows indefinitely (it was already 2.4 MB in the directory listing). There is no `RotatingFileHandler`.
**Fix:** Replace the `FileHandler` in `main.py` with a `RotatingFileHandler(maxBytes=10*1024*1024, backupCount=5)`.

---

### 20. `_file_cache` in `flask_api.py` has no maximum size
The cache dict stores every unique file path ever read. On systems with many islands, this can accumulate.
**Fix:** Use `functools.lru_cache` or a size-bounded `OrderedDict` with a 500-entry cap.

---

### 21. Maintenance mode settings are re-read from the DB on every request that checks them
`get_maintenance_settings()` opens a DB connection and runs a `SELECT` on every call.  
These settings change rarely.
**Fix:** Cache them in memory with a 10-second TTL (a short TTL ensures toggles take effect promptly without hitting the DB on every request).

---

### 22. `bot.log` encoding is UTF-8 but the handler does not set `errors="replace"`
If a Discord message contains characters that can't be encoded by the host locale, the logger will raise and crash the logging thread on Windows.
**Fix:** Use `logging.FileHandler("bot.log", encoding="utf-8", errors="replace")`.

---

## 🟢 New Features Worth Adding

### 23. Per-island item watch list (frontend + API)
Users can already subscribe to island alerts (`island_online`, `island_slot`) but there is no "notify me when `<item>` is available on any island" flow.  
The `island_subscriptions` table already has a `kind` field and supports `"item"` — but the backend never fires DMs for item subscriptions.
**Fix:** In the item-cache refresh cycle, diff the old and new caches; for any newly-present item, query subscribers with `kind='item'` and `island_clean=item_name`, then DM them via Discord.

---

### 24. Public visitor leaderboard endpoint
`island_visits` tracks every visit per user. A leaderboard endpoint (`/api/leaderboard?period=7d`) would give the community a fun stat to look at.
```
GET /api/leaderboard?period=7d&limit=10
→ [{ "display_name": "...", "visits": 42, "unique_islands": 7 }, ...]
```

---

### 25. Island uptime percentage endpoint
The `island_bot_status` table is updated in real-time but only stores "is online now". A separate `island_uptime_log` table (island_id, up_at, down_at) would allow calculating uptime percentages per island per day.

---

### 26. Discord slash command `/island <name>` for public status
Currently `!islands` returns all island statuses in a giant embed. A `/island <name>` slash command that shows a single island's current status (online/offline, visitor count, items, map) would be cleaner for users.

---

### 27. Webhook-based Google Sheets refresh trigger
Currently cache refreshes are either on a timer (`CACHE_REFRESH_HOURS`) or triggered by `/api/refresh`. A Google Apps Script webhook in the spreadsheet could POST to `/api/refresh` every time a cell is changed, making the data update in near-real-time without polling.

---

### 28. `!myislands` Discord command
A slash command that lists all member islands the invoking user has access to (based on their roles), with live status for each. Useful for subscribers who don't know which islands they have access to.

---

### 29. Automated nickname format enforcement reminder
The bot already validates nicknames when a dodo is revealed (`nickname_warning_for`) and fires a warning embed. However, there is no periodic reminder to users who still have non-compliant nicknames after N days.  
**Fix:** A daily task that scans guild members, checks `is_valid_acnh_nickname(member.nick)`, and DMs a gentle reminder to violators (with a configurable grace period).

---

### 30. `GET /api/islands/<name>` single-island detail endpoint
All island data is behind `GET /api/islands` (returns all islands). Fetching a single island requires the frontend to download the full list and filter.
**Fix:** Add `GET /api/islands/<name>` that returns the same `_build_island_response` payload for just one island. This reduces payload size for detail pages significantly.

---

## Summary Table

| # | Area | Priority | Effort |
|---|------|----------|--------|
| 1 | Dodo reveal debounce | 🔴 High | Small |
| 2 | `asyncio.run()` in Flask route | 🔴 High | Small |
| 3 | Dead shadow function definitions | 🔴 High | Small |
| 4 | Config.validate() ignores service selection | 🔴 High | Small |
| 5 | SQLite WAL write retry | 🔴 High | Small |
| 6 | Rate limiting on public endpoints | 🟠 Medium | Medium |
| 7 | Dodo queue expiry job | 🟠 Medium | Small |
| 8 | Auth refresh race / blocking | 🟠 Medium | Medium |
| 9 | Search analytics dashboard endpoint | 🟠 Medium | Small |
| 10 | SearchAlias in Discord bot | 🟠 Medium | Small |
| 11 | Dodo queue DM notification | 🟠 Medium | Medium |
| 12 | Monitor loop uses DB not message history | 🟠 Medium | Small |
| 13 | Duplicate trivia question | 🟠 Medium | Tiny |
| 14 | Free Dodo Board stale data race | 🟠 Medium | Small |
| 15 | chat_log.json unbounded growth | 🟠 Medium | Small |
| 16 | flask_api.py monolith — split blueprints | 🟡 Low | Large |
| 17 | discord_command_bot.py monolith — split cogs | 🟡 Low | Large |
| 18 | Config class-level side effects | 🟡 Low | Medium |
| 19 | Log rotation | 🟡 Low | Tiny |
| 20 | _file_cache unbounded | 🟡 Low | Tiny |
| 21 | Maintenance settings cached per-request | 🟡 Low | Small |
| 22 | Logger encoding errors on Windows | 🟡 Low | Tiny |
| 23 | Item watch list fire DMs | 🟢 New | Medium |
| 24 | Visitor leaderboard endpoint | 🟢 New | Small |
| 25 | Island uptime log table + endpoint | 🟢 New | Medium |
| 26 | `/island <name>` slash command | 🟢 New | Small |
| 27 | Google Sheets webhook trigger | 🟢 New | Small |
| 28 | `/myislands` slash command | 🟢 New | Small |
| 29 | Nickname reminder daily task | 🟢 New | Medium |
| 30 | `GET /api/islands/<name>` single-island endpoint | 🟢 New | Small |
