# Dokploy v0.29.11 — Build Concurrency & Timeout (primary-source research)

Research done against the Dokploy source at tag **`v0.29.11`**
(commit `1c4414165d4aedbf6e28afab7a94c8fb7c053373`), via the GitHub API.
All file paths below are as they exist at that tag.

## TL;DR

- **The premise is outdated for v0.29.11.** Self-hosted Dokploy no longer uses
  BullMQ/Redis for deployments. There is **no `new Worker('deployments', ...)`**,
  no `bull:deployments:` key, no `lockDuration`/`stalledInterval`/`maxStalledCount`.
  Deployments run through a **custom in-memory queue**.
- **Concurrency is officially configurable** — no fork needed. It is a DB-backed
  integer (`buildsConcurrency`, default **1**, range **1–100**) exposed in the UI at
  **Settings → Deployments** ("Concurrent Builds"), settable per web-server and
  per remote server.
- **There is NO build timeout of any kind.** No env var, no UI setting, no wrapper
  around `docker build`. A hung build occupies its concurrency slot indefinitely.
  The only kill mechanism is the **manual "Cancel" button** (`killDockerBuild`,
  `pkill -2 -f "docker build"`).
- **No relevant env vars exist** (`BUILD_CONCURRENCY`, `MAX_CONCURRENT_BUILDS`,
  `BUILD_TIMEOUT`, etc. all return 0 hits). Concurrency is DB/UI only.

---

## 1. Deployment build concurrency

### The queue is in-memory, not BullMQ

`apps/dokploy/server/queues/queueSetup.ts` — the file docstring is explicit:

> Self-hosted uses an in-memory, per-group FIFO queue with configurable
> concurrency per server. Cloud does not use the queue at all…

```ts
const createInMemoryQueue = (): DeploymentQueue => {
	const queue = new InMemoryQueue({
		resolveConcurrency: resolveBuildsConcurrency,
	});
	queue.process(processDeploymentJob);
	...
```

There is no `new Worker(...)`. The scheduler lives in
`apps/dokploy/server/queues/in-memory-queue.ts`. Concurrency is enforced in
`drainPartition()`:

```ts
const concurrency = Math.max(1, await this.resolveConcurrency(key));
while (partition.active.length < concurrency) { ... }
```

Model:
- Jobs are **partitioned by `serverId`** (local web server uses
  `LOCAL_PARTITION = "__local__"`). Each partition runs up to its own
  `concurrency` jobs in parallel.
- **Within a partition, jobs of the same group** (same application / same compose)
  are serialized FIFO — two builds of the *same* service never run in parallel.
- So concurrency is **per-server**, resolved fresh on every scheduling tick
  (config changes apply without a restart).

### Where the concurrency value comes from

`apps/dokploy/server/queues/concurrency.ts`:

```ts
export const resolveBuildsConcurrency = async (partition: string): Promise<number> => {
	try {
		if (partition === LOCAL_PARTITION) {
			const settings = await getWebServerSettings();
			return normalize(settings?.buildsConcurrency ?? 1);
		}
		const currentServer = await db.query.server.findFirst({
			where: eq(server.serverId, partition),
			columns: { buildsConcurrency: true },
		});
		return normalize(currentServer?.buildsConcurrency ?? 1);
	} catch (error) {
		console.error("Failed to resolve builds concurrency, defaulting to 1", error);
		return 1;
	}
};

const normalize = (value: number): number => Math.max(1, Math.floor(value));
```

So the effective value is:
- **Local web server:** `web_server_settings.buildsConcurrency`
- **Remote server:** `server.buildsConcurrency` (that server's row)
- Default / on error / missing row: **1**

### DB schema (default 1)

`packages/server/src/db/schema/web-server-settings.ts:109`
```ts
buildsConcurrency: integer("buildsConcurrency").notNull().default(1),
```
`packages/server/src/db/schema/server.ts:44`
```ts
buildsConcurrency: integer("buildsConcurrency").notNull().default(1),
```

Validation zod: `z.number().int().min(1).max(100)` (both schema files).
Migration: `apps/dokploy/drizzle/0172_quick_the_professor.sql`.

### Not hardcoded, not an env var — it's a UI setting

- **Local:** `settings.updateBuildsConcurrency` — `adminProcedure`, **not**
  license-gated (`apps/dokploy/server/api/routers/settings.ts:472`). Any admin can
  set it on a self-hosted instance (blocked only on cloud).
- **Remote server:** `server.updateBuildsConcurrency`
  (`apps/dokploy/server/api/routers/server.ts:483`), `withPermission("server","create")`.
  Note: **adding remote servers** requires an enterprise license
  (`hasValidLicense` check at `server.ts:141`), but editing concurrency on an
  existing local install does not.
- **UI component:** `apps/dokploy/components/dashboard/settings/servers/actions/builds-concurrency.tsx`
  — number input, `min={1} max={MAX_CONCURRENCY}` where `MAX_CONCURRENCY = 100`.
- **UI page:** `apps/dokploy/pages/dashboard/settings/deployments.tsx` —
  card titled **"Concurrent Builds"**: *"Configure how many deployments can build
  at the same time…"*. Rendered once for the Dokploy web server and once per remote server.

### The 1–100 cap is UI-only

`resolveBuildsConcurrency` does **not** cap at 100 — the test
`apps/dokploy/__test__/queues/concurrency.test.ts` asserts *"does not cap high
values"* (999 → 999). Floor of 1, 0 → 1, missing → 1. So a value written directly
to the DB above 100 would be honored; the UI just refuses to enter it.

---

## 2. Build timeout — does not exist

Grep across the repo at v0.29.11 (via GitHub code search), **all zero hits**:

| term | hits |
|---|---|
| `buildTimeout` / `BUILD_TIMEOUT` / `DEPLOY_TIMEOUT` | 0 |
| `lockDuration` | 0 |
| `stalledInterval` | 0 |
| `maxStalledCount` | 0 |
| `BUILD_CONCURRENCY` / `MAX_CONCURRENT` | 0 |

- The in-memory queue has **no per-job timeout / stalled-job recovery**. A job
  runs `await this.processor(job)`; if `docker build` hangs, the promise never
  resolves and the slot stays occupied forever (no auto-recovery like BullMQ's
  `stalled` mechanism).
- `execAsync` / `execAsyncStream` (`packages/server/src/utils/process/execAsync.ts`)
  accept only `{ cwd, env, shell }` — **no Node `timeout` option is passed** to any
  `docker build` exec/spawn.
- The `timeout: 99999` in that file (line ~247) is the **SSH connect timeout** for
  remote servers, unrelated to builds.
- The only build-kill path is manual: `killDockerBuild()` in
  `queueSetup.ts` runs `pkill -2 -f "docker build"` (or `docker compose`), called
  from the **Cancel deployment** mutations in `application.ts` / `compose.ts`.
  A user must click Cancel.

---

## 3. Redis / Swarm notes

- Redis **is** still deployed by Dokploy setup as a Swarm service — `redis:8`,
  container `dokploy-redis` (`packages/server/src/setup/redis-setup.ts`), and
  `apps/dokploy/server/queues/redis-connection.ts` reads
  `process.env.REDIS_HOST || "dokploy-redis"`.
- **But `redisConfig` / `redis-connection.ts` is imported by nobody** (code search:
  only its own definition). BullMQ (`from "bullmq"`) is used only in the separate
  `apps/schedules/*` cron app and `apps/api/*`, and `in-memory-queue.ts` imports a
  BullMQ **type** only for API-compat. **Redis has no role in deployment concurrency.**

---

## Recommendation (safe, officially supported)

**To increase concurrency — supported, no fork:**
UI → **Settings → Deployments → Concurrent Builds** → set the value (1–100) for the
Dokploy server (and per remote server). Applies immediately, no restart. Size it to
your host's CPU/RAM/disk; each parallel `docker build` is heavy. Values >100 require
writing the DB directly (`web_server_settings.buildsConcurrency` /
`server.buildsConcurrency`) — honored at runtime but unsupported via UI.

**To get a build timeout — not available in v0.29.11.** Honest options:

1. **No native feature.** There is no env var or setting. Do not expect stalled-job
   auto-recovery — the in-memory queue has none, so a hung build wedges its slot
   until manually cancelled.
2. **Operational mitigation (no fork):** run a host cron / watchdog that kills
   `docker build` processes older than N minutes, e.g.
   `pkill -2 -f "docker build"` gated on process age — mirrors exactly what
   Dokploy's own Cancel button does. Or a systemd timer scanning
   `docker ps`/build PIDs. This frees the queue slot without touching Dokploy code.
3. **Fork/patch (if you want it enforced in-app):** wrap the build exec with a Node
   timeout, or add a timeout race in `in-memory-queue.ts` `runJob()`. Carries
   upgrade-maintenance cost.
4. **Manual:** the built-in **Cancel** button on a stuck deployment
   (`killDockerBuild`).

## Key files

| Concern | File |
|---|---|
| Queue wiring (in-memory, not BullMQ) | `apps/dokploy/server/queues/queueSetup.ts` |
| Scheduler + concurrency enforcement | `apps/dokploy/server/queues/in-memory-queue.ts` |
| Resolve concurrency from DB | `apps/dokploy/server/queues/concurrency.ts` |
| Job processor | `apps/dokploy/server/queues/deployments-queue.ts` |
| Local concurrency mutation (adminProcedure) | `apps/dokploy/server/api/routers/settings.ts:472` |
| Remote-server concurrency mutation | `apps/dokploy/server/api/routers/server.ts:483` |
| UI control (min 1, max 100) | `apps/dokploy/components/dashboard/settings/servers/actions/builds-concurrency.tsx` |
| UI page ("Concurrent Builds") | `apps/dokploy/pages/dashboard/settings/deployments.tsx` |
| Schema (default 1) | `packages/server/src/db/schema/{web-server-settings.ts:109, server.ts:44}` |
| Build exec (no timeout option) | `packages/server/src/utils/process/execAsync.ts` |
| Manual build kill | `killDockerBuild()` in `queueSetup.ts` (`pkill -2 -f "docker build"`) |
| Redis setup (unused by deployments) | `packages/server/src/setup/redis-setup.ts` |
