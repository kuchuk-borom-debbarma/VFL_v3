**VFL — Visual Flow Logger: Core Concept Specification**

---

**What is VFL?**

VFL is a typed, extensible tracing system for modeling and capturing distributed flows. It supports both a modeling layer (define flows upfront) and a runtime layer (capture via instrumentation). Flows are non-linear graphs of typed blocks connected by typed edges.

---

**Core entities:**

**Trace** — the top-level unit. Represents one operation from start to finish. It is pushed once at the beginning of a flow.

**Block** — the atomic unit of work. Every block belongs to a trace and is owned by a `scope`. Blocks are strongly typed (e.g., `log`, `http`, `db`) and carry structured `metadata`.

**Edge** — a typed connection between two blocks (`from` -> `to`). Captured explicitly by the client to describe the relationship (e.g., `sequential`, `async`).

**Closure** — (Internal/Backend) A precomputed flat table of every ancestor-descendant relationship. Written once on insert, read many times on query.

---

**Block Specification:**

- `id`: UUID
- `traceId`: UUID
- `scope`: Ownership label (e.g., `api-service`)
- `blockType`: Semantic type (e.g., `http`, `graphql`, `db`, `message`, `log`)
- `metadata`: Strongly-typed structured data specific to the `blockType`.
- **Latency Timestamps (ms):**
    - `originAt`: Absolute initiation time (e.g., user click in browser).
    - `receivedAt`: Entry into a system/service boundary (ingress).
    - `startedAt`: Actual start of processing logic.
    - `endedAt`: Completion of processing logic.
    - `leftAt`: Exit from the system/service boundary (egress/response sent).
    - `sentAt`: When the telemetry data was actually flushed to the VFL server.

---

**Edge Specification:**

- `id`: UUID
- `traceId`: UUID
- `fromBlockId`: Originating block
- `toBlockId`: Destination block
- `edgeType`: Relationship nature (e.g., `sequential`, `async`, `retry`)
- `metadata`: Optional edge-specific data.

---

**Trace Specification:**

- `id`: UUID
- `name`: Human-readable flow name
- `createdAt`: Initiation timestamp
- `metadata`: Global trace context

---

**Clock Skew and Latency:**

In a distributed system, clocks are rarely perfectly synchronized. VFL handles this as follows:
1. **Local Latency**: Calculated within a single block (e.g., `endedAt - startedAt`) is always accurate as it uses the same clock.
2. **Transit Latency**: Calculated between blocks (e.g., `Consumer.receivedAt - Producer.leftAt`) may be affected by clock skew.
3. **Drift Correction**: The VFL Server should implement "drift correction" logic. If a child block appears to start before its parent, the server can normalize the timestamps based on the known causal relationship defined by the `Edge`.

---

**Design Principles:**

- **Explicit over Inferred**: The client explicitly sends Edges and Blocks to reduce backend processing overhead.
- **Unified Metadata**: No distinction between "generic" and "specific" data; everything is merged into a strongly-typed `metadata` object.
- **Latency First**: The six-timestamp model provides high-fidelity visibility into ingress, processing, egress, and telemetry lag.
- **Directional Expansion**: In the UI, ghost nodes expand toward the viewer (downstream to upstream) to maintain context.
- **Closure for Speed**: Recursive queries are avoided by using a Closure table populated at write-time.