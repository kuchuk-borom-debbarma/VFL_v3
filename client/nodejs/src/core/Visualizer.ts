import type { Trace } from "../models/trace/Trace.ts";
import type { Block } from "../models/block/Block.ts";
import type { Edge } from "../models/edge/Edge.ts";

export interface StructuredNode {
  block: any;
  children: Array<{
    edge: Edge;
    node: StructuredNode;
  }>;
}

export interface StructuredTrace {
  trace: Trace;
  roots: StructuredNode[];
}

/**
 * Utility class to transform flat VFL data into a hierarchical structure for visualization.
 */
export class VFLVisualizer {
  /**
   * Transforms flat blocks and edges into a recursive tree structure.
   * Handles non-linear graphs by allowing blocks to appear in multiple branches if they have multiple parents.
   */
  static structure(trace: Trace, blocks: any[], edges: Edge[]): StructuredTrace {
    const blockMap = new Map<string, any>(
      blocks.map(b => [b.id, typeof b.toJSON === 'function' ? b.toJSON() : b])
    );
    
    // 1. Identify root blocks (those that are never a 'toBlockId')
    const targetBlockIds = new Set(edges.map(e => e.toBlockId));
    const rootBlocks = blocks.filter(b => !targetBlockIds.has(b.id));

    // 2. Build the hierarchy recursively
    const buildNode = (blockId: string): StructuredNode => {
      const block = blockMap.get(blockId);
      const outboundEdges = edges.filter(e => e.fromBlockId === blockId);

      return {
        block,
        children: outboundEdges.map(edge => ({
          edge,
          node: buildNode(edge.toBlockId)
        }))
      };
    };

    return {
      trace,
      roots: rootBlocks.map(root => buildNode(root.id))
    };
  }
}
