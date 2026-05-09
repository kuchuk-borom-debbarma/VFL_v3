import type { Trace } from "./src/models/trace/Trace.ts";
import { LogBlock } from "./src/models/block/LogBlock.ts";
import type { Edge } from "./src/models/edge/Edge.ts";

const trace: Trace = {
    id: crypto.randomUUID(),
    name: "Sample Trace",
    createdAt: Date.now(),
    metadata: { version: "1.0.0" }
};

const block1 = new LogBlock({
    id: crypto.randomUUID(),
    traceId: trace.id,
    scope: "api-service",
    metadata: {
        message: "Incoming request",
        level: "info"
    }
});

const block2 = new LogBlock({
    id: crypto.randomUUID(),
    traceId: trace.id,
    scope: "db-service",
    metadata: {
        message: "Query executed",
        level: "debug"
    }
});

const edge: Edge = {
    id: crypto.randomUUID(),
    traceId: trace.id,
    fromBlockId: block1.id,
    toBlockId: block2.id,
    edgeType: "sequential",
    metadata: {}
};

console.log("Trace:", JSON.stringify(trace, null, 2));
console.log("Block 1 (Log):", JSON.stringify(block1, null, 2));
console.log("Block 2 (Log):", JSON.stringify(block2, null, 2));
console.log("Edge:", JSON.stringify(edge, null, 2));