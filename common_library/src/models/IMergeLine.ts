export interface IMergeLine{
    srcX:number;
    srcY:number;
    endX:number;
    endY:number;
}

export function createMergeLineObj(){
    const obj:IMergeLine ={
        endX:0,
        endY:0,
        srcX:0,
        srcY:0
    }
    return obj;
}