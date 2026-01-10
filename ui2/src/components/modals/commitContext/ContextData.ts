export class ContextData{
    static readonly optionClasses = "border-bottom context-option";
}

export enum Option{
    Checkout,
    Merge,
    Rebase,
    CherryPick,
    MoreOptions,
    SoftReset,
    HardReset,
    DeleteBranch,
}

export interface IBaseProps{
    hideModal:()=>void;
    onMouseHover:(opt:Option)=>void;
}