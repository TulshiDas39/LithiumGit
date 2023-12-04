import { IPositionDiff, IPositition, IViewBox } from "../interfaces";
import { BranchUtils } from "./BranchUtils";
import * as ReactDOMServer from 'react-dom/server';
import { BranchPanel2 } from "../../components/selectedRepository/selectedRepoRight/branches/BranchPanel2";
import { UiUtils } from "./UiUtils";
import { EnumHtmlIds, EnumIdPrefix } from "../enums";
import { Constants, CreateCommitInfoObj, IBranchDetails, ICommitInfo, IRepositoryDetails, IStatus } from "common_library";
import { ModalData } from "../../components/modals/ModalData";
import { CacheUtils } from "./CacheUtils";
import { ReduxUtils } from "./ReduxUtils";
import { PbSvgContainerWidth, PbHorizontalScrollLeft, PbHorizontalScrollWidth, PbHeadCommit, PbPanelHeight, PbSelectedCommit, PbViewBoxX, PbViewBoxWidth, PbMergeCommit, PbViewBoxHeight, PbViewBoxY, PbVerticalScrollHeight, PbVerticalScrollTop, PbViewBox } from "./branchGraphPublishers";
import { Publisher } from "../publishers";
import { NumUtils } from "./NumUtils";


interface IState{
    svgContainerWidth:PbSvgContainerWidth;
    panelHeight:PbPanelHeight;
    zoomLabel:Publisher<number>;
    mergingCommit:PbMergeCommit;
    headCommit:PbHeadCommit;
    selectedCommit:PbSelectedCommit;
    horizontalScrollWidth:PbHorizontalScrollWidth;
    horizontalScrollRatio:number;
    horizontalScrollRatio2: Publisher<number>;
    zoomLabel2: Publisher<number>;
    verticalScrollRatio:number;
    verticalScrollRatio2:Publisher<number>;
    viewBox:IViewBox;
    viewBox2:PbViewBox;
    notScrolledHorizontallyYet:boolean;
    notScrolledVerticallyYet:boolean;
    verticalScrollTop:number;
    verticalScrollTop2:PbVerticalScrollTop;
    horizontalScrollLeft:number;
    horizontalScrollLeft2:PbHorizontalScrollLeft; 
    viewBoxX:PbViewBoxX;
    viewBoxY:PbViewBoxY;
    viewBoxWidth:PbViewBoxWidth;
    viewBoxHeight:PbViewBoxHeight;
    verticalScrollHeight:PbVerticalScrollHeight;
}


export class BranchGraphUtils{
    //static horizontalScrollBarId = "horizontalScrollBar";    
    static svgContainer:HTMLDivElement;
    static branchPanelContainerElement:HTMLDivElement= null!;
    static svgElement:SVGSVGElement = null!;
    static horizontalScrollBarElement:HTMLDivElement = null!;
    static verticalScrollBarElement:HTMLDivElement = null!;
    // static headElement:HTMLElement = null!;
    static branchSvgHtml='';
    static initialHorizontalScrollRatio = 1;
    static initialVerticalScrollRatio = 1;
    static zoom = 0;
    //static horizontalScrollWidth = 0;
    static verticalScrollHeight = 0;
    static selectedCommit:ICommitInfo;
    static focusedCommit:ICommitInfo=null!;
    static readonly selectedCommitColor = "blueviolet"
    static readonly commitColor = "cadetblue";
    static readonly svgLnk = "http://www.w3.org/2000/svg";
    //static readonly scrollbarSize = 10;
    static readonly scrollBarSize = 10;

    static get horizontalScrollContainerWidth(){
        return this.state.svgContainerWidth.value+10;
    }

    static handleCommitSelect=(commit:ICommitInfo)=>{};
    static openContextModal=()=>{};
   
    static state:IState={
        svgContainerWidth: new PbSvgContainerWidth(null!),
        headCommit:new PbHeadCommit(null!),
        mergingCommit:new PbMergeCommit(null!),
        panelHeight:new PbPanelHeight(window.innerHeight * 0.65),
        selectedCommit: new PbSelectedCommit(null!),
        zoomLabel:new Publisher(0),
        zoomLabel2:new Publisher(1),
        horizontalScrollRatio:0,
        verticalScrollRatio:0,
        viewBox: {x:0,y:0,width:0,height:0},
        notScrolledHorizontallyYet:true,
        notScrolledVerticallyYet:true,
        verticalScrollTop:0,
        horizontalScrollLeft:0,
        horizontalScrollRatio2:new Publisher(0),
        verticalScrollRatio2:new Publisher(0),
    } as IState;

    static dataRef ={
        initialHorizontalScrollLeft:0,
        initialVerticalScrollTop:0,
        isMounted:false,
        zoom:this.zoom,
        initialViewbox:this.state.viewBox,
    }

    static init(){
        BranchGraphUtils.state.horizontalScrollWidth = new PbHorizontalScrollWidth(0);
        BranchGraphUtils.state.verticalScrollHeight = new PbVerticalScrollHeight(0);
        BranchGraphUtils.state.horizontalScrollLeft2 = new PbHorizontalScrollLeft(0);
        BranchGraphUtils.state.verticalScrollTop2 = new PbVerticalScrollTop(0);
        BranchGraphUtils.state.viewBoxWidth = new PbViewBoxWidth(0);
        BranchGraphUtils.state.viewBoxHeight = new PbViewBoxHeight(0);
        BranchGraphUtils.state.viewBoxX = new PbViewBoxX(0);
        BranchGraphUtils.state.viewBoxY = new PbViewBoxY(0);
        BranchGraphUtils.state.viewBox2 = new PbViewBox({x:0,y:0,width:0,height:0});

        window.addEventListener("resize",()=>{
            BranchGraphUtils.state.svgContainerWidth.update();
        });
    }

    static updateScrollWidthUis(){
        //if(!this.svgElement) return;
        BranchGraphUtils.updateScrollWidthValues();
        BranchGraphUtils.verticalScrollBarElement.style.height = `${this.verticalScrollHeight}px`;
    }
    
    static updateHorizontalScrollBarUi(){
        BranchGraphUtils.horizontalScrollBarElement.style.width = `${BranchGraphUtils.state.horizontalScrollWidth.value}px`;
    }

    static updateScrollWidthValues(){
        BranchGraphUtils.state.horizontalScrollWidth.update();
        BranchGraphUtils.verticalScrollHeight = BranchGraphUtils.getVerticalScrollHeight();
    }

    static createBranchPanel(){
        BranchGraphUtils.svgContainer = document.querySelector(`#${EnumHtmlIds.branchSvgContainer}`) as HTMLDivElement;                
        BranchGraphUtils.selectedCommit = BranchUtils.repositoryDetails.headCommit;
        BranchGraphUtils.branchSvgHtml = ReactDOMServer.renderToStaticMarkup(BranchPanel2({
            width:BranchGraphUtils.svgContainer.getBoundingClientRect().width,
            height:Math.floor(window.innerHeight * 0.65),
            repoDetails:BranchUtils.repositoryDetails,
        }))

        BranchGraphUtils.svgContainer.innerHTML = BranchGraphUtils.branchSvgHtml;

        BranchGraphUtils.svgElement = BranchGraphUtils.svgContainer.querySelector('svg')!;
        BranchGraphUtils.horizontalScrollBarElement = document.querySelector(`#${EnumHtmlIds.branchHorizontalScrollBar}`) as HTMLDivElement;
        BranchGraphUtils.verticalScrollBarElement = document.querySelector(`#${EnumHtmlIds.branchVerticalScrollBar}`) as HTMLDivElement;
        BranchGraphUtils.branchPanelContainerElement = document.querySelector(`#${EnumHtmlIds.branchPanelContainer}`) as HTMLDivElement;
        
        //this.insertNewBranchGraph();
//        this.state.headCommit.publish(BranchUtils.repositoryDetails.headCommit);
        BranchGraphUtils.updateUi();
        //this.state.headCommit.publish(BranchUtils.repositoryDetails.headCommit);
        //this.updateUi();
        BranchGraphUtils.addEventListeners();
        
        BranchGraphUtils.handleCommitSelect(BranchGraphUtils.selectedCommit);
        const branchPanelContainer = document.querySelector(`#${EnumHtmlIds.branchPanelContainer}`)!;
        branchPanelContainer.classList.remove('invisible');
    }  

    static setReduxData(){
        ReduxUtils.setStatusCurrent(BranchUtils.repositoryDetails.status);
    }


    static handleZoomEffect(){
        if(this.zoom === 0){
            this.dataRef.initialViewbox = this.state.viewBox;
        }
    }

    static getViewBoxStr(){
        return `${BranchGraphUtils.state.viewBoxX.value} ${BranchGraphUtils.state.viewBoxY.value} ${BranchGraphUtils.state.viewBoxWidth.value} ${BranchGraphUtils.state.viewBoxHeight.value}`;
    }

    static handleHozontalScroll=(horizontalScrollMousePosition?:IPositition)=>{     
        if(horizontalScrollMousePosition === undefined ) {
            if(!this.state.notScrolledHorizontallyYet){                
                this.dataRef.initialHorizontalScrollLeft = this.state.horizontalScrollLeft;
            }
        }
        else{
            if(this.state.svgContainerWidth.value <= BranchGraphUtils.state.horizontalScrollWidth.value) return;
            let newLeft = this.dataRef.initialHorizontalScrollLeft+ horizontalScrollMousePosition!.x;
            const maxLeft = this.state.svgContainerWidth.value - BranchGraphUtils.state.horizontalScrollWidth.value;
            if(newLeft < 0) newLeft = 0;
            else if(newLeft > maxLeft) newLeft = maxLeft;
            let newRatio = newLeft/maxLeft;            

            let totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
            if(totalWidth <this.state.svgContainerWidth.value) totalWidth = this.state.svgContainerWidth.value;

            const x = totalWidth *newRatio;
            let viewBoxX = x - (this.state.svgContainerWidth.value/2);

            
            this.state.horizontalScrollRatio= newRatio;
            this.state.horizontalScrollLeft=newLeft;
            this.state.notScrolledHorizontallyYet=false;
            this.state.viewBox.x = viewBoxX;  
            this.updateViewBoxUi();
            this.updateHorizontalScroll();
            // this.horizontalScrollBarElement.style.left = `${this.state.horizontalScrollLeft}px`;
        }        
    }
    static handleHozontalScroll2=(positionDiff:number)=>{             
        const movableWidth = BranchGraphUtils.state.svgContainerWidth.value - BranchGraphUtils.state.horizontalScrollWidth.value;
        if(movableWidth == 0)
            return;
        const ratioDiff = positionDiff / movableWidth;
        let newRatio = BranchGraphUtils.initialHorizontalScrollRatio + ratioDiff;
        newRatio = NumUtils.between1_0(newRatio);
        BranchGraphUtils.state.horizontalScrollRatio2.publish(newRatio);        
    }

    static handleVerticalScroll2=(positionDiff:number)=>{             
        const movableHeight = BranchGraphUtils.state.panelHeight.value-BranchGraphUtils.state.verticalScrollHeight.value;
        if(movableHeight == 0)
            return;
        const ratioDiff = positionDiff / movableHeight;
        let newRatio = BranchGraphUtils.initialVerticalScrollRatio + ratioDiff;
        newRatio = NumUtils.between1_0(newRatio);        
        BranchGraphUtils.state.verticalScrollRatio2.publish(newRatio);        
    }

    static handleScroll2=(positionDiff:IPositionDiff)=>{        
        const xRatio = BranchGraphUtils.state.horizontalScrollWidth.value/BranchGraphUtils.state.svgContainerWidth.value;
        BranchGraphUtils.handleHozontalScroll2(-positionDiff.dx*(xRatio));
        const yRatio = BranchGraphUtils.state.verticalScrollHeight.value/BranchGraphUtils.state.panelHeight.value;
        BranchGraphUtils.handleVerticalScroll2(-positionDiff.dy*(yRatio));
    }

    static handleVerticalScroll=(verticalScrollMousePosition?:IPositition)=>{
        if(verticalScrollMousePosition === undefined ) {
            if(!this.state.notScrolledVerticallyYet){                
                this.dataRef.initialVerticalScrollTop = this.state.verticalScrollTop;
            }
        }
        else{
            if(this.state.panelHeight.value <= this.verticalScrollHeight) return;
            let newY = this.dataRef.initialVerticalScrollTop + verticalScrollMousePosition!.y;
            const maxY = this.state.panelHeight.value - this.verticalScrollHeight;
            if(newY > maxY) newY = maxY;
            else if(newY < 0) newY = 0;
            const newRatio = newY/maxY;
            let totalHeight = BranchUtils.repositoryDetails.branchPanelHeight;
            if(totalHeight < this.state.panelHeight.value) totalHeight = this.state.panelHeight.value;

            const y = totalHeight *newRatio;
            let viewBoxY = y - (this.state.panelHeight.value/2);            
            
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
            // if(state.state.panelWidth <= horizontalScrollWidth) return;
    
            let newViewBox = {...this.state.viewBox};
            let newHorizontalRatio = this.state.horizontalScrollRatio;
            let newVerticalRatio = this.state.verticalScrollRatio;
            let newHorizontalScrollLeft = this.state.horizontalScrollLeft;
            let newVerticalScrollTop = this.state.verticalScrollTop;
            
    
            if(!!svgScrollMousePosition?.y && this.state.panelHeight.value > this.verticalScrollHeight){
                let totalHeight = BranchUtils.repositoryDetails.branchPanelHeight;
                if(totalHeight < this.state.panelHeight.value) totalHeight = this.state.panelHeight.value;
                let maxY = this.state.panelHeight.value - this.verticalScrollHeight;
                const movedScrollBar = (svgScrollMousePosition.y*(maxY/totalHeight)*(this.state.viewBox.height/this.state.panelHeight.value));                        
                newVerticalScrollTop = this.dataRef.initialVerticalScrollTop - movedScrollBar;
                
                if(newVerticalScrollTop > maxY) newVerticalScrollTop = maxY;
                else if(newVerticalScrollTop < 0) newVerticalScrollTop = 0;
                newVerticalRatio = newVerticalScrollTop/(this.state.panelHeight.value-this.verticalScrollHeight);
                
    
                const y = totalHeight *newVerticalRatio;
                let viewBoxY = y - (this.state.panelHeight.value/2);
                newViewBox.y = viewBoxY;
    
            }
            
            if(!!svgScrollMousePosition?.x && this.state.svgContainerWidth.value > BranchGraphUtils.state.horizontalScrollWidth.value){
                let totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
                if(totalWidth <this.state.svgContainerWidth.value) totalWidth = this.state.svgContainerWidth.value;
    
                const maxLeft = this.state.svgContainerWidth.value - BranchGraphUtils.state.horizontalScrollWidth.value;
                const movedScrollBar = (svgScrollMousePosition.x * (maxLeft / totalWidth) *(this.state.viewBox.width/this.state.svgContainerWidth.value));            
                newHorizontalScrollLeft = this.dataRef.initialHorizontalScrollLeft- movedScrollBar;
                if(newHorizontalScrollLeft < 0) newHorizontalScrollLeft = 0;
                else if(newHorizontalScrollLeft > maxLeft) newHorizontalScrollLeft = maxLeft;
                newHorizontalRatio = newHorizontalScrollLeft/maxLeft;                        
    
                const x = totalWidth *newHorizontalRatio;
                let viewBoxX = x - (this.state.svgContainerWidth.value/2);   
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

    static updateSelectedCommitUi(){
//        this.publishers
    }
    
    static addEventListendersOnCommit(){

        const clickListener = (target:HTMLElement)=>{
            const commitId = target.id.substring(EnumIdPrefix.COMMIT_CIRCLE.length);
            const selectedCommit = BranchUtils.repositoryDetails.allCommits.find(x=>x.hash === commitId);
            BranchGraphUtils.state.selectedCommit.publish(selectedCommit!);
        }
        
        UiUtils.addEventListenderByClassName("commit","click",clickListener);

        const commitTextClickListener=(target:HTMLElement)=>{
            const commitId = target.id.substring(EnumIdPrefix.COMMIT_TEXT.length);
            const commitCircleElem = BranchGraphUtils.svgElement.querySelector<HTMLElement>(`#${EnumIdPrefix.COMMIT_CIRCLE}${commitId}`);
            clickListener(commitCircleElem!);
        }

        UiUtils.addEventListenderByClassName("commit_text","click",commitTextClickListener);

        const contextEventListener=(target:HTMLElement,event:MouseEvent)=>{            
            const commitId = target.id.substring(EnumIdPrefix.COMMIT_CIRCLE.length);
            const selectedCommit = BranchUtils.repositoryDetails.allCommits.find(x=>x.hash === commitId);
            ModalData.commitContextModal.selectedCommit=selectedCommit!;            
            ModalData.commitContextModal.position = {
                x:event.clientX,
                y:event.clientY,
            }

            BranchGraphUtils.openContextModal();
        }

        UiUtils.addEventListenderByClassName("commit","contextmenu",contextEventListener)

        const commitTextContextClickListener=(target:HTMLElement,event:MouseEvent)=>{
            const commitId = target.id.substring(EnumIdPrefix.COMMIT_TEXT.length);
            const commitCircleElem = BranchGraphUtils.svgElement.querySelector<HTMLElement>(`#${EnumIdPrefix.COMMIT_CIRCLE}${commitId}`);
            contextEventListener(commitCircleElem!,event);
        }

        UiUtils.addEventListenderByClassName("commit_text","contextmenu",commitTextContextClickListener)

    }

    static addWheelListender(){
        if(!this.svgElement) return;
        
        BranchGraphUtils.svgElement.addEventListener("wheel",(e)=>{
            var delta = Math.max(Math.abs(e.deltaX),Math.abs(e.deltaY));
            if(e.deltaX > 0 || e.deltaY > 0) {                
                BranchGraphUtils.controlZoom("zoomOut",delta * 0.01);
            }
            else{
                BranchGraphUtils.controlZoom("zoomIn",delta * 0.01);
            }

            
        })
    }

    static addEventListeners(){
        UiUtils.HandleHorizontalDragging(BranchGraphUtils.horizontalScrollBarElement,BranchGraphUtils.handleHozontalScroll2,()=>{
            BranchGraphUtils.initialHorizontalScrollRatio = BranchGraphUtils.state.horizontalScrollRatio2.value;
        });
        UiUtils.HandleVerticalDragging(BranchGraphUtils.verticalScrollBarElement,BranchGraphUtils.handleVerticalScroll2,()=>{
            BranchGraphUtils.initialVerticalScrollRatio = BranchGraphUtils.state.verticalScrollRatio2.value;
        });
        UiUtils.HandleDragging(BranchGraphUtils.svgElement as any,BranchGraphUtils.handleScroll2,()=>{
            BranchGraphUtils.initialHorizontalScrollRatio = BranchGraphUtils.state.horizontalScrollRatio2.value;
            BranchGraphUtils.initialVerticalScrollRatio = BranchGraphUtils.state.verticalScrollRatio2.value;
        });
        this.addEventListendersOnCommit();
        this.addWheelListender();
    }

    static getVerticalScrollHeight(){        
        let totalHeight = BranchUtils.repositoryDetails.branchPanelHeight;
        if(totalHeight < this.state.panelHeight.value) totalHeight = this.state.panelHeight.value;
        const height = this.state.viewBox.height / totalHeight;        
        return height*this.state.panelHeight.value;
    }

    static getHorizontalScrollWidth(){
        // let totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
        // if(totalWidth < BranchGraphUtils.state.state.panelWidth.value) totalWidth = BranchGraphUtils.state.state.panelWidth.value;
        // const widthRatio = BranchGraphUtils.state.viewBox.width / totalWidth;
        // const horizontalScrollWidth = widthRatio*BranchGraphUtils.state.state.panelWidth.value;
        // return horizontalScrollWidth;
        return 0;
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

    static setScrollPosition () {       
        if(!this.focusedCommit) this.focusedCommit = BranchUtils.repositoryDetails?.headCommit;
        else {
            const focusedCommit = BranchUtils.repositoryDetails.allCommits.find(x=>x.hash === this.focusedCommit.hash);
            if(!focusedCommit) this.focusedCommit = BranchUtils.repositoryDetails?.headCommit;
        }

        let totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
        let totalHeight = BranchUtils.repositoryDetails.branchPanelHeight;
        if(totalHeight < this.state.panelHeight.value) totalHeight = this.state.panelHeight.value;        
        if(totalWidth < this.state.svgContainerWidth.value) totalHeight = this.state.svgContainerWidth.value;
        const horizontalRatio = this.focusedCommit.x/totalWidth;
        const verticalRatio = this.focusedCommit.ownerBranch.y/totalHeight;
        let verticalScrollTop = (this.state.panelHeight.value-this.verticalScrollHeight)*verticalRatio;   
        let horizontalScrollLeft = (this.horizontalScrollContainerWidth-BranchGraphUtils.state.horizontalScrollWidth.value)*horizontalRatio;
        this.dataRef.initialVerticalScrollTop = verticalScrollTop;
        this.dataRef.initialHorizontalScrollLeft = horizontalScrollLeft;

        const x = totalWidth *horizontalRatio;
        let viewBoxX = 0;
        if(totalWidth > this.state.svgContainerWidth.value) viewBoxX = x- (this.state.svgContainerWidth.value/2);

        const y = totalHeight *verticalRatio;
        let viewBoxY = 0;
        if(totalHeight > this.state.panelHeight.value) viewBoxY = y - (this.state.panelHeight.value/2);        
        
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

    static controlZoom(action:"zoomIn"|"zoomOut"|"reset",diifValue:number|undefined){
        if(!BranchGraphUtils.svgElement) return;
        if(!diifValue) diifValue = 0.1;
        console.log("diifValue",diifValue)
        let newValue = BranchGraphUtils.state.zoomLabel2.value;
        if(action === "zoomIn"){
            newValue +=  newValue*diifValue             
        }

        else if(action === "zoomOut"){            
            newValue -= newValue*diifValue;
        }
        else newValue = 1;

        newValue = NumUtils.between(0,5,newValue);
        BranchGraphUtils.state.zoomLabel2.publish(newValue);        
    }


    static CreateHeadTextElement(commit:ICommitInfo){
        if(!commit.refValues.length) return null;    
        let y = commit.ownerBranch.y - BranchUtils.commitRadius - 4;
        const x = commit.x + BranchUtils.commitRadius;
        for(let i=0;i<commit.refValues.length-1;i++){                
            y = y - BranchUtils.branchPanelFontSize - 1;
        }
        // return <text x={x} y={y} direction="rtl" fontSize={BranchUtils.branchPanelFontSize} fill="blue">HEAD</text>;
        const elem = document.createElementNS(this.svgLnk,'text');        
        elem.setAttribute("x",`${x}`)
        elem.setAttribute("y",`${y}`)
        elem.setAttribute("direction",`rtl`)
        elem.setAttribute("font-size",`${BranchUtils.branchPanelFontSize}`);
        elem.setAttribute("fill",`blue`);
        elem.classList.add("refText",`${EnumIdPrefix.COMMIT_REF}${commit.hash}`,"headRef")
        elem.innerHTML = Constants.detachedHeadIdentifier;
        return elem;
    }
    
    static updateUiForCheckout(){
        if(!this.svgElement) return;
        const headCommit = BranchUtils.repositoryDetails.headCommit;
        if(BranchUtils.repositoryDetails.status.isDetached){
            const commitElem = this.svgElement.querySelector(`#${EnumIdPrefix.COMMIT_CIRCLE}${headCommit.hash}`);
            const headTextElem = this.CreateHeadTextElement(headCommit);        
            commitElem?.insertAdjacentElement("beforebegin",headTextElem!);
        }

        const HTextElem = this.svgElement.querySelector(`#${EnumIdPrefix.COMMIT_TEXT}${headCommit.hash}`);

        HTextElem?.classList.remove("d-none");
        ReduxUtils.setStatusCurrent(BranchUtils.repositoryDetails.status);
    }
    

    static revertUiOfExistingCheckout(){
        if(!this.svgElement) return;
        const headCommit = BranchUtils.repositoryDetails.headCommit;
        const headCommitTextElem = this.svgElement.querySelector(`#${EnumIdPrefix.COMMIT_TEXT}${headCommit.hash}`);
        if(!headCommitTextElem) return;
        headCommitTextElem.classList.add("d-none");
        if(BranchUtils.repositoryDetails.status.isDetached){
            const refElems = this.svgElement.querySelectorAll(`.${EnumIdPrefix.COMMIT_REF}${headCommit.hash}`);
            let headTextElem:Element|undefined;

            refElems.forEach(elem=>{
                if(elem.classList.contains("headRef")) headTextElem = elem;
            });

            if(headTextElem) headTextElem.remove();

        }
    }

    static handleCheckout(commit:ICommitInfo,repoDetails:IRepositoryDetails,newStatus:IStatus){
        this.revertUiOfExistingCheckout();
        const existingHead = repoDetails.headCommit;
        existingHead.isHead = false;
        const newHeadCommit = repoDetails.allCommits.find(x=>x.hash === commit.hash);
        if(!newHeadCommit) throw "New checkout commit not found";
        repoDetails.headCommit = newHeadCommit;
        newHeadCommit.isHead = true;        

        const existingStatus = repoDetails.status;
        repoDetails.status = newStatus;                

        if(existingStatus.isDetached){
            existingHead.refValues = existingHead.refValues.filter(x=> x !== Constants.detachedHeadIdentifier);
            if(existingHead.ownerBranch.increasedHeightForDetached > 0){
                existingHead.ownerBranch.maxRefCount -= existingHead.ownerBranch.increasedHeightForDetached;                
                existingHead.ownerBranch.increasedHeightForDetached = 0;
            }            
        }

        const existingMaxRefLength = newHeadCommit.ownerBranch.maxRefCount;

        if(newStatus.isDetached){
            newHeadCommit.refs += `,${Constants.detachedHeadIdentifier}`;
            newHeadCommit.refValues.push(`${Constants.detachedHeadIdentifier}`);            
        }
        else{
            if(!BranchUtils.repositoryDetails.branchList.includes(newHeadCommit.ownerBranch.name)){
                newHeadCommit.refs = `${Constants.headPrefix}${newHeadCommit.ownerBranch.name},${newHeadCommit.refs}`;
                newHeadCommit.refValues.push(`${newHeadCommit.ownerBranch.name}`);
                newHeadCommit.branchNameWithRemotes.push({branchName:newHeadCommit.ownerBranch.name,remote:""});                
            }
        }
        if(newHeadCommit.refValues.length > existingMaxRefLength){
            newHeadCommit.ownerBranch.increasedHeightForDetached = newHeadCommit.refValues.length - existingMaxRefLength;
            newHeadCommit.ownerBranch.maxRefCount = newHeadCommit.refValues.length;
            CacheUtils.setRepoDetails(BranchUtils.repositoryDetails);
            BranchGraphUtils.refreshBranchPanelUi();
        }
        else {
            CacheUtils.setRepoDetails(BranchUtils.repositoryDetails);
            this.updateUiForCheckout();
        }        
    }

    static refreshBranchPanelUi(){
        this.createBranchPanel();
    }

    static handleNewBranch(sourceCommit:ICommitInfo,branch:string,status:IStatus){
        BranchUtils.repositoryDetails.branchList.push(branch);
        const commitFrom = BranchUtils.repositoryDetails.allCommits.find(x=>x.hash === sourceCommit.hash);
        if(!commitFrom) return;        
        commitFrom.refValues.push(branch);                
        const refLimitExcited = commitFrom.refValues.length > commitFrom.ownerBranch.maxRefCount;
        if(refLimitExcited)  commitFrom.ownerBranch.maxRefCount++;
        BranchUtils.repositoryDetails.status = status;
        if(status.current === branch) {
            BranchUtils.repositoryDetails.headCommit = commitFrom;
        }
        this.focusedCommit = commitFrom;

        CacheUtils.setRepoDetails(BranchUtils.repositoryDetails);
        
        this.refreshBranchPanelUi();
    }

    static isRequiredReload(newStatus:IStatus){
        const existingStatus = BranchUtils.repositoryDetails?.status;
        if(!existingStatus?.headCommit) return false;
        if(newStatus.current !== existingStatus.current) return true;
        if(newStatus.ahead !== existingStatus.ahead) return true;
        if(newStatus.behind !== existingStatus.behind) return true;
        if(newStatus.isDetached !== existingStatus.isDetached) return true;
        if(newStatus.headCommit.hash !== existingStatus.headCommit.hash) return true;
        const existingRefs = existingStatus.headCommit.refValues;
        const newRefs = newStatus.headCommit.refValues;        
        if(newRefs.some(ref=> !existingRefs.includes(ref)) || newRefs.length !== existingRefs.length) return true;
        return false;        
    }

    static getVerticalLinePath(vLineHeight:number,archRadius:number){
        return `v${vLineHeight} a${archRadius},${archRadius} 0 0 0 ${archRadius},${archRadius}`;
    }

    static getBranchLinePath(startX:number,startY:number,vLinePath:string,hLineLength:number){
        return `M${startX},${startY} ${vLinePath} h${hLineLength}`;
    }

    static getBranchLinePathData(branchDetails:IBranchDetails){
        const parentCommit = branchDetails.parentCommit;
        const startX = parentCommit?.x || 20;
        const startY = parentCommit?.ownerBranch.y || branchDetails.y;
        const endX = branchDetails.commits[branchDetails.commits.length - 1].x;
        const hLineLength = endX - startX;
        let vLineHeight =  0;
        let archRadius = BranchUtils.branchPanelFontSize;
        if(parentCommit?.ownerBranch.y) vLineHeight = branchDetails.y - parentCommit.ownerBranch.y - archRadius;
        let vLinePath = "";
        if(!!vLineHeight) vLinePath = `v${vLineHeight} a${archRadius},${archRadius} 0 0 0 ${archRadius},${archRadius}`
        return {startX,startY,endX,hLineLength,vLinePath}
    }

    static createMergeCommit(head: ICommitInfo, x:number,srcCommit:ICommitInfo){
        // <circle id={`${EnumIdPrefix.COMMIT_CIRCLE}${c.hash}`} className="commit" cx={c.x} cy={props.branchDetails.y} r={BranchUtils.commitRadius} stroke="black" 
        //                 strokeWidth="3" fill={`${props.selectedCommit?.hash === c.hash?BranchGraphUtils.selectedCommitColor:BranchGraphUtils.commitColor}`}/>    
        const circleElem = document.createElementNS(this.svgLnk, "circle");
        circleElem.id = `${EnumIdPrefix.COMMIT_CIRCLE}merge` ;
        // circleElem.classList.add("commit");// = `${EnumIdPrefix.COMMIT_CIRCLE}merge` ;
        circleElem.setAttribute("cx",x+"")
        circleElem.setAttribute("cy",head.ownerBranch.y+"")
        circleElem.setAttribute("r",BranchUtils.commitRadius+"")
        circleElem.setAttribute("stroke","red")
        circleElem.setAttribute("strokeWidth","3")
        circleElem.setAttribute("fill",BranchGraphUtils.commitColor)
        circleElem.classList.add("mergingState");


        // const clickListener = (target:HTMLElement)=>{
        //     const existingSelectedCommitElem = this.branchPanelContainer.querySelector(`#${EnumIdPrefix.COMMIT_CIRCLE}${this.selectedCommit.hash}`);
        //     existingSelectedCommitElem?.setAttribute("fill",this.commitColor);
        //     const commitId = target.id.substring(EnumIdPrefix.COMMIT_CIRCLE.length);
        //     const selectedCommit = BranchUtils.repositoryDetails.allCommits.find(x=>x.hash === commitId);
        //     target.setAttribute("fill",this.selectedCommitColor);
        //     this.handleCommitSelect(selectedCommit!);
        //     this.selectedCommit = selectedCommit!;
        // }

        const clickListener = (_e:MouseEvent)=>{
            let existingSelectedCommitElem:HTMLElement|null;
            if(this.selectedCommit.hash) {
                existingSelectedCommitElem = this.svgContainer.querySelector(`#${EnumIdPrefix.COMMIT_CIRCLE}${this.selectedCommit.hash}`);
                existingSelectedCommitElem?.setAttribute("fill",this.commitColor);
            }

            circleElem.setAttribute("fill",this.selectedCommitColor);
            const dummyCommit = CreateCommitInfoObj();
            dummyCommit.hash = null!;
            dummyCommit.date = new Date().toISOString();
            dummyCommit.ownerBranch = head.ownerBranch;
            dummyCommit.previousCommit = head;
            dummyCommit.message = 'Commit is in merging state.';
            this.selectedCommit = dummyCommit;
            this.handleCommitSelect(this.selectedCommit);
        }

        circleElem.addEventListener("click",clickListener);
        return circleElem;
    }

    static createMergedStateLine(x1:number,y1:number,x2:number,y2:number){
        //<line x1="40" x2="260" y1="100" y2="100" stroke="#5184AF" stroke-width="2" stroke-linecap="round" stroke-dasharray="4"/>
        //<line key={`${line.srcX}-${line.srcY}-${line.endX}-${line.endY}`} x1={line.srcX} y1={line.srcY} x2={line.endX} y2={line.endY} stroke="green" strokeWidth={1} />
        
        const line = document.createElementNS(this.svgLnk,"line");
        line.setAttribute("x1", x1+"");
        line.setAttribute("y1", y1+"");
        line.setAttribute("x2", x2+"");
        line.setAttribute("y2", y2+"");
        line.setAttribute("stroke", "green");
        line.setAttribute("strokeWidth", "1");
        line.setAttribute("stroke-dasharray", "4");
        line.classList.add("mergingState");
        return line;
    }

    static getStartingPointOfLineFromCommitCircle(x1:number,y1:number,x2:number,y2:number){
        const dx = x1-x2;
        const dy = y1-y2;
        const distance = Math.sqrt((dx*dx)+(dy*dy));
        const radius = BranchUtils.commitRadius;
        const m = radius;
        const n = distance - radius;
        const x = (m*x2 + n*x1)/distance;
        const y = (m*y2 + n*y1)/distance;
        return {x,y} as IPositition
    }    

    static updateUi(){
        BranchGraphUtils.state.svgContainerWidth.update();
        BranchGraphUtils.state.panelHeight.update();
        BranchGraphUtils.state.horizontalScrollWidth.update();
        BranchGraphUtils.state.verticalScrollHeight.update();
        BranchGraphUtils.state.selectedCommit.publish(BranchUtils.repositoryDetails.headCommit);
        //BranchGraphUtils.state.horizontalScrollWidth.update();
        
        //BranchGraphUtils.updateScrollWidthUis();
        //BranchGraphUtils.updateMergingStateUi();
        //this.updateHeadIdentifier();
    }

    static updateViewBox(){
        
    }

    static updateHeadIdentifier(){        
        const headElem = BranchGraphUtils.svgContainer.querySelector(`#${EnumIdPrefix.COMMIT_TEXT}${BranchGraphUtils.state.headCommit.value.hash}`)
        headElem?.classList.remove("d-none");
        if(!BranchGraphUtils.state.headCommit.prevValue)
            return;
        const prevHeadElem = BranchGraphUtils.svgContainer.querySelector(`#${EnumIdPrefix.COMMIT_TEXT}${BranchGraphUtils.state.headCommit.prevValue!.hash}`);
        prevHeadElem?.classList.add("d-none");         
    }    

    static checkForUiUpdate(newStatus:IStatus){
        const existingStatus = BranchUtils.repositoryDetails?.status;
        if(newStatus.mergingCommitHash !== existingStatus.mergingCommitHash){
            existingStatus.mergingCommitHash = newStatus.mergingCommitHash;
            // if(existingStatus.mergingCommitHash) this.createMerginStategUi();
            // else this.removeMergingStateUi();
        }

        CacheUtils.setRepoDetails(BranchUtils.repositoryDetails);
    }

    private static updateSvgSizeUi(){
        this.svgElement.setAttribute("height",this.state.panelHeight.value+"");                   
        this.svgElement.setAttribute("width",this.state.svgContainerWidth.value+"");                   
    }

    static resizeGraph(width:number,height:number){
        // console.log("resizing",width,height);
        // BranchGraphUtils.state.panelWidth = width;
        // BranchGraphUtils.panelHeight = height;
        // this.state.viewBox.width = width;
        // this.state.viewBox.height = height;

        // this.updateViewBoxUi();
        // this.updateSvgSizeUi();
    }    

    static InitPublishers(){
        const width = Math.floor(this.svgContainer.getBoundingClientRect().width)-10;
        //this.state.panelWidth = new BranchPanelWidth(width);
        //this.state.panelHeight = new Publisher(Math.floor(window.innerHeight * 0.65));
        let mergingCommit = null! as ICommitInfo;
        if(BranchUtils.repositoryDetails.status.mergingCommitHash){
            mergingCommit = {
                hash:BranchUtils.repositoryDetails.status.mergingCommitHash,
            } as ICommitInfo;
        }        
    }

    static UpdateStates(){

    }

    static updateGraph(){

    }
}