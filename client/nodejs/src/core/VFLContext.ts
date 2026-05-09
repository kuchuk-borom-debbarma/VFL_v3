import type { BaseBlock } from "../models/BlockBase";

export interface VFLContext {
    traceId: string;
    parentBlock?: BaseBlock
}