import type { VFLContext } from "../core/VFLContext";

//used to expose functions that have access to VFL context.
export abstract class VFLCtxFlow {
    readonly ctx: VFLContext
    constructor(ctx: VFLContext) {
        this.ctx = ctx;
    }
}