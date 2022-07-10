import { IPositition, IViewBox } from "../interfaces";
import { BranchUtils } from "./BranchUtils";
import * as ReactDOMServer from 'react-dom/server';
import { BranchPanel2 } from "../../components/selectedRepository/selectedRepoRight/branches/BranchPanel2";
import { UiUtils } from "./UiUtils";
import { EnumIdPrefix } from "../enums";

interface IState{
    scrollTop:number;
    scrollLeft:number;
    horizontalScrollRatio:number;
    verticalScrollRatio:number;
    viewBox:IViewBox;
    notScrolledHorizontallyYet:boolean;
    notScrolledVerticallyYet:boolean;
    verticalScrollTop:number;
    horizontalScrollLeft:number;    
}

export class BranchGraphUtils{
    static branchPanelContainerId = "branchPanelContainer";
    static horizontalScrollBarId = "horizontalScrollBar";
    static verticalScrollBarId = "verticalScrollBar";
    static branchPanelContainer:HTMLDivElement;
    static branchPanelRootElement:HTMLDivElement= null!;
    static svgElement:SVGSVGElement = null!;
    static horizontalScrollBarElement:HTMLDivElement = null!;
    static verticalScrollBarElement:HTMLDivElement = null!;
    static headElement:HTMLElement = null!;
    static branchPanelHtml:string='';
    static panelWidth = -1;
    static panelHeight = 400;
    static zoom = 0;
    static horizontalScrollWidth = 0;
    static verticalScrollHeight = 0;
    static get horizontalScrollContainerWidth(){
        return this.panelWidth+10;
    }
   

    static state:IState={
        scrollTop:0,
        horizontalScrollRatio:0,
        verticalScrollRatio:0,
        viewBox: {x:0,y:0,width:0,height:0},
        notScrolledHorizontallyYet:true,
        notScrolledVerticallyYet:true,
        verticalScrollTop:0,
        horizontalScrollLeft:0,
    } as IState;

    static dataRef ={
        initialHorizontalScrollLeft:0,
        initialVerticalScrollTop:0,
        isMounted:false,
        zoom:this.zoom,
        initialViewbox:this.state.viewBox,
    }

    static setInitialState(){
        this.state ={
            scrollLeft:BranchUtils.repositoryDetails.branchPanelWidth,
            scrollTop:0,
            horizontalScrollRatio:0,
            verticalScrollRatio:0,
            viewBox: {x:0,y:0,width:this.panelWidth,height:this.panelHeight},
            notScrolledHorizontallyYet:true,
            notScrolledVerticallyYet:true,
            verticalScrollTop:0,
            horizontalScrollLeft:0,
        }
    }

    static updateScrollWidthUis(){
        if(!this.svgElement) return;
        this.updateScrollWidthValues();
        this.horizontalScrollBarElement.style.width = `${this.horizontalScrollWidth}px`;
        this.verticalScrollBarElement.style.height = `${this.verticalScrollHeight}px`;
    }

    static updateScrollWidthValues(){
        this.horizontalScrollWidth = this.getHorizontalScrollWidth();
        this.verticalScrollHeight = this.getVerticalScrollHeight();
    }

    static createBranchPanel(){
        if(!BranchUtils.repositoryDetails) return;
        if(this.panelWidth ===  -1) return;        
        
        this.state.viewBox.width = this.panelWidth;
        this.state.viewBox.height = this.panelHeight;

        this.updateScrollWidthValues();

        this.setScrollPosition();
        

        this.branchPanelHtml = ReactDOMServer.renderToStaticMarkup(BranchPanel2({
            containerWidth:this.panelWidth,
            panelHeight:this.panelHeight,
            repoDetails:BranchUtils.repositoryDetails,
            viewBox:this.state.viewBox,
            horizontalScrollWidth:this.horizontalScrollWidth,
            verticalScrollHeight:this.verticalScrollHeight,
            verticalScrollTop:this.state.verticalScrollTop,
            horizontalScrollLeft:this.state.horizontalScrollLeft,
        }))

    }  

    static displayHeadIdentifier(){
        const headCommit = BranchUtils.repositoryDetails.headCommit;
        const headElem = this.branchPanelContainer.querySelector(`#${EnumIdPrefix.COMMIT_TEXT}${headCommit.hash}`)
        headElem?.classList.remove("d-none");             
    }

    static insertNewBranchGraph(){
        if(!this.branchPanelHtml) return;
        this.branchPanelContainer = document.querySelector(`#${this.branchPanelContainerId}`) as HTMLDivElement;
        // if(!this.branchPanelContainer) return;
        this.branchPanelContainer.innerHTML = this.branchPanelHtml;

        this.svgElement = this.branchPanelContainer.querySelector('svg')!;
        this.horizontalScrollBarElement = this.branchPanelContainer.querySelector(`#${this.horizontalScrollBarId}`) as HTMLDivElement;
        this.verticalScrollBarElement = this.branchPanelContainer.querySelector(`#${this.verticalScrollBarId}`) as HTMLDivElement;

        this.displayHeadIdentifier();
        
        this.addEventListeners();
        
        this.handleZoomEffect();
    }

    static handleZoomEffect(){
        if(this.zoom === 0){
            this.dataRef.initialViewbox = this.state.viewBox;
        }
    }

    static getViewBoxStr(){
        return `${this.state.viewBox.x} ${this.state.viewBox.y} ${this.state.viewBox.width} ${this.state.viewBox.height}`;
    }

    static handleHozontalScroll=(horizontalScrollMousePosition?:IPositition)=>{        
        if(horizontalScrollMousePosition === undefined ) {
            if(!this.state.notScrolledHorizontallyYet){                
                this.dataRef.initialHorizontalScrollLeft = this.state.horizontalScrollLeft;
            }
        }
        else{
            if(this.panelWidth <= this.horizontalScrollWidth) return;
            let newLeft = this.dataRef.initialHorizontalScrollLeft+ horizontalScrollMousePosition!.x;
            const maxLeft = this.panelWidth - this.horizontalScrollWidth;
            if(newLeft < 0) newLeft = 0;
            else if(newLeft > maxLeft) newLeft = maxLeft;
            let newRatio = newLeft/maxLeft;            

            let totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
            if(totalWidth <this.panelWidth) totalWidth = this.panelWidth;

            const x = totalWidth *newRatio;
            let viewBoxX = x - (this.panelWidth/2);

            
            this.state.horizontalScrollRatio= newRatio;
            this.state.horizontalScrollLeft=newLeft;
            this.state.notScrolledHorizontallyYet=false;
            this.state.viewBox.x = viewBoxX;  
            this.updateViewBoxUi();
            this.updateHorizontalScroll();
            // this.horizontalScrollBarElement.style.left = `${this.state.horizontalScrollLeft}px`;
        }        
    }

    static handleVerticalScroll=(verticalScrollMousePosition?:IPositition)=>{
        if(verticalScrollMousePosition === undefined ) {
            if(!this.state.notScrolledVerticallyYet){                
                this.dataRef.initialVerticalScrollTop = this.state.verticalScrollTop;
            }
        }
        else{
            if(this.panelHeight <= this.verticalScrollHeight) return;
            let newY = this.dataRef.initialVerticalScrollTop + verticalScrollMousePosition!.y;
            const maxY = this.panelHeight - this.verticalScrollHeight;
            if(newY > maxY) newY = maxY;
            else if(newY < 0) newY = 0;
            const newRatio = newY/maxY;
            let totalHeight = BranchUtils.repositoryDetails.branchPanelHeight;
            if(totalHeight < this.panelHeight) totalHeight = this.panelHeight;

            const y = totalHeight *newRatio;
            let viewBoxY = y - (this.panelHeight/2);            
            
            this.state.verticalScrollRatio= newRatio;
            this.state.notScrolledVerticallyYet=false;
            this.state.verticalScrollTop=newY;
            this.state.viewBox.y=viewBoxY;

            this.svgElement.setAttribute("viewBox",this.getViewBoxStr());            
            this.verticalScrollBarElement.style.top = `${this.state.verticalScrollTop}px`;            
        }
    }

    static handleSvgDragging=(svgScrollMousePosition?:IPositition)=>{
        if(svgScrollMousePosition === undefined ) {
            if(!this.state.notScrolledVerticallyYet){                
                this.dataRef.initialVerticalScrollTop = this.state.verticalScrollTop;
            }
            if(!this.state.notScrolledHorizontallyYet){
                this.dataRef.initialHorizontalScrollLeft = this.state.horizontalScrollLeft;
            }
        }

        else{
            // if(panelHeight <= verticalScrollHeight) return;
            // if(state.panelWidth <= horizontalScrollWidth) return;
    
            let newViewBox = {...this.state.viewBox};
            let newHorizontalRatio = this.state.horizontalScrollRatio;
            let newVerticalRatio = this.state.verticalScrollRatio;
            let newHorizontalScrollLeft = this.state.horizontalScrollLeft;
            let newVerticalScrollTop = this.state.verticalScrollTop;
            
    
            if(!!svgScrollMousePosition?.y && this.panelHeight > this.verticalScrollHeight){
                let totalHeight = BranchUtils.repositoryDetails.branchPanelHeight;
                if(totalHeight < this.panelHeight) totalHeight = this.panelHeight;
                let maxY = this.panelHeight - this.verticalScrollHeight;
                const movedScrollBar = (svgScrollMousePosition.y*(maxY/totalHeight)*(this.state.viewBox.height/this.panelHeight));                        
                newVerticalScrollTop = this.dataRef.initialVerticalScrollTop - movedScrollBar;
                
                if(newVerticalScrollTop > maxY) newVerticalScrollTop = maxY;
                else if(newVerticalScrollTop < 0) newVerticalScrollTop = 0;
                newVerticalRatio = newVerticalScrollTop/(this.panelHeight-this.verticalScrollHeight);
                
    
                const y = totalHeight *newVerticalRatio;
                let viewBoxY = y - (this.panelHeight/2);
                newViewBox.y = viewBoxY;
    
            }
            
            if(!!svgScrollMousePosition?.x && this.panelWidth > this.horizontalScrollWidth){
                let totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
                if(totalWidth <this.panelWidth) totalWidth = this.panelWidth;
    
                const maxLeft = this.panelWidth - this.horizontalScrollWidth;
                const movedScrollBar = (svgScrollMousePosition.x * (maxLeft / totalWidth) *(this.state.viewBox.width/this.panelWidth));            
                newHorizontalScrollLeft = this.dataRef.initialHorizontalScrollLeft- movedScrollBar;
                if(newHorizontalScrollLeft < 0) newHorizontalScrollLeft = 0;
                else if(newHorizontalScrollLeft > maxLeft) newHorizontalScrollLeft = maxLeft;
                newHorizontalRatio = newHorizontalScrollLeft/maxLeft;                        
    
                const x = totalWidth *newHorizontalRatio;
                let viewBoxX = x - (this.panelWidth/2);   
                newViewBox.x = viewBoxX;                         
            }
                
            this.state.horizontalScrollRatio= newHorizontalRatio;
            this.state.verticalScrollRatio=newVerticalRatio;
            this.state.horizontalScrollLeft=newHorizontalScrollLeft;
            this.state.verticalScrollTop=newVerticalScrollTop;
            this.state.notScrolledHorizontallyYet=false;
            this.state.notScrolledVerticallyYet=false;
            this.state.viewBox={
                ...this.state.viewBox,
                ...newViewBox,
            };

            this.svgElement.setAttribute("viewBox",this.getViewBoxStr());            
            this.horizontalScrollBarElement.style.left = `${this.state.horizontalScrollLeft}px`;
            this.verticalScrollBarElement.style.top = `${this.state.verticalScrollTop}px`;
        
        }
    }

    static addEventListeners(){
        // const horizontalScrollBar = this.branchPanelContainer.querySelector(`#${this.horizontalScrollBarId}`) as HTMLElement;
        UiUtils.handleDrag(this.horizontalScrollBarElement,this.handleHozontalScroll);
        UiUtils.handleDrag(this.verticalScrollBarElement,this.handleVerticalScroll);
        UiUtils.handleDrag(this.svgElement as any,this.handleSvgDragging);
        
    }

    static getVerticalScrollHeight(){        
        let totalHeight = BranchUtils.repositoryDetails.branchPanelHeight;
        if(totalHeight < this.panelHeight) totalHeight = this.panelHeight;
        const height = this.state.viewBox.height / totalHeight;        
        return height*this.panelHeight;
    }

    static  getHorizontalScrollWidth(){
        let totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
        if(totalWidth < this.panelWidth) totalWidth = this.panelWidth;
        const widthRatio = this.state.viewBox.width / totalWidth;
        const horizontalScrollWidth = widthRatio*this.panelWidth;
        return horizontalScrollWidth;
    }

    static updateHorizontalScroll(){
        this.horizontalScrollBarElement.style.left = `${this.state.horizontalScrollLeft}px`;
    }

    static updateVerticalScroll(){
        this.verticalScrollBarElement.style.top = `${this.state.verticalScrollTop}px`;
    }

    static updateViewBoxUi(){
        this.svgElement.setAttribute("viewBox",this.getViewBoxStr());            
    }

    static updateUIPositioning(){
        
        this.updateHorizontalScroll();
        this.updateVerticalScroll();
        this.updateViewBoxUi(); 
    }

    static scrollToHeadCommit(){
        if(!this.branchPanelHtml) return;

        this.setScrollPosition();
        this.updateUIPositioning();                      
    }

    static setScrollPosition () {        
        if(!BranchUtils.repositoryDetails?.headCommit) return;

        let totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
        let totalHeight = BranchUtils.repositoryDetails.branchPanelHeight;
        if(totalHeight < this.panelHeight) totalHeight = this.panelHeight;        
        if(totalWidth < this.panelWidth) totalHeight = this.panelWidth;
        const horizontalRatio = BranchUtils.repositoryDetails.headCommit.x/totalWidth;
        const verticalRatio = BranchUtils.repositoryDetails.headCommit.ownerBranch.y/totalHeight;
        let verticalScrollTop = (this.panelHeight-this.verticalScrollHeight)*verticalRatio;   
        let horizontalScrollLeft = (this.horizontalScrollContainerWidth-this.horizontalScrollWidth)*horizontalRatio;
        this.dataRef.initialVerticalScrollTop = verticalScrollTop;
        this.dataRef.initialHorizontalScrollLeft = horizontalScrollLeft;

        const x = totalWidth *horizontalRatio;
        let viewBoxX = 0;
        if(totalWidth > this.panelWidth) viewBoxX = x- (this.panelWidth/2);

        const y = totalHeight *verticalRatio;
        let viewBoxY = 0;
        if(totalHeight > this.panelHeight) viewBoxY = y - (this.panelHeight/2);        
        
        this.state.horizontalScrollRatio=horizontalRatio;
        this.state.verticalScrollRatio=verticalRatio;
        this.state.verticalScrollTop=verticalScrollTop;
        this.state.horizontalScrollLeft=horizontalScrollLeft;
        this.state.viewBox={
            ...this.state.viewBox,
            x:viewBoxX,
            y:viewBoxY,                
        }        

    }

    static controlZoom(action:"zoomIn"|"zoomOut"|"reset"){
        if(!this.svgElement) return;
        if(action === "zoomIn"){
            this.zoom++;            
        }

        else if(action === "zoomOut"){
            this.zoom--;
        }
        else this.zoom = 0;

        const viewBox = BranchUtils.getViewBoxValue(this.dataRef.initialViewbox,this.zoom);
        this.state.viewBox = viewBox;            
        this.dataRef.zoom = this.zoom;

        this.updateUIPositioning();
        this.updateScrollWidthUis();
        this.handleZoomEffect();
    }
}