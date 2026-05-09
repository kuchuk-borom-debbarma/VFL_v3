/**
 * Represents the immutable state of a flow at a specific point in time.
 * Users pass this context to API calls to chain blocks and preserve trace identity.
 */
export interface VFLContext {
  /** The unique ID of the trace this context belongs to. */
  readonly traceId: string;
  /** The ID of the most recently created block in this path, used for automatic chaining. */
  readonly currentBlockId?: string;
  /** The current scope (service/component name). */
  readonly scope: string;
}
