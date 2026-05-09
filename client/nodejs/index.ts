import type { Trace } from "./src/models/trace/Trace.ts";
import { LogBlock } from "./src/models/block/LogBlock.ts";
import { HttpBlock } from "./src/models/block/remote/HttpBlock.ts";
import { DbBlock } from "./src/models/block/remote/DbBlock.ts";
import { MessageBlock } from "./src/models/block/remote/MessageBlock.ts";
import { GraphQLBlock } from "./src/models/block/remote/GraphQLBlock.ts";
import type { Edge } from "./src/models/edge/Edge.ts";

const trace: Trace = {
    id: crypto.randomUUID(),
    name: "Complex Order Flow",
    createdAt: Date.now(),
    metadata: { environment: "staging" }
};

const userClickTime = Date.now() - 500; // Simulating user click 500ms ago

// 1. Gateway Entry
const ingress = new LogBlock({
    id: crypto.randomUUID(),
    traceId: trace.id,
    scope: "api-gateway",
    metadata: { message: "Order request received", level: "info" },
    originAt: userClickTime,
    receivedAt: Date.now()
});

// 2. User Profile Fetch (GraphQL)
const profileFetch = new GraphQLBlock({
    id: crypto.randomUUID(),
    traceId: trace.id,
    scope: "user-service",
    metadata: {
        url: "https://users.local/graphql",
        operationName: "GetUserDetails",
        query: "query GetUserDetails($id: ID!) { user(id: $id) { name email } }",
        variables: { id: "user-456" },
        statusCode: 200
    },
    originAt: userClickTime,
    startedAt: Date.now() + 5,
    endedAt: Date.now() + 25
});

// 3. Inventory Check (HTTP)
const inventoryCheck = new HttpBlock({
    id: crypto.randomUUID(),
    traceId: trace.id,
    scope: "inventory-service",
    metadata: {
        url: "https://inventory.local/check",
        method: "GET",
        statusCode: 200
    },
    originAt: userClickTime,
    startedAt: Date.now() + 30,
    endedAt: Date.now() + 65
});

// Edges
const edges: Edge[] = [
    { id: crypto.randomUUID(), traceId: trace.id, fromBlockId: ingress.id, toBlockId: profileFetch.id, edgeType: "sequential", metadata: {} },
    { id: crypto.randomUUID(), traceId: trace.id, fromBlockId: profileFetch.id, toBlockId: inventoryCheck.id, edgeType: "sequential", metadata: {} }
];

console.log("Trace:", JSON.stringify(trace, null, 2));
console.log("Sample Blocks (with originAt):", JSON.stringify([ingress, profileFetch, inventoryCheck], null, 2));
console.log("Edges:", JSON.stringify(edges, null, 2));