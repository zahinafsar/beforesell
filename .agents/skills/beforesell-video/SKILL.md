---
name: beforesell-video
description: Create or revise BeforeSell animated marketplace reels using the existing my-video Remotion project, its illustrated avatars, official branding, and Liam narration. Use for requests for another similar BeforeSell story, product reel, or animated promotional video.
---

# BeforeSell video

Create a complete, editable video in the established BeforeSell style. Infer a workable story from the request and proceed; ask only when a missing fact materially changes the result. Treat the choices below as defaults for similar videos, subject to the user's current instructions.

## Locate the template

This skill is installed inside the BeforeSell repository under `.claude/skills/beforesell-video` or `.agents/skills/beforesell-video`. The video project is `<repository>/my-video`, separate from the Next.js marketplace at the repository root. Run video commands from `my-video`.

Read the applicable repository instructions, then [references/template.md](references/template.md) for the exact reusable files, audio workflow, and layout coordinates. Inspect current source before changing it; preserve user edits.

For another video, give it a unique story slug and composition ID. Keep its source under `my-video/src/stories/<slug>/`, its generated media under `my-video/public/stories/<slug>/`, and its generation scripts under `my-video/scripts/`. Register it in `src/Root.tsx` without replacing the existing `Beforesell-Story` or its audio. A request to improve the current video should edit that video instead of creating a duplicate.

## Style and pacing

- Default to a vertical 1080 × 1920 reel, 30 fps, for Facebook, Instagram, and TikTok.
- Use the existing navy, black, and white hand-drawn avatars with expressive faces. Keep characters large, clearly visible, and softly highlighted with the existing silhouette shadow. Reuse approved art when it suits the story.
- Keep the canvas plain white. The user removed decorative gradients, blobs, texture, and background circles. Add visual interest through actions, props, scene cuts, message bubbles, and small animated emphasis marks.
- Use short bold headlines, usually 2–5 words. Let speech explain the story. Avoid subtitle-like paragraphs, repeated labels, and oversized blocks of text.
- Aim for a brisk 20–30 second story when the user has not specified length. Choose enough distinct visual beats to avoid long static scenes; the reference has eight parts, but the story determines the count.
- Animate meaningful actions: posting an item, a buyer noticing it, a conversation, an exchange, and a happy result. Use quick entrances around 0.14–0.24 seconds and complete simple actions within roughly the first second of a scene.
- Drive animation with `useCurrentFrame()`, `useVideoConfig()`, and `interpolate()`. Do not use CSS animation, transition timers, or unseeded randomness.

## Branding and clear layout

Use `Stage` from `src/Art.tsx` for consistent framing. It already puts the official logo at the top left and the two brand links at opposite ends of the bottom row. Keep this placement in every scene, including the happy ending and closing card.

- Official logo asset: `public/brand/beforesell-logo.svg`. Do not redraw or substitute it.
- Facebook destination: `https://www.facebook.com/beforesell.official`, displayed as `facebook.com/beforesell.official` at the bottom left.
- Website destination: `https://beforesell.com`, displayed as `beforesell.com` at the bottom right.
- Keep the footer horizontal with `justifyContent: "space-between"`, readable text, and no wrapping. Do not center or stack the brand links.
- Keep avatars, text, props, badges, and their animated travel paths in separate spaces. Reserve room for rotation, shadows, entrances, and scaling at their maximum extent. A laptop inside its listing card is intentional containment; a laptop covering someone's torso is a layout error.
- In the happy ending, show happy people without an extra floating laptop. Put sale props in the exchange scene and remove them afterward.

## Narration and sound

Use the selected Liam American Male voice: Kokoro `am_liam`, model `onnx-community/Kokoro-82M-v1.0-ONNX`, q8 on CPU, speed 1.16. Reuse the existing local npm `kokoro-js` implementation; do not introduce a paid provider or change the voice without a request.

Adapt the existing narration generator for the new story. Generate a WAV for each scene, a combined track, a manifest, and isolated timing data. Keep speech starting at frame zero, trim leading and trailing silence, and cap internal pauses at 100 milliseconds. Derive scene duration from the generated speech rather than stretching it across fixed holds. Preserve the generator's sample-rate and voice validation.

Write “Before Sell” in synthesis text for pronunciation and display “BeforeSell” visually. Include the website and Facebook handle in the closing narration when useful, as in the reference. Adapt the original quiet soundtrack to the new scene IDs and total duration so it remains underneath the speech.

## Finish within the requested scope

Register the full video and independently useful scenes as separate authored composition nodes. Use `staticFile()` for assets, `CanvasImage` for images, and `Audio` from `@remotion/media` for sound. Use the composition fps for timing and one-second premounting on supported media and sequences.

Follow the user's workspace restrictions: do not add code comments; do not add or run automated tests or manual/browser playback checks. Audio generation and requested artifact creation are production steps, not permission to test. Do not claim the result was visually reviewed or played back.

Make the new composition available in Remotion Studio, starting it with `--no-open` if necessary, and return its printed local URL with a brief description. Do not render an MP4 unless the user asks for export/render. Do not publish the video to social media as part of creating it.
