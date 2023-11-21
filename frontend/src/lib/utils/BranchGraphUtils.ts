import { IPositition, IViewBox } from "../interfaces";
import { BranchUtils } from "./BranchUtils";
import * as ReactDOMServer from 'react-dom/server';
import { BranchPanel2 } from "../../components/selectedRepository/selectedRepoRight/branches/BranchPanel2";
import { UiUtils } from "./UiUtils";
import { EnumHtmlIds, EnumIdPrefix } from "../enums";
import { Constants, CreateCommitInfoObj, IBranchDetails, ICommitInfo, IRepositoryDetails, IStatus } from "common_library";
import { ModalData } from "../../components/modals/ModalData";
import { CacheUtils } from "./CacheUtils";
import { ReduxUtils } from "./ReduxUtils";
import { Publisher } from "../publishers";
import { BranchPanelWidth, HorizontalScrollLeft, HorizontalScrollWidth } from "./branchPanel";

interface IState{
    panelWidth:BranchPanelWidth;
    panelHeight:Publisher<number>;
    zoomLabel:Publisher<number>;
    mergingCommit:Publisher<ICommitInfo>;
    headCommit:Publisher<ICommitInfo>;
    selectedCommit:Publisher<ICommitInfo>;
    horizontalScrollWidth:HorizontalScrollWidth;
    horizontalScrollRatio:number;
    horizontalScrollRatio2: Publisher<number>;
    zoomLabel2: Publisher<number>;
    verticalScrollRatio:number;
    viewBox:IViewBox;
    notScrolledHorizontallyYet:boolean;
    notScrolledVerticallyYet:boolean;
    verticalScrollTop:number;
    horizontalScrollLeft:number;
    horizontalScrollLeft2:Publisher<number>;    
}


export class BranchGraphUtils{
    //static horizontalScrollBarId = "horizontalScrollBar";    
    static svgContainer:HTMLDivElement;
    static branchPanelRootElement:HTMLDivElement= null!;
    static svgElement:SVGSVGElement = null!;
    static horizontalScrollBarElement:HTMLDivElement = null!;
    static verticalScrollBarElement:HTMLDivElement = null!;
    // static headElement:HTMLElement = null!;
    static branchSvgHtml='';
    static zoom = 0;
    //static horizontalScrollWidth = 0;
    static verticalScrollHeight = 0;
    static selectedCommit:ICommitInfo;
    static focusedCommit:ICommitInfo=null!;
    static readonly selectedCommitColor = "blueviolet"
    static readonly commitColor = "cadetblue";
    static readonly svgLnk = "http://www.w3.org/2000/svg";
    //static readonly scrollbarSize = 10;
    static readonly verticalScrollBarWidth = 10;

    static get horizontalScrollContainerWidth(){
        return this.state.panelWidth.value+10;
    }

    static handleCommitSelect=(commit:ICommitInfo)=>{};
    static openContextModal=()=>{};
   
    static state:IState={
        panelWidth: new BranchPanelWidth(),
        headCommit:new Publisher<ICommitInfo>(null!).subscribe(BranchGraphUtils.updateHeadIdentifier),
        mergingCommit:new Publisher<ICommitInfo>(null!).subscribe(BranchGraphUtils.updateMergingStateUi),
        panelHeight:new Publisher(0),
        selectedCommit: new Publisher<ICommitInfo>(null!),
        zoomLabel:new Publisher(0),
        zoomLabel2:new Publisher(1),
        horizontalScrollLeft2:new HorizontalScrollLeft(0),
        horizontalScrollRatio:0,
        verticalScrollRatio:0,
        viewBox: {x:0,y:0,width:0,height:0},
        notScrolledHorizontallyYet:true,
        notScrolledVerticallyYet:true,
        verticalScrollTop:0,
        horizontalScrollLeft:0,
        horizontalScrollWidth:new HorizontalScrollWidth(0).subscribe(BranchGraphUtils.updateHorizontalScrollBarUi),
        horizontalScrollRatio2:new Publisher(1.0)
    };

    static dataRef ={
        initialHorizontalScrollLeft:0,
        initialVerticalScrollTop:0,
        isMounted:false,
        zoom:this.zoom,
        initialViewbox:this.state.viewBox,
    }

    static updateScrollWidthUis(){
        //if(!this.svgElement) return;
        this.updateScrollWidthValues();
        this.verticalScrollBarElement.style.height = `${this.verticalScrollHeight}px`;
    }
    
    static updateHorizontalScrollBarUi(){
        BranchGraphUtils.horizontalScrollBarElement.style.width = `${BranchGraphUtils.state.horizontalScrollWidth.value}px`;
    }

    static updateScrollWidthValues(){
        BranchGraphUtils.state.horizontalScrollWidth.update();
        this.verticalScrollHeight = this.getVerticalScrollHeight();
    }

    static createBranchPanel(){
        BranchGraphUtils.svgContainer = document.querySelector(`#${EnumHtmlIds.branchSvgContainer}`) as HTMLDivElement;                        
        //this.InitPublishers();
        
        // this.state.viewBox.width = this.publishers.state.panelWidth.value;
        // this.state.viewBox.height = this.publishers.panelHeight.value;

        // this.updateScrollWidthValues();

        //this.setScrollPosition();
        
        BranchGraphUtils.selectedCommit = BranchUtils.repositoryDetails.headCommit;

        BranchGraphUtils.branchSvgHtml = ReactDOMServer.renderToStaticMarkup(BranchPanel2({
            width:BranchGraphUtils.svgContainer.getBoundingClientRect().width,
            height:Math.floor(window.innerHeight * 0.65),
            repoDetails:BranchUtils.repositoryDetails,
        }))

        BranchGraphUtils.svgContainer.innerHTML = this.branchSvgHtml;

        this.svgElement = this.svgContainer.querySelector('svg')!;
        this.horizontalScrollBarElement = document.querySelector(`#${EnumHtmlIds.branchHorizontalScrollBar}`) as HTMLDivElement;
        this.verticalScrollBarElement = document.querySelector(`#${EnumHtmlIds.branchVerticalScrollBar}`) as HTMLDivElement;
        //this.insertNewBranchGraph();
//        this.state.headCommit.publish(BranchUtils.repositoryDetails.headCommit);
        this.updateUi();
        //this.state.headCommit.publish(BranchUtils.repositoryDetails.headCommit);
        //this.updateUi();
        this.handleCommitSelect(this.selectedCommit);
        const branchPanelContainer = document.querySelector(`#${EnumHtmlIds.branchPanelContainer}`)!;
        branchPanelContainer.classList.remove('invisible');
    }  

    private static insertNewBranchGraph(){

        //this.updateUi();

        // this.svgElement = this.branchPanelContainer.querySelector('svg')!;
        // this.horizontalScrollBarElement = this.branchPanelContainer.querySelector(`#${this.horizontalScrollBarId}`) as HTMLDivElement;
        // this.verticalScrollBarElement = this.branchPanelContainer.querySelector(`#${this.verticalScrollBarId}`) as HTMLDivElement;

        //this.updateHeadIdentifier();
        //this.handleCommitSelect(this.selectedCommit);
        
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
            if(this.state.panelWidth.value <= BranchGraphUtils.state.horizontalScrollWidth.value) return;
            let newLeft = this.dataRef.initialHorizontalScrollLeft+ horizontalScrollMousePosition!.x;
            const maxLeft = this.state.panelWidth.value - BranchGraphUtils.state.horizontalScrollWidth.value;
            if(newLeft < 0) newLeft = 0;
            else if(newLeft > maxLeft) newLeft = maxLeft;
            let newRatio = newLeft/maxLeft;            

            let totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
            if(totalWidth <this.state.panelWidth.value) totalWidth = this.state.panelWidth.value;

            const x = totalWidth *newRatio;
            let viewBoxX = x - (this.state.panelWidth.value/2);

            
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
            
            if(!!svgScrollMousePosition?.x && this.state.panelWidth.value > BranchGraphUtils.state.horizontalScrollWidth.value){
                let totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
                if(totalWidth <this.state.panelWidth.value) totalWidth = this.state.panelWidth.value;
    
                const maxLeft = this.state.panelWidth.value - BranchGraphUtils.state.horizontalScrollWidth.value;
                const movedScrollBar = (svgScrollMousePosition.x * (maxLeft / totalWidth) *(this.state.viewBox.width/this.state.panelWidth.value));            
                newHorizontalScrollLeft = this.dataRef.initialHorizontalScrollLeft- movedScrollBar;
                if(newHorizontalScrollLeft < 0) newHorizontalScrollLeft = 0;
                else if(newHorizontalScrollLeft > maxLeft) newHorizontalScrollLeft = maxLeft;
                newHorizontalRatio = newHorizontalScrollLeft/maxLeft;                        
    
                const x = totalWidth *newHorizontalRatio;
                let viewBoxX = x - (this.state.panelWidth.value/2);   
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
            let existingSelectedCommitElem:Element | null ;
            if(!this.selectedCommit.hash){
                existingSelectedCommitElem = this.svgContainer.querySelector(`#${EnumIdPrefix.COMMIT_CIRCLE}merge`);
            }
            else {
                existingSelectedCommitElem = this.svgContainer.querySelector(`#${EnumIdPrefix.COMMIT_CIRCLE}${this.selectedCommit.hash}`);
            }
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

    private static addResizeListener(){
        const svgContainerElem = document.getElementById(EnumHtmlIds.branchSvgContainer);
        const horizontalScrollBarContainer = this.horizontalScrollBarElement.parentElement!;
        const handleResize = ()=>{
            const width = this.svgContainer.offsetWidth;
            const widthStr = width+"px";
            if(svgContainerElem)
                svgContainerElem.style.width = widthStr;
            horizontalScrollBarContainer.style.width = widthStr;
            horizontalScrollBarContainer.style.width = widthStr;
            this.resizeGraph(width,this.state.panelHeight.value);

        }
        new ResizeObserver(handleResize).observe(this.svgContainer)

    }

    static addEventListeners(){
        // const horizontalScrollBar = this.branchPanelContainer.querySelector(`#${this.horizontalScrollBarId}`) as HTMLElement;
        UiUtils.handleDrag(this.horizontalScrollBarElement,this.handleHozontalScroll);
        UiUtils.handleDrag(this.verticalScrollBarElement,this.handleVerticalScroll);
        UiUtils.handleDrag(this.svgElement as any,this.handleSvgDragging);
        this.addEventListendersOnCommit();
        this.addWheelListender();
        this.addResizeListener();
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

    static scrollToHeadCommit(){
        if(!this.branchSvgHtml) return;
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
        if(totalHeight < this.state.panelHeight.value) totalHeight = this.state.panelHeight.value;        
        if(totalWidth < this.state.panelWidth.value) totalHeight = this.state.panelWidth.value;
        const horizontalRatio = this.focusedCommit.x/totalWidth;
        const verticalRatio = this.focusedCommit.ownerBranch.y/totalHeight;
        let verticalScrollTop = (this.state.panelHeight.value-this.verticalScrollHeight)*verticalRatio;   
        let horizontalScrollLeft = (this.horizontalScrollContainerWidth-BranchGraphUtils.state.horizontalScrollWidth.value)*horizontalRatio;
        this.dataRef.initialVerticalScrollTop = verticalScrollTop;
        this.dataRef.initialHorizontalScrollLeft = horizontalScrollLeft;

        const x = totalWidth *horizontalRatio;
        let viewBoxX = 0;
        if(totalWidth > this.state.panelWidth.value) viewBoxX = x- (this.state.panelWidth.value/2);

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

    static controlZoom(action:"zoomIn"|"zoomOut"|"reset",zoomValue:number|undefined){
        if(!this.svgElement) return;
        if(!zoomValue) zoomValue = 10;
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


    static removeMergingStateUi(){
        if(BranchUtils.repositoryDetails.status.mergingCommitHash)return;

        const head = BranchUtils.repositoryDetails.headCommit;
        const allCommits = BranchUtils.repositoryDetails.allCommits;
        const latestCommit = allCommits[allCommits.length-1];
        const endX = latestCommit.x;
        const y = head.ownerBranch.y;

        const branchLineElem = document.querySelector(`#${EnumIdPrefix.BRANCH_LINE}${head.ownerBranch._id}`)!;
        //d={`M${data.startX},${data.startY} ${data.vLinePath} h${data.hLineLength}`}
        const branchDetails = head.ownerBranch;
        const lineData = this.getBranchLinePathData(branchDetails);
        const hLineLength = endX - lineData.startX;
        const linePath = this.getBranchLinePath(lineData.startX,lineData.startY,lineData.vLinePath,hLineLength);
        branchLineElem.setAttribute("d",linePath);

        const elems = document.querySelectorAll(".mergingState");
        elems.forEach(elem=> elem.remove());

    }

    static createMerginStategUi(){
        if(!this.state.mergingCommit.value)return;
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

        const gElem = document.querySelector('#branchPanel')?.getElementsByTagName('g').item(0)!;

        const srcCommit = allCommits.find(x=>x.hash === BranchUtils.repositoryDetails.status.mergingCommitHash)!;
        const pointFromCircle = this.getStartingPointOfLineFromCommitCircle(srcCommit.x,srcCommit.ownerBranch.y,endX,y);
        const line = this.createMergedStateLine(pointFromCircle.x,pointFromCircle.y, endX,y);
        gElem.appendChild(line);
        const commitBox = this.createMergeCommit(head, endX,srcCommit);
        gElem.appendChild(commitBox);

    }

    static updateUi(){
        this.state.panelWidth.update();
        this.updateScrollWidthUis();
        this.updateMergingStateUi();
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

    static updateMergingStateUi(){
        if(this.state.mergingCommit.prevValue)
            this.removeMergingStateUi();
        this.createMerginStategUi();
    }

    static checkForUiUpdate(newStatus:IStatus){
        const existingStatus = BranchUtils.repositoryDetails?.status;
        if(newStatus.mergingCommitHash !== existingStatus.mergingCommitHash){
            existingStatus.mergingCommitHash = newStatus.mergingCommitHash;
            if(existingStatus.mergingCommitHash) this.createMerginStategUi();
            else this.removeMergingStateUi();
        }

        CacheUtils.setRepoDetails(BranchUtils.repositoryDetails);
    }

    private static updateSvgSizeUi(){
        this.svgElement.setAttribute("height",this.state.panelHeight.value+"");                   
        this.svgElement.setAttribute("width",this.state.panelWidth.value+"");                   
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
        this.state.panelHeight = new Publisher(Math.floor(window.innerHeight * 0.65));
        let mergingCommit = null! as ICommitInfo;
        if(BranchUtils.repositoryDetails.status.mergingCommitHash){
            mergingCommit = {
                hash:BranchUtils.repositoryDetails.status.mergingCommitHash,
            } as ICommitInfo;
        }
        this.state.mergingCommit = new Publisher(mergingCommit);
        this.state.headCommit = new Publisher(BranchUtils.repositoryDetails.headCommit);
        this.state.selectedCommit = new Publisher(null! as ICommitInfo);
    }

    static UpdateStates(){

    }

    static updateGraph(){

    }
}