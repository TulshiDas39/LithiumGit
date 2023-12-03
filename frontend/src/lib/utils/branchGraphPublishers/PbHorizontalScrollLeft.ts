import { DerivedState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";

export class PbHorizontalScrollLeft extends DerivedState<number>{
    constructor(value:number){
        super(value);
        BranchGraphUtils.state.horizontalScrollRatio2.subscribe(this.update.bind(this));
        BranchGraphUtils.state.horizontalScrollWidth.subscribe(this.update.bind(this));
        BranchGraphUtils.state.svgContainerWidth.subscribe(this.update.bind(this));
    }
    protected applyChange(): void {
        var elem = BranchGraphUtils.horizontalScrollBarElement;
        elem.style.left = `${this._val}px`;        
    }
    protected getDerivedValue(): number {
        const scrolRatio = BranchGraphUtils.state.horizontalScrollRatio2.value;
        const scrollWidth = BranchGraphUtils.state.horizontalScrollWidth.value; 
        const movableWidth = BranchGraphUtils.state.svgContainerWidth.value-scrollWidth;
        return movableWidth * scrolRatio;
    }

}