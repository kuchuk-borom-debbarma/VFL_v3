import { VFLClient } from "../src/client/VFLClient.ts";
import type { VFLContext } from "../src/core/Context.ts";
import { MermaidFlush } from "../src/core/flushes/MermaidFlush.ts";

/**
 * Demonstrates Hierarchical Scopes and Nested Subgraphs.
 */

const vfl = new VFLClient({
  defaultScope: "api-gateway",
  flushes: [new MermaidFlush()]
});

async function runNestedFlow() {
  console.log("\n>>> Starting Hierarchical Scope Flow <<<\n");

  let ctx = vfl.startTrace("Deep Fulfillment Flow");
  ctx = vfl.log(ctx, "Checkout started");

  // --- Auth Service (with sub-modules) ---
  ctx = await (async (parentCtx) => {
    // Enter 'auth-service'
    let authCtx = vfl.subScope(parentCtx, "auth-service");
    authCtx = vfl.log(authCtx, "Validating session");

    // Enter 'permissions' module inside 'auth-service'
    let permCtx = vfl.subScope(authCtx, "permissions-module");
    permCtx = vfl.log(permCtx, "Checking granular access");
    await sleep(20);
    permCtx = vfl.log(permCtx, "Access granted");

    // Return to 'auth-service' level
    authCtx = vfl.log(permCtx, "Session fully verified");
    return authCtx;
  })(ctx);

  // --- Inventory & Shipping (Parallel) ---
  const [invFinal, shipFinal] = await Promise.all([
    // Inventory Service
    (async (parentCtx) => {
      let invCtx = vfl.subScope(parentCtx, "inventory-service");
      invCtx = vfl.log(invCtx, "Reserving stock");
      
      // Nested DB call
      let dbCtx = vfl.subScope(invCtx, "database-layer");
      dbCtx = vfl.db(dbCtx, { system: "postgres", query: "UPDATE stock..." });
      
      return vfl.log(dbCtx, "Stock reserved");
    })(ctx),

    // Shipping Service
    (async (parentCtx) => {
      let shipCtx = vfl.subScope(parentCtx, "shipping-service");
      shipCtx = vfl.log(shipCtx, "Fetching rates");
      
      // Nested Legacy API
      let legacyCtx = vfl.subScope(shipCtx, "legacy-adapter");
      legacyCtx = vfl.http(legacyCtx, { url: "https://legacy.soap", method: "POST", statusCode: 200 });
      
      return vfl.log(legacyCtx, "Rates fetched");
    })(ctx)
  ]);

  // Final merge
  ctx = vfl.log(shipFinal, "All systems integrated");
  vfl.link(invFinal, ctx, "sequential");

  console.log("\n>>> Deep Flow Finished. <<<\n");
  await vfl.flush();
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

runNestedFlow();
