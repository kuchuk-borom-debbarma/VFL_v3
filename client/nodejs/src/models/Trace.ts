export class Trace {
    readonly name: string
    readonly id: string
    readonly createdAt: number

    constructor(name: string) {
        this.name = name
        this.id = crypto.randomUUID()
        this.createdAt = Date.now()
    }
}