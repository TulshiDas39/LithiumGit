import { DerivedState } from "../../publishers";
import { GraphUtils } from "../GraphUtils";

export class PbHorizontalScrollLeft extends DerivedState<number>{
    constructor(value:number){
        super(value);
        GraphUtils.state.horizontalScrollRatio.subscribe(this.update.bind(this));
        GraphUtils.state.horizontalScrollWidth.subscribe(this.update.bind(this));
        GraphUtils.state.svgContainerWidth.subscribe(this.update.bind(this));
    }
    protected applyChange(): void {
        var elem = GraphUtils.horizontalScrollBarElement;
        elem.style.left = `${this._val}px`;        
    }
    protected getDerivedValue(): number {
        const scrolRatio = GraphUtils.state.horizontalScrollRatio.value;
        const scrollWidth = GraphUtils.state.horizontalScrollWidth.value; 
        const movableWidth = GraphUtils.state.svgContainerWidth.value-scrollWidth;
        return movableWidth * scrolRatio;
    }

}