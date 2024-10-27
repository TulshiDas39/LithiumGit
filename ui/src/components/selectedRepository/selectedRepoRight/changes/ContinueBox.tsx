import { Form } from "react-bootstrap";
import { useMultiState } from "../../../../lib";
import React, { useEffect } from "react";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual } from "react-redux";
import { AppButton } from "../../../common";
import { FaCheck } from "react-icons/fa";

interface IState{
    value:string;
}

function ContinueBoxComponent(){
    const store = useSelectorTyped(state=>({
        rebaseCommit:state.ui.status?.rebasingCommit,
        repoPath:state.savedData?.recentRepositories.find(_=> _.isSelected)?.path,
    }),shallowEqual);

    const [state,setState]= useMultiState<IState>({
        value:""
    });

    useEffect(()=>{        
        setState({value:store.rebaseCommit?.message || ""});
    },[store.rebaseCommit])

    const handleSkip=()=>{

    }
    
    return <div className="w-100 pb-2 d-flex flex-column" style={{height:116}}>
            <div className="col">
                <Form.Control as="textarea" rows={2} value={state.value} onChange={_ => {}} onKeyUp={e=> {if (e.key === 'Enter' ) e.preventDefault(); }}        
                    type="textarea" className="w-100 h-100 rounded-0 no-resize bg-color" placeholder="Commit message" />
            </div>
            <div className="col d-flex pt-1 px-1 align-items-center justify-content-around flex-nowrap overflow-auto">
                <div className="">
                    <AppButton type="default" onClick={handleSkip} className="h-100 py-2">                                    
                        <span className="">Continue</span>                    
                    </AppButton>
                </div>
                <div className="px-1">
                    <AppButton type="default" onClick={handleSkip} className="h-100 py-2">                                    
                        <span className="">Skip</span>                    
                    </AppButton>
                </div>
                <div>
                    <AppButton type="default" onClick={handleSkip} className="h-100 py-2"
                    style={{paddingRight:8,paddingLeft:8}}>                                    
                        <span className="">Abort</span>                    
                    </AppButton> 
                </div>
                               
            </div>
    </div>
}

export const ContinueBox = React.memo(ContinueBoxComponent);