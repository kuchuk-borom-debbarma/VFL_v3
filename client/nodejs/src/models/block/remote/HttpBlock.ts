import { Block, type BlockParams } from "../Block.ts";

/**
 * Metadata for HTTP-based remote calls.
 */
export interface HttpMetadata {
  url: string;
  method: string;
  statusCode?: number;
  requestSize?: number;
  responseSize?: number;
}

export interface HttpBlockParams extends BlockParams<HttpMetadata> {}

/**
 * Represents an HTTP request/response cycle.
 */
export class HttpBlock extends Block<HttpMetadata> {
  blockType = 'http';

  constructor(params: HttpBlockParams) {
    super(params);
  }
}
