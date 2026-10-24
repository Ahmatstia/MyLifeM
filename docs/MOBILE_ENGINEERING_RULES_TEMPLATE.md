# Mobile Application — Engineering Rules Template

> **Scope:** Reusable rules for multiple mobile projects.  
> **Companion docs:** `MOBILE_ARCHITECTURE_TEMPLATE.md`, `PROJECT_PROFILE_TEMPLATE.md`, `MOBILE_IMPLEMENTATION_ROADMAP_TEMPLATE.md`.  
> **Purpose:** Keep code maintainable, testable, secure, and consistent without imposing unnecessary boilerplate.

Use these as defaults. A project may override a rule only when the reason and trade-offs are recorded in its `PROJECT_PROFILE.md` or an ADR. A rule must never override a product's approved requirements or a framework's security constraints.

---

## 1. Non-negotiable engineering rules

1. Keep UI rendering separate from business rules and persistence details.
2. A screen/component must not call API/database/storage directly unless the architecture explicitly designates it as a narrowly scoped adapter.
3. Inner business rules must not import framework UI, routing, HTTP clients, or database drivers.
4. Every important business rule must have one clear owner; do not duplicate calculations across screens.
5. Use explicit types and strict compiler settings where the stack supports them. Do not use untyped escape hatches to conceal unclear contracts.
6. Make the source of truth for each data category explicit: backend, local database, or cache.
7. Client-side validation improves UX but does not replace backend validation or authorization.
8. A feature must handle relevant loading, empty, success, failure, offline, permission, and expired-session states.
9. Add tests around business rules, data boundaries, and important user journeys.
10. Do not add an abstraction, package, architecture layer, global store, or background process without a concrete need.
11. Do not change domain/schema/API contracts silently. Record consequential decisions in an ADR.
12. Never leave the codebase in a knowingly broken state while claiming the feature is complete.

## 2. Naming conventions

Use the conventions native to the chosen language/framework when they conflict with examples below. Record the final convention once in the project profile.

| Item | Suggested convention (TypeScript example) | Example |
|---|---|---|
| File/folder | `kebab-case` | `record-detail-screen.tsx` |
| React component | `PascalCase` | `RecordDetailScreen` |
| Hook | `use` + `camelCase` | `useRecordDetail` |
| Function/variable | `camelCase` | `calculateTotal` |
| Type/interface/class | `PascalCase` | `RecordRepository` |
| Constant | `UPPER_SNAKE_CASE` for true global constants | `DEFAULT_PAGE_SIZE` |
| Test file | source name + test suffix | `calculate-total.test.ts` |
| Use case | action + `.use-case` | `create-record.use-case.ts` |
| DTO | entity/contract + role | `record-response.dto.ts` |
| Mapper | entity + `.mapper` | `record.mapper.ts` |

Avoid unclear names such as `helper.ts`, `common.ts`, `manager.ts`, `misc.ts`, or `utils.ts` as a permanent home for unrelated logic. Prefer a name that expresses the capability and ownership.

## 3. File and component boundaries

- A file should have one primary reason to change, not necessarily only one function.
- Do not split every helper function into a separate file. Cohesion is more important than file count.
- A screen should compose a page from sections/components and presentation state; extract independent sections when it improves reading, testing, reuse, or ownership.
- A visual component should receive clear props and should not need to know whether data came from REST, local database, or a mock.
- Use explicit input/output types for public module boundaries.
- Keep route/navigation files thin. Route files connect navigation parameters to the relevant screen; they do not own workflows.
- Avoid circular dependencies. Feature A must not reach into Feature B's private implementation files.
- Use a barrel/public `index` file only where it defines an intentional public API. Do not create barrel files mechanically for every directory.

### File length heuristic

Line count is a review signal, not a pass/fail rule. When a screen is around 200–300 lines or a module becomes hard to reason about, review whether it has multiple independent responsibilities. Keep cohesive logic together even if the file exceeds a suggested threshold. Do not split code only to make files smaller.

## 4. Layer-specific rules

### Presentation

Allowed:
- render UI and accessibility semantics;
- manage short-lived view/form state;
- call presentation hooks, controllers, or application actions;
- format data for display;
- handle navigation and feedback.

Not allowed:
- direct `fetch`, SQL, local DB, or secret storage access from ordinary screens/components;
- canonical business calculations duplicated across screens;
- concrete repository construction scattered across UI;
- placing an entire workflow in one large event handler;
- treating a hidden/disabled UI action as authorization.

### Application / use cases

- Name actions in business/user terms, not framework terms.
- Depend on stable contracts and return predictable outcomes.
- Orchestrate multiple repositories when required.
- Keep navigation and rendering outside the use case.
- Do not add a use-case wrapper around every one-line operation without a reason.

### Domain

- Keep domain concepts and rules independent of storage/transport formats.
- Use finite typed values for statuses, categories, and priorities when the domain has a known set.
- Put an invariant where it can be enforced consistently, not in just one screen.
- Prefer pure functions for calculations when practical.
- Do not reproduce an entire backend schema as a second model layer automatically. Map only where semantic or compatibility boundaries justify it.

### Data / infrastructure

- Isolate HTTP, database, filesystem, platform SDK, and vendor-specific code in adapters/data sources.
- Map API/storage DTOs to application/domain models at the boundary.
- Make parsing/validation of untrusted API data explicit when appropriate.
- Keep retry/cache/pagination/sync policy within the data boundary or a clearly owned application workflow.
- Do not leak raw HTTP responses or database driver objects to presentation.

## 5. State ownership

Pick state by lifetime and ownership:

| State | Default owner | Rule |
|---|---|---|
| Modal, accordion, selected tab | Component/screen | Keep local unless it must survive/navigation-share |
| Form draft | Form/presentation | Keep separate from persisted server data |
| API records/cache | Query/repository layer | Define freshness, invalidation, pagination, and errors |
| Cross-screen preferences | App-level state or preferences adapter | Only if genuinely shared |
| Persistent business data | Repository and chosen source of truth | Avoid multiple writable copies |
| Authentication secrets | Platform-secure storage adapter | Never ordinary preferences or source code |
| Derived values | Computed selector/function | Do not persist duplicate values without a reason |

Do not use a global state store as the default location for all application data. Don't combine multiple state-management systems without documenting which owns which kind of state.

## 6. Type safety, validation, and error behavior

- Prefer strict typing and explicit return types on public boundaries.
- Avoid `any` or equivalent dynamic escape hatches; if unavoidable, isolate and validate them at the boundary.
- Validate user input for immediate feedback.
- Re-check business rules in application/domain code.
- Validate API inputs and enforce authorization on the backend for server-owned data.
- Normalize infrastructure errors into a small, documented application error vocabulary.
- Preserve actionable error context for logs without exposing sensitive data to the user.
- Never silently convert failures to success, empty data, or a fake default value unless that fallback is an explicit product rule.
- Handle duplicate taps, retries, timeouts, and partial failures when they could cause duplicate mutations or inconsistent state.

## 7. API, persistence, and offline rules

Every project must state its data strategy in `PROJECT_PROFILE.md`:

- **Online-first:** server is authoritative; mutations require connectivity unless designed otherwise.
- **Read cache:** server remains authoritative; define cache freshness and stale-data UI.
- **Offline-write/local-first:** specify local source of truth or pending-write queue, idempotency, retry, conflict resolution, deletion semantics, and unsynced-state UX.
- **Fully local:** specify local schema migrations, backup/export, restore, corruption recovery, and device-loss assumptions.

Additional rules:

- A mobile application should not connect directly to a server's production database.
- Do not add a local database solely for speculative future use.
- Do not claim “offline-first” just because some reads are cached.
- Avoid storing sensitive secrets in ordinary key-value preferences.
- Make schema migration and user-data preservation part of a persistence change review.
- Use environment configuration for public build-time values; never bundle private server credentials into a mobile binary.

## 8. Security and privacy

- Commit `.env.example`, not actual secret values.
- Never hardcode API private keys, signing credentials, passwords, or production tokens.
- Assume input and API response payloads can be malformed or malicious.
- Server authorization is authoritative for protected server resources.
- Securely store session secrets; document refresh, expiration, logout, account switching, and local data cleanup.
- Redact tokens, passwords, personal data, and sensitive request payloads from logs/crash reporting.
- Request only the platform permissions required by current features.
- Review dependencies and native permissions before adding packages.
- Consider export, deletion, retention, backup, and local storage privacy where product requirements make them relevant.
- Test unauthorized, expired-session, and forbidden paths wherever authentication is involved.

## 9. Dependency and configuration policy

- Prefer the framework's supported installation/version-selection command where applicable.
- Do not upgrade the whole dependency tree as an unrelated part of a feature.
- Before adding a library, explain what need it solves, whether the framework already supports it, its maintenance/security profile, and its impact on bundle/native builds.
- Keep environment configuration typed/validated at app startup where practical.
- Centralize technical configuration, not business behavior.
- Use dependency injection/composition at a clear app boundary. Avoid runtime service locators used unpredictably throughout the UI.
- Make test configuration isolated from real user data, production services, and developer-specific databases.

## 10. Testing rules

Test the behavior at the smallest level that proves the contract.

| Test level | What to cover |
|---|---|
| Unit | Business rules, pure calculations, validation, mapping, boundary conditions |
| Use case/application | Workflow sequence, preconditions, success/failure, multiple dependencies |
| Repository integration | Mapping, persistence, cache/sync, API contract behavior |
| Component/UI | Important interactions, empty/loading/error states, accessible labels/roles |
| End-to-end | Critical real user journeys on supported device/simulator |

Minimum expectations:

- no test silently writes to the production or developer's personal database;
- fixtures are deterministic where possible;
- test both success and relevant failure paths;
- cover edge cases such as empty data, malformed values, duplicate submissions, no network, expired auth, and storage failure when relevant;
- use mocks/fakes at external boundaries, but avoid mocking every internal function so tests do not merely mirror implementation;
- run the existing checks before and after changes.

## 11. Accessibility and UX quality

- Interactive controls have accessible labels/roles and meaningful focus behavior.
- Touch targets, text scaling, contrast, and screen-reader semantics are considered for supported platforms.
- Async actions expose progress and prevent confusing duplicate submissions where appropriate.
- Destructive actions have clear consequences and appropriate confirmation/undo patterns according to risk.
- Empty states explain what is missing and the next useful action.
- Errors should tell the user what they can do, not expose a stack trace.
- Respect reduced-motion/platform preferences when relevant.

## 12. Git and change management

- Keep changes focused on one coherent feature/fix/refactor.
- Do not rewrite unrelated files or formatting across the repository unless requested or necessary.
- Do not discard user changes.
- Before modifying an established project, inspect the actual files, scripts, dependency versions, and existing conventions.
- Update documentation when the behavior, contracts, architecture, or setup changes.
- Use ADRs for decisions that materially affect future work; avoid an ADR for every minor implementation detail.
- A completion report must distinguish checks that ran and passed from checks that were not run.

## 13. Code review checklist

Before marking work complete, ask:

- [ ] Is each new file in the layer/feature that owns it?
- [ ] Does UI remain free of business rules and direct persistence access?
- [ ] Are dependencies flowing in the intended direction?
- [ ] Is the source of truth clear for the data touched?
- [ ] Are loading/empty/error/success and relevant offline states handled?
- [ ] Are error messages safe and actionable?
- [ ] Are permissions/auth enforced at the correct boundary?
- [ ] Are types, validation, and accessibility considered?
- [ ] Are important success and failure paths tested?
- [ ] Are migrations/backward compatibility needed?
- [ ] Was a new library or abstraction actually necessary?
- [ ] Did any unrelated behavior change?
- [ ] Were typecheck/lint/tests/build run where supported? Are results reported truthfully?
- [ ] Do docs/profile/ADR require an update?

## 14. Instructions for AI coding agents

When this file is provided to a coding agent:

1. Read the project profile and approved product/design/schema/API artifacts first.
2. Inspect the actual repository before proposing changes; do not assume the example tree already exists.
3. Reuse current patterns when they are sound; identify concrete problems before replacing them.
4. Do not treat examples as required features or create empty future folders.
5. Keep changes within the requested phase/scope.
6. Explain material conflicts between requirements, schema, and code rather than silently resolving them.
7. Implement incrementally, validate after each vertical slice, and report actual tests/builds performed.
8. If a major decision is missing, document options and a safe recommendation; do not invent a settled business requirement.
