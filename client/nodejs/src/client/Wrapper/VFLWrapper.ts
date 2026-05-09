import type { VFLBaseBuffer } from "../../core/VFLBufferBase";
import type { VFLContext } from "../../core/VFLContext";
import type { VFLFlusherBase } from "../../core/VFLFlusherBase";
import { Trace } from "../../models/Trace"
import { VFLCtxFlow } from "../VFLCtxFlow";
import { VFLCtxWrapper } from "./VFLCtxWrapper";


export class VFLWrapper<T> {
    constructor(
        private readonly buffer: VFLBaseBuffer<unknown>,
        private readonly flusher: VFLFlusherBase<unknown>,
        private readonly ctxFlowBuilder: (ctx: VFLContext) => VFLCtxFlow
    ) { }

    startTrace<T>(traceName: string, fn: (vflContext: VFLCtxFlow) => Promise<T>): Promise<T>
    startTrace<T>(traceName: string, fn: (vflContext: VFLCtxFlow) => T): T
    startTrace<T>(traceName: string, fn: (vflContext: VFLCtxFlow) => Promise<T> | T): Promise<T> | T {
        const trace = new Trace(traceName)
        this.buffer.push(trace)

        const context: VFLContext = {
            traceId: trace.id
        }

        let result: Promise<T> | T

        try {
            result = fn(new VFLCtxWrapper(context))
        } catch (e) {
            this.buffer.push({ traceId: trace.id, type: 'EOF', status: 'failure' })
            this.flusher.flush(this.buffer.drain())
            throw e
        }

        if (result instanceof Promise) {
            return result
                .then((val) => {
                    this.buffer.push({ traceId: trace.id, type: 'EOF', status: 'success' })
                    this.flusher.flush(this.buffer.drain())
                    return val
                })
                .catch((e) => {
                    this.buffer.push({ traceId: trace.id, type: 'EOF', status: 'failure' })
                    this.flusher.flush(this.buffer.drain())
                    throw e
                }) as Promise<T>
        }

        this.buffer.push({ traceId: trace.id, type: 'EOF', status: 'success' })
        this.flusher.flush(this.buffer.drain())
        return result
    }
}