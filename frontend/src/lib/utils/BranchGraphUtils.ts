import { IPositition, IViewBox } from "../interfaces";
import { BranchUtils } from "./BranchUtils";
import * as ReactDOMServer from 'react-dom/server';
import { BranchPanel2 } from "../../components/selectedRepository/selectedRepoRight/branches/BranchPanel2";
import { UiUtils } from "./UiUtils";
import { EnumIdPrefix } from "../enums";
import { Constants, createBranchDetailsObj, IBranchDetails, ICommitInfo, IRepositoryDetails, IStatus } from "common_library";
import { ModalData } from "../../components/modals/ModalData";
import { DetachedHeadText } from "../../components/selectedRepository/selectedRepoRight/branches/DetachedHeadText";
import ReactDOM from "react-dom";
import { CacheUtils } from "./CacheUtils";
import { ReduxUtils } from "./ReduxUtils";

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
    // static headElement:HTMLElement = null!;
    static branchPanelHtml:string='';
    static panelWidth = -1;
    static panelHeight = Math.floor(window.innerHeight * 0.65);
    static zoom = 0;
    static horizontalScrollWidth = 0;
    static verticalScrollHeight = 0;
    static selectedCommit:ICommitInfo;
    static focusedCommit:ICommitInfo=null!;
    static readonly selectedCommitColor = "blueviolet"
    static readonly commitColor = "cadetblue";

    static get horizontalScrollContainerWidth(){
        return this.panelWidth+10;
    }

    static handleCommitSelect=(commit:ICommitInfo)=>{};
    static openContextModal=()=>{};
   

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
        
        this.selectedCommit = BranchUtils.repositoryDetails.headCommit;

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
        this.handleCommitSelect(this.selectedCommit);
        
        this.addEventListeners();
        
        this.handleZoomEffect();

        ReduxUtils.setLoader(undefined);
        this.setReduxData();
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
        return `${this.state.viewBox.x} ${this.state.viewBox.y} ${this.state.viewBox.width} ${this.state.viewBox.height}`;
    }

    static handleHozontalScroll=(horizontalScrollMousePosition?:IPositition)=>{     
        if(horizontalScrollMousePosition === undefined ) {
            if(!this.state.notScrolledHorizontallyYet){                
                this.dataRef.initialHorizontalScrollLeft = this.state.horizontalScrollLeft;
            }
        }
        else{
            console.log("this.panelWidth",this.panelWidth);
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
    
    static addEventListendersOnCommit(){

        const clickListener = (target:HTMLElement)=>{
            const existingSelectedCommitElem = this.branchPanelContainer.querySelector(`#${EnumIdPrefix.COMMIT_CIRCLE}${this.selectedCommit.hash}`);
            existingSelectedCommitElem?.setAttribute("fill",this.commitColor);
            const commitId = target.id.substring(EnumIdPrefix.COMMIT_CIRCLE.length);
            const selectedCommit = BranchUtils.repositoryDetails.allCommits.find(x=>x.hash === commitId);
            target.setAttribute("fill",this.selectedCommitColor);
            this.handleCommitSelect(selectedCommit!);
            this.selectedCommit = selectedCommit!;
        }
        
        UiUtils.addEventListenderByClassName("commit","click",clickListener);

        const commitTextClickListener=(target:HTMLElement)=>{
            const commitId = target.id.substring(EnumIdPrefix.COMMIT_TEXT.length);
            const commitCircleElem = this.svgElement.querySelector<HTMLElement>(`#${EnumIdPrefix.COMMIT_CIRCLE}${commitId}`);
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

            this.openContextModal();
        }

        UiUtils.addEventListenderByClassName("commit","contextmenu",contextEventListener)

        const commitTextContextClickListener=(target:HTMLElement,event:MouseEvent)=>{
            const commitId = target.id.substring(EnumIdPrefix.COMMIT_TEXT.length);
            const commitCircleElem = this.svgElement.querySelector<HTMLElement>(`#${EnumIdPrefix.COMMIT_CIRCLE}${commitId}`);
            contextEventListener(commitCircleElem!,event);
        }

        UiUtils.addEventListenderByClassName("commit_text","contextmenu",commitTextContextClickListener)

    }

    static addWheelListender(){
        if(!this.svgElement) return;
        
        this.svgElement.addEventListener("wheel",(e)=>{
            var delta = Math.max(Math.abs(e.deltaX),Math.abs(e.deltaY));
            if(e.deltaX > 0 || e.deltaY > 0) {
                // dispatch(ActionUI.decreamentBranchPanelZoom(delta));
                // this.zoom -= delta;
                this.controlZoom("zoomOut",delta);

            }
            else{
                // dispatch(ActionUI.increamentBranchPanelZoom(delta));
                // this.zoom += delta;
                this.controlZoom("zoomIn",delta);

            }

            
        })
    }

    static addEventListeners(){
        // const horizontalScrollBar = this.branchPanelContainer.querySelector(`#${this.horizontalScrollBarId}`) as HTMLElement;
        UiUtils.handleDrag(this.horizontalScrollBarElement,this.handleHozontalScroll);
        UiUtils.handleDrag(this.verticalScrollBarElement,this.handleVerticalScroll);
        UiUtils.handleDrag(this.svgElement as any,this.handleSvgDragging);
        this.addEventListendersOnCommit();
        this.addWheelListender();
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
        this.focusedCommit = BranchUtils.repositoryDetails?.headCommit;
        this.setScrollPosition();
        this.updateUIPositioning();                      
    }

    static setScrollPosition () {       
        if(!this.focusedCommit) this.focusedCommit = BranchUtils.repositoryDetails?.headCommit;
        else {
            const focusedCommit = BranchUtils.repositoryDetails.allCommits.find(x=>x.hash === this.focusedCommit.hash);
            if(!focusedCommit) this.focusedCommit = BranchUtils.repositoryDetails?.headCommit;
        }

        let totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
        let totalHeight = BranchUtils.repositoryDetails.branchPanelHeight;
        if(totalHeight < this.panelHeight) totalHeight = this.panelHeight;        
        if(totalWidth < this.panelWidth) totalHeight = this.panelWidth;
        const horizontalRatio = this.focusedCommit.x/totalWidth;
        const verticalRatio = this.focusedCommit.ownerBranch.y/totalHeight;
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

    static controlZoom(action:"zoomIn"|"zoomOut"|"reset",zoomValue:number|undefined){
        if(!this.svgElement) return;
        if(!zoomValue) zoomValue = 1;
        if(action === "zoomIn"){
            this.zoom += zoomValue;            
        }

        else if(action === "zoomOut"){            
            this.zoom -= zoomValue;
        }
        else this.zoom = 0;

        const viewBox = BranchUtils.getViewBoxValue(this.dataRef.initialViewbox,this.zoom);
        this.state.viewBox = viewBox;            
        this.dataRef.zoom = this.zoom;

        this.updateUIPositioning();
        this.updateScrollWidthUis();
        this.handleZoomEffect();
    }


    static CreateHeadTextElement(commit:ICommitInfo){
        if(!commit.refValues.length) return null;    
        let y = commit.ownerBranch.y - BranchUtils.commitRadius - 4;
        const x = commit.x + BranchUtils.commitRadius;
        for(let i=0;i<commit.refValues.length-1;i++){                
            y = y - BranchUtils.branchPanelFontSize - 1;
        }
        // return <text x={x} y={y} direction="rtl" fontSize={BranchUtils.branchPanelFontSize} fill="blue">HEAD</text>;
        const elem = document.createElementNS("http://www.w3.org/2000/svg",'text');        
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
        this.insertNewBranchGraph();
    }

    static handleNewBranch(sourceCommit:ICommitInfo,branch:string,status:IStatus){
        console.log("BranchUtils.repositoryDetails",BranchUtils.repositoryDetails);
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

    static updateMergingUi(){
        if(!BranchUtils.repositoryDetails.status.mergingCommitHash)return;
        const head = BranchUtils.repositoryDetails.headCommit;
        const allCommits = BranchUtils.repositoryDetails.allCommits;
        const latestCommit = allCommits[allCommits.length-1];
        const endX = latestCommit.x + BranchUtils.distanceBetweenCommits;
        const y = head.ownerBranch.y;

        const branchLineElem = document.querySelector(`#${EnumIdPrefix.BRANCH_LINE}${head.ownerBranch._id}`)!;
        //d={`M${data.startX},${data.startY} ${data.vLinePath} h${data.hLineLength}`}
        const branchDetails = head.ownerBranch;
        const lineData = this.getBranchLinePathData(branchDetails);
        const hLineLength = endX - lineData.startX;
        const linePath = this.getBranchLinePath(lineData.startX,lineData.startY,lineData.vLinePath,hLineLength);
        branchLineElem.setAttribute("d",linePath);

    }

    static checkForUiUpdate(newStatus:IStatus){
        const existingStatus = BranchUtils.repositoryDetails?.status;
        if(newStatus.mergingCommitHash !== existingStatus.mergingCommitHash){
            existingStatus.mergingCommitHash = newStatus.mergingCommitHash;
            this.updateMergingUi();
        }
    }
}