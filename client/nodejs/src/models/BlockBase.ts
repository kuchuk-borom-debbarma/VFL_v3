export abstract class BaseBlock {
    //Base
    readonly traceId: string;
    readonly id: string;
    readonly blockType: string;
    readonly parentBlockId?: string;
    readonly scopeBlockId: string;
    readonly data: Record<string, any>;

    //Time
    readonly enteredAt?: number; //When this was called by parent
    readonly ranAt: number; //When this started executing
    readonly finishedAt: number; //When this finished executing
    readonly exitedAt?: number; //When it returned to parent

    constructor(initData: {
        traceId: string;
        id: string;
        blockType: string;
        parentBlockId?: string;
        scopeBlockId: string;
        data: Record<string, any>;
        ranAt: number;
        finishedAt: number;
        enteredAt?: number;
        exitedAt?: number;

    }) {
        this.traceId = initData.traceId;
        this.id = initData.id;
        this.blockType = initData.blockType;
        this.parentBlockId = initData.parentBlockId;
        this.scopeBlockId = initData.scopeBlockId;
        this.data = initData.data;
        this.enteredAt = initData.enteredAt;
        this.ranAt = initData.ranAt;
        this.finishedAt = initData.finishedAt;
        this.exitedAt = initData.exitedAt;
    }
}