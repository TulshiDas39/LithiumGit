import { DerivedState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";

export class PbViewBoxHeight extends DerivedState<number>{
    constructor(value:number){
        super(value);
        BranchGraphUtils.state.panelHeight.subscribe(this.update.bind(this));
        BranchGraphUtils.state.zoomLabel.subscribe(this.update.bind(this));
    }
    protected getDerivedValue(): number {
        const panelHeight = BranchGraphUtils.state.panelHeight.value;
        const zoom = BranchGraphUtils.state.zoomLabel.value;
        return panelHeight / zoom;
    }
    protected applyChange(): void {
        
    }
    
}