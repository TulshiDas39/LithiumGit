import { BranchUtils } from "./BranchUtils";

export class BranchGraphUtils{
    static branchPanelContainerId = "branchPanelContainer";
    static branchPanelRootElement:HTMLDivElement= null!;
    static panelWidth = -1;
    
    static createBranchPanel(){
        if(!BranchUtils.repositoryDetails) return;
        if(this.panelWidth ===  -1) return;

        this.branchPanelRootElement = document.createElement('div');
        this.branchPanelRootElement.id = "branchPanel";
        this.branchPanelRootElement.classList.add("w-100");
        this.branchPanelRootElement.style.overflow="hidden";

        let svgContainer = document.createElement('div');
        svgContainer.classList.add("d-flex align-items-stretch");
    }
}