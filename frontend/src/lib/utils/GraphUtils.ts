import { IPositionDiff, IPositition } from "../interfaces";
import { RepoUtils } from "./RepoUtils";
import * as ReactDOMServer from 'react-dom/server';
import { BranchPanel } from "../../components/selectedRepository/selectedRepoRight/branches/BranchPanel";
import { UiUtils } from "./UiUtils";
import { EnumHtmlIds, EnumIdPrefix } from "../enums";
import { Constants, CreateCommitInfoObj, IBranchDetails, ICommitInfo, IStatus } from "common_library";
import { ModalData } from "../../components/modals/ModalData";
import { CacheUtils } from "./CacheUtils";
import { ReduxUtils } from "./ReduxUtils";
import { PbSvgContainerWidth, PbHorizontalScrollLeft, PbHorizontalScrollWidth, PbHeadCommit, PbPanelHeight, PbSelectedCommit, PbViewBoxX, PbViewBoxWidth, PbMergeCommit, PbViewBoxHeight, PbViewBoxY, PbVerticalScrollHeight, PbVerticalScrollTop, PbViewBox } from "./branchGraphPublishers";
import { Publisher } from "../publishers";
import { NumUtils } from "./NumUtils";
import { IpcUtils } from "./IpcUtils";
import { PbCommitFilter } from "./branchGraphPublishers/PbCommitFilter";


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
    filter:PbCommitFilter;
}

export class GraphUtils{
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
        filter : new PbCommitFilter({limit:400,toDate: new Date().toISOString(),userModified:false}),
    } as IState;
    
    static resizeHandler = ()=>{
        GraphUtils.state.svgContainerWidth.update();
        GraphUtils.state.panelHeight.update();
    }

    static init(){
        GraphUtils.state.horizontalScrollWidth = new PbHorizontalScrollWidth(0);
        GraphUtils.state.verticalScrollHeight = new PbVerticalScrollHeight(0);
        GraphUtils.state.horizontalScrollLeft = new PbHorizontalScrollLeft(0);
        GraphUtils.state.verticalScrollTop = new PbVerticalScrollTop(0);
        GraphUtils.state.viewBoxWidth = new PbViewBoxWidth(0);
        GraphUtils.state.viewBoxHeight = new PbViewBoxHeight(0);
        GraphUtils.state.viewBoxX = new PbViewBoxX(0);
        GraphUtils.state.viewBoxY = new PbViewBoxY(0);
        GraphUtils.state.viewBox = new PbViewBox({x:0,y:0,width:0,height:0});
    }    

    static createBranchPanel(){
        console.log("creating graph");
        GraphUtils.resetGraphStates();
        GraphUtils.svgContainer = document.querySelector(`#${EnumHtmlIds.branchSvgContainer}`) as HTMLDivElement;                
        //BranchGraphUtils.selectedCommit = BranchUtils.repositoryDetails.headCommit;
        GraphUtils.branchSvgHtml = ReactDOMServer.renderToStaticMarkup(BranchPanel({
            width:GraphUtils.svgContainer.getBoundingClientRect().width,
            height:GraphUtils.svgContainer.getBoundingClientRect().height,
            repoDetails:RepoUtils.repositoryDetails,
        }))

        GraphUtils.svgContainer.innerHTML = GraphUtils.branchSvgHtml;

        GraphUtils.svgElement = GraphUtils.svgContainer.querySelector('svg')!;
        GraphUtils.horizontalScrollBarElement = document.querySelector(`#${EnumHtmlIds.branchHorizontalScrollBar}`) as HTMLDivElement;
        GraphUtils.verticalScrollBarElement = document.querySelector(`#${EnumHtmlIds.branchVerticalScrollBar}`) as HTMLDivElement;
        GraphUtils.branchPanelContainerElement = document.querySelector(`#${EnumHtmlIds.branchPanelContainer}`) as HTMLDivElement;                
        GraphUtils.addEventListeners();
        GraphUtils.resetStates();
        GraphUtils.updateUi();
        const branchPanelContainer = document.querySelector(`#${EnumHtmlIds.branchPanelContainer}`)!;
        branchPanelContainer.classList.remove('invisible');
    }
    
    static resetStates(){
        GraphUtils.state.selectedCommit.publish(RepoUtils.repositoryDetails.headCommit);
    }

    static setReduxData(){
        ReduxUtils.setStatus(RepoUtils.repositoryDetails.status);
    }

    static getViewBoxStr(){
        return `${GraphUtils.state.viewBoxX.value} ${GraphUtils.state.viewBoxY.value} ${GraphUtils.state.viewBoxWidth.value} ${GraphUtils.state.viewBoxHeight.value}`;
    }

    static handleHozontalScroll2=(positionDiff:number)=>{             
        const movableWidth = GraphUtils.state.svgContainerWidth.value - GraphUtils.state.horizontalScrollWidth.value;
        if(movableWidth == 0)
            return;
        const ratioDiff = positionDiff / movableWidth;
        let newRatio = GraphUtils.initialHorizontalScrollRatio + ratioDiff;
        newRatio = NumUtils.between1_0(newRatio);
        GraphUtils.state.horizontalScrollRatio.publish(newRatio);        
    }

    static handleVerticalScroll2=(positionDiff:number)=>{             
        const movableHeight = GraphUtils.state.panelHeight.value-GraphUtils.state.verticalScrollHeight.value;
        if(movableHeight == 0)
            return;
        const ratioDiff = positionDiff / movableHeight;
        let newRatio = GraphUtils.initialVerticalScrollRatio + ratioDiff;
        newRatio = NumUtils.between1_0(newRatio);
        GraphUtils.state.verticalScrollRatio.publish(newRatio);        
    }

    static handleScroll2=(positionDiff:IPositionDiff)=>{        
        const xRatio = GraphUtils.state.horizontalScrollWidth.value/GraphUtils.state.svgContainerWidth.value;
        GraphUtils.handleHozontalScroll2(-positionDiff.dx*(xRatio));
        const yRatio = GraphUtils.state.verticalScrollHeight.value/GraphUtils.state.panelHeight.value;
        GraphUtils.handleVerticalScroll2(-positionDiff.dy*(yRatio));
    }    

    static updateSelectedCommitUi(){
//        this.publishers
    }
    
    static addEventListendersOnCommit(){

        const clickListener = (target:HTMLElement)=>{
            const commitId = target.id.substring(EnumIdPrefix.COMMIT_CIRCLE.length);
            const selectedCommit = RepoUtils.repositoryDetails.allCommits.find(x=>x.hash === commitId);
            GraphUtils.state.selectedCommit.publish(selectedCommit!);
        }
        
        UiUtils.addEventListenderByClassName("commit","click",clickListener);

        const commitTextClickListener=(target:HTMLElement)=>{
            const commitId = target.id.substring(EnumIdPrefix.COMMIT_TEXT.length);
            const commitCircleElem = GraphUtils.svgElement.querySelector<HTMLElement>(`#${EnumIdPrefix.COMMIT_CIRCLE}${commitId}`);
            clickListener(commitCircleElem!);
        }

        UiUtils.addEventListenderByClassName("commit_text","click",commitTextClickListener);

        const contextEventListener=(target:HTMLElement,event:MouseEvent)=>{            
            const commitId = target.id.substring(EnumIdPrefix.COMMIT_CIRCLE.length);
            const selectedCommit = RepoUtils.repositoryDetails.allCommits.find(x=>x.hash === commitId);
            ModalData.commitContextModal.selectedCommit=selectedCommit!;            
            ModalData.commitContextModal.position = {
                x:event.clientX,
                y:event.clientY,
            }

            GraphUtils.openContextModal();
        }

        UiUtils.addEventListenderByClassName("commit","contextmenu",contextEventListener)

        const commitTextContextClickListener=(target:HTMLElement,event:MouseEvent)=>{
            const commitId = target.id.substring(EnumIdPrefix.COMMIT_TEXT.length);
            const commitCircleElem = GraphUtils.svgElement.querySelector<HTMLElement>(`#${EnumIdPrefix.COMMIT_CIRCLE}${commitId}`);
            contextEventListener(commitCircleElem!,event);
        }

        UiUtils.addEventListenderByClassName("commit_text","contextmenu",commitTextContextClickListener)

    }

    static addWheelListender(){
        if(!GraphUtils.svgElement) return;
        
        GraphUtils.svgElement.addEventListener("wheel",(e)=>{
            var delta = Math.max(Math.abs(e.deltaX),Math.abs(e.deltaY));
            if(e.deltaX > 0 || e.deltaY > 0) {                
                GraphUtils.controlZoom("zoomOut", 0.1);
            }
            else{
                GraphUtils.controlZoom("zoomIn", 0.1);
            }
        })
    }

    static addEventListeners(){
        window.addEventListener("resize",GraphUtils.resizeHandler);
        UiUtils.HandleHorizontalDragging(GraphUtils.horizontalScrollBarElement,GraphUtils.handleHozontalScroll2,()=>{
            GraphUtils.initialHorizontalScrollRatio = GraphUtils.state.horizontalScrollRatio.value;
        });
        UiUtils.HandleVerticalDragging(GraphUtils.verticalScrollBarElement,GraphUtils.handleVerticalScroll2,()=>{
            GraphUtils.initialVerticalScrollRatio = GraphUtils.state.verticalScrollRatio.value;
        });
        UiUtils.HandleDragging(GraphUtils.svgElement as any,GraphUtils.handleScroll2,()=>{
            GraphUtils.initialHorizontalScrollRatio = GraphUtils.state.horizontalScrollRatio.value;
            GraphUtils.initialVerticalScrollRatio = GraphUtils.state.verticalScrollRatio.value;
        });
        GraphUtils.addEventListendersOnCommit();
        GraphUtils.addWheelListender();
    }

    static controlZoom(action:"zoomIn"|"zoomOut"|"reset",diifValue:number|undefined){
        if(!GraphUtils.svgElement) return;
        if(!diifValue) diifValue = 0.1;
        let newValue = GraphUtils.state.zoomLabel.value;
        if(action === "zoomIn"){
            newValue +=  newValue*diifValue             
        }

        else if(action === "zoomOut"){            
            newValue -= newValue*diifValue;
        }
        else newValue = 1;

        newValue = NumUtils.between(0.01,50,newValue);
        GraphUtils.state.zoomLabel.publish(newValue);        
    }


    static CreateHeadTextElement(commit:ICommitInfo){
        if(!commit.refValues.length) return null;    
        let y = commit.ownerBranch.y - RepoUtils.commitRadius - 4;
        const x = commit.x + RepoUtils.commitRadius;
        for(let i=0;i<commit.refValues.length-1;i++){                
            y = y - RepoUtils.branchPanelFontSize - 1;
        }
        // return <text x={x} y={y} direction="rtl" fontSize={BranchUtils.branchPanelFontSize} fill="blue">HEAD</text>;
        const elem = document.createElementNS(this.svgLnk,'text');        
        elem.setAttribute("x",`${x}`)
        elem.setAttribute("y",`${y}`)
        elem.setAttribute("direction",`rtl`)
        elem.setAttribute("font-size",`${RepoUtils.branchPanelFontSize}`);
        elem.setAttribute("fill",`blue`);
        elem.classList.add("refText",`${EnumIdPrefix.COMMIT_REF}${commit.hash}`,"headRef")
        elem.innerHTML = Constants.detachedHeadIdentifier;
        return elem;
    }
    
    static updateUiForCheckout(){
        if(!this.svgElement) return;
        const headCommit = RepoUtils.repositoryDetails.headCommit;
        if(!headCommit)
            return;
        if(RepoUtils.repositoryDetails.status.isDetached){
            const commitElem = this.svgElement.querySelector(`#${EnumIdPrefix.COMMIT_CIRCLE}${headCommit.hash}`);
            const headTextElem = this.CreateHeadTextElement(headCommit);        
            commitElem?.insertAdjacentElement("beforebegin",headTextElem!);
        }

        const HTextElem = this.svgElement.querySelector(`#${EnumIdPrefix.COMMIT_TEXT}${headCommit.hash}`);

        HTextElem?.classList.remove("d-none");
        ReduxUtils.setStatus(RepoUtils.repositoryDetails.status);
    }
    

    static revertUiOfExistingCheckout(){
        if(!this.svgElement) return;
        const headCommit = RepoUtils.repositoryDetails.headCommit;
        if(!headCommit)
            return;
        const headCommitTextElem = this.svgElement.querySelector(`#${EnumIdPrefix.COMMIT_TEXT}${headCommit.hash}`);
        if(!headCommitTextElem) return;
        headCommitTextElem.classList.add("d-none");
        if(RepoUtils.repositoryDetails.status.isDetached){
            const refElems = this.svgElement.querySelectorAll(`.${EnumIdPrefix.COMMIT_REF}${headCommit.hash}`);
            let headTextElem:Element|undefined;

            refElems.forEach(elem=>{
                if(elem.classList.contains("headRef")) headTextElem = elem;
            });

            if(headTextElem) headTextElem.remove();

        }
    }

    static handleCheckout(commit:ICommitInfo,newStatus:IStatus){
        const repoDetails = RepoUtils.repositoryDetails;
        this.revertUiOfExistingCheckout();
        const existingHead = repoDetails.headCommit;

        const newHeadCommit = repoDetails.allCommits.find(x=>x.hash === commit.hash);        

        const existingStatus = repoDetails.status;
        repoDetails.status = newStatus; 

        if(existingHead){
            existingHead.isHead = false;
            if(existingStatus.isDetached){
                existingHead.refValues = existingHead.refValues.filter(x=> x !== Constants.detachedHeadIdentifier);
                if(existingHead.ownerBranch.increasedHeightForDetached > 0){
                    existingHead.ownerBranch.maxRefCount -= existingHead.ownerBranch.increasedHeightForDetached;                
                    existingHead.ownerBranch.increasedHeightForDetached = 0;
                }            
            }
        }
        repoDetails.headCommit = newHeadCommit!;
        
        if(newHeadCommit){
            repoDetails.headCommit = newHeadCommit;
            newHeadCommit.isHead = true;
            const existingMaxRefLength = newHeadCommit.ownerBranch.maxRefCount;

            if(newStatus.isDetached){
                newHeadCommit.refs += `,${Constants.detachedHeadIdentifier}`;
                newHeadCommit.refValues.push(`${Constants.detachedHeadIdentifier}`);            
            }
            else{
                if(!RepoUtils.repositoryDetails.branchList.includes(newHeadCommit.ownerBranch.name)){
                    newHeadCommit.refs = `${Constants.headPrefix}${newHeadCommit.ownerBranch.name},${newHeadCommit.refs}`;
                    newHeadCommit.refValues.push(`${newHeadCommit.ownerBranch.name}`);
                    newHeadCommit.branchNameWithRemotes.push({branchName:newHeadCommit.ownerBranch.name,remote:""});                
                }
            }
            if(newHeadCommit.refValues.length > existingMaxRefLength){
                newHeadCommit.ownerBranch.increasedHeightForDetached = newHeadCommit.refValues.length - existingMaxRefLength;
                newHeadCommit.ownerBranch.maxRefCount = newHeadCommit.refValues.length;
                CacheUtils.setRepoDetails(RepoUtils.repositoryDetails);
                GraphUtils.refreshBranchPanelUi();
            }
            else {
                CacheUtils.setRepoDetails(RepoUtils.repositoryDetails);
                this.updateUiForCheckout();
            }
        }
                
    }

    static refreshBranchPanelUi(){
        this.createBranchPanel();
    }

    static handleNewBranch(sourceCommit:ICommitInfo,branch:string,status:IStatus){
        RepoUtils.repositoryDetails.branchList.push(branch);
        const commitFrom = RepoUtils.repositoryDetails.allCommits.find(x=>x.hash === sourceCommit.hash);
        if(!commitFrom) return;        
        commitFrom.refValues.push(branch);                
        const refLimitExcited = commitFrom.refValues.length > commitFrom.ownerBranch.maxRefCount;
        if(refLimitExcited)  commitFrom.ownerBranch.maxRefCount++;
        RepoUtils.repositoryDetails.status = status;
        if(status.current === branch) {
            RepoUtils.repositoryDetails.headCommit = commitFrom;
        }
        this.focusedCommit = commitFrom;

        CacheUtils.setRepoDetails(RepoUtils.repositoryDetails);
        
        this.refreshBranchPanelUi();
    }

    static async isRequiredReload(){
        try{
            const newStatus = RepoUtils.repositoryDetails?.status;
            if(!newStatus?.headCommit) return false;
            
            if(!!GraphUtils.state.headCommit.value){
                if(newStatus.headCommit.hash !== GraphUtils.state.headCommit.value.hash) return true;
                const uiRefs = GraphUtils.state.headCommit.value.refValues;
                const newRefs = newStatus.headCommit.refValues;        
                if(newRefs.some(ref => !uiRefs.includes(ref)) || newRefs.length !== uiRefs.length) return true;
            }
            let filter = GraphUtils.state.filter.value;
            if(!filter.userModified){
                filter = {...filter,toDate:new Date().toISOString()};
            }
            let commits = await IpcUtils.getGraphCommitList(filter);
            for(let c of commits){
                const existingCm = RepoUtils.repositoryDetails.allCommits.find(_=> _.hash === c.hash);
                if(!existingCm)
                    return true;
                if(existingCm.refValues.some(_=> !c.refValues.includes(_)))
                    return true;
            }            
            return false;
        }catch(e){
            return false;
        }
             
    }

    static getVerticalLinePath(vLineHeight:number,archRadius:number){
        return `v${vLineHeight} a${archRadius},${archRadius} 0 0 0 ${archRadius},${archRadius}`;
    }

    static getBranchLinePath(startX:number,startY:number,vLinePath:string,hLineLength:number){
        return `M${startX},${startY} ${vLinePath} h${hLineLength}`;
    }

    static getBranchLinePathData(branchDetails:IBranchDetails){
        const parentCommit = branchDetails.parentCommit;
        const startX = parentCommit?.x || branchDetails.commits[0]?.x || 150;
        const startY = parentCommit?.ownerBranch.y || branchDetails.y;
        const endX = branchDetails.commits[branchDetails.commits.length - 1].x;
        const hLineLength = endX - startX;
        let vLineHeight =  0;
        let archRadius = RepoUtils.branchPanelFontSize;
        if(parentCommit?.ownerBranch.y) vLineHeight = branchDetails.y - parentCommit.ownerBranch.y - archRadius;
        let vLinePath = "";
        if(!!vLineHeight) vLinePath = `v${vLineHeight} a${archRadius},${archRadius} 0 0 0 ${archRadius},${archRadius}`
        return {startX,startY,endX,hLineLength,vLinePath}
    }

    static createMergeCommit(head: ICommitInfo, x:number,mergeCommit:ICommitInfo){
        // <circle id={`${EnumIdPrefix.COMMIT_CIRCLE}${c.hash}`} className="commit" cx={c.x} cy={props.branchDetails.y} r={BranchUtils.commitRadius} stroke="black" 
        //                 strokeWidth="3" fill={`${props.selectedCommit?.hash === c.hash?BranchGraphUtils.selectedCommitColor:BranchGraphUtils.commitColor}`}/>    
        const circleElem = document.createElementNS(this.svgLnk, "circle");
        circleElem.id = `${EnumIdPrefix.COMMIT_CIRCLE}merge` ;
        // circleElem.classList.add("commit");// = `${EnumIdPrefix.COMMIT_CIRCLE}merge` ;
        circleElem.setAttribute("cx",x+"")
        circleElem.setAttribute("cy",head.ownerBranch.y+"")
        circleElem.setAttribute("r",(RepoUtils.commitRadius+2)+"")
        circleElem.setAttribute("stroke","red")
        circleElem.setAttribute("stroke-width","3");
        circleElem.setAttribute("fill",GraphUtils.commitColor)
        circleElem.classList.add("mergingState");

        const circleElem2 = document.createElementNS(this.svgLnk, "circle");
        circleElem2.setAttribute("cx",x+"")
        circleElem2.setAttribute("cy",head.ownerBranch.y+"")
        circleElem2.setAttribute("r",(RepoUtils.commitRadius+15)+"")
        circleElem2.setAttribute("stroke","green");
        circleElem2.setAttribute("stroke-width","2");
        circleElem2.setAttribute("stroke-dasharray", "5");
        circleElem2.setAttribute("fill","none");
        circleElem2.classList.add("mergingState");


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
            if(GraphUtils.state.selectedCommit.value?.hash) {
                existingSelectedCommitElem = GraphUtils.svgContainer.querySelector(`#${EnumIdPrefix.COMMIT_CIRCLE}${GraphUtils.state.selectedCommit.value.hash}`);
                existingSelectedCommitElem?.setAttribute("fill",GraphUtils.commitColor);
            }

            circleElem.setAttribute("fill",GraphUtils.selectedCommitColor);

            GraphUtils.state.selectedCommit.publish(mergeCommit);
        }

        circleElem.addEventListener("click",clickListener);
        return [circleElem,circleElem2];
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
        const radius = RepoUtils.commitRadius;
        const m = radius;
        const n = distance - radius;
        const x = (m*x2 + n*x1)/distance;
        const y = (m*y2 + n*y1)/distance;
        return {x,y} as IPositition
    }    

    static updateUi(){
        GraphUtils.state.svgContainerWidth.update();
        GraphUtils.state.panelHeight.update();
        GraphUtils.state.horizontalScrollWidth.update();
        GraphUtils.state.verticalScrollHeight.update();
        //GraphUtils.state.selectedCommit.publish(RepoUtils.repositoryDetails.headCommit);        
        GraphUtils.state.headCommit.update();
    }     

    static refreshGraph(){
        const filter = {...GraphUtils.state.filter.value};
        if(!filter.userModified){
            filter.toDate = new Date().toISOString();
        }
        GraphUtils.state.filter.publishFilter(filter);
    }

    static checkForUiUpdate(newStatus:IStatus){
        const existingStatus = RepoUtils.repositoryDetails?.status;
        const head = RepoUtils.repositoryDetails.headCommit;
        if(!!head && newStatus.mergingCommitHash !== GraphUtils.state.mergingCommit.value?.parentHashes[1]){            
            existingStatus.mergingCommitHash = newStatus.mergingCommitHash;
            if(newStatus.mergingCommitHash){
                const dummyCommit = CreateCommitInfoObj();
                dummyCommit.hash = null!;                
                dummyCommit.date = new Date().toISOString();
                dummyCommit.ownerBranch = head.ownerBranch;
                dummyCommit.previousCommit = head;
                dummyCommit.message = 'Commit is in merging state.';
                const allCommits = RepoUtils.repositoryDetails.allCommits;
                const latestCommit = allCommits[allCommits.length-1];
                dummyCommit.x = latestCommit.x + RepoUtils.distanceBetweenCommits; 
                dummyCommit.inMergingState = true; 
                dummyCommit.parentHashes = [head.hash,newStatus.mergingCommitHash];
                GraphUtils.state.mergingCommit.publish(dummyCommit);
            }
            else{
                GraphUtils.state.mergingCommit.publish(null!);
            }
        }

        CacheUtils.setRepoDetails(RepoUtils.repositoryDetails);
    }
    
    static resetGraphStates=()=>{
        GraphUtils.state.panelHeight.publish(0);
        GraphUtils.state.svgContainerWidth.publish(0);
        GraphUtils.state.headCommit.publish(null!);
        GraphUtils.state.mergingCommit.publish(null!);
    }
}