import React from "react";
import { Fragment } from "react";
import { FaAngleDown, FaAngleRight, FaMinus } from "react-icons/fa";
import { useMultiState } from "../../../../lib";

export interface IStagedFile {
    fileName: string;
    path: string;
}

export interface IStagedChanges {
    stagedFiles: IStagedFile[];
}


interface IStagedChangesProps{
    stagedChanges:IStagedChanges;
}

interface IState{
    isStagedChangesExpanded:boolean;
    hoveredFile?:IStagedFile;
}

function StagedChangesComponent(props:IStagedChangesProps){
    const [state,setState] = useMultiState<IState>({isStagedChangesExpanded:true});
    const handleStageCollapse = () => {
        setState({ isStagedChangesExpanded: !state.isStagedChangesExpanded });
    }

    return <Fragment>
    <div className="d-flex hover" onClick={handleStageCollapse}>
        <span>{state.isStagedChangesExpanded ? <FaAngleDown /> : <FaAngleRight />} </span>
        <span>Staged Changes</span>
    </div>
    {state.isStagedChangesExpanded && 
    <div className="d-flex flex-column ps-2" onMouseLeave={_=> setState({hoveredFile:undefined})}>
        {props.stagedChanges.stagedFiles.map(f=>(
            <div key={f.path} className="d-flex align-items-center flex-nowrap position-relative hover" 
                title={f.path} onMouseEnter={()=> setState({hoveredFile:f})}>
                <span className="pe-1 flex-shrink-0">{f.fileName}</span>
                <span className="small text-secondary">{f.path}</span>
                {state.hoveredFile?.path === f.path && <div className="position-absolute d-flex bg-white ps-3" style={{ right: 0 }}>
                    <span className="hover" title="Unstage"><FaMinus /></span>                                    
                </div>}
            </div>
        ))}                        
    </div>
    }
</Fragment>
}

export const StagedChanges = React.memo(StagedChangesComponent);