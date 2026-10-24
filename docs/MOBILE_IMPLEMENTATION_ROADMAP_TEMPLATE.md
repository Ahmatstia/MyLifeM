# Mobile Application — Implementation Roadmap Template

> **Purpose:** A reusable phased delivery plan for mobile apps. Adapt the feature order to the actual PRD; phases are gates, not a promise to implement every capability.

This roadmap intentionally favors vertical slices over large up-front scaffolding. A working, tested feature that goes through route → UI → logic → data → tests is more valuable than dozens of empty folders.

---

## Phase 0 — Understand and align the project

### Inputs

- Approved or draft PRD and MVP scope
- System/product architecture and domain model
- UI/UX design and design tokens
- Database schema/data model
- API contract and security/privacy requirements, if applicable

### Work

- [ ] Fill `PROJECT_PROFILE.md` from the actual project artifacts.
- [ ] Inspect the current repository and existing framework version if the project is not empty.
- [ ] List features/domains and rank MVP vs deferred scope.
- [ ] Identify domain invariants and relationships that must be preserved.
- [ ] Decide data source of truth for each data category.
- [ ] Decide authentication/session lifecycle and secure storage.
- [ ] Decide routing, state strategy, validation, and test tooling.
- [ ] Decide online-first, read cache, offline-write, or local-only behavior.
- [ ] Record unresolved material decisions in the profile/ADR; label assumptions honestly.
- [ ] Confirm no conflict between PRD, design, API contract, and data schema blocks the first vertical slice.

### Exit criteria

- [ ] The first vertical slice and its acceptance criteria are clear.
- [ ] The API/data source and failure behavior are known or explicitly mocked/blocked.
- [ ] Security and storage boundaries are defined sufficiently for the first feature.
- [ ] Deferred features are not accidentally included in the initial build.

**Deliverable:** updated project profile, feature map, first-slice plan, and necessary ADRs only.

## Phase 1 — Minimal foundation

### Work

- [ ] Create the project from the appropriate current framework template.
- [ ] Configure TypeScript/strict compiler options or the equivalent for the selected stack.
- [ ] Establish routing and root application layout.
- [ ] Establish design tokens and only the initial shared UI primitives needed.
- [ ] Add environment configuration with safe startup validation.
- [ ] Add centralized logging and an application-level error vocabulary where useful.
- [ ] Configure lint, typecheck, formatter, tests, and build scripts.
- [ ] Add `.gitignore` and a safe `.env.example`; verify secrets are not tracked.
- [ ] Add the architecture/engineering docs and the project profile.
- [ ] Verify the clean baseline build and test commands.

### Exit criteria

- [ ] App starts on supported development targets.
- [ ] Navigation shell works.
- [ ] Typecheck/lint/test baseline is recorded.
- [ ] No production secret or real user data is required to run local development.

Do not add auth, database, analytics, notification, or global state libraries unless the first slice requires them or the approved architecture has committed to them.

## Phase 2 — First vertical slice

Choose one small but representative user journey. It should exercise the architecture but not try to implement all features at once.

### Work

- [ ] Route entry is thin and imports a feature-owned screen.
- [ ] Screen composes feature-specific components.
- [ ] UI state/loading/error behavior has clear ownership.
- [ ] Business logic is placed in the appropriate application/domain module when needed.
- [ ] Data access goes through the repository/data boundary.
- [ ] DTO mapping and input validation are present at applicable boundaries.
- [ ] Unit tests cover core rules and edge cases.
- [ ] Repository integration or API adapter tests cover important data behavior.
- [ ] Component/E2E tests cover critical visible interactions where practical.
- [ ] Accessibility, empty/loading/error/success states are reviewed.

### Exit criteria

- [ ] The vertical slice meets acceptance criteria and passes relevant quality gates.
- [ ] The team can explain where a route, screen, rule, and data source belong.
- [ ] The pattern was reviewed before being copied into more features.

## Phase 3 — Core MVP features

Repeat the vertical-slice approach in PRD priority order.

For every feature:

- [ ] Record its owner, entities, dependencies, and MVP boundary.
- [ ] Confirm relevant screens/flows against the design.
- [ ] Add only the required component/use-case/domain/data modules.
- [ ] Reuse public shared components and contracts without reaching into another feature's internals.
- [ ] Cover success and failure paths.
- [ ] Confirm data integrity, migrations, permissions, and destructive flows as applicable.
- [ ] Run regression checks on previously completed slices.
- [ ] Update API/data contracts and profile if implementation revealed a real ambiguity.

### Exit criteria

- [ ] All agreed MVP acceptance criteria are implemented or explicitly blocked/deferred.
- [ ] There are no known critical data loss, authorization, or navigation defects.
- [ ] Cross-feature workflows follow the approved domain/system model.

## Phase 4 — Cross-cutting capabilities (only if in scope)

Potential capabilities:

- [ ] Authentication hardening and session recovery
- [ ] Offline caching or offline-write/synchronization
- [ ] Push/local notifications
- [ ] Search, pagination, filtering, or large-list performance
- [ ] Localization and date/time/number handling
- [ ] Analytics/crash reporting with privacy review
- [ ] Export/import/backup/restore
- [ ] Deep links and universal/app links
- [ ] Accessibility and platform-specific polish

For each capability, define requirements, failure behavior, data ownership, security/privacy impact, dependencies, tests, and an ADR when the decision materially changes architecture.

## Phase 5 — Release readiness

- [ ] Validate the actual production configuration without committing private secrets.
- [ ] Test account/session expiration and logout cleanup where applicable.
- [ ] Test no-network, slow-network, server errors, and stale cache according to data strategy.
- [ ] Test destructive operations and recovery paths.
- [ ] Review app permissions, dependency security, privacy disclosures, and logging.
- [ ] Run unit, integration, component, and selected E2E suites.
- [ ] Run release build on each supported platform.
- [ ] Verify app icon, splash, deep links, accessibility basics, and display sizes.
- [ ] Document install, run, test, build, environment setup, and known limitations.
- [ ] Prepare rollback/hotfix approach appropriate to release channel.

### Release gate

No release-ready claim without actual verification results. State precisely what was tested, on which target/configuration, and what remains unverified.

## Phase 6 — Maintain and evolve

Revisit architecture only when evidence warrants it.

Triggers include:

- the same business rule has been duplicated;
- one feature repeatedly imports another feature's internals;
- screen state and remote data are fighting each other;
- the app needs real offline-write and conflict handling;
- a new platform changes native requirements;
- large-list/startup performance fails an agreed target;
- data schema/API contract changes;
- a security/privacy risk is discovered.

For each proposed refactor, state the concrete problem, options, trade-offs, migration risk, and regression plan. Avoid speculative microservices, plugin systems, generic frameworks, and premature abstractions.

## Reusable vertical-slice completion checklist

- [ ] One clear user outcome from the PRD is achieved.
- [ ] Route, screen, component, presentation state, business rules, and data access have explicit responsibilities.
- [ ] The data source of truth and offline behavior are clear.
- [ ] Validation and error behavior are covered.
- [ ] Tests match the risk of the change.
- [ ] Existing feature regressions were checked.
- [ ] Design-system and accessibility expectations are met.
- [ ] No unrelated feature scope was included.
- [ ] Documentation/profile/ADR was updated only where necessary.
- [ ] The completion report lists actual checks and results.
