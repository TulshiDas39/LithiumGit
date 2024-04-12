import React, { Fragment, useEffect } from "react"
import { Form, ProgressBar } from "react-bootstrap";
import { AppButton } from "../../../common";
import { CloneState, DataUtils, EnumModals, FetchState } from "../../../../lib";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { GitUtils } from "../../../../lib/utils/GitUtils";
import { shallowEqual, useDispatch } from "react-redux";
import { ActionClone, ActionModals } from "../../../../store";
import { ModalData } from "../../../modals/ModalData";
import { useSelectorTyped } from "../../../../store/rootReducer";

function CloneRepoPanelRepository(){
    const store = useSelectorTyped(state => state.clone,shallowEqual);
    const dispatch = useDispatch();    
    // const refData = useRef({progress:0,stage: FetchState.Remote,timer: undefined! as NodeJS.Timeout});
    const cloneRepo = ()=>{        
        if(!store.url){
            ModalData.errorModal.message = "URL required.";
            dispatch(ActionModals.showModal(EnumModals.ERROR));
            return;
        }
        const isValidPath = IpcUtils.isValidPath(store.directory);
        if(!isValidPath.result){
            ModalData.errorModal.message = "Invalid directory path";
            dispatch(ActionModals.showModal(EnumModals.ERROR));
            return;
        }        
        IpcUtils.cloneRepository(store.url,store.directory);
        dispatch(ActionClone.updateData({cloningState:CloneState.InProgress}));
    }

    useEffect(()=>{
        if(store.cloningState === CloneState.InProgress && !DataUtils.clone.timer){
            DataUtils.clone.timer = setInterval(()=>{
                let progress = 0;                
                if(DataUtils.clone.stage === FetchState.Resolving){
                    progress = 100;
                }
                else if(DataUtils.clone.stage === FetchState.Receiving){
                    progress = DataUtils.clone.progress;
                }
                let cloningState = store.cloningState;
                if(DataUtils.clone.stage === FetchState.Resolving && DataUtils.clone.progress === 100){            
                    cloningState = CloneState.Finished;
                }
                dispatch(ActionClone.updateData({progress,progressLabel:DataUtils.clone.stage,cloningState}));                
                
            },500);
        }
        else if(store.cloningState === CloneState.Finished){
            clearInterval(DataUtils.clone.timer);
            DataUtils.clone.timer = null!;            
        }        
    },[store.cloningState])

    const handleBrowse=()=>{
        IpcUtils.browseFolderPath().then(r=>{
            if(r.result) dispatch(ActionClone.updateData({directory:r.result}));
        })
    }
    const showInFolder=()=>{
        IpcUtils.showInFileExplorer(store.directory);
    }

    const open=()=>{
        GitUtils.OpenRepository(store.directory);
    }

    return <div>
        <div className="text-center">
            <h2>Clone Repository</h2>
        </div>
        <div className="row g-0">
            <div className="col-2 d-flex align-items-center justify-content-end">                
                <span>URL: </span>
            </div>
            <div className="col-8">
                <Form.Control type="text" value={store.url} readOnly={store.cloningState !== CloneState.NotStarted} onChange={_=>dispatch(ActionClone.updateData({url:_.target.value})) } />
            </div>                        
        </div>

        <div className="row g-0 pt-2">
            <div className="col-2 d-flex align-items-center justify-content-end">                
                <span>Directory Path: </span>
            </div>
            <div className="col-8">
                <Form.Control type="text" value={store.directory} readOnly={store.cloningState !== CloneState.NotStarted}
                    onChange={_=> dispatch(ActionClone.updateData({directory:_.target.value}))} />
            </div>
            <div className="col-2">
                <div className="ps-1 h-100 d-flex">
                    {store.cloningState !== CloneState.Finished && <div className="h-100" style={{maxWidth:120}}>
                        <AppButton disabled={store.cloningState === CloneState.InProgress} className="w-100" text="Browse" type="success" style={{height:'100%',color:'white'}}
                        onClick={handleBrowse}  />
                    </div>}
                    {store.cloningState === CloneState.Finished && <div className="ps-2 h-100" style={{maxWidth:150}}>
                        <AppButton className="w-100" text="Show in Folder" type="success" style={{height:'100%',color:'white'}}
                        onClick={showInFolder}  />
                    </div>}
                </div>
            </div>
        </div>

        {store.cloningState === CloneState.NotStarted && <div className="d-flex justify-content-center pt-3">
              <AppButton text="Clone Repository" type="default" onClick={() => cloneRepo()}/>
        </div>}
        {store.cloningState === CloneState.Finished && <div className="pt-3">
            <div className="pe-2 text-center">Clone Complete</div>
            <div className="d-flex justify-content-center pt-3">
                <AppButton text="Open" type="success" className="text-white" onClick={open}/>
            </div>
            <div className="d-flex justify-content-center pt-5">
                <AppButton text="Clone More Repository" type="default"
                 onClick={()=> dispatch(ActionClone.updateData({cloningState:CloneState.NotStarted,directory:"",url:""}))}/>
            </div>
        </div>}

        {store.cloningState === CloneState.InProgress && <Fragment>
            <div className="row g-0 py-5">
                <div className="col-1" />
                <div className="col-10">
                    <ProgressBar className="w-100" style={{height:20}} animated variant="success" now={store.progress} key={1}  label={`${store.progress}%`} />
                </div>            
            </div>
            <div className="text-center">{store.progressLabel === FetchState.Remote?"fetching":store.progressLabel}...</div>
        </Fragment>
        }
    </div>
}

export const CloneRepoPanel = React.memo(CloneRepoPanelRepository);