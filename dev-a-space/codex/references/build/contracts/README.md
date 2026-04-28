# Build Contracts

These are the **typed** integration contracts between Dev A (identity/community) and Dev B (funding/pipelines).

If a type lives here, it is a cross-domain agreement. If it lives in `lib/auth/types.ts` or `lib/funding/types.ts`, it is internal to one domain and may change without coordination.

## Status legend

Each type is annotated in the file with a `// STATUS:` line:

- **LOCKED** — frozen for V2.P1 onward. Changing it requires a documented decision (see `build/decisions/` if/when added) and an update note in both dev progress files.
- **DRAFT** — agreed shape but minor field changes still allowed during V2.P1 setup. Becomes LOCKED at the V2.P1 completion gate.
- **STUB** — placeholder; the owning dev fills it in by the named gate.

## Files

| File | Owner of source-of-truth | Purpose |
|---|---|---|
| `role.ts` | Dev A | The single role enum used by both domains. |
| `profile.ts` | Dev A | `Profile` and the three role-specific profile shapes. Funding matching reads these. |
| `session.ts` | Dev A | What Dev B can read off the current session for visibility/RLS decisions. |
| `funding.ts` | Dev B | `FundingItem`, `FundingQuery`, `FundingSummary`, `FundingPreferences`, and published funding/preference helper signatures. |
| `route-policy.ts` | Dev A (registry), Dev B (registers entries) | Per-route role gating registry, so middleware (Dev A) does not need cross-domain edits when Dev B adds a route. |

## How to use

These files are imported as types only. The runtime implementation lives in each developer's `lib/` folder.

```ts
// in lib/funding/queries.ts (Dev B owned)
import type { Role, Session } from "../../build/contracts/session";
import type { FundingItem, FundingQuery } from "../../build/contracts/funding";
```

Yes, `build/` is outside `app/` and `lib/`. That is intentional: it makes the contracts visually obvious as cross-domain. Add `"build/contracts/*"` to `tsconfig.json` `paths` during V2.P1 bootstrap so imports become `@contracts/funding`.

## Change protocol

1. The owning dev opens a PR that edits the contract file.
2. The other dev must approve before merge.
3. The PR description names the gate at which the change becomes effective.
4. Both dev `progress.md` files get a one-line entry under "Contract changes consumed."

No silent contract changes. No implicit field additions.
