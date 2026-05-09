**VFL — Visual Flow Logger: Core Concept Specification**

---

**What is VFL?**

VFL is a typed, extensible tracing system for modeling and capturing distributed flows. It supports both a modeling layer (define flows upfront) and a runtime layer (capture via metaprogramming). Flows are non-linear graphs of typed blocks connected by typed edges.

---

**Core entities:**

**Trace** — the top-level unit. Represents one operation from start to finish. All blocks and edges in a flow belong to a trace.

**Block** — the atomic unit of a flow. Typed, scoped, and carries both generic metadata and block-specific data. Blocks connect to other blocks via edges — one block can connect to multiple others, making the graph non-linear.

**Edge** — a typed connection between two blocks. Carries the nature and direction of the relationship.

**Closure** — a precomputed flat table of every ancestor-descendant relationship at every depth. Written once on insert, read many times on query. Makes all descendant and ancestry queries fast and non-recursive.

---

**Block:**
- `id`
- `traceId`
- `scope` — ownership label, e.g. `foo-service`, `api-service`
- `blockType` — references the type registry
- `metadata` — generic key-value, free form
- `data` — block-specific fields, validated against the blockType schema at write time
- `status` — `pending`, `running`, `success`, `failure`
- `startedAt`
- `endedAt`

---

**Edge:**
- `id`
- `traceId`
- `fromBlockId`
- `toBlockId`
- `edgeType` — references the type registry
- `metadata` — validated against the edgeType schema

---

**Trace:**
- `id`
- `name`
- `createdAt`
- `metadata`

---

**Closure:**
- `ancestorId`
- `descendantId`
- `depth`
- `traceId` — scopes all closure queries to a single trace, no full table scans

Closure rows are written at block insert time. For every ancestor of the new block, one row is inserted. A block with three ancestors above it generates three closure rows plus one self-referencing row at depth zero.

The graph is non-linear — a block can have multiple parents. Closure handles this naturally since a block with two parents simply gets two sets of ancestry rows.

---

**Type registry:**

All block and edge types are extensible via a type registry. A type definition carries:
- a name
- a description
- a JSON schema defining what `data` is valid for that type
- a flag indicating whether it is built-in or user-defined

Built-in block types: `box`, `log`, `remote`, `queue`

Built-in edge types: `sequential`, `async`, `retry`

Users register custom types with their own schemas. Built-in types are semantic anchors the engine reasons about. User-defined types are validated against their schema but treated as opaque by the core.

---

**Scope:**

A plain string label on every block. Answers the question "whose responsibility is this block?" No nesting rules, no structural enforcement — just a tag. Filtering by scope is a flat query on the block table.

---

**Filtering:**

All filtering is flat field queries against the block table, the edge table, or the closure table. No recursive CTEs at query time.

- Filter by `blockType` — show all `remote` blocks across the trace
- Filter by `scope` — show everything owned by `api-service`
- Filter by both — show all `remote` blocks inside `api-service`
- Filter by `status` — show all `failure` blocks
- Filter descendants of a block — single closure query by `ancestorId`
- Filter ancestors of a block — single closure query by `descendantId`
- Filter by depth — show only blocks within N hops of a given block

Edges give connectivity, scope gives ownership, blockType gives semantics, closure gives ancestry. Every meaningful query is a combination of these four.

---

**Filter view modes:**

When a filter is applied, intermediate blocks are skipped. For example if `a -> b -> c` and only `a` and `c` match the filter, `b` is skipped. VFL offers two view modes to handle this:

**Mode 1 — Clean subgraph**

Matched blocks only are shown. Skipped intermediate blocks are replaced by a derived edge carrying a hop count label. The graph is clean and uncluttered. Derived edges are visually distinct from real edges.

```
a ——[2 hops]——► c
```

The hop count comes directly from the closure table depth — no extra computation needed. Clicking a derived edge shows the list of skipped blocks without expanding them into the graph.

**Mode 2 — Hybrid explore**

Matched blocks are shown at full opacity. Skipped intermediate blocks are shown as collapsed ghost nodes on the edge between matched blocks. The graph shape is preserved and context is not lost.

```
a ——[b]——► c
```

Ghost nodes are collapsed by default and non-interactive in their collapsed state. Expansion is triggered from the downstream matched block — the `c` block. Expanding reveals the ghosted nodes growing toward `c`, preserving the direction of the flow. This keeps the expansion feel consistent — you are always pulling context toward where you are looking, not pushing outward from the start.

Expansion is incremental — expanding `c` reveals its immediate ghosted ancestor first. If that ancestor is also a ghost, it can be expanded further in the same direction until the full path between `a` and `c` is revealed.

---

**Example flow:**

```
Trace: foo

Block: db_write    [box]    scope: foo-service
Block: api_call    [remote] scope: foo-service
Block: write_disk  [box]    scope: api-service
Block: response_ok [log]    scope: api-service

Edges:
db_write    ——[sequential]——► api_call
api_call    ——[sequential]——► write_disk
write_disk  ——[sequential]——► response_ok

Closure:
ancestor      descendant     depth  traceId
db_write      db_write       0      foo
db_write      api_call       1      foo
db_write      write_disk     2      foo
db_write      response_ok    3      foo
api_call      api_call       0      foo
api_call      write_disk     1      foo
api_call      response_ok    2      foo
write_disk    write_disk     0      foo
write_disk    response_ok    1      foo
response_ok   response_ok    0      foo
```

Filter by `remote` — Mode 1:
```
db_write ——[1 hop]——► write_disk ——[sequential]——► response_ok
```

Filter by `remote` — Mode 2:
```
db_write ——[api_call ghost]——► write_disk ——[sequential]——► response_ok

expand from write_disk:
db_write ——► api_call ——► write_disk ——► response_ok
```

---

**Design principles:**

- Flat over nested — the graph has no hierarchy, only connectivity and scope
- Filter is a lens, not a cut — filtering narrows attention without destroying the graph
- Types carry meaning, not just labels — data is validated against schema at write time
- Model first, instrument second — define flows explicitly, runtime captures against that definition
- Scope is a tag, not a boundary — ownership is declared, not enforced by structure
- Write once, read many — closure rows are computed at insert time so reads are never recursive
- Expansion flows toward the viewer — ghost nodes expand from the downstream block, preserving flow direction