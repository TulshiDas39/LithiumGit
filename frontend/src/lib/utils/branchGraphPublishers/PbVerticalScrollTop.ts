import { DerivedState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";

export class PbVerticalScrollTop extends DerivedState<number>{
    constructor(value:number){
        super(value);
        BranchGraphUtils.state.verticalScrollRatio2.subscribe(this.update.bind(this));
        BranchGraphUtils.state.verticalScrollHeight.subscribe(this.update.bind(this));
        BranchGraphUtils.state.panelHeight.subscribe(this.update.bind(this));
    }
    protected applyChange(): void {
        var elem = BranchGraphUtils.verticalScrollBarElement;
        elem.style.top = `${this._val}px`;        
    }
    protected getDerivedValue(): number {
        const scrolRatio = BranchGraphUtils.state.verticalScrollRatio2.value;
        const scrollHeight = BranchGraphUtils.state.verticalScrollHeight.value; 
        const movableWidth = BranchGraphUtils.state.panelHeight.value-scrollHeight;
        return movableWidth * scrolRatio;
    }
}