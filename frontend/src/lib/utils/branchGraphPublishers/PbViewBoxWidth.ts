import { DerivedState } from "../../publishers";
import { GraphUtils } from "../BranchGraphUtils";

export class PbViewBoxWidth extends DerivedState<number>{
    constructor(value:number){
        super(value);
        GraphUtils.state.svgContainerWidth.subscribe(this.update.bind(this));
        GraphUtils.state.zoomLabel.subscribe(this.update.bind(this));
    }
    protected getDerivedValue(): number {
        const panelWidth = GraphUtils.state.svgContainerWidth.value;
        const zoom = GraphUtils.state.zoomLabel.value;
        return panelWidth / zoom;
    }
    protected applyChange(): void {
        
    }

}