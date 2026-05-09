/**
 * The base interface for all VFL buffers. Buffers the logs and then flushes them
 */
export interface VFLBaseBuffer<T> {
    push(item: T): void
    drain(): T[]
    size(): number
}