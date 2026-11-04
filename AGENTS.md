<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Game rules live in `src/game/engine.ts` as pure functions (board = flat Uint8Array); keep UI out so logic stays unit-testable.
- Local persistence goes through the stores in `src/lib/storage.ts` (useSyncExternalStore); no backend, the game must work offline.
- Board cells are memoized components; drag position updates the floating piece via ref transforms, React state changes only when the hovered cell changes.
- Ambient effects use radial gradients, not animated blur filters, for mid-range Android performance.

- i18n: UI text lives in src/i18n/locales/<code>.json (one file per language, same keys as pt-BR.json) and is registered in src/i18n/languages.ts; only the active locale is lazy-loaded. Why: easy to add/review languages without runtime machine translation.
- Audio is synthesized with Web Audio in src/lib/audio.ts (no audio files). Why: tiny bundle, original sounds, voice cap prevents overlap.
- Board/tray geometry stays dir="ltr" even in RTL languages. Why: drag-and-drop math assumes left-to-right columns.
- Piece availability and game over are re-derived from the current board on every render in play.tsx (plus reducer `over`). Why: never rely on a stale check after lines clear.
- Android: Capacitor wraps the SPA build (`spa.enabled`); `bun run build:android` copies _shell.html to index.html and strips all manifest permissions. Why: fully offline, no INTERNET permission needed for bundled assets.
- Fonts are bundled via @fontsource imports in styles.css, never CDN links. Why: offline/privacy.
