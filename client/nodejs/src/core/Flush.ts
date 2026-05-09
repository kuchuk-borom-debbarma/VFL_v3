import type { Trace } from "../models/trace/Trace.ts";
import type { Block } from "../models/block/Block.ts";
import type { Edge } from "../models/edge/Edge.ts";

export interface FlushData {
  traces: Trace[];
  blocks: any[]; // Serialized blocks
  edges: Edge[];
}

/**
 * Base abstract class for all VFL flush mechanisms.
 * A Flush is responsible for taking the internal state and exporting it to a destination.
 */
export abstract class VFLFlush {
  /**
   * Executes the flush operation with the provided data.
   */
  abstract flush(data: FlushData): Promise<void> | void;
}
