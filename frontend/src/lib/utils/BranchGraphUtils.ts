import { IViewBox } from "../interfaces";
import { BranchUtils } from "./BranchUtils";

export class BranchGraphUtils{
    static branchPanelContainerId = "branchPanelContainer";
    static branchPanelRootElement:HTMLDivElement= null!;
    static panelWidth = -1;
    static panelHeight = 400;
    static get horizontalScrollContainerWidth(){
        return this.panelWidth+10;
    }
    static createBranchPanel(){
        if(!BranchUtils.repositoryDetails) return;
        if(this.panelWidth ===  -1) return;

        this.branchPanelRootElement = document.createElement('div');
        this.branchPanelRootElement.id = "branchPanel";
        this.branchPanelRootElement.classList.add("w-100");
        this.branchPanelRootElement.style.overflow="hidden";

        let svgContainer = document.createElement('div');
        svgContainer.classList.add("d-flex","align-items-stretch");
        svgContainer.style.width = `${this.horizontalScrollContainerWidth}px`;
        const svg = document.createElement('svg');
        svg.setAttribute('width',`${this.panelWidth}px`);
        svg.setAttribute('height',`${this.panelHeight}px`)
        // svg.style.height = `${this.panelHeight}px`;
        const viewBox:IViewBox =  {x:0,y:0,width:this.panelWidth,height:this.panelHeight};
        svg.setAttribute('viewBox',`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`)
        svg.style.transform = `scale(1)`;
        svgContainer.appendChild(svg);

        this.branchPanelRootElement.appendChild(svgContainer);
    }

    static insertNewBranchGraph(){
        if(!this.branchPanelRootElement) return;
        const container = document.querySelector(`#${this.branchPanelContainerId}`);
        if(!container) return;
        container.innerHTML = '';
        container.appendChild(this.branchPanelRootElement);
    }
}