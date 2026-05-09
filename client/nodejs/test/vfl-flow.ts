import { VFLClient } from "../src/client/VFLClient.ts";
import { JsonFlush } from "../src/core/flushes/JsonFlush.ts";
import { StructuredJsonFlush } from "../src/core/flushes/StructuredJsonFlush.ts";
import { MermaidFlush } from "../src/core/flushes/MermaidFlush.ts";

/**
 * Realistic flow testing the Flush and Batching mechanisms.
 */

// Initialize client with multiple flushes and a batch size of 4
const vfl = new VFLClient({
  defaultScope: "order-service",
  batchSize: 4,
  flushes: [
    new JsonFlush(),
    new StructuredJsonFlush(),
    new MermaidFlush()
  ]
});

async function processOrder(orderId: string) {
  console.log(`\n>>> Processing Order: ${orderId} <<<\n`);
  
  let ctx = vfl.startTrace(`Order Flow: ${orderId}`);

  // 1. Log (Block 1)
  ctx = vfl.log(ctx, "Starting validation");
  await sleep(10);

  // 2. HTTP (Block 2)
  ctx = vfl.http(ctx, { url: "https://auth.local", method: "POST", statusCode: 200 });
  await sleep(10);

  // 3. DB (Block 3)
  ctx = vfl.db(ctx, { system: "redis", query: "GET user:123" });
  await sleep(10);

  // 4. GraphQL (Block 4) -> This should trigger the first AUTO-FLUSH (batchSize: 4)
  console.log("\n[TEST] Adding 4th block, expecting AUTO-FLUSH...");
  ctx = vfl.graphql(ctx, { 
    url: "https://api.local/graphql", 
    query: "query { stock }", 
    statusCode: 200 
  });

  // 5. Message (Block 5) -> Part of the next batch
  ctx = vfl.message(ctx, { system: "kafka", topic: "orders", action: "publish" });

  // Manually flush the remaining blocks at the end of the flow
  console.log("\n[TEST] Flow finished, triggering MANUAL FLUSH for remaining blocks...");
  await vfl.flush();
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

processOrder("ORD-BATCH-789");
