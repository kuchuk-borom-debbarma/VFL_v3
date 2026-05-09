import type { Trace } from "../models/trace/Trace.ts";
import type { Block } from "../models/block/Block.ts";
import type { Edge } from "../models/edge/Edge.ts";

/**
 * Internal engine responsible for state management and data persistence.
 * Separated from the public API to allow for easy refactoring of the storage/transport layer.
 */
export class VFLEngine {
  private traces: Map<string, Trace> = new Map();
  private blocks: Map<string, Block> = new Map();
  private edges: Edge[] = [];

  /**
   * Registers a trace in the internal state.
   */
  registerTrace(trace: Trace): void {
    this.traces.set(trace.id, trace);
    // TODO: In a real implementation, this would trigger an immediate push to the server
    console.debug(`[VFLEngine] Trace registered: ${trace.id} (${trace.name})`);
  }

  /**
   * Registers a block in the internal state.
   */
  registerBlock(block: Block): void {
    this.blocks.set(block.id, block);
    console.debug(`[VFLEngine] Block registered: ${block.id} [${block.blockType}]`);
  }

  /**
   * Registers an edge in the internal state.
   */
  registerEdge(edge: Edge): void {
    this.edges.push(edge);
    console.debug(`[VFLEngine] Edge registered: ${edge.fromBlockId} -> ${edge.toBlockId} [${edge.edgeType}]`);
  }

  /**
   * Returns a snapshot of the current state.
   */
  getState() {
    return {
      traces: Array.from(this.traces.values()),
      blocks: Array.from(this.blocks.values()).map(b => b.toJSON()),
      edges: this.edges,
    };
  }

  /**
   * Clears the internal state.
   */
  clear(): void {
    this.traces.clear();
    this.blocks.clear();
    this.edges = [];
  }
}
