# Realtime Features — Scalability Review (1M users)

Assumes 1,000,000 total users and ~100,000 peak concurrently online (10%).
Firestore pricing used: writes $0.18 / 100k, reads $0.06 / 100k (us-multi-region).

## Summary

| Feature | Verdict at 1M | Notes |
| --- | --- | --- |
| User directory (`/api/users`) | ✅ Fixed | Was load-all; now cursor-paginated. Search needs a DB index. |
| Messages (`chats/{id}/messages`) | ✅ Fixed | Was load-all per chat; now newest-30 live + paginated older. |
| Typing | ✅ Good | Throttled to transitions; tiny write volume. |
| Presence | ✅ Improved | Read fan-out removed (shown only inside chat). Heartbeat write cost remains, tunable. |
| New-message FCM | ⚠️ Moderate | 1 DB read + 1 send per message; queue at high volume. |
| Read receipts (`markRead`) | ⚠️ Minor | One write per incoming message while a chat is open; debounce-able. |

## Details

### 1. User directory — FIXED
Previously `findMany` returned **every** user (≈1M rows/request) — fatal. Now cursor-paginated
(`orderBy id`, 20/page, indexed) → O(page), scales flat.
- **TODO**: `name contains` search scans all rows at 1M. Add a Postgres `pg_trgm` GIN index on
  `User.name` (or use a search service) before relying on search at scale.

### 2. Messages — FIXED
Previously subscribed to the **entire** message collection (a 50k-message chat = 50k reads on open).
Now: live subscription to the newest 30 (`orderBy createdAt desc, limit 30`) + `fetchOlderMessages`
pages on scroll-up. Bounded reads regardless of history length.

### 3. Typing — GOOD
`chats/{chatId}.typing.{uid}` is written **only on the false→true transition** and once on idle —
not per keystroke (that was fixed). ~2 writes per typing burst, only for users actively typing.
Negligible at scale.

### 4. Presence — IMPROVED (read fan-out removed)
Presence is now displayed **only inside an open chat** — a single `status/{peerId}` listener — instead
of one listener per directory row. This removes the read fan-out, which was the dangerous, super-linear
cost driver (a "hot" user watched by W people previously cost W reads per heartbeat).

Remaining cost is just the heartbeat **writes**: each online user writes `status/{uid}` every 25s
while foregrounded.
- 100k online / 25s = **4,000 writes/s** → ~345M/day → **~$620/day (~$18.7k/mo)**.
- Tunable without a rewrite via `HEARTBEAT_MS` / `ONLINE_TTL_MS` in `src/lib/presence.ts`
  (e.g. 60s heartbeat ≈ halves the cost).
- If presence cost is still too high at scale, move just the heartbeat to RTDB (`onDisconnect`,
  billed by bandwidth) or a Redis/websocket service.

> Each user still *publishes* their own presence globally (registered in `_layout.tsx`) so any chat
> they're opened in can read it; only the per-row directory *reads* were removed.

### 5. New-message FCM — MODERATE
`/api/chat/notify` does 1 indexed `fcmToken` read + 1 FCM send per message. Fine at moderate volume;
at very high message rates put it behind a queue/worker and cache tokens so the request path stays
cheap. The client call is already fire-and-forget.

### 6. Read receipts — MINOR
`markRead` writes a serverTimestamp whenever an open chat's message count changes — i.e. one write
per incoming message while you're viewing. Debounce to ~once / few seconds if message bursts are
common.

## Not performance, but required before production
Firestore is on **open test rules** (no Firebase Auth). Lock down with per-user rules (Firebase
custom-token auth) before launch — see `CHAT_SETUP.md`.
