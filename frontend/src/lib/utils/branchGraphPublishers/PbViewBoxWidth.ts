import { DerivedState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";

export class PbViewBoxWidth extends DerivedState<number>{
    constructor(value:number){
        super(value);
        BranchGraphUtils.state.svgContainerWidth.subscribe(this.update.bind(this));
        BranchGraphUtils.state.zoomLabel.subscribe(this.update.bind(this));
    }
    protected getDerivedValue(): number {
        const panelWidth = BranchGraphUtils.state.svgContainerWidth.value;
        const zoom = BranchGraphUtils.state.zoomLabel.value;
        return panelWidth / zoom;
    }
    protected applyChange(): void {
        
    }

}