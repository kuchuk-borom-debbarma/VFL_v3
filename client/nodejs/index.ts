import { VFLClient } from "./src/client/VFLClient.ts";

// Initialize the VFL Client
const vfl = new VFLClient({
    defaultScope: "order-orchestrator"
});

console.log("--- Starting VFL Flow ---");

// 1. Start a Trace
let ctx = vfl.startTrace("User Checkout", { version: "2.0" });

// 2. Initial Log
ctx = vfl.log(ctx, "Checkout process initiated");

// 3. User Profile Fetch (GraphQL)
ctx = vfl.graphql(ctx, {
    url: "https://users.local/graphql",
    operationName: "GetUserDetails",
    query: "query { user(id: \"123\") { name } }",
    statusCode: 200
});

// 4. Branching: Sequential call to Inventory
let inventoryCtx = vfl.http(ctx, {
    url: "https://inventory.local/v1/stock",
    method: "GET",
    statusCode: 200
});

// 5. Branching: Database persistence from the same user context
let dbCtx = vfl.db(ctx, {
    system: "postgresql",
    query: "INSERT INTO checkout_logs ...",
    rowsAffected: 1
});

// 6. Manual link: Link inventory check completion to DB success (non-linear)
vfl.link(inventoryCtx, dbCtx, "sequential", { reason: "validation-complete" });

// 7. Final Step: Publish message from the DB context
ctx = vfl.message(dbCtx, {
    system: "kafka",
    topic: "orders",
    action: "publish"
});

console.log("--- Flow Complete ---");

// Output the internal state
const state = vfl.debugState();
console.log(JSON.stringify(state, null, 2));