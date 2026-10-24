# Mobile Application — Architecture & Folder Structure Template

> **Jenis dokumen:** Template arsitektur lintas proyek mobile  
> **Status:** Reusable baseline; perlu diadaptasi melalui `PROJECT_PROFILE.md`  
> **Default implementasi konkret:** React Native + Expo + TypeScript + Expo Router  
> **Prinsip:** feature-first, separation of concerns, dependency inward, UI tipis, source of truth jelas, dan kompleksitas bertambah hanya ketika dibutuhkan.

---

## 1. Tujuan dan cara memakai template

Dokumen ini adalah fondasi arsitektur untuk **lebih dari satu proyek aplikasi mobile**. Dokumen ini tidak mengasumsikan nama produk, fitur bisnis, model database, jenis pengguna, atau backend tertentu.

Template dibuat agar proyek-proyek baru tidak membutuhkan riset dan penulisan arsitektur dari nol setiap kali. Untuk proyek baru:

1. Salin paket template ke repositori baru atau folder `docs/architecture/`.
2. Isi `PROJECT_PROFILE.md` dengan stack, platform, bentuk penyimpanan, autentikasi, domain, serta batas MVP proyek tersebut.
3. Berikan PRD, system architecture, design system, dan schema/database design yang sudah disepakati kepada coding agent.
4. Jalankan `AI_AGENT_BOOTSTRAP_PROMPT.md` agar agent memetakan artefak proyek ke template.
5. Catat hanya keputusan yang benar-benar spesifik terhadap proyek di `docs/architecture/adr/`.

**Jangan menyalin semua fitur dari contoh ke proyek baru.** Folder dan layer adalah pola, bukan daftar fitur wajib. Jangan membuat folder kosong hanya karena muncul di contoh.

### 1.1 Cakupan

Template ini membahas:

- struktur folder yang tumbuh bersama fitur;
- pemisahan route, screen, UI components, presentation state, application/use cases, business logic, repository, dan data source;
- batas dependensi antar-layer dan antar-feature;
- API, local storage, cache, offline-first, dan sinkronisasi;
- validasi, error handling, security, testing, dokumentasi, dan perubahan arsitektur;
- cara AI coding agent menggunakan template dengan konsisten.

Template ini **bukan** pengganti PRD, domain model, database schema, UI design, API contract, maupun deployment plan. Setiap artefak tetap menjadi sumber kebenaran pada topik masing-masing.

## 2. Prinsip dasar

1. **Feature-first:** kode dikelompokkan terutama berdasarkan kemampuan/feature produk, bukan satu folder global berisi semua screen atau semua service.
2. **Layered:** setiap feature memisahkan presentasi, orchestration aplikasi, aturan domain, dan detail data sesuai kompleksitasnya.
3. **Dependency inward:** aturan bisnis tidak mengetahui framework UI, navigation, HTTP client, database driver, ataupun platform SDK.
4. **UI tipis:** screen merender state dan meneruskan aksi; screen bukan tempat utama business logic.
5. **Single source of truth:** setiap jenis data memiliki pemilik yang jelas. Cache bukan sumber kebenaran tanpa keputusan eksplisit.
6. **Boundary eksplisit:** feature berbagi kode melalui public API atau shared module yang disengaja, bukan mengimpor file internal feature lain secara acak.
7. **Testability:** aturan bisnis utama dapat diuji tanpa men-render screen atau menjalankan perangkat.
8. **Progressive complexity:** abstraksi ditambahkan berdasarkan kebutuhan nyata, bukan untuk memenuhi jumlah file tertentu.
9. **API/database boundary:** aplikasi mobile tidak boleh terhubung langsung ke database server. Mobile berkomunikasi melalui API/service contract yang diotorisasi.
10. **No silent architecture changes:** perubahan besar pada storage, sync, auth, domain, atau dependency harus ditulis dan ditinjau melalui ADR.

## 3. Layered architecture

### 3.1 Diagram konsep

```text
┌──────────────────────────────────────────────────────┐
│ PRESENTATION                                         │
│ Route adapter · Screen/View · UI Components · UI state│
└──────────────────────────┬───────────────────────────┘
                           │ user intent / displayed state
                           ▼
┌──────────────────────────────────────────────────────┐
│ APPLICATION                                          │
│ Use cases · orchestration · application-level types  │
└──────────────────────────┬───────────────────────────┘
                           │ depends on contracts
                           ▼
┌──────────────────────────────────────────────────────┐
│ DOMAIN (when business complexity warrants it)        │
│ Entities · value objects · invariants · ports         │
└──────────────────────────▲───────────────────────────┘
                           │ implemented by
┌──────────────────────────┴───────────────────────────┐
│ DATA / INFRASTRUCTURE                                │
│ Repository adapters · remote/local source · mappers  │
│ HTTP · local database · secure storage · platform SDK│
└──────────────────────────────────────────────────────┘

Composition root wires concrete implementations together.
```

**Dependency direction** (compile-time imports) points inward. The data layer may implement repository interfaces owned by a stable inner layer. The composition root is an outer boundary allowed to know concrete implementations and inject them.

Conceptual flow for a write action:

```text
Route → Screen → presentation hook/controller → use case
      → repository contract → repository implementation
      → remote/local data source → mapper → result/state
```

Simple screens do not need every element in the diagram. A small read-only feature can use a query hook plus repository without introducing a domain service or a one-line use case. Add an abstraction when it isolates a meaningful rule, integration, or test seam.

### 3.2 Presentation layer

**Responsibilities**

- Show the screen and feature-specific UI.
- Manage short-lived presentation state: open modal, selected tab, form draft, loading/error feedback.
- Translate user interaction into an application action.
- Format values for display without changing business meaning.
- Handle navigation and accessible interaction.

**Must not own**

- HTTP requests, SQL queries, or direct AsyncStorage/SecureStore access;
- canonical business formulas or invariants reused elsewhere;
- persistence-to-domain mapping;
- permissions/security decisions that must be enforced by a server;
- large orchestration flows hidden inside button handlers.

**File meanings**

- **Route:** framework entry point and navigation wiring; it should import a screen and pass only route params or composition concerns.
- **Screen/View:** composes feature components and subscribes to its presentation state.
- **Component:** reusable visual unit; receives explicit props and does not know where data originated.
- **Presentation hook/controller/view model:** loads data and exposes UI-ready state/actions. It may call application use cases or read/query abstractions.
- **Form schema:** input shape and UX validation; this is not a replacement for domain or server validation.

### 3.3 Application layer

**Responsibilities**

- Express a meaningful user/system action, such as `CreateRecord`, `CompleteItem`, or `GetHomeOverview`.
- Coordinate repository calls when an action spans more than one data source.
- enforce application workflow order and preconditions;
- expose a stable result/error contract to presentation;
- request external side effects via a port where appropriate.

Use cases should not import React, React Native, Expo Router, component libraries, or a concrete HTTP/database implementation.

**Rule of thumb:** create a use case when it encapsulates meaningful behavior, orchestration, validation, or reusable application action. Do not mechanically create a class/file for every getter or every CRUD endpoint if it adds no boundary or value.

### 3.4 Domain layer

Use this layer when the project contains business rules worth protecting from UI and infrastructure details.

Possible contents:

- business entities and value objects;
- typed status/category/priority values;
- invariants and calculations;
- business policies and domain services;
- repository interfaces/ports;
- domain-specific errors.

Domain rules should be deterministic where possible, easy to unit-test, and independent of framework/database classes. A domain model is not necessarily identical to a REST DTO or a database row.

For a small CRUD app with very little business logic, keep the domain layer lightweight. Do not create artificial entities, factories, and services merely to mirror a diagram.

### 3.5 Data / infrastructure layer

**Responsibilities**

- Implement repository contracts.
- Read/write remote API or local storage.
- Convert transport/storage representations to application/domain models.
- Implement caching, retry, pagination, and sync mechanics according to policy.
- Encapsulate platform APIs and third-party SDKs.

Possible contents:

- remote data source (HTTP/API client);
- local data source (SQLite/AsyncStorage/etc., if selected);
- repository implementation;
- request/response DTOs;
- mappers and transport schema validation;
- adapters for secure storage, notifications, files, camera, location, or analytics.

Data sources are not allowed to silently redefine business meaning. DTOs stay at transport boundaries; do not pass raw response objects across every layer just because TypeScript permits it.

### 3.6 Shared, core, and feature code

- `features/` owns code that has clear business/feature ownership.
- `shared/ui/` owns genuinely reusable visual primitives that do not belong to a single feature.
- `core/` owns technical cross-cutting capabilities such as config, logging, error normalization, network base client, and secure storage adapters.
- `app/` owns route/navigation entry points and application composition, not domain behavior.

Avoid a universal `utils/`, `helpers/`, `services/`, or `types/` dumping ground. A function should live beside its owner unless it is truly generic.

## 4. Recommended folder structure — React Native + Expo + TypeScript

This is the concrete default for projects that use the same stack. `PROJECT_PROFILE.md` can override the route root or omit capabilities that are not needed.

```text
mobile-app/
├── app/                            # Expo Router route files only
│   ├── _layout.tsx                 # Root layout/provider composition
│   ├── index.tsx                   # Redirect or initial route wiring
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx             # Thin route adapter
│   │   └── onboarding.tsx
│   └── (main)/
│       ├── _layout.tsx
│       ├── index.tsx               # Thin route adapter
│       └── [feature]/
│           ├── index.tsx
│           └── [id].tsx
├── src/
│   ├── app/                        # Optional app composition helpers
│   │   ├── providers/
│   │   ├── bootstrap/
│   │   └── navigation/             # Only if not represented by Expo Router
│   ├── core/                       # Technical infrastructure used cross-feature
│   │   ├── config/
│   │   ├── errors/
│   │   ├── logging/
│   │   ├── network/
│   │   ├── security/
│   │   ├── storage/
│   │   └── telemetry/              # Optional
│   ├── shared/
│   │   ├── ui/                     # Button, TextField, Modal, etc.
│   │   ├── hooks/                  # Truly cross-feature hooks only
│   │   ├── formatters/              # Generic display formatting only
│   │   └── types/                  # Small set of genuinely shared types
│   ├── features/
│   │   └── [feature-name]/
│   │       ├── presentation/
│   │       │   ├── screens/
│   │       │   ├── components/
│   │       │   ├── hooks/          # View/presentation state
│   │       │   ├── state/          # Feature UI state only, if needed
│   │       │   └── validation/     # Form/input schemas
│   │       ├── application/
│   │       │   ├── use-cases/
│   │       │   ├── queries/        # Optional read/query operations
│   │       │   └── dto/            # Application input/output types if needed
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   ├── value-objects/
│   │       │   ├── rules/
│   │       │   ├── repositories/   # Interfaces/ports
│   │       │   └── errors/
│   │       ├── data/
│   │       │   ├── repositories/   # Concrete implementations
│   │       │   ├── data-sources/
│   │       │   │   ├── remote/
│   │       │   │   └── local/
│   │       │   ├── dto/            # API/storage representations
│   │       │   └── mappers/
│   │       └── index.ts            # Optional intentional public API
│   └── test-utils/                 # Reusable test helpers, if needed
├── assets/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── component/
│   └── e2e/
├── docs/
│   ├── architecture/
│   │   ├── PROJECT_PROFILE.md
│   │   ├── MOBILE_ARCHITECTURE_TEMPLATE.md
│   │   ├── MOBILE_ENGINEERING_RULES_TEMPLATE.md
│   │   ├── MOBILE_IMPLEMENTATION_ROADMAP_TEMPLATE.md
│   │   └── adr/
│   └── product/                    # Links/copies of PRD/design contracts as appropriate
├── scripts/
├── .env.example
├── .gitignore
├── AGENTS.md                       # Agent workflow and project-specific truth
├── app.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

### 4.1 Do not create every folder immediately

Start with the folders needed for the first end-to-end feature and create the others as implementation requires them. The diagram is the **target organization**, not a mandatory empty scaffold.

A minimal start may be:

```text
app/
  _layout.tsx
  index.tsx
src/
  core/
  shared/ui/
  features/
    [first-feature]/
      presentation/
      data/
      application/     # Add when logic/orchestration needs a distinct boundary
      domain/          # Add when meaningful domain rules exist
```

### 4.2 Expo Router routes are not the screen implementation

With Expo Router, files under `app/` are URL/navigation declarations and entry points. Keep them thin. Store screen implementations in the owning feature, for example:

```tsx
// app/(main)/[feature]/index.tsx
import { FeatureListScreen } from '@/features/[feature-name]/presentation/screens/feature-list-screen';

export default function FeatureListRoute() {
  return <FeatureListScreen />;
}
```

This makes navigation changes less likely to entangle business code. Route naming and parameter handling still must follow the actual Expo Router version and conventions in the project.

### 4.3 One feature template

```text
src/features/[feature-name]/
├── presentation/
│   ├── screens/
│   │   ├── feature-list-screen.tsx
│   │   └── feature-detail-screen.tsx
│   ├── components/
│   │   ├── feature-card.tsx
│   │   └── feature-empty-state.tsx
│   ├── hooks/
│   │   └── use-feature-list.ts
│   └── validation/
│       └── feature-form.schema.ts
├── application/
│   └── use-cases/
│       ├── list-features.use-case.ts
│       └── create-feature.use-case.ts
├── domain/
│   ├── entities/
│   │   └── feature-item.ts
│   └── repositories/
│       └── feature.repository.ts
└── data/
    ├── repositories/
    │   └── feature.repository.impl.ts
    ├── data-sources/
    │   └── remote/feature-api.ts
    ├── dto/feature-response.dto.ts
    └── mappers/feature.mapper.ts
```

This is a reference. If the feature is display-only, remove unused sections. If it has meaningful rules, add domain rules and tests. If local storage is not required, do not create `data-sources/local/` yet.

## 5. Responsibility and file-size guidelines

Line counts are warning signals, not laws. A coherent file may be longer than a tiny utility. Review the **number of reasons the file changes**, not just the line count.

| File kind | Main responsibility | Extract when… |
|---|---|---|
| Route | Navigation wiring | It contains UI construction or business logic beyond route concerns |
| Screen | Compose a page from state and components | It includes multiple independent sections, complex transformations, or many effects |
| UI component | One coherent visual responsibility | It mixes unrelated UI, data loading, and business calculations |
| Presentation hook/view model | UI state and screen actions | It becomes a generic global manager or mixes unrelated screens |
| Use case | One meaningful application action/workflow | It coordinates several operations or contains a distinct workflow |
| Domain rule/service | One business policy or calculation | Multiple unrelated policies are joined in one module |
| Repository | Access and synchronize a defined data aggregate | It becomes a catch-all for different domains or unrelated external systems |
| Mapper | Convert one boundary representation | It contains business policy or unrelated format conversions |

**Suggested review heuristic, not a hard limit:** when a screen grows beyond roughly 200–300 lines, or a file has multiple independent reasons to change, review whether extraction improves clarity. Do not split a cohesive, readable file just to satisfy a number.

## 6. State management policy

Decide by state ownership, not by habit.

| State type | Examples | Default location |
|---|---|---|
| Ephemeral UI state | Open modal, expanded section, selected tab | Component or screen hook |
| Form draft | Input values, local validation messages | Form state in presentation |
| Remote/server state | API records, server pagination, stale/fresh status | Query/cache layer (e.g. TanStack Query if chosen) and repository boundary |
| Cross-screen app state | Theme, language, selected workspace | Small app-level store/context, only if genuinely shared |
| Domain/persistent state | Records that survive app restarts | Repository + chosen persistence mechanism |
| Auth/session secret | Access/refresh tokens | Secure platform storage adapter, not ordinary preferences |
| Derived state | Totals, filtered lists, computed labels | Compute from source state; avoid unnecessary duplicate storage |

Do not mirror every API record into a separate global state store. Do not copy the same source of truth into component state, global state, and local database without a synchronization policy.

## 7. Data flow and repository contracts

### 7.1 Read flow

```text
Screen → query/presentation hook → repository contract
       → repository implementation → remote/local source
       → DTO/schema validation → mapper → domain/application model
       → UI state
```

### 7.2 Write flow

```text
User action → presentation handler → use case (if meaningful)
            → domain validation/rules → repository contract
            → remote/local persistence → mapped result
            → cache/UI refresh → feedback
```

### 7.3 Repository rules

- A repository represents a coherent data ownership boundary, not every endpoint as a separate class by default.
- UI does not import concrete repository implementations.
- Repository interface belongs to the stable inner boundary chosen by the project; implementation belongs to data/infrastructure.
- Data source wraps transport or storage access. It should not be called directly by screens.
- Mapper converts DTO/storage shapes into stable app/domain types.
- Do not assume a mobile-side repository is a security boundary; server authorization remains authoritative.

## 8. API, local storage, and offline strategy

Choose and document one of these modes for each relevant data category in `PROJECT_PROFILE.md`.

### A. Online-first

- Backend/API is the source of truth.
- Local state is ephemeral or a small cache.
- Writes require connectivity unless a feature explicitly supports a queue.
- Lowest sync complexity; suitable when offline mutation is not a product requirement.

### B. Online-first with read cache

- API remains authoritative.
- Cached reads improve perceived speed or limited offline access.
- Define freshness, invalidation, and behavior when cached data is stale.
- Do not show cached values as unquestionably current.

### C. Local-first / offline-write

- Local database is the immediate source of truth for user interactions, or the device keeps pending mutations locally.
- Requires a clear sync model: outbox/queue, idempotency, retry, conflict policy, deletion semantics, migration, and user feedback for unsynced data.
- Do not merely add SQLite and call the app offline-first.
- Secure sensitive data and define what logout/account switching does to local data.

### D. Fully local, no account/backend

- A local database or storage adapter owns persistence.
- Plan export/backup, schema migration, corruption recovery, and device-loss behavior when data matters.
- Keep repository contracts so storage implementation can evolve without leaking into UI.

**Important:** local storage and secure secret storage are different responsibilities. Store non-sensitive preferences in an appropriate preferences store; tokens/secrets must use platform-secure storage appropriate to the threat model. Never hardcode secrets into source code or ship private server credentials in a mobile bundle.

## 9. Validation and error handling

Validation happens at the relevant boundaries:

1. **Presentation validation:** fast feedback for missing/invalid form input.
2. **Domain/application validation:** protects business rules and workflow invariants.
3. **Transport validation:** validates API payloads at the boundary when required by the API contract.
4. **Server validation/authorization:** authoritative validation for server-owned data and access permissions.

Define a stable error vocabulary for application behavior (e.g. validation, not found, unauthorized, conflict, offline, rate limited, unknown). Keep technical details in logs; display safe, actionable messages to users. Avoid swallowing errors or returning fake success to make the UI appear healthy.

## 10. Security and privacy baseline

- Never commit credentials, signing files, API secrets, or real `.env` values.
- Keep `.env.example` limited to variable names and safe sample values.
- Treat all client input and all API responses as untrusted.
- Authorization must be enforced by the backend for protected resources; hiding a button is not access control.
- Use secure storage for session secrets and document token expiry/refresh/logout behavior.
- Redact tokens, passwords, personal information, and sensitive payloads from logs/crash reports.
- Request platform permissions only when required; explain user-facing purpose where appropriate.
- Define account deletion, data export, retention, backup, and local-data cleanup where relevant to product requirements.
- Audit dependency additions and permissions; avoid packages that duplicate existing platform/framework capability without a reason.

## 11. Testing strategy

Use multiple levels; not every file requires every test type.

| Level | What it proves | Typical subjects |
|---|---|---|
| Unit | One rule/function behaves correctly | Domain rules, calculations, validation, mappers |
| Application/use-case | An action coordinates collaborators correctly | Success, validation failure, repository failure |
| Repository integration | Mapping and persistence behavior works | API adapter contracts, local DB migrations, caching |
| Component/UI | A component responds to state and user actions | Loading, empty, error, accessibility, interactions |
| E2E | Critical user journeys work on a real/simulated device | Onboarding, sign-in, create/update/delete, offline recovery |

Mandatory rules:

- Tests must not silently use real production services or a developer's personal database.
- Use fixtures/factories with deterministic IDs and clock where needed.
- Test negative paths: malformed payload, no network, expired session, empty data, duplicated taps, and failed persistence when relevant.
- Business rules should not require mounting React Native screens to be tested.
- E2E should focus on critical journeys; do not force every unit-level edge case into E2E.

## 12. Architecture decision records (ADR)

Create an ADR only for decisions with material long-term impact, for example:

- mobile framework and routing;
- API contract and authentication;
- offline mode, persistence, sync, and conflict resolution;
- state management and query cache;
- dependency injection/composition;
- navigation/auth boundary;
- push/local notifications;
- localization and design-system strategy.

Do not create an ADR for every library import or minor refactor.

Suggested filename: `docs/architecture/adr/ADR-001-data-strategy.md`.

```md
# ADR-NNN — [Decision title]

- Status: Proposed | Accepted | Superseded
- Date: YYYY-MM-DD
- Owner: [role/team]

## Context
[Problem and constraints]

## Options considered
1. [Option, trade-offs]
2. [Option, trade-offs]

## Decision
[What is selected]

## Consequences
[Benefits, costs, risks, migration implications]

## Follow-up
[Tests, docs, or implementation work]
```

## 13. Reusable conventions for future features

Before implementing a feature, answer:

1. Which capability owns this feature and its data?
2. What is the smallest complete user journey (vertical slice)?
3. Does this feature have meaningful business rules or is it simple presentation/CRUD?
4. Which data source is authoritative and what happens offline?
5. Which existing public interfaces can be reused without coupling unrelated features?
6. What loading, empty, error, permission-denied, and success states are required?
7. Which automated tests prove it works?
8. Does the feature affect auth, navigation, notifications, analytics, accessibility, privacy, or migrations?
9. Does it require an ADR or only an implementation note?
10. How will backward compatibility and regression be verified?

## 14. Definition of Done

A feature is done when, as applicable:

- [ ] Acceptance criteria from the product artifact are met.
- [ ] UI, orchestration, business rules, and data access have clear ownership.
- [ ] No protected resource depends solely on client-side authorization.
- [ ] Loading, empty, error, and success states are handled.
- [ ] Types, validation, accessibility, and platform behavior are reviewed.
- [ ] Tests for critical rules and flows pass.
- [ ] No secrets or sensitive logs were introduced.
- [ ] Relevant documentation and ADRs are updated.
- [ ] Regression checks/build/lint/typecheck pass according to project scripts.
- [ ] No unrelated refactor or feature scope was slipped into the change.

## 15. Framework adaptation

This document's folder tree is concrete for React Native + Expo + TypeScript. If a project uses Flutter, Kotlin, Swift, or another mobile stack, keep the architectural principles but adapt framework-specific locations and idioms rather than copying the Expo tree literally.

For Flutter, official guidance describes a UI layer and data layer, with view/view model, repository, and service roles; the domain/use-case layer is optional when the app's logic warrants it. The same principle applies here: preserve boundaries, not names for their own sake.

## 16. References (official documentation)

- Expo — Create a project: https://docs.expo.dev/get-started/create-a-project/
- Expo — File structure / start developing: https://docs.expo.dev/get-started/start-developing/
- Expo — TypeScript: https://docs.expo.dev/guides/typescript/
- Expo — Router guides: https://docs.expo.dev/router/introduction/
- Flutter — Guide to app architecture: https://docs.flutter.dev/app-architecture/guide
- Flutter — Architecture concepts and layered architecture: https://docs.flutter.dev/app-architecture/concepts

Documentation and framework templates can change. Before bootstrapping a new codebase, confirm the installed framework version and current official guidance; do not replace a working project's versions blindly.
