/**
 * A realistic order processing flow using only standard logging.
 * This represents the "Before" state - hard to visualize relationships and latencies.
 */

async function processOrder(orderId: string) {
  console.log(`[OrderService] Starting process for order: ${orderId}`);

  // 1. Validation
  console.log(`[OrderService] Validating order ${orderId}...`);
  await sleep(20);
  console.log(`[OrderService] Order ${orderId} is valid.`);

  // 2. Fetch User (GraphQL)
  console.log(`[UserService] Fetching user profile for order ${orderId}...`);
  await sleep(50);
  console.log(`[UserService] User profile retrieved.`);

  // 3. Parallel Tasks
  console.log(`[OrderService] Running parallel tasks for ${orderId}...`);
  
  const stockPromise = (async () => {
    console.log(`[InventoryService] Checking stock for order ${orderId}...`);
    await sleep(100);
    console.log(`[InventoryService] Stock confirmed.`);
  })();

  const dbPromise = (async () => {
    console.log(`[OrderService] Logging transaction to DB for ${orderId}...`);
    await sleep(40);
    console.log(`[OrderService] DB Write successful.`);
  })();

  await Promise.all([stockPromise, dbPromise]);

  // 4. Confirmation
  console.log(`[OrderService] Confirming order ${orderId}...`);
  await sleep(10);

  // 5. Messaging
  console.log(`[LogisticsService] Publishing order.confirmed event for ${orderId}...`);
  await sleep(5);
  
  console.log(`[OrderService] Order ${orderId} processed successfully.`);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Execute the flow
processOrder("ORD-999").then(() => console.log("Flow finished."));
