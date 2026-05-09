/**
 * The base interface for all VFL flushers. Flushes the logs to the server
 */
export interface VFLFlusherBase<T> {
    flush(items: T[]): void | Promise<void>
}