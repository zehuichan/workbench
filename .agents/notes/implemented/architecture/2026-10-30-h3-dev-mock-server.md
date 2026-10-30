# Agent Note: h3 dev mock server with an implicit static-host fallback

Status: implemented

## Problem

The playground deploys to GitHub Pages, which serves static files only. Demos that stand for a server (the auto-save draft) need an HTTP endpoint while developing, and nothing at all online. Writing `localStorage` directly in the demo never exercised a request path, so the demo said nothing about how `useAutoSave` behaves against a real `save`.

## Decision

`server/` holds an h3 app, `createMockApp()`, mounted by the `mockServer()` Vite plugin for `/api/*` on the dev server. `pnpm dev` stays one process on port 9527. An endpoint is a `register*Routes(app)` module under `server/routes/`, called from `server/app.ts`. State lives on the app instance. `createMockApp({ latencyMs })` holds every response back for that long and defaults to `0`; `vite.config.ts` passes `400` so a demo's `saving` state is visible without the demo faking a delay. `h3` is a dev dependency and the build output contains no server code.

The fallback lives in the request layer. The shared axios instance `request` (`src/api/request.ts`) takes a `localKey` request option, implemented by a response interceptor. A request that sets it is answered from `localStorage[localKey]` when no server answers: no host responds, the route answers 404 or 405, or a success body is a string (a static host's HTML fallback page, which axios leaves a string). A `GET` resolves the stored JSON or `null`; any other method stores its JSON body and resolves it. Other failed statuses and cancellations reject. A request without `localKey` is untouched. `getDraft` and `saveDraft` in `src/api/draft.ts` own the endpoint and pass its URL as `localKey`, so the `localStorage` key is the endpoint path. Callers neither branch on the mode nor know a storage key, and the demo does not mention either. `getDraft` returns untrusted JSON, so the caller narrows it.

The draft is a single resource, `/api/draft`, and its wire format is the JSON object itself, with no envelope. `GET` answers the object or JSON `null`; `PUT` takes the object as its body. `localStorage` holds the identical text, so the request layer needs no knowledge of the draft shape.

## Alternatives considered

**Standalone h3 process with a Vite proxy.** Isolates the mock from Vite, but `pnpm dev` then needs two processes and a port to coordinate. The middleware keeps one command.

**Build-time switch (`import.meta.env.PROD` or a `VITE_*` flag).** Needs a flag per deployment target and fails for a production build previewed locally or later pointed at a real backend. A runtime probe lets one bundle run against the dev mock, a real backend, or nothing.

**Keep the `localStorage`-only mock.** No new dependency, but no request path to exercise and no template for the next demo that needs an endpoint.

**A `useServerSnapshot` composable that remembers the server is absent.** It stops repeating failed requests after the first probe, but it adds a public composable, its JSDoc, tests, and a README row for one consumer, and an `/api/*` client does not belong beside the form composables. Module-level memory of the probe would be a global cache the repo's ownership rule forbids.

**Absence detection inside each API function.** Keeps `request.ts` bare, but every endpoint that wants a fallback repeats the detection and the storage mapping. One interceptor owns them once.

## Consequences

Every request that sets `localKey` probes the server. On the static deployment each save sends one request that answers 404 before it falls back, which shows in the network panel and console.

A route missing from the mock answers 404, which the client reads as "no server" and silently serves from `localStorage`. A typo in an endpoint therefore shows up as unexpected local persistence, not an error.

Fallback data stays in one browser and is never copied to a server that appears later.

The dev store is in memory and resets when the dev server restarts.

The latency exists only in the mock. The static deployment answers from `localStorage` at once, so `saving` shows for a moment there.

The fallback is generic: it stores whatever JSON body a request sends, so an endpoint whose server response differs from its request body cannot use `localKey` without a change to the interceptor.

## Verification

`server/__tests__/app.test.ts` pins the route contract and the latency. The `localKey` interceptors have no automated tests: they are a thin layer over axios, and the two modes were exercised in the browser instead: `pnpm dev` stores through `/api/draft`, and `pnpm preview` of a production build stores in `localStorage`.
