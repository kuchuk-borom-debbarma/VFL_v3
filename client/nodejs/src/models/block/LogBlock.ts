import { Block, type BlockParams } from "./Block.ts";

export interface LogMetadata {
  message: string;
  level: 'info' | 'warn' | 'error' | 'debug';
}

export interface LogBlockParams extends BlockParams<LogMetadata> {}

export class LogBlock extends Block<LogMetadata> {
  blockType = 'log';

  constructor(params: LogBlockParams) {
    super(params);
  }
}
