import React, { Fragment } from "react"
import { FaAngleDown, FaAngleRight, FaPlus, FaUndo } from "react-icons/fa";
import { useMultiState } from "../../../../lib";


export interface IModifiedFile {
    fileName: string;
    path: string;
}

export interface IChanges {
    modifiedFiles: IModifiedFile[];
}

interface IModifiedChangesProps{
    modifiedChanges:IChanges;
}

interface IState{
    isChangesExpanded:boolean;
}

function ModifiedChangesComponent(props:IModifiedChangesProps){
    const [state,setState] = useMultiState<IState>({isChangesExpanded:true});

    const handleChangesCollapse = () => {
        setState({ isChangesExpanded: !state.isChangesExpanded });
    }
    
    return <Fragment>
    <div className="d-flex hover" onClick={handleChangesCollapse}>
        <span>{state.isChangesExpanded ? <FaAngleDown /> : <FaAngleRight />} </span>
        <span>Changes</span>
    </div>
    {state.isChangesExpanded && 
        <div className="d-flex flex-column ps-2">
            {props.modifiedChanges.modifiedFiles.map(f=>(
                <div className="d-flex align-items-center flex-nowrap position-relative">
                    <span className="pe-1 flex-shrink-0">{f.fileName}</span>
                    <span className="small text-secondary">{f.path}</span>
                    <div className="position-absolute d-flex bg-white ps-2" style={{ right: 0 }}>
                        <span className="hover" title="discard"><FaUndo /></span>
                        <span className="px-1" />
                        <span className="hover"><FaPlus /></span>
                    </div>
                </div>
            ))}                                                
        </div>
    }
</Fragment>
}

export const ModifiedChanges = React.memo(ModifiedChangesComponent);