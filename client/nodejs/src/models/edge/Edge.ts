/**
 * Represents a typed connection between two blocks in a trace.
 */
export interface Edge {
  /** Unique identifier for this edge. */
  id: string;
  /** The trace this edge belongs to. */
  traceId: string;
  /** The ID of the originating block. */
  fromBlockId: string;
  /** The ID of the destination block. */
  toBlockId: string;
  /** The semantic type of the relationship (e.g., 'sequential', 'async', 'retry'). */
  edgeType: string;
  /** Generic metadata for the edge. */
  metadata: Record<string, any>;
}
