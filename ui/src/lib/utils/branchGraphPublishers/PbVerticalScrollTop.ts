import { DerivedState } from "../../publishers";
import { GraphUtils } from "../GraphUtils";

export class PbVerticalScrollTop extends DerivedState<number>{
    constructor(value:number){
        super(value);
        GraphUtils.state.verticalScrollRatio.subscribe(this.update.bind(this));
        GraphUtils.state.verticalScrollHeight.subscribe(this.update.bind(this));
        GraphUtils.state.panelHeight.subscribe(this.update.bind(this));
    }
    protected applyChange(): void {
        var elem = GraphUtils.verticalScrollBarElement;
        elem.style.top = `${this._val}px`;        
    }
    protected getDerivedValue(): number {
        const scrolRatio = GraphUtils.state.verticalScrollRatio.value;
        const scrollHeight = GraphUtils.state.verticalScrollHeight.value; 
        const movableWidth = GraphUtils.state.panelHeight.value-scrollHeight;
        return movableWidth * scrolRatio;
    }
}