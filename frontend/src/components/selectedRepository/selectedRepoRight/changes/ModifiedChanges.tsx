import { IFile, IStatus, RendererEvents, RepositoryInfo } from "common_library";
import React, { useEffect, useRef } from "react"
import { FaAngleDown, FaAngleRight, FaPlus, FaUndo } from "react-icons/fa";
import { EnumChangesType, UiUtils, useMultiState } from "../../../../lib";


interface IModifiedChangesProps{
    modifiedChanges?:IFile[];
    repoInfoInfo?:RepositoryInfo;
    onStatusChange:(status:IStatus)=>void;
    onFileSelect:(path:string)=>void;
    selectedFilePath?:string;
    selectedMode:EnumChangesType;
    handleExpand:(isExpanded:boolean)=>void;
    height:number;
    handleMinHeightChange:(height:number)=>void;
}

interface IState{
    isExpanded:boolean;
    hoveredFile?:IFile;
    isHeadHover:boolean;
}

function ModifiedChangesComponent(props:IModifiedChangesProps){
    const [state,setState] = useMultiState<IState>({
        isExpanded:true,
        isHeadHover:false});

    const ref = useRef<HTMLDivElement>();

    useEffect(()=>{
        if(ref.current?.clientHeight)
            props.handleMinHeightChange(ref.current.clientHeight);
    },[ref.current?.clientHeight])

    useEffect(()=>{
        props.handleExpand(state.isExpanded);
    },[state.isExpanded])    

    const handleChangesCollapse = () => {
        setState({ isExpanded: !state.isExpanded });
    }

    const handleStage=(file:IFile)=>{
        window.ipcRenderer.send(RendererEvents.stageItem().channel,[file.path],props.repoInfoInfo);
    }

    const stageAll=()=>{
        if(!props.modifiedChanges?.length) return;
        window.ipcRenderer.send(RendererEvents.stageItem().channel,props.modifiedChanges?.map(x=>x.path),props.repoInfoInfo);        
    }

    const discardUnstagedChangesOfItem=(item:IFile)=>{
        window.ipcRenderer.send(RendererEvents.discardItem().channel,[item.path],props.repoInfoInfo);
    }

    const discardAll=()=>{
        if(!props.modifiedChanges?.length) return;
        window.ipcRenderer.send(RendererEvents.discardItem().channel,props.modifiedChanges.map(x=>x.path),props.repoInfoInfo);
    }
    
    return <div ref={ref as any} className="overflow-auto" style={{maxHeight:props.height}}>
    <div className="d-flex" onMouseEnter={_=> setState({isHeadHover:true})} 
        onMouseLeave={_=> setState({isHeadHover:false})}>
        <div className="d-flex flex-grow-1 hover" onClick={handleChangesCollapse}
            >
            <span>{state.isExpanded ? <FaAngleDown /> : <FaAngleRight />} </span>
            <span>Changes</span>
            {!!props.modifiedChanges?.length && <span className="text-info">({props.modifiedChanges.length})</span>}
        </div>
        {state.isHeadHover && <div className="d-flex">
            <span className="hover" title="Discard all" onClick={_=>discardAll()}><FaUndo /></span>
            <span className="px-1" />
            <span className="hover" title="Stage all" onClick={_=> stageAll()}><FaPlus /></span>
        </div>}
    </div>
    
    {state.isExpanded && 
        <div className="container ps-2 border" onMouseLeave={_=> setState({hoveredFile:undefined})}>
            {props.modifiedChanges?.map(f=>(
                <div key={f.path} title={f.path} onMouseEnter= {_ => setState({hoveredFile:f})}
                    className={`row g-0 align-items-center flex-nowrap hover w-100 ${props.selectedFilePath === f.path && props.selectedMode === EnumChangesType.MODIFIED?"selected":""}`}
                    >
                    <div className="col-auto overflow-hidden align-items-center flex-shrink-1" onClick={(_)=> props.onFileSelect(f.path)}>
                        <span className="pe-1 flex-shrink-0">{f.fileName}</span>
                        <span className="small text-secondary">
                            <span>{f.path}</span>
                        </span>
                    </div>
                    
                    {state.hoveredFile?.path === f.path &&
                     <div className="col-auto align-items-center flex-nowrap overflow-hidden flex-grow-1 text-end">                        
                            <span className="hover" title="discard" onClick={_=> discardUnstagedChangesOfItem(f)}><FaUndo /></span>
                            <span className="px-1" />
                            <span className="hover" title="Stage" onClick={_=>handleStage(f)}><FaPlus /></span>                                                
                    </div>}
                </div>
            ))}                                                
        </div>
    }
    </div>
}

export const ModifiedChanges = React.memo(ModifiedChangesComponent);