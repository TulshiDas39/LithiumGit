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
    scale:number;
    paddingTop:number;
    paddingLeft:number;
    scrollTop:number;
    scrollLeft:number;
    panelWidth:number;
    horizontalScrollPercent:number;
    verticalScrollPercent:number;
}

function BranchPanelComponent(props:IBranchPanelProps){
    const panelHeight = 400;
    const panelWidth = 900;
    const store = useSelectorTyped(state=>({
        zoom:state.ui.versions.branchPanelZoom,
    }),shallowEqual);

    useEffect(()=>{
        setState({scale:1+ (store.zoom/10)});        
    },[store.zoom])

    const [state,setState]=useMultiState<IState>({
        scale:1,
        paddingLeft:0,
        paddingTop:0,
        scrollLeft:props.repoDetails.branchPanelWidth,
        scrollTop:0,
        panelWidth:0,
        horizontalScrollPercent:0,
        verticalScrollPercent:0,
    });
    
    useEffect(()=>{
        if(props.repoDetails?.headCommit) {
            let elmnt = document.getElementById(props.repoDetails.headCommit.hash);
            if(elmnt) elmnt.scrollIntoView();            
        }
        const horizontalPercent = (props.repoDetails?.headCommit.x*100)/props.repoDetails.branchPanelWidth;
        setState({horizontalScrollPercent:horizontalPercent});
    },[props.repoDetails?.headCommit])

    const svgHeight = useMemo(()=>{
        if(props.repoDetails.branchPanelHeight < panelHeight) return panelHeight;
        return props.repoDetails.branchPanelHeight;
    },[props.repoDetails.branchPanelHeight])
        

    const scrollPosition = useRef({scrollTop:0,scrollLeft:Number.MAX_SAFE_INTEGER,width:0,});
    const adjustPadding = ()=>{
        if( state.scale < 1) return;
        //const svgHeight = getSVGHeight();
        const hiddenHeightSpace = svgHeight * state.scale - panelHeight;
        let paddingTop = 0;
        let paddingLeft = 0;
        if(scrollPosition.current.scrollTop < hiddenHeightSpace / 2){
            paddingTop = Math.ceil(hiddenHeightSpace/2);
        }

        const svgWidth = props.repoDetails.branchPanelWidth;
        const hiddenWidthSpace = svgWidth * state.scale - svgWidth;        
        if(scrollPosition.current.scrollLeft < hiddenWidthSpace / 2){
            paddingLeft = Math.ceil(hiddenWidthSpace/2);            
        }

        setState({paddingLeft,paddingTop});
    }
    const paddingTimer = useRef<NodeJS.Timeout>();

    const scrollStateTimer = useRef<NodeJS.Timeout>();

    const setPaddingAdjustTimeout = ()=>{
        paddingTimer.current = setTimeout(()=>{
            adjustPadding();
            paddingTimer.current = null!;
        },100);
    }

    const setScrollPositionSetterTimeout = ()=>{
        scrollStateTimer.current = setTimeout(()=>{            
            setState({
                scrollLeft:scrollPosition.current.scrollLeft,
                scrollTop:scrollPosition.current.scrollTop,
                panelWidth:scrollPosition.current.width,
            });
            scrollStateTimer.current = null!;
        },100);
    }

    // useEffect(()=>{
    //     if(!paddingTimer.current) setPaddingAdjustTimeout();        
    // },[state.scale])

    const handleScroll =  (e: React.UIEvent<HTMLDivElement, UIEvent>)=>{
        const { scrollTop,scrollLeft,clientWidth } =  e.target as HTMLDivElement;
        scrollPosition.current.scrollLeft = scrollLeft;
        scrollPosition.current.scrollTop = scrollTop;   
        scrollPosition.current.width = clientWidth;
        console.log(scrollPosition.current);
        if(!paddingTimer.current && state.scale > 1) setPaddingAdjustTimeout();
        if(scrollStateTimer.current) {
           clearTimeout(scrollStateTimer.current);
        }
        setScrollPositionSetterTimeout();
    }

    const viewBoxValue = useMemo(()=>{
        const x = props.repoDetails.branchPanelWidth - panelWidth;
        const y = -10;
        return {x,y,width:panelWidth,height:panelHeight};
    },[props.repoDetails.branchPanelWidth]);
    
    const horizontalScrollWidth = useMemo(()=>{
        const width = viewBoxValue.width / props.repoDetails.branchPanelWidth;
        return width*panelWidth;
    },[viewBoxValue.width,props.repoDetails.branchPanelWidth]);

    const currentMousePositionXRef = useRef<number>();

    const {currentMousePosition,elementRef} = useDrag();
    console.log("currentMousePosition",currentMousePosition);
    useEffect(()=>{
        if(currentMousePosition)
            currentMousePositionXRef.current = currentMousePosition.x;
        else{
            if(currentMousePositionXRef.current === undefined) return;
            let currentX = (state.horizontalScrollPercent/100)*panelWidth;
            console.log("currentPercent",state.horizontalScrollPercent);
            currentX += currentMousePositionXRef.current;
            const newPercent = (currentX *100)/panelWidth;
            console.log("newPercent",newPercent);
            setState({
                horizontalScrollPercent: newPercent,
            })
        }    
    },[currentMousePosition])
    
    let adjustedHorizontalRight = useMemo(()=>{
        let x = panelWidth * (1-(state.horizontalScrollPercent/100));
        x -= horizontalScrollWidth / 2;
        if( x < 0) return 0;
        return x;        
    },[state.horizontalScrollPercent])
    console.log("state.horizontalScrollPercent",state.horizontalScrollPercent);
    adjustedHorizontalRight = useMemo(()=>{
        if(!currentMousePosition) return adjustedHorizontalRight;
        return adjustedHorizontalRight-currentMousePosition.x;
    },[currentMousePosition,adjustedHorizontalRight])
    console.log("adjustedHorizontalRight",adjustedHorizontalRight)

    if(!props.repoDetails) return <span className="d-flex justify-content-center w-100">Loading...</span>;
    
    return <div id="branchPanel" className="w-100 overflow-x-hidden">
        <div className="d-flex w-100 align-items-stretch">
            <svg width={panelWidth} height={panelHeight} viewBox={`${viewBoxValue.x} ${viewBoxValue.y} ${viewBoxValue.width} ${viewBoxValue.height}` } style={{transform:`scale(1)`} }>
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
                                    scrollLeft={(state.scrollLeft - state.paddingLeft)/state.scale}
                                    scrollTop={state.scrollTop} 
                                    panelWidth={state.panelWidth}
                                    
                                />
                            ))
                        }                                        
                    </g>
            </svg>
            <div className="bg-secondary" style={{width:`10px`}}>
            </div>
        </div>            
            <div className="d-flex w-100 bg-secondary py-2 position-relative">
                <div ref={elementRef as any} className="position-absolute bg-danger h-100" style={{width:`${horizontalScrollWidth}px`, right:adjustedHorizontalRight,top:0}}></div>
            </div>
    </div>
}

export const BranchPanel = React.memo(BranchPanelComponent);