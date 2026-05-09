import { Block, type BlockParams } from "../Block.ts";

/**
 * Metadata for GraphQL-based remote calls.
 */
export interface GraphQLMetadata {
  /** The GraphQL endpoint URL. */
  url: string;
  /** The name of the GraphQL operation being executed. */
  operationName?: string;
  /** The raw GraphQL query or mutation string. */
  query: string;
  /** The variables provided to the GraphQL operation. */
  variables?: Record<string, any>;
  /** The resulting HTTP status code. */
  statusCode?: number;
  /** Any errors returned in the GraphQL response body. */
  errors?: any[];
}

export interface GraphQLBlockParams extends BlockParams<GraphQLMetadata> {}

/**
 * Represents a GraphQL query or mutation.
 * Captures specific GraphQL context like query strings and operation names.
 */
export class GraphQLBlock extends Block<GraphQLMetadata> {
  blockType = 'graphql';

  constructor(params: GraphQLBlockParams) {
    super(params);
  }
}
