import React, { useEffect } from "react"
import { BranchGraphUtils, DiffUtils, EnumHtmlIds, ILine, UiUtils, useMultiState } from "../../../../lib";
import { ChangeUtils } from "../../../../lib/utils/ChangeUtils";
import { EnumChangeType, IFile, StringUtils } from "common_library";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { StepNavigation } from "../../../common";

interface IProps{
    file?:IFile
}

interface IState{
    currentStep:number;
    totalStep:number;    
}

function CommitDiffViewComponent(props:IProps){
    const [state,setState] = useMultiState({currentStep:0,totalStep:0} as IState);
    const resetStepNavigation = ()=>{
        const totalChange = ChangeUtils.totalChangeCount;
        const currentStep = ChangeUtils.totalChangeCount > 0 ? 1:0;
        setState({totalStep:totalChange,currentStep});
    }
    useEffect(()=>{
        const selectedCommit = BranchGraphUtils.state.selectedCommit;
        if(!props.file || !selectedCommit.value){
            ChangeUtils.ClearView();
            return;
        }
        ChangeUtils.containerId = EnumHtmlIds.CommitDiff;
        if(props.file.changeType !== EnumChangeType.DELETED){
            IpcUtils.getFileContentAtSpecificCommit(selectedCommit.value.hash, props.file.path).then(res=>{
                const content = res.response || "";
                const lines = StringUtils.getLines(content);
                if(props.file?.changeType === EnumChangeType.MODIFIED){
                    const options =  [selectedCommit.value.hash,"--word-diff=porcelain", "--word-diff-regex=.","--diff-algorithm=minimal",props.file.path];            
                    IpcUtils.getGitShowResult(options).then(res=>{
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
            IpcUtils.getGitShowResult([`${selectedCommit.value.hash}^:${props.file.path}`]).then(content=>{                
                const lines = StringUtils.getLines(content);                
                const lineConfigs = lines.map(l=> ({text:l,textHightlightIndex:[]} as ILine))
                ChangeUtils.currentLines = null!;
                ChangeUtils.previousLines = lineConfigs!;
                ChangeUtils.showChanges();
            })            
        }
        
    },[props.file])

    useEffect(()=>{
        ChangeUtils.FocusHightlightedLine(state.currentStep);
    },[state.currentStep])

    const handleNext=()=>{
        if(state.currentStep >= state.totalStep)
            return ;
        setState({currentStep:state.currentStep + 1});
    }

    const handlePrevious=()=>{
        if(state.currentStep <= 1)
            return ;
        setState({currentStep:state.currentStep - 1});
    }
    
    return <div className="h-100 w-100">
        <StepNavigation currentStep={state.currentStep} totalStep={state.totalStep} 
            onNextClick={handleNext} onPreviousClick={handlePrevious} />
        <div id={EnumHtmlIds.CommitDiff} className="h-100 w-100" style={{height:`calc(100% - 30px)`}}>

        </div>
    </div>
}

export const CommitDiffView = React.memo(CommitDiffViewComponent);