export class Trace {
    readonly name: string;
    readonly id: string;
    readonly createdAt: string;

    constructor(name: string, id: string, createdAt: string) {
        this.name = name;
        this.id = id;
        this.createdAt = createdAt;
    }
}