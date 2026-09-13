Type: grilling
Status: resolved

## Question

On bot create (and re-triggerable from bot edit), generate a low-poly-face avatar the user can click to regenerate. Resolve: generation mechanism (image-gen API call vs deterministic algorithmic low-poly SVG from a seed), what triggers regeneration (new random seed each click vs a fresh model call each click), and storage (`bots.avatar_url` pointing at a stored image vs `bots.avatar_seed` regenerated client-side each render).

## Answer

- **Mechanism**: deterministic algorithmic low-poly SVG generated from a seed — no external image-gen API, no cost/latency/key management. Same seed always reproduces the same face.
- **Regenerate**: clicking "regenerate" picks a new random seed; the SVG renders instantly client-side from it.
- **Storage**: `bots.avatar_seed` only (small int/string) — no rendered blob stored, no `avatar_url`. The SVG is recomputed client-side from the seed on every render.
