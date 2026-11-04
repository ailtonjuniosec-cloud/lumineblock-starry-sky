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
