import { DerivedState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";

export class PbViewBoxHeight extends DerivedState<number>{
    constructor(value:number){
        super(value);
        BranchGraphUtils.state.panelHeight.subscribe(this.update.bind(this));
        BranchGraphUtils.state.zoomLabel2.subscribe(this.update.bind(this));
    }
    protected getDerivedValue(): number {
        const panelHeight = BranchGraphUtils.state.panelHeight.value;
        const zoom = BranchGraphUtils.state.zoomLabel2.value;
        return panelHeight / zoom;
    }
    protected applyChange(): void {
        const svgElem = BranchGraphUtils.svgElement;
        svgElem.setAttribute("viewBox",BranchGraphUtils.getViewBoxStr());
    }
    
}