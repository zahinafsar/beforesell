# Existing BeforeSell template

Paths below are relative to `<repository>/my-video`. The current example is the Sara and Milan laptop story, `Beforesell-Story`: 1080 × 1920, 30 fps, eight scenes, 732 frames / 24.4 seconds. Inspect current files for later edits instead of treating these values as permanent.

## Reuse these files

| File | Purpose |
| --- | --- |
| `src/Art.tsx` | `Stage`, `Brand`, `BrandContacts`, `Character`, `Laptop`, `Heading`, `Reveal`, `Spark`, `Ground`, palette and easing |
| `src/Fonts.ts` | Local Story Sans regular/bold and Story Serif font loading |
| `src/Composition.tsx` | Explicit `Series.Sequence` story timeline, music and main composition |
| `src/Root.tsx` | Main video and individual scene registrations |
| `src/scenes/` | Eight reference scenes and working prop animations |
| `src/Narration.tsx` | Reference scene audio component; its paths and scene names belong to the existing story |
| `scripts/generate-narration.mjs` | Working local Liam generation, WAV encoding, silence reduction and speech-derived timing |
| `scripts/create-soundtrack.py` | Original procedural music, keyed by scene IDs and driven by the narration manifest |
| `STORY.md` | Current story, narration table and illustration prompts |
| `public/brand/beforesell-logo.svg` | Official mark copied from the marketplace |
| `public/illustrations/` | Transparent Sara and Milan poses: sad/searching and happy |
| `public/fonts/` | Local font files; reuse rather than relying on installed system fonts |

Palette: navy `#00487c`, blue `#0496ff`, ink `#14242f`, muted `#546c7b`. Canvas: `#ffffff`. The main heading style uses Story Sans bold, approximately 88–100 px, line height 1.04. Use navy and blue as accents in illustration and foreground objects.

`Character` currently selects only `sara` or `milan`, with an optional `happy` pose. For different subjects, use new transparent artwork and a story-specific image component rather than pretending an existing asset represents a materially different object. If image-generation tools are available, follow their applicable instructions. Read the existing illustration prompts in `STORY.md` when creating art. Preserve consistent clothing, face, line weight, palette, transparency and pose proportions across scenes. Do not overwrite approved character assets.

## Layout geometry

The shared Stage owns these spaces:

- Logo: x 84, y 100, size 42; reserve the top brand row through approximately y 200.
- Headlines: usually x 84, y 284, right margin 140. Keep their bottom above the scene's first foreground element.
- Story content: roughly y 530–1620.
- Footer: left/right 64, bottom 140. Facebook text is 26 px, website text is 30 px bold; reserve a clear band beginning around y 1700.

Useful character and object positions from the current scenes:

| Scene arrangement | Separate regions |
| --- | --- |
| Sara solo | Character x 0, y 540, width 620, height 1050; props begin around x 700 |
| Milan solo | Character x 400, y 540, width 620, height 1050; thought bubble x 60, y 620, width 280 |
| Listing | Character x 0, y 530, width 560, height 1060; phone x 650, y 650, width 320, height 640; laptop contained inside phone |
| Two people | Characters at x 0 and x 540, width 480 each; heights around 750–900, with y chosen to end by 1600 |
| Chat | Message bubbles occupy y 510–650; deal badge y 700–810; avatars begin at y 850 |
| Exchange | Laptop moves horizontally at y 500 with a small upward arc; payment travels in a separate row at y 720; avatars begin at y 850 |
| Happy ending | Avatars y 550–1450, short tagline around y 1500; no laptop or central logo covering a person |
| Closing card | Shared top-left logo, headline y 380, avatars y 580–1380, CTA y 1470, shared footer |

These are starting coordinates, not requirements for every story. Keep the same visual scale and allocate extra space if a different prop needs it. Consider the full movement envelope: character sway and rotation, Reveal translation, badge scale, and shadow. Avoid increasing scale or moving a badge through a character to add energy. Put motion in its own reserved area.

## Reference story beats

1. Sara's old laptop is slow; she cannot yet afford an upgrade.
2. She posts the laptop.
3. Milan wants that same laptop.
4. BeforeSell connects their needs.
5. They exchange quick messages and agree.
6. The laptop and money change hands in distinct visual lanes.
7. Both are happy; the sale contributes toward Sara's upgrade, without implying it necessarily pays for a new laptop.
8. Closing card invites viewers to the website and Facebook page.

For another story, reuse the need → listing → discovery → connection → conversation → exchange → benefit → brand rhythm when it fits. Adapt the item, people, and actions to the user's premise. Show concrete actions rather than repeating headlines against unchanged poses. Do not invent prices, guarantees, promotions, or marketplace features as facts.

## Isolated audio workflow for a new story

Create a new generator under `scripts/`, based on `generate-narration.mjs`. Retain the existing root resolution when the generator stays directly inside that directory. Change its scene script, output destination, manifest name as needed, and timing output path together:

- Media: `public/stories/<slug>/audio/`.
- Timing: `src/stories/<slug>/timing.ts`.
- Narration components: story-specific `Audio` nodes referencing those unique media paths, with `from={0}` and `premountFor={fps}`.
- Soundtrack: a story-specific adaptation of `create-soundtrack.py`, reading that story's manifest, defining a chord for every scene ID, and writing into that story's audio directory.

The current generator emits mono 24 kHz PCM WAV, validates the Liam voice, normalizes speech, trims ends with 3 ms fades, retains at most 100 ms of internal silence, and uses `ceil(speechDuration * fps)` for clip lengths. Its combined file aligns each clip to the corresponding scene frame. Keep these behaviors when adapting it. A model download may be necessary on the first run; report a generation failure accurately rather than using silent placeholder audio.

For the current story only, `npm run narration` and `python3 scripts/create-soundtrack.py` regenerate its assets and timing. Do not run those unchanged for a new story: they overwrite the current example.

Run the new story's generation scripts, then format authored files as appropriate. Leave tests and playback review to the user under the workspace instructions. Start or reuse Studio with `npm run dev -- --no-open --port 3333`, use the actual URL printed by the server, and link the new composition ID. The port may differ if already occupied. Export only on request, using the requested composition and a unique output filename.
