import { ICommitInfo, IRepositoryDetails } from "common_library";
import React, { useMemo, useRef } from "react"
import { useEffect } from "react";
import { shallowEqual } from "react-redux";
import { useMultiState } from "../../../../lib";
import { useDrag } from "../../../../lib/hooks/useDrag";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { SingleBranch } from "./SingleBranch";

interface IBranchPanelProps{
    onCommitSelect:(commit:ICommitInfo)=>void;
    selectedCommit?:ICommitInfo;
    repoDetails:IRepositoryDetails;
}

interface IState{
    scrollTop:number;
    scrollLeft:number;
    horizontalScrollRatio:number;
    verticalScrollRatio:number;
    viewBox:{x:number;y:number;width:number;height:number};
    notScrolledHorizontallyYet:boolean;
    notScrolledVerticallyYet:boolean;
    verticalScrollTop:number;
    horizontalScrollLeft:number;
}

function BranchPanelComponent(props:IBranchPanelProps){
    const panelHeight = 400;
    const panelWidth = 865;
    const horizontalScrollContainerWidth = panelWidth+10;
    const store = useSelectorTyped(state=>({
        zoom:state.ui.versions.branchPanelZoom,
    }),shallowEqual);

    useEffect(()=>{
        //setState({scale:1+ (store.zoom/10)});        
    },[store.zoom])

    const [state,setState]=useMultiState<IState>({
        scrollLeft:props.repoDetails.branchPanelWidth,
        scrollTop:0,
        horizontalScrollRatio:0,
        verticalScrollRatio:0,
        viewBox:{x:props.repoDetails.branchPanelWidth - panelWidth,y:0,width:panelWidth,height:panelHeight},
        notScrolledHorizontallyYet:true,
        notScrolledVerticallyYet:true,
        verticalScrollTop:0,
        horizontalScrollLeft:0,
    });

    const dataRef = useRef({
        initialHorizontalScrollPercent:0,
        initialHorizontalScrollLeft:0,
        initialVerticalScrollTop:0,
    });

    const isMounted = useRef(false);
    useEffect(()=>{
        isMounted.current = true;
    },[])
    useEffect(()=>{
        if(props.repoDetails?.headCommit) {
            let elmnt = document.getElementById(props.repoDetails.headCommit.hash);
            if(elmnt) elmnt.scrollIntoView();            
        }
        else return;
        let totalWidth = props.repoDetails.branchPanelWidth;
        let totalHeight = props.repoDetails.branchPanelHeight;
        if(totalHeight < panelHeight) totalHeight = panelHeight;
        if(totalWidth < panelWidth) totalHeight = panelWidth;
        const horizontalRatio = props.repoDetails?.headCommit.x/totalWidth;
        const verticalRatio = props.repoDetails?.headCommit.ownerBranch.y/totalHeight;
        const verticalScrollTop = (panelHeight-verticalScrollHeight)*verticalRatio;
        const horizontalScrollLeft = (panelWidth-horizontalScrollWidth)*horizontalRatio;
        dataRef.current.initialHorizontalScrollPercent = horizontalRatio;
        dataRef.current.initialVerticalScrollTop = verticalScrollTop;
        dataRef.current.initialHorizontalScrollLeft = horizontalScrollLeft;

        const x = totalWidth *horizontalRatio;
        let viewBoxX = x - (panelWidth/2);


        const y = totalHeight *verticalRatio;
        let viewBoxY = y - (panelHeight/2);
        
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

    },[props.repoDetails?.headCommit])        
    
    const horizontalScrollWidth = useMemo(()=>{
        const width = state.viewBox.width / props.repoDetails.branchPanelWidth;
        return width*panelWidth;
    },[state.viewBox.width,props.repoDetails.branchPanelWidth]);

    const verticalScrollHeight = useMemo(()=>{        
        let totalHeight = props.repoDetails.branchPanelHeight;
        if(totalHeight < panelHeight) totalHeight = panelHeight;
        const height = state.viewBox.height / totalHeight;        
        return height*panelHeight;
    },[state.viewBox.height,props.repoDetails.branchPanelHeight]);

    const {currentMousePosition: horizontalScrollMousePosition,elementRef: horizontalScrollElementRef} = useDrag();
    const {currentMousePosition:verticalScrollMousePosition,elementRef:verticalScrollElementRef} = useDrag();
    useEffect(()=>{
        if(horizontalScrollMousePosition === undefined ) {
            if(!state.notScrolledHorizontallyYet){                
                dataRef.current.initialHorizontalScrollPercent = state.horizontalScrollRatio;
                dataRef.current.initialHorizontalScrollLeft = state.horizontalScrollLeft;
            }
        }
        else{
            //let initialX = (dataRef.current.initialHorizontalScrollPercent/100)*panelWidth;
            let newLeft = dataRef.current.initialHorizontalScrollLeft+ horizontalScrollMousePosition!.x;
            const maxLeft = panelWidth - horizontalScrollWidth;
            if(newLeft < 0) newLeft = 0;
            else if(newLeft > maxLeft) newLeft = maxLeft;
            let newRatio = newLeft/maxLeft;
            //const minPercent = (horizontalScrollWidth*100)/ horizontalScrollContainerWidth;
            // if(newRatio > 100) newRatio = 100;            
            // else if(newRatio < minPercent) newRatio = minPercent;

            let totalWidth = props.repoDetails.branchPanelWidth;
            if(totalWidth < panelWidth) totalWidth = panelWidth;

            const x = totalWidth *newRatio;
            let viewBoxX = x - (panelWidth/2);
            

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
    
    // useEffect(()=>{
    //     const x = props.repoDetails.branchPanelWidth *state.horizontalScrollRatio;
    //     let viewBoxX = x - panelWidth+horizontalScrollWidth;

    //     if(state.horizontalScrollRatio < .5){
    //         viewBoxX = x - panelWidth-horizontalScrollWidth;
    //     }
    //     if(viewBoxX < 0) viewBoxX = 0;
    //     setState(st=>({
    //         ...st,
    //         viewBox:{
    //             ...st.viewBox,
    //             x: viewBoxX
    //         }
    //     }))
    // },[state.horizontalScrollRatio]);

    // useEffect(()=>{
    //     let totalHeight = props.repoDetails.branchPanelHeight;
    //     if(totalHeight < panelHeight) totalHeight = panelHeight;

    //     const y = totalHeight *(state.verticalScrollPercent/100);
    //     let viewBoxY = y - (panelHeight/2);

    //     setState(st=>({
    //         ...st,
    //         viewBox:{
    //             ...st.viewBox,
    //             y: viewBoxY
    //         }
    //     }))
    // },[state.verticalScrollPercent]);

    // const adjustedHorizontalRight = useMemo(()=>{
    //     let x = horizontalScrollContainerWidth * (1-(state.horizontalScrollRatio/100));        
    //     if( x < 0) return 0;
    //     if(x > horizontalScrollContainerWidth - horizontalScrollWidth) 
    //         return horizontalScrollContainerWidth - horizontalScrollWidth;
    //     return x;        
    // },[state.horizontalScrollRatio]);        

    if(!props.repoDetails) return <span className="d-flex justify-content-center w-100">Loading...</span>;
    
    return <div id="branchPanel" className="w-100 overflow-x-hidden">
        <div className="d-flex align-items-stretch" style={{width:`${horizontalScrollContainerWidth}px`}}>
            <svg width={panelWidth} height={panelHeight} viewBox={`${state.viewBox.x} ${state.viewBox.y} ${state.viewBox.width} ${state.viewBox.height}` } style={{transform:`scale(1)`} }>
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
                                    panelWidth={panelWidth}
                                    
                                />
                            ))
                        }                                        
                    </g>
            </svg>
            <div className="d-flex bg-secondary position-relative" style={{width:`10px`}}>
                <div ref={verticalScrollElementRef as any} className="bg-danger position-absolute w-100" style={{height:`${verticalScrollHeight}px`,top:state.verticalScrollTop,left:0}}> </div>
            </div>
        </div>            
            <div className="d-flex w-100 bg-secondary py-2 position-relative" style={{width:`${horizontalScrollContainerWidth}px`}}>
                <div ref={horizontalScrollElementRef as any} className="position-absolute bg-danger h-100" style={{width:`${horizontalScrollWidth}px`, left:state.horizontalScrollLeft,top:0}}></div>
            </div>
    </div>
}

export const BranchPanel = React.memo(BranchPanelComponent);