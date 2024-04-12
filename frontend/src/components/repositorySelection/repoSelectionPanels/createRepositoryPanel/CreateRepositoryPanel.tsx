import React from "react"
import { Form } from "react-bootstrap";
import { EnumModals, useMultiState } from "../../../../lib";
import { AppButton } from "../../../common";
import { RendererEvents } from "common_library";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { ModalData } from "../../../modals/ModalData";
import { useDispatch } from "react-redux";
import { ActionModals } from "../../../../store";
import { GitUtils } from "../../../../lib/utils/GitUtils";

enum Stage{
    NotStarted,
    Complete,
}

interface IState{
    directory:string;
    stage:Stage;
}

function CreateRepositoryPanelComponent(){
    const dispatch = useDispatch();
    const [state,setState] = useMultiState<IState>({
        directory:"",
        stage:Stage.NotStarted,
    });

    const handleBrowse=()=>{
        IpcUtils.browseFolderPath().then((r)=>{
            console.log("r",r);
            if(r.result){
                setState({directory:r.result});
            }
        });        
    }

    const showInFolder=()=>{
        IpcUtils.showInFileExplorer(state.directory);
    }

    const createRepo = ()=>{
        const r = IpcUtils.isValidPath(state.directory);
        if(!r.result){
            ModalData.errorModal.message = "Invalid folder path";
            dispatch(ActionModals.showModal(EnumModals.ERROR));
            return;
        }
        IpcUtils.initNewRepo(state.directory).then(()=>{
            setState({stage:Stage.Complete});
        });
    }

    const handleOpen=()=>{
        GitUtils.OpenRepository(state.directory);
    }

    return <div>
        <div className="text-center">
            <h2>Create Repository</h2>
        </div>
        <div className="row g-0 pt-2">
            <div className="col-2 d-flex align-items-center justify-content-end">                
                <span>Directory Path: </span>
            </div>
            <div className="col-8">
                <Form.Control type="text" value={state.directory} readOnly={state.stage === Stage.Complete}
                    onChange={_=> setState({directory:_.target.value})} />
            </div>
            <div className="col-2">
                <div className="ps-1 h-100 d-flex">
                    {state.stage === Stage.NotStarted && <div className="h-100" style={{maxWidth:120}}>
                        <AppButton className="w-100" text="Browse" type="success" style={{height:'100%',color:'white'}}
                        onClick={handleBrowse}  />
                    </div>}
                    {state.stage === Stage.Complete && <div className="ps-2 h-100" style={{maxWidth:150}}>
                        <AppButton className="w-100" text="Show in Folder" type="success" style={{height:'100%',color:'white'}}
                        onClick={showInFolder}  />
                    </div>}
                </div>
            </div>
        </div>
        {state.stage === Stage.NotStarted && <div className="d-flex justify-content-center pt-3">
              <AppButton text="Create Repository" type="default" onClick={() => createRepo()}/>
        </div>}
        {state.stage === Stage.Complete && <div className="pt-3">
            <div className="pe-2 text-center">Complete</div>
            <div className="d-flex justify-content-center pt-3">
                <AppButton text="Open" type="success" className="text-white" onClick={handleOpen}/>
            </div>
            <div className="d-flex justify-content-center pt-5">
                <AppButton text="Create More Repository" type="default"
                 onClick={()=>setState({stage:Stage.NotStarted,directory:""})}/>
            </div>
        </div>}
    </div>
}

export const CreateRepositoryPanel = React.memo(CreateRepositoryPanelComponent);