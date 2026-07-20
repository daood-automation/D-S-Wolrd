# D·S World

A private, warm, PIN-locked home screen for Daood and Saima.

## Phase 1 (this push)
- Arrival / PIN screen: slow handwritten welcome text, PIN set-up on first
  use, soft tap + unlock sounds, random "threshold" phrase before entry.
- Home screen: presence cards for Daood (Lahore) and Saima (Faisalabad)
  with live local time, tap-to-set-your-own-photo avatars, a
  change-our-home-photo button, four placeholder tiles (step into our
  world / whisper something / add a memory / relive our story), and a
  bottom nav.
- Installable PWA (manifest + service worker, works offline once loaded).
- Pure static site — no backend yet. Photos and the PIN are stored in
  the browser's localStorage on each device for now; this will move to
  Neon Postgres + R2 once accounts and sync are built in the next phase.

## Deploy
Static site — point Cloudflare Pages at this repo with no build command,
output directory `/`.

## Next phase (not built yet)
Accounts + shared realtime state (Cloudflare Worker + Durable Object),
Neon Postgres, R2 media storage, the actual "world" rooms, messaging,
and memories/diary.
