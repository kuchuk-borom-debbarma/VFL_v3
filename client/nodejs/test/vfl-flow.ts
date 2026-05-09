import { VFLClient } from "../src/client/VFLClient.ts";
import type { VFLContext } from "../src/core/Context.ts";
import { MermaidFlush } from "../src/core/flushes/MermaidFlush.ts";

/**
 * The instrumented version of the realistic checkout process.
 * Demonstrates how context-passing preserves the relationship across functions
 * and parallel branches.
 */

const vfl = new VFLClient({
  defaultScope: "api-gateway",
  flushes: [new MermaidFlush()]
});

async function validateUser(ctx: VFLContext, userId: string) {
  // Use 'withScope' style logic manually by switching scope in the call
  let authCtx = vfl.log({ ...ctx, scope: "auth-service" }, `Validating session for user: ${userId}`);
  await sleep(30);
  return vfl.log(authCtx, "Session valid");
}

async function checkInventory(ctx: VFLContext, items: string[]) {
  let invCtx = vfl.log({ ...ctx, scope: "inventory-service" }, `Checking stock for items: ${items.join(", ")}`);
  
  // Simulated remote HTTP call
  invCtx = vfl.http(invCtx, { 
    url: "https://inventory.local/v1/stock", 
    method: "GET", 
    statusCode: 200 
  });
  
  await sleep(150);
  return vfl.log(invCtx, "Stock availability confirmed");
}

async function processPayment(ctx: VFLContext, amount: number) {
  let payCtx = vfl.log({ ...ctx, scope: "payment-service" }, `Initiating payment for $${amount}`);
  
  // Simulated remote DB call
  payCtx = vfl.db(payCtx, { 
    system: "stripe-gateway", 
    query: "POST /v1/charges", 
    rowsAffected: 1 
  });
  
  await sleep(200);
  return vfl.log(payCtx, "Payment processed successfully");
}

async function trackEvent(ctx: VFLContext, event: string) {
  let anaCtx = vfl.log({ ...ctx, scope: "analytics-service" }, `Tracking event: ${event}`);
  
  // Simulated remote Message call
  anaCtx = vfl.message(anaCtx, { 
    system: "segment", 
    topic: "events", 
    action: "publish" 
  });
  
  await sleep(10);
  return anaCtx;
}

async function checkoutProcess(orderId: string) {
  console.log(`\n>>> [VFL] Starting Instrumented Checkout: ${orderId} <<<\n`);

  // Start Trace
  let ctx = vfl.startTrace("Checkout Flow", { orderId });
  ctx = vfl.log(ctx, `Received checkout request for ${orderId}`);

  // 1. Auth Call
  ctx = await validateUser(ctx, "user_123");

  // 2. Parallel Tasks
  // Both tasks inherit the same parent 'ctx'
  console.log(`[VFL] Dispatching parallel tasks...`);
  const [invCtxFinal, payCtxFinal] = await Promise.all([
    checkInventory(ctx, ["item_A", "item_B"]),
    processPayment(ctx, 150.00)
  ]);

  // 3. Final steps - we continue from the payment completion, but could link both
  ctx = vfl.log(payCtxFinal, `Finalizing order ${orderId}`);
  
  // Manual link to show that inventory also had to finish
  vfl.link(invCtxFinal, ctx, "sequential", { note: "inventory-ready" });

  await trackEvent(ctx, "order_completed");

  console.log(`\n>>> [VFL] Instrumented Flow Finished. <<<\n`);
  
  // Ensure data is flushed to the Mermaid output
  await vfl.flush();
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

checkoutProcess("ORD-VFL-202");
