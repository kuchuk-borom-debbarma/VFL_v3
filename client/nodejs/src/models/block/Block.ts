/**
 * Parameters for initializing a Block.
 */
export interface BlockParams<TMetadata = Record<string, any>> {
  /** Unique identifier for this block (usually a UUID). */
  id: string;
  /** Reference to the Trace this block belongs to. */
  traceId: string;
  /** Label indicating ownership or context (e.g., 'api-gateway', 'order-service'). */
  scope: string;
  /** Strongly typed metadata for the block, defined by its type. */
  metadata: TMetadata;
  /** 
   * Timestamp (ms) when the block's operation was first received by the system.
   * Useful for tracking ingress latency.
   */
  receivedAt?: number | null;
  /** 
   * Timestamp (ms) when the actual processing for this block started.
   * If not provided, defaults to the current time.
   */
  startedAt?: number;
  /** 
   * Timestamp (ms) when the processing for this block was completed.
   */
  endedAt?: number | null;
  /** 
   * Timestamp (ms) when the result of this block's operation left the system.
   * Useful for tracking egress latency.
   */
  leftAt?: number | null;
}

/**
 * Base abstract class for all VFL Blocks.
 * A Block represents an atomic unit of work within a distributed flow.
 */
export abstract class Block<TMetadata = Record<string, any>> {
  /** Unique identifier for this block. */
  id: string;
  /** The trace this block is part of. */
  traceId: string;
  /** The service or component that owns this block. */
  scope: string;
  /** The semantic type of this block (e.g., 'log', 'remote', 'box'). */
  abstract blockType: string;
  /** Strongly-typed metadata for the block. */
  metadata: TMetadata;

  /** Time the request was received at the system boundary. */
  receivedAt: number | null;
  /** Time the processing of the block started. */
  startedAt: number;
  /** Time the processing of the block finished. */
  endedAt: number | null;
  /** Time the response left the system boundary. */
  leftAt: number | null;

  constructor(params: BlockParams<TMetadata>) {
    this.id = params.id;
    this.traceId = params.traceId;
    this.scope = params.scope;
    this.metadata = params.metadata;
    this.receivedAt = params.receivedAt ?? null;
    this.startedAt = params.startedAt ?? Date.now();
    this.endedAt = params.endedAt ?? null;
    this.leftAt = params.leftAt ?? null;
  }

  /**
   * Serializes the block into a plain object for transport or storage.
   */
  toJSON() {
    return {
      id: this.id,
      traceId: this.traceId,
      scope: this.scope,
      blockType: this.blockType,
      metadata: this.metadata,
      receivedAt: this.receivedAt,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      leftAt: this.leftAt,
    };
  }
}
