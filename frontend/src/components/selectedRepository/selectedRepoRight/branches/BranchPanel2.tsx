import { ICommitInfo, IRepositoryDetails } from "common_library";
import React, { Fragment, useCallback, useMemo, useRef } from "react"
import { useEffect } from "react";
import { shallowEqual, useDispatch } from "react-redux";
import { BranchUtils, IViewBox, useMultiState } from "../../../../lib";
import { useDrag } from "../../../../lib/hooks/useDrag";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { ActionUI } from "../../../../store/slices/UiSlice";
import { SingleBranch } from "./SingleBranch";

interface IBranchPanelProps{
    onCommitSelect:(commit:ICommitInfo)=>void;
    selectedCommit?:ICommitInfo;
    repoDetails:IRepositoryDetails;
    containerWidth:number;
}

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
    panelWidth:number;    
}

function BranchPanelComponent(props:IBranchPanelProps){
    const panelHeight = 400;
    const dispatch = useDispatch();    
    const store = useSelectorTyped(state=>({
        zoom:state.ui.versions.branchPanelZoom,
        homeIconClickVersion:state.ui.versions.branchPanelHome,
    }),shallowEqual); 

    console.log("props.repoDetails",props.repoDetails);

    const [state,setState]=useMultiState<IState>({
        scrollLeft:props.repoDetails.branchPanelWidth,
        scrollTop:0,
        horizontalScrollRatio:0,
        verticalScrollRatio:0,
        viewBox: {x:0,y:0,width:props.containerWidth,height:panelHeight},
        notScrolledHorizontallyYet:true,
        notScrolledVerticallyYet:true,
        verticalScrollTop:0,
        horizontalScrollLeft:0,
        panelWidth:props.containerWidth,        
    });

    const horizontalScrollContainerWidth = state.panelWidth+10;

    const horizontalScrollWidth = useMemo(()=>{
        let totalWidth = props.repoDetails.branchPanelWidth;
        if(totalWidth < props.containerWidth) totalWidth = props.containerWidth;
        const widthRatio = state.viewBox.width / totalWidth;
        const horizontalScrollWidth = widthRatio*props.containerWidth;
        return horizontalScrollWidth;
    },[state.viewBox.width]);

    const dataRef = useRef({
        initialHorizontalScrollLeft:0,
        initialVerticalScrollTop:0,
        isMounted:false,
        zoom:store.zoom,
        initialViewbox:state.viewBox,
    });

    useEffect(()=>{
        const viewBox = BranchUtils.getViewBoxValue(dataRef.current.initialViewbox,store.zoom);        
        setState({
            ...state,
            viewBox:viewBox,
        });
        dataRef.current.zoom = store.zoom;

    },[store.zoom])
    
    useEffect(()=>{
        dataRef.current.isMounted = true;
        return ()=>{
            dispatch(ActionUI.resetBranchPanelZoom());
        }
    },[])    

    const verticalScrollHeight = useMemo(()=>{        
        let totalHeight = props.repoDetails.branchPanelHeight;
        if(totalHeight < panelHeight) totalHeight = panelHeight;
        const height = state.viewBox.height / totalHeight;        
        return height*panelHeight;
    },[state.viewBox.height,props.repoDetails.branchPanelHeight]);    

    useEffect(()=>{
        if(props.repoDetails?.headCommit) {
            let elmnt = document.getElementById(props.repoDetails.headCommit.hash);
            if(elmnt) elmnt.scrollIntoView();            
        }
        else return;
        let totalWidth = props.repoDetails.branchPanelWidth;
        let totalHeight = props.repoDetails.branchPanelHeight;
        if(totalHeight < panelHeight) totalHeight = panelHeight;        
        if(totalWidth < state.panelWidth) totalHeight = state.panelWidth;
        const horizontalRatio = props.repoDetails?.headCommit.x/totalWidth;
        const verticalRatio = props.repoDetails?.headCommit.ownerBranch.y/totalHeight;
        let verticalScrollTop = (panelHeight-verticalScrollHeight)*verticalRatio;        
        let horizontalScrollLeft = (horizontalScrollContainerWidth-horizontalScrollWidth)*horizontalRatio;        
        dataRef.current.initialVerticalScrollTop = verticalScrollTop;
        dataRef.current.initialHorizontalScrollLeft = horizontalScrollLeft;

        const x = totalWidth *horizontalRatio;
        let viewBoxX = 0;
        if(totalWidth > state.panelWidth) viewBoxX = x- (state.panelWidth/2);

        const y = totalHeight *verticalRatio;
        let viewBoxY = 0;
        if(totalHeight > panelHeight) viewBoxY = y - (panelHeight/2);        

        setState({
            horizontalScrollRatio:horizontalRatio,
            verticalScrollRatio:verticalRatio,
            verticalScrollTop:verticalScrollTop,
            horizontalScrollLeft:horizontalScrollLeft,
            viewBox:{
                ...state.viewBox,
                x:viewBoxX,
                y:viewBoxY,                
            }
        });

    },[props.repoDetails?.headCommit,state.panelWidth,store.homeIconClickVersion])                

    const {currentMousePosition: horizontalScrollMousePosition,elementRef: horizontalScrollElementRef} = useDrag();
    const {currentMousePosition:verticalScrollMousePosition,elementRef:verticalScrollElementRef} = useDrag();
    const {currentMousePosition:svgScrollMousePosition,elementRef:svGRef} = useDrag();
    useEffect(()=>{
        if(horizontalScrollMousePosition === undefined ) {
            if(!state.notScrolledHorizontallyYet){                
                dataRef.current.initialHorizontalScrollLeft = state.horizontalScrollLeft;
            }
        }
        else{
            if(state.panelWidth <= horizontalScrollWidth) return;
            let newLeft = dataRef.current.initialHorizontalScrollLeft+ horizontalScrollMousePosition!.x;
            const maxLeft = state.panelWidth - horizontalScrollWidth;
            if(newLeft < 0) newLeft = 0;
            else if(newLeft > maxLeft) newLeft = maxLeft;
            let newRatio = newLeft/maxLeft;            

            let totalWidth = props.repoDetails.branchPanelWidth;
            if(totalWidth <state.panelWidth) totalWidth = state.panelWidth;

            const x = totalWidth *newRatio;
            let viewBoxX = x - (state.panelWidth/2);            

            setState({
                horizontalScrollRatio: newRatio,
                horizontalScrollLeft:newLeft,
                notScrolledHorizontallyYet:false,       
                viewBox:{
                    ...state.viewBox,
                    x: viewBoxX
                }
            })
        }        
    },[horizontalScrollMousePosition])        

    useEffect(()=>{
        if(verticalScrollMousePosition === undefined ) {
            if(!state.notScrolledVerticallyYet){                
                dataRef.current.initialVerticalScrollTop = state.verticalScrollTop;
            }
        }
        else{
            if(panelHeight <= verticalScrollHeight) return;
            let newY = dataRef.current.initialVerticalScrollTop + verticalScrollMousePosition!.y;
            const maxY = panelHeight - verticalScrollHeight;
            if(newY > maxY) newY = maxY;
            else if(newY < 0) newY = 0;
            const newRatio = newY/maxY;
            let totalHeight = props.repoDetails.branchPanelHeight;
            if(totalHeight < panelHeight) totalHeight = panelHeight;

            const y = totalHeight *newRatio;
            let viewBoxY = y - (panelHeight/2);

            setState({
                verticalScrollRatio: newRatio,
                notScrolledVerticallyYet:false,
                verticalScrollTop:newY,
                viewBox:{
                    ...state.viewBox,
                    y:viewBoxY
                }
            })
        }        
    },[verticalScrollMousePosition])

    useEffect(()=>{
        if(svgScrollMousePosition === undefined ) {
            if(!state.notScrolledVerticallyYet){                
                dataRef.current.initialVerticalScrollTop = state.verticalScrollTop;
            }
            if(!state.notScrolledHorizontallyYet){
                dataRef.current.initialHorizontalScrollLeft = state.horizontalScrollLeft;
            }
        }

        else{
            // if(panelHeight <= verticalScrollHeight) return;
            // if(state.panelWidth <= horizontalScrollWidth) return;
    
            let newViewBox = {...state.viewBox};
            let newHorizontalRatio = state.horizontalScrollRatio;
            let newVerticalRatio = state.verticalScrollRatio;
            let newHorizontalScrollLeft = state.horizontalScrollLeft;
            let newVerticalScrollTop = state.verticalScrollTop;
            
    
            if(!!svgScrollMousePosition?.y && panelHeight > verticalScrollHeight){
                let totalHeight = props.repoDetails.branchPanelHeight;
                if(totalHeight < panelHeight) totalHeight = panelHeight;
                let maxY = panelHeight - verticalScrollHeight;
                const movedScrollBar = (svgScrollMousePosition.y*(maxY/totalHeight)*(state.viewBox.height/panelHeight));                        
                newVerticalScrollTop = dataRef.current.initialVerticalScrollTop - movedScrollBar;
                
                if(newVerticalScrollTop > maxY) newVerticalScrollTop = maxY;
                else if(newVerticalScrollTop < 0) newVerticalScrollTop = 0;
                newVerticalRatio = newVerticalScrollTop/(panelHeight-verticalScrollHeight);
                
    
                const y = totalHeight *newVerticalRatio;
                let viewBoxY = y - (panelHeight/2);
                newViewBox.y = viewBoxY;
    
            }
            
            if(!!svgScrollMousePosition?.x && state.panelWidth > horizontalScrollWidth){
                let totalWidth = props.repoDetails.branchPanelWidth;
                if(totalWidth <state.panelWidth) totalWidth = state.panelWidth;
    
                const maxLeft = state.panelWidth - horizontalScrollWidth;
                const movedScrollBar = (svgScrollMousePosition.x * (maxLeft / totalWidth) *(state.viewBox.width/state.panelWidth));            
                newHorizontalScrollLeft = dataRef.current.initialHorizontalScrollLeft- movedScrollBar;
                if(newHorizontalScrollLeft < 0) newHorizontalScrollLeft = 0;
                else if(newHorizontalScrollLeft > maxLeft) newHorizontalScrollLeft = maxLeft;
                newHorizontalRatio = newHorizontalScrollLeft/maxLeft;                        
    
                const x = totalWidth *newHorizontalRatio;
                let viewBoxX = x - (state.panelWidth/2);   
                newViewBox.x = viewBoxX;                         
            }
    
            setState({
                horizontalScrollRatio: newHorizontalRatio,
                verticalScrollRatio:newVerticalRatio,
                horizontalScrollLeft:newHorizontalScrollLeft,
                verticalScrollTop:newVerticalScrollTop,
                notScrolledHorizontallyYet:false,
                notScrolledVerticallyYet:false,
                viewBox:{
                    ...state.viewBox,
                    ...newViewBox,
                }
            })
        }

    },[svgScrollMousePosition])


    useEffect(()=>{
        if(store.zoom === 0){
            dataRef.current.initialViewbox = state.viewBox;
        }
    },[state.viewBox])   
    
    const handleWheel = useCallback((e:React.WheelEvent<SVGSVGElement>)=>{
        var delta = Math.max(Math.abs(e.deltaX),Math.abs(e.deltaY));
        if(e.deltaX > 0 || e.deltaY > 0) {
            dispatch(ActionUI.decreamentBranchPanelZoom(delta));

        }
        else{
            dispatch(ActionUI.increamentBranchPanelZoom(delta));
        }
    },[]);    

    if(!props.repoDetails) return <span className="d-flex justify-content-center w-100">Loading...</span>;
    
    return <div id="branchPanel" className="w-100" style={{overflow:'hidden'}}>
        <Fragment>
            <div className="d-flex align-items-stretch" style={{width:`${horizontalScrollContainerWidth}px`}}>
                <svg onWheel={handleWheel} ref={svGRef as any}
                width={state.panelWidth} height={panelHeight} viewBox={`${state.viewBox.x} ${state.viewBox.y} ${state.viewBox.width} ${state.viewBox.height}` } style={{transform:`scale(1)`} }>
                        <g>
                            {
                                props.repoDetails.mergedLines.map(line=>(
                                    <line key={`${line.srcX}-${line.srcY}-${line.endX}-${line.endY}`} x1={line.srcX} y1={line.srcY} x2={line.endX} y2={line.endY} stroke="green" strokeWidth={1} />
                                ))
                            }
                            {
                                props.repoDetails.resolvedBranches.map(branch=>(
                                    <SingleBranch key={branch._id} 
                                        branchDetails ={branch} 
                                        onCommitSelect={props.onCommitSelect} 
                                        selectedCommit={props.selectedCommit} 
                                        scrollLeft={(state.scrollLeft)}
                                        scrollTop={state.scrollTop} 
                                        panelWidth={state.panelWidth}
                                        
                                    />
                                ))
                            }                                        
                        </g>
                </svg>
                <div className="d-flex bg-secondary position-relative" style={{width:`10px`}}>
                    <div ref={verticalScrollElementRef as any} className="bg-danger position-absolute w-100" style={{height:`${verticalScrollHeight}px`,top:state.verticalScrollTop,left:0}}> </div>
                </div>
            </div>            
            <div className="d-flex bg-secondary py-2 position-relative" style={{width:`${horizontalScrollContainerWidth}px`}}>
                <div ref={horizontalScrollElementRef as any} className="position-absolute bg-danger h-100" style={{width:`${horizontalScrollWidth}px`, left:state.horizontalScrollLeft,top:0}}></div>
            </div>           
        </Fragment>
    </div>
}

export const BranchPanel2 = React.memo(BranchPanelComponent);