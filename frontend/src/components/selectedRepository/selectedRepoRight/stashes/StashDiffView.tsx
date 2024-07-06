import { EnumChangeType, IFile, IStash, StringUtils } from "common_library";
import React, { useEffect } from "react"
import { useMultiState, DiffUtils, EnumHtmlIds, ILine } from "../../../../lib";
import { ChangeUtils } from "../../../../lib/utils/ChangeUtils";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { StepNavigation } from "../../../common";

interface IProps{
    file?:IFile;
    stash?:IStash;
}

interface IState{
    currentStep:number;
    totalStep:number;
    stepResetVersion:number;    
}

function StashDiffViewComponent(props:IProps){
    const [state,setState] = useMultiState<IState>({currentStep:0,totalStep:0,stepResetVersion:0,});
    const resetStepNavigation = ()=>{
        const totalChange = ChangeUtils.totalChangeCount;
        const currentStep = ChangeUtils.totalChangeCount > 0 ? 1:0;
        setState({totalStep:totalChange,currentStep});
    }
    useEffect(()=>{
        const selectedStash = props.stash!;
        if(!props.file || !props.stash){
            ChangeUtils.ClearView();
            return;
        }
        ChangeUtils.containerId = EnumHtmlIds.StashDiff;
        if(props.file.changeType !== EnumChangeType.DELETED){
            IpcUtils.getFileContentAtSpecificCommit(selectedStash.hash, props.file.path).then(res=>{
                const content = res.result || "";
                const lines = StringUtils.getLines(content);
                if(props.file?.changeType === EnumChangeType.MODIFIED){
                    const options =  ["HEAD",`stash@{${selectedStash.index}}`,"--word-diff=porcelain", "--word-diff-regex=.","--diff-algorithm=minimal","--",props.file.path];            
                    IpcUtils.getDiff(options).then(res=>{                        
                        let lineConfigs = DiffUtils.GetUiLines(res,lines);
                        ChangeUtils.currentLines = lineConfigs.currentLines;
                        ChangeUtils.previousLines = lineConfigs.previousLines;
                        ChangeUtils.showChanges();
                        resetStepNavigation();
                    })
                }
                else{
                    const lineConfigs = lines.map(l=> ({text:l,textHightlightIndex:[]} as ILine))
                    ChangeUtils.currentLines = lineConfigs;
                    ChangeUtils.previousLines = null!;
                    ChangeUtils.showChanges();
                    resetStepNavigation();
                }
                
            })
        }
        else{            
            IpcUtils.getGitShowResult([`${selectedStash.hash}^:${props.file.path}`]).then(content=>{                
                const lines = StringUtils.getLines(content);                
                const lineConfigs = lines.map(l=> ({text:l,textHightlightIndex:[]} as ILine))
                ChangeUtils.currentLines = null!;
                ChangeUtils.previousLines = lineConfigs!;
                ChangeUtils.showChanges();
                resetStepNavigation();
            })            
        }
        
    },[props.file])

    useEffect(()=>{
        ChangeUtils.FocusHightlightedLine(state.currentStep);
    },[state.currentStep,state.stepResetVersion])

    const handleNext=()=>{
        if(state.currentStep == state.totalStep){
            setState({stepResetVersion:state.stepResetVersion+1});
        }
        else{
            setState({currentStep:state.currentStep + 1});
        }
    }

    const handlePrevious=()=>{
        if(state.currentStep == 1){
            setState({stepResetVersion:state.stepResetVersion+1});
        }
        else{
            setState({currentStep:state.currentStep - 1});
        }
    }
    
    return <div className="h-100 w-100">
        <StepNavigation currentStep={state.currentStep} totalStep={state.totalStep} 
            onNextClick={handleNext} onPreviousClick={handlePrevious} />
        <div id={EnumHtmlIds.StashDiff} className="w-100" style={{height:`calc(100% - 30px)`}}>

        </div>
    </div>
}

export const StashDiffView = React.memo(StashDiffViewComponent);