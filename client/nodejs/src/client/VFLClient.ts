import { VFLEngine } from "../core/Engine.ts";
import type { VFLContext } from "../core/Context.ts";
import type { Trace } from "../models/trace/Trace.ts";
import type { Edge } from "../models/edge/Edge.ts";

// Block imports
import { LogBlock, type LogMetadata } from "../models/block/LogBlock.ts";
import { HttpBlock, type HttpMetadata } from "../models/block/remote/HttpBlock.ts";
import { DbBlock, type DbMetadata } from "../models/block/remote/DbBlock.ts";
import { MessageBlock, type MessageMetadata } from "../models/block/remote/MessageBlock.ts";
import { GraphQLBlock, type GraphQLMetadata } from "../models/block/remote/GraphQLBlock.ts";

import { VFLVisualizer } from "../core/Visualizer.ts";

import { VFLFlush } from "../core/Flush.ts";

export interface ClientOptions {
  defaultScope: string;
  /** List of flush mechanisms to use for telemetry. */
  flushes?: VFLFlush[];
  /** Number of blocks to collect before automatically flushing. Defaults to 0 (no auto-flush). */
  batchSize?: number;
}

/**
 * The primary entry point for VFL users.
 * Provides a high-level API to create traces, blocks, and connections using a context-passing pattern.
 */
export class VFLClient {
  private engine: VFLEngine;
  private defaultScope: string;
  private flushes: VFLFlush[];
  private batchSize: number;
  private blockCount: number = 0;

  constructor(options: ClientOptions, engine?: VFLEngine) {
    this.engine = engine ?? new VFLEngine();
    this.defaultScope = options.defaultScope;
    this.flushes = options.flushes ?? [];
    this.batchSize = options.batchSize ?? 0;
  }

  /**
   * Starts a new trace and returns the initial context.
   */
  startTrace(name: string, metadata: Record<string, any> = {}): VFLContext {
    const trace: Trace = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      metadata,
    };

    this.engine.registerTrace(trace);

    return {
      traceId: trace.id,
      scope: this.defaultScope,
    };
  }

  /**
   * Internal helper to create a block and an edge from the current context.
   */
  private createLinkedBlock<TBlock extends any, TMetadata>(
    ctx: VFLContext,
    BlockClass: new (params: any) => TBlock,
    metadata: TMetadata,
    edgeType: string = 'sequential'
  ): { block: TBlock; context: VFLContext } {
    const blockId = crypto.randomUUID();
    
    // @ts-ignore - Dynamic instantiation of abstract-extending classes
    const block = new BlockClass({
      id: blockId,
      traceId: ctx.traceId,
      scope: ctx.scope,
      metadata,
      startedAt: Date.now(),
    });

    this.engine.registerBlock(block as any);
    this.blockCount++;

    if (ctx.currentBlockId) {
      const edge: Edge = {
        id: crypto.randomUUID(),
        traceId: ctx.traceId,
        fromBlockId: ctx.currentBlockId,
        toBlockId: blockId,
        edgeType,
        metadata: {},
      };
      this.engine.registerEdge(edge);
    }

    // Check if batch size reached
    if (this.batchSize > 0 && this.blockCount >= this.batchSize) {
      this.flush();
    }

    return {
      block,
      context: {
        ...ctx,
        currentBlockId: blockId,
      },
    };
  }

  /**
   * Adds a log block to the trace.
   */
  log(ctx: VFLContext, message: string, level: LogMetadata['level'] = 'info'): VFLContext {
    return this.createLinkedBlock(ctx, LogBlock, { message, level }).context;
  }

  /**
   * Adds an HTTP block to the trace.
   */
  http(ctx: VFLContext, metadata: HttpMetadata): VFLContext {
    return this.createLinkedBlock(ctx, HttpBlock, metadata).context;
  }

  /**
   * Adds an Database block to the trace.
   */
  db(ctx: VFLContext, metadata: DbMetadata): VFLContext {
    return this.createLinkedBlock(ctx, DbBlock, metadata).context;
  }

  /**
   * Adds a Message block to the trace.
   */
  message(ctx: VFLContext, metadata: MessageMetadata): VFLContext {
    return this.createLinkedBlock(ctx, MessageBlock, metadata).context;
  }

  /**
   * Adds a GraphQL block to the trace.
   */
  graphql(ctx: VFLContext, metadata: GraphQLMetadata): VFLContext {
    return this.createLinkedBlock(ctx, GraphQLBlock, metadata).context;
  }

  /**
   * Manually creates an edge between two contexts.
   * Useful for non-linear branching.
   */
  link(from: VFLContext, to: VFLContext, edgeType: string = 'async', metadata: Record<string, any> = {}): void {
    if (!from.currentBlockId || !to.currentBlockId) {
      throw new Error("Cannot link contexts without active blocks.");
    }

    const edge: Edge = {
      id: crypto.randomUUID(),
      traceId: from.traceId,
      fromBlockId: from.currentBlockId,
      toBlockId: to.currentBlockId,
      edgeType,
      metadata,
    };

    this.engine.registerEdge(edge);
  }

  /**
   * Manually triggers all registered flushes and clears the internal state.
   * This is typically called at the end of a request lifecycle or when a batch is full.
   * 
   * @returns A promise that resolves when all flushes have completed.
   */
  async flush(): Promise<void> {
    const data = this.engine.getState();
    
    // Skip if there's nothing to flush to avoid unnecessary overhead
    if (data.blocks.length === 0) return;

    // Execute all registered flush mechanisms in parallel
    await Promise.all(this.flushes.map(f => f.flush(data)));
    
    // Clear internal engine state and reset counters after successful flush
    this.engine.clear();
    this.blockCount = 0;
  }

  /**
   * Returns a snapshot of the current internal state of the engine.
   * Mostly used for debugging or custom reporting.
   */
  debugState() {
    return this.engine.getState();
  }

  /**
   * Returns a hierarchical, structured view of a specific trace.
   * It maps flat blocks and edges into a recursive tree structure,
   * making it ideal for rendering flow diagrams in a UI.
   * 
   * @param traceId The ID of the trace to visualize.
   * @returns A structured object containing the trace tree.
   * @throws Error if the traceId is not found in the current state.
   */
  getVisualization(traceId: string) {
    const state = this.engine.getState();
    const trace = state.traces.find(t => t.id === traceId);
    if (!trace) throw new Error(`Trace ${traceId} not found.`);

    const blocks = state.blocks.filter(b => b.traceId === traceId);
    const edges = state.edges.filter(e => e.traceId === traceId);

    return VFLVisualizer.structure(trace, blocks as any, edges);
  }
}
