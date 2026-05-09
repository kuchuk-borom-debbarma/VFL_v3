/**
 * A realistic simulation of a checkout process using only standard console logging.
 * This baseline demonstrates how hard it is to track flows across function boundaries
 * and parallel executions without structured tracing.
 */

async function validateUser(userId: string) {
  console.log(`[AuthService] Validating session for user: ${userId}`);
  await sleep(30);
  console.log(`[AuthService] Session valid.`);
}

async function checkInventory(items: string[]) {
  console.log(`[InventoryService] Checking stock for items: ${items.join(", ")}`);
  await sleep(150); // Faked remote API latency
  console.log(`[InventoryService] Stock availability confirmed.`);
}

async function processPayment(amount: number) {
  console.log(`[PaymentService] Initiating payment for $${amount}`);
  await sleep(200); // Faked remote DB/Gateway latency
  console.log(`[PaymentService] Payment processed successfully.`);
}

async function trackEvent(event: string) {
  console.log(`[AnalyticsService] Tracking event: ${event}`);
  await sleep(10);
}

async function checkoutProcess(orderId: string) {
  console.log(`\n>>> [Gateway] Received checkout request for ${orderId} <<<\n`);

  // 1. Synchronous dependency
  await validateUser("user_123");

  // 2. Parallel dependencies
  console.log(`[Gateway] Dispatching inventory and payment tasks in parallel...`);
  await Promise.all([
    checkInventory(["item_A", "item_B"]),
    processPayment(150.00)
  ]);

  // 3. Final steps
  console.log(`[Gateway] Finalizing order ${orderId}...`);
  await trackEvent("order_completed");

  console.log(`\n>>> [Gateway] Checkout ${orderId} finished successfully <<<\n`);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Start the process
checkoutProcess("ORD-REAL-101");
