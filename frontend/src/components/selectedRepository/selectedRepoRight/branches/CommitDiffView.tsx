import React, { useEffect, useMemo } from "react"
import { GraphUtils, DiffUtils, EnumHtmlIds, ILine, useMultiState, DiffData } from "../../../../lib";
import { EnumChangeType, IFile, StringUtils } from "common_library";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { StepNavigation } from "../../../common";

interface IProps{
    file?:IFile;
    containerId:EnumHtmlIds;
}

interface IState{
    currentStep:number;
    totalStep:number;
    stepResetVersion:number;    
}

function CommitDiffViewComponent(props:IProps){
    const [state,setState] = useMultiState<IState>({currentStep:0,totalStep:0,stepResetVersion:0,});
    const changeUtils = useMemo(()=>{
        return DiffData.ResolveObjectUtils(props.containerId)!;
    },[props.containerId]);
    
    const resetStepNavigation = ()=>{
        const totalChange = changeUtils.totalChangeCount;
        const currentStep = changeUtils.totalChangeCount > 0 ? 1:0;
        setState({totalStep:totalChange,currentStep,stepResetVersion:state.stepResetVersion+1});
    }
    useEffect(()=>{
        const selectedCommit = GraphUtils.state.selectedCommit;
        if(!props.file || !selectedCommit.value){
            changeUtils.ClearView();
            return;
        }
        
        if(props.file.changeType !== EnumChangeType.DELETED){
            IpcUtils.getFileContentAtSpecificCommit(selectedCommit.value.hash, props.file.path).then(res=>{
                const content = res.result || "";
                const lines = StringUtils.getLines(content);
                if(props.file?.changeType === EnumChangeType.MODIFIED){
                    const options =  [selectedCommit.value.hash,"--word-diff=porcelain", "--word-diff-regex=.","--diff-algorithm=minimal","-m","--",props.file.path];            
                    IpcUtils.getGitShowResult(options).then(res=>{
                        let lineConfigs = DiffUtils.GetUiLines(res,lines);
                        changeUtils.currentLines = lineConfigs.currentLines;
                        changeUtils.previousLines = lineConfigs.previousLines;
                        changeUtils.showChanges();
                        resetStepNavigation();
                    })
                }
                else{
                    const lineConfigs = lines.map(l=> ({text:l,textHightlightIndex:[]} as ILine))
                    changeUtils.currentLines = lineConfigs;
                    changeUtils.previousLines = null!;
                    changeUtils.showChanges();
                    resetStepNavigation();
                }
                
            })
        }
        else{            
            IpcUtils.getGitShowResult([`${selectedCommit.value.hash}^:${props.file.path}`]).then(content=>{                
                const lines = StringUtils.getLines(content);                
                const lineConfigs = lines.map(l=> ({text:l,textHightlightIndex:[]} as ILine))
                changeUtils.currentLines = null!;
                changeUtils.previousLines = lineConfigs!;
                changeUtils.showChanges();
                resetStepNavigation();
            })            
        }
        
    },[props.file])

    useEffect(()=>{
        changeUtils.FocusHightlightedLine(state.currentStep);
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
        <div id={props.containerId} className="w-100" style={{height:`calc(100% - 30px)`}}>

        </div>
    </div>
}

export const CommitDiffView = React.memo(CommitDiffViewComponent);