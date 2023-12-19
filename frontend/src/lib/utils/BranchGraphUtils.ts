import { IPositionDiff, IPositition } from "../interfaces";
import { BranchUtils } from "./BranchUtils";
import * as ReactDOMServer from 'react-dom/server';
import { BranchPanel } from "../../components/selectedRepository/selectedRepoRight/branches/BranchPanel";
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
    mergingCommit:PbMergeCommit;
    headCommit:PbHeadCommit;
    selectedCommit:PbSelectedCommit;
    horizontalScrollWidth:PbHorizontalScrollWidth;
    horizontalScrollRatio: Publisher<number>;
    zoomLabel: Publisher<number>;
    verticalScrollRatio:Publisher<number>;
    viewBox:PbViewBox;
    verticalScrollTop:PbVerticalScrollTop;
    horizontalScrollLeft:PbHorizontalScrollLeft; 
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
    static branchSvgHtml='';
    static initialHorizontalScrollRatio = 1;
    static initialVerticalScrollRatio = 1;
    static focusedCommit:ICommitInfo=null!;
    static readonly selectedCommitColor = "blueviolet"
    static readonly commitColor = "cadetblue";
    static readonly svgLnk = "http://www.w3.org/2000/svg";
    //static readonly scrollbarSize = 10;
    static readonly scrollBarSize = 10;

    static openContextModal=()=>{};
   
    static state:IState={
        svgContainerWidth: new PbSvgContainerWidth(null!),
        headCommit:new PbHeadCommit(null!),
        mergingCommit:new PbMergeCommit(null!),
        panelHeight:new PbPanelHeight(null!),
        selectedCommit: new PbSelectedCommit(null!),
        zoomLabel:new Publisher(1),
        horizontalScrollRatio:new Publisher(0),
        verticalScrollRatio:new Publisher(0),
    } as IState;    

    static init(){
        BranchGraphUtils.state.horizontalScrollWidth = new PbHorizontalScrollWidth(0);
        BranchGraphUtils.state.verticalScrollHeight = new PbVerticalScrollHeight(0);
        BranchGraphUtils.state.horizontalScrollLeft = new PbHorizontalScrollLeft(0);
        BranchGraphUtils.state.verticalScrollTop = new PbVerticalScrollTop(0);
        BranchGraphUtils.state.viewBoxWidth = new PbViewBoxWidth(0);
        BranchGraphUtils.state.viewBoxHeight = new PbViewBoxHeight(0);
        BranchGraphUtils.state.viewBoxX = new PbViewBoxX(0);
        BranchGraphUtils.state.viewBoxY = new PbViewBoxY(0);
        BranchGraphUtils.state.viewBox = new PbViewBox({x:0,y:0,width:0,height:0});

        window.addEventListener("resize",()=>{
            BranchGraphUtils.state.svgContainerWidth.update();
            BranchGraphUtils.state.panelHeight.update();
        });
    }    

    static createBranchPanel(){
        BranchGraphUtils.svgContainer = document.querySelector(`#${EnumHtmlIds.branchSvgContainer}`) as HTMLDivElement;                
        //BranchGraphUtils.selectedCommit = BranchUtils.repositoryDetails.headCommit;
        BranchGraphUtils.branchSvgHtml = ReactDOMServer.renderToStaticMarkup(BranchPanel({
            width:BranchGraphUtils.svgContainer.getBoundingClientRect().width,
            height:BranchGraphUtils.svgContainer.getBoundingClientRect().height,
            repoDetails:BranchUtils.repositoryDetails,
        }))

        BranchGraphUtils.svgContainer.innerHTML = BranchGraphUtils.branchSvgHtml;

        BranchGraphUtils.svgElement = BranchGraphUtils.svgContainer.querySelector('svg')!;
        BranchGraphUtils.horizontalScrollBarElement = document.querySelector(`#${EnumHtmlIds.branchHorizontalScrollBar}`) as HTMLDivElement;
        BranchGraphUtils.verticalScrollBarElement = document.querySelector(`#${EnumHtmlIds.branchVerticalScrollBar}`) as HTMLDivElement;
        BranchGraphUtils.branchPanelContainerElement = document.querySelector(`#${EnumHtmlIds.branchPanelContainer}`) as HTMLDivElement;                
        BranchGraphUtils.updateUi();
        BranchGraphUtils.addEventListeners();
        const branchPanelContainer = document.querySelector(`#${EnumHtmlIds.branchPanelContainer}`)!;
        branchPanelContainer.classList.remove('invisible');
    }  

    static setReduxData(){
        ReduxUtils.setStatusCurrent(BranchUtils.repositoryDetails.status);
    }

    static getViewBoxStr(){
        return `${BranchGraphUtils.state.viewBoxX.value} ${BranchGraphUtils.state.viewBoxY.value} ${BranchGraphUtils.state.viewBoxWidth.value} ${BranchGraphUtils.state.viewBoxHeight.value}`;
    }

    static handleHozontalScroll2=(positionDiff:number)=>{             
        const movableWidth = BranchGraphUtils.state.svgContainerWidth.value - BranchGraphUtils.state.horizontalScrollWidth.value;
        if(movableWidth == 0)
            return;
        const ratioDiff = positionDiff / movableWidth;
        let newRatio = BranchGraphUtils.initialHorizontalScrollRatio + ratioDiff;
        newRatio = NumUtils.between1_0(newRatio);
        BranchGraphUtils.state.horizontalScrollRatio.publish(newRatio);        
    }

    static handleVerticalScroll2=(positionDiff:number)=>{             
        const movableHeight = BranchGraphUtils.state.panelHeight.value-BranchGraphUtils.state.verticalScrollHeight.value;
        if(movableHeight == 0)
            return;
        const ratioDiff = positionDiff / movableHeight;
        let newRatio = BranchGraphUtils.initialVerticalScrollRatio + ratioDiff;
        newRatio = NumUtils.between1_0(newRatio);        
        BranchGraphUtils.state.verticalScrollRatio.publish(newRatio);        
    }

    static handleScroll2=(positionDiff:IPositionDiff)=>{        
        const xRatio = BranchGraphUtils.state.horizontalScrollWidth.value/BranchGraphUtils.state.svgContainerWidth.value;
        BranchGraphUtils.handleHozontalScroll2(-positionDiff.dx*(xRatio));
        const yRatio = BranchGraphUtils.state.verticalScrollHeight.value/BranchGraphUtils.state.panelHeight.value;
        BranchGraphUtils.handleVerticalScroll2(-positionDiff.dy*(yRatio));
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
            BranchGraphUtils.initialHorizontalScrollRatio = BranchGraphUtils.state.horizontalScrollRatio.value;
        });
        UiUtils.HandleVerticalDragging(BranchGraphUtils.verticalScrollBarElement,BranchGraphUtils.handleVerticalScroll2,()=>{
            BranchGraphUtils.initialVerticalScrollRatio = BranchGraphUtils.state.verticalScrollRatio.value;
        });
        UiUtils.HandleDragging(BranchGraphUtils.svgElement as any,BranchGraphUtils.handleScroll2,()=>{
            BranchGraphUtils.initialHorizontalScrollRatio = BranchGraphUtils.state.horizontalScrollRatio.value;
            BranchGraphUtils.initialVerticalScrollRatio = BranchGraphUtils.state.verticalScrollRatio.value;
        });
        this.addEventListendersOnCommit();
        this.addWheelListender();
    }

    static controlZoom(action:"zoomIn"|"zoomOut"|"reset",diifValue:number|undefined){
        if(!BranchGraphUtils.svgElement) return;
        if(!diifValue) diifValue = 0.1;
        let newValue = BranchGraphUtils.state.zoomLabel.value;
        if(action === "zoomIn"){
            newValue +=  newValue*diifValue             
        }

        else if(action === "zoomOut"){            
            newValue -= newValue*diifValue;
        }
        else newValue = 1;

        newValue = NumUtils.between(0,5,newValue);
        BranchGraphUtils.state.zoomLabel.publish(newValue);        
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
            if(BranchGraphUtils.state.selectedCommit.value.hash) {
                existingSelectedCommitElem = this.svgContainer.querySelector(`#${EnumIdPrefix.COMMIT_CIRCLE}${BranchGraphUtils.state.selectedCommit.value.hash}`);
                existingSelectedCommitElem?.setAttribute("fill",this.commitColor);
            }

            circleElem.setAttribute("fill",this.selectedCommitColor);
            const dummyCommit = CreateCommitInfoObj();
            dummyCommit.hash = null!;
            dummyCommit.date = new Date().toISOString();
            dummyCommit.ownerBranch = head.ownerBranch;
            dummyCommit.previousCommit = head;
            dummyCommit.message = 'Commit is in merging state.';
            BranchGraphUtils.state.selectedCommit.publish(dummyCommit);
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
        BranchGraphUtils.state.headCommit.publish(BranchUtils.repositoryDetails.headCommit);
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
}