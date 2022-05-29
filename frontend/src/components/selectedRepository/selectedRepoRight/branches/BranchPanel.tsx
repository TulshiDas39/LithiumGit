import { ICommitInfo, IRepositoryDetails } from "common_library";
import React, { Fragment, useMemo, useRef, useState } from "react"
import { useEffect } from "react";
import { shallowEqual } from "react-redux";
import { BranchUtils, IViewBox, useMultiState } from "../../../../lib";
import { useDrag } from "../../../../lib/hooks/useDrag";
import { useSelectorTyped } from "../../../../store/rootReducer";
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
    // horizontalScrollWidth:number;
}

function BranchPanelComponent(props:IBranchPanelProps){
    const panelHeight = 400;
    const widthDiffWithContainer = 10;
    //const panelWidth = 865;
    const store = useSelectorTyped(state=>({
        zoom:state.ui.versions.branchPanelZoom,
    }),shallowEqual); 

    

    const [state,setState]=useMultiState<IState>({
        scrollLeft:props.repoDetails.branchPanelWidth,
        scrollTop:0,
        horizontalScrollRatio:0,
        verticalScrollRatio:0,
        viewBox:{x:0,y:0,width:props.containerWidth,height:panelHeight},
        notScrolledHorizontallyYet:true,
        notScrolledVerticallyYet:true,
        verticalScrollTop:0,
        horizontalScrollLeft:0,
        panelWidth:props.containerWidth,
        // horizontalScrollWidth:0,
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

    // const horizontalScrollContainerRef = useRef<HTMLDivElement>();
    useEffect(()=>{
        dataRef.current.isMounted = true;
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
                width:state.panelWidth,
                height:panelHeight,
            }
        });

    },[props.repoDetails?.headCommit,state.panelWidth])                

    const {currentMousePosition: horizontalScrollMousePosition,elementRef: horizontalScrollElementRef} = useDrag();
    const {currentMousePosition:verticalScrollMousePosition,elementRef:verticalScrollElementRef} = useDrag();
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
            const newRatio = newY/(panelHeight-verticalScrollHeight);
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
        if(store.zoom === 0){
            dataRef.current.initialViewbox = state.viewBox;
        }
    },[state.viewBox])
    // useEffect(()=>{
    //     if(horizontalScrollContainerRef.current){
    //         const width = Math.floor(horizontalScrollContainerRef.current.getBoundingClientRect().width);
    //         const newPanelWidth = width-10;
    //         if(state.panelWidth != newPanelWidth){
    //             let viewBox = {x:state.viewBox.x,y:state.viewBox.y} as IViewBox;
    //             viewBox.width = newPanelWidth;
    //             viewBox.height = panelHeight;
    //             viewBox = BranchUtils.getViewBoxValue(viewBox,store.zoom);
    //             let totalWidth = props.repoDetails.branchPanelWidth;
    //             if(totalWidth < newPanelWidth) totalWidth = newPanelWidth;
    //             const widthRatio = viewBox.width / totalWidth;
    //             const horizontalScrollWidth = widthRatio*width;
    //             setState({
    //                 panelWidth:newPanelWidth,
    //                 viewBox:viewBox,
    //                 // horizontalScrollWidth:horizontalScrollWidth,
    //             });
    //         }
    //     }
    // },[horizontalScrollContainerRef.current])    
    // console.log("horizontalScrollWidth",horizontalScrollWidth)    

    if(!props.repoDetails) return <span className="d-flex justify-content-center w-100">Loading...</span>;
    
    return <div id="branchPanel" className="w-100" style={{overflow:'hidden'}}>
        {state.panelWidth !== -1 && <Fragment>
            <div className="d-flex align-items-stretch" style={{width:`${horizontalScrollContainerWidth}px`}}>
                <svg width={state.panelWidth} height={panelHeight} viewBox={`${state.viewBox.x} ${state.viewBox.y} ${state.viewBox.width} ${state.viewBox.height}` } style={{transform:`scale(1)`} }>
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
        </Fragment>}
    </div>
}

export const BranchPanel = React.memo(BranchPanelComponent);