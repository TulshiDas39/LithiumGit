import { DerivedPublisher } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";

export class PbHorizontalScrollLeft extends DerivedPublisher<number>{
    constructor(value?:number){
        super(value);
        BranchGraphUtils.state.horizontalScrollRatio2.subscribe(this.update.bind(this));
        BranchGraphUtils.state.horizontalScrollWidth.subscribe(this.update.bind(this));
        BranchGraphUtils.state.panelWidth.subscribe(this.update.bind(this));
    }
    onChange(): void {
        var elem = BranchGraphUtils.horizontalScrollBarElement;
        elem.style.left = `${this._val}px`;        
    }
    getDerivedValue(): number {
        const scrolRatio = BranchGraphUtils.state.horizontalScrollRatio2.value;
        const scrollWidth = BranchGraphUtils.state.horizontalScrollWidth.value; 
        const movableWidth = BranchGraphUtils.state.panelWidth.value-scrollWidth;
        return movableWidth * scrolRatio;
    }

}