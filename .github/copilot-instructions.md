Short, focused instructions to help AI coding agents become productive in this repository.

Project highlights
- Framework: Next.js (app directory) using React client components (see `src/app` and `use client` markers).
- Styling: Tailwind CSS utilities are used across components (see `src/app/globals.css` and many `className` usages).
- Backend/Storage: Supabase client usage lives under `src/lib/supabase/*` and services in `src/lib/services/*` (e.g. `storage.service.ts`, `photos.service.ts`).
- Data access pattern: thin hooks wrap service calls and mutations under `src/lib/hooks/*` (e.g. `useSignalements`, `useTypesSignalement`). Components call those hooks rather than calling Supabase directly.

What to change and how
- Prefer editing React components inside `src/components/*` and pages under `src/app/*` (route files are `page.tsx` or `route.ts`).
- Client components must include 'use client' at the top. If you convert a server component to client, add this line and update imports accordingly.
- Follow the existing state patterns: use React hooks (useState/useRef) and controlled inputs. See `SignalementForm.tsx` for an example multi-step form and file upload flow.

Key files to inspect when making changes
- `src/app/layout.tsx` and `src/app/page.tsx`: top-level layout and global styling.
- `src/lib/supabase/client.ts` and `src/lib/supabase/useSupabaseAuth.ts`: Supabase client and auth helpers.
- `src/lib/services/*.ts`: encapsulate network logic and storage uploads. When adding new server calls, mirror this service pattern and return consistent shapes.
- `src/lib/hooks/*`: thin adapters for React components. Add new hooks here to keep components thin.
- `src/components/signalements/SignalementForm.tsx`: canonical example of multi-step UI, validation, geolocation and photo upload flows. Use it as reference for UX and error handling.

Conventions and patterns
- API routes: under `src/app/api/*/route.ts`. They export HTTP handlers (Next.js App Router conventions).
- Types: central types live in `src/types/` (e.g. `entities.ts`, `signalements.ts`). Use them for function signatures and service payloads.
- Styling: use Tailwind utility classes consistently. Prefer small, composable classes; avoid global CSS overrides unless necessary.
- File uploads: storage uploads go through `src/lib/services/storage.service.ts` and photo records through `photos.service.ts`. After upload, services often call a mutation hook (see `useSignalements().updateSignalementUrl`).
- Geolocation & browser APIs: components may rely on `navigator.geolocation`. Guard with feature checks and expose a boolean state like `locationRetrieved` rather than showing raw coords in the UI.

Developer workflows & commands
- Start development (Next.js dev server): npm run dev (check `package.json` for exact scripts).
- Lint/type checks: project includes TypeScript; run your editor's typecheck or `npm run build` to surface TypeScript/Next errors.
- Git: repository uses standard git workflows. There was an issue with stale `.git/index.lock` during development — only remove it after confirming no active git processes are running.

Integration points
- Supabase: ensure environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, service key if needed) are set in your env when testing uploads.
- External services: any additional APIs should be added under `src/lib/services` and wrapped by hooks under `src/lib/hooks`.

Examples (copy patterns)
- Adding a new data service
  - Create `src/lib/services/my.service.ts` that exports plain functions performing Supabase or fetch calls.
  - Add a hook `src/lib/hooks/useMy.ts` that returns loading, error and actions/mutations built on top of the service.
  - Call the hook from a client component in `src/components`.

- File upload flow (SignalementForm pattern)
  - Capture a File via an <input type="file" /> ref.
  - Upload via `uploadSignalementPhoto(file, entityId)` from `storage.service.ts`.
  - Create a DB/photo record via `createPhotoSignalement(entityId, path)`.
  - Update the parent entity via `updateSignalementUrl.mutateAsync({ id, url: path })`.

What NOT to change without discussion
- Global auth flow in `src/lib/supabase/*` and `useSupabaseAuth.ts` — it's central to app security and token handling.
- API route shapes and database contract in `src/lib/services/*` unless you update matching server DB migrations.

If you're an AI agent making edits
- Keep diffs small and targeted. Run `npm run dev` and quick typecheck after edits.
- Prefer to add unit tests or at least a small local manual verification step when changing services that touch Supabase.

Questions to ask the human before bigger changes
- Should new server keys be stored in environment for CI/CD or local only?
- Are we allowed to change the DB schema or must we keep backwards compatibility with existing service calls?

If anything is missing or unclear, ask the repo owner to point to the database schema, deployment pipeline, or required environment variables.
