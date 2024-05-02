import { DerivedState } from "../../publishers";
import { GraphUtils } from "../GraphUtils";

export class PbViewBoxHeight extends DerivedState<number>{
    constructor(value:number){
        super(value);
        GraphUtils.state.panelHeight.subscribe(this.update.bind(this));
        GraphUtils.state.zoomLabel.subscribe(this.update.bind(this));
    }
    protected getDerivedValue(): number {
        const panelHeight = GraphUtils.state.panelHeight.value;
        const zoom = GraphUtils.state.zoomLabel.value;
        return panelHeight / zoom;
    }
    protected applyChange(): void {
        
    }
    
}