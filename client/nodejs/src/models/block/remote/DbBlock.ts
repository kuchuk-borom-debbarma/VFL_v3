import { Block, type BlockParams } from "../Block.ts";

/**
 * Metadata for Database operations.
 */
export interface DbMetadata {
  /** The database system (e.g., 'postgresql', 'mongodb', 'redis'). */
  system: string;
  /** The raw query string or command. */
  query: string;
  /** The specific table or collection being accessed. */
  collection?: string;
  /** Number of rows or documents affected by the operation. */
  rowsAffected?: number;
}

export interface DbBlockParams extends BlockParams<DbMetadata> {}

/**
 * Represents a database query or command.
 */
export class DbBlock extends Block<DbMetadata> {
  blockType = 'db';

  constructor(params: DbBlockParams) {
    super(params);
  }
}
