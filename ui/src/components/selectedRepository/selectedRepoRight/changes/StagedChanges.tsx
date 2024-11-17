import { EnumChangeType, IChanges, IFile, IStatus, RendererEvents, RepositoryInfo, StringUtils } from "common_library";
import React, { Fragment, useEffect, useMemo, useRef } from "react";
import { FaAngleDown, FaAngleRight, FaMinus } from "react-icons/fa";
import { DiffUtils, EnumChangeGroup, EnumHtmlIds, ILine, ReduxUtils, UiUtils, useMultiState } from "../../../../lib";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { ChangeUtils } from "../../../../lib/utils/ChangeUtils";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual, useDispatch } from "react-redux";
import { ActionUI } from "../../../../store/slices/UiSlice";
import { ActionChanges } from "../../../../store";
import { GitUtils } from "../../../../lib/utils/GitUtils";
import { ChangesData } from "../../../../lib/data/ChangesData";

interface ISingleFileProps{
    item:IFile
    handleSelect:(file:IFile)=>void;
    isSelected:boolean;
    handleUnstage:()=>void;
}

function SingleFile(props:ISingleFileProps){
    const [state,setState]=useMultiState({isHovered:false})
    const getStatusText = ()=>{
        if(props.item.changeType === EnumChangeType.MODIFIED)
            return "M";
        if(props.item.changeType === EnumChangeType.CREATED)
            return "A";
        if(props.item.changeType === EnumChangeType.RENAMED)
            return "R";
        return "D";
    }
    return (
        <div key={props.item.path} className={`row g-0 align-items-center flex-nowrap hover w-100 ${props.isSelected ? "selected":""}`} 
        title={props.item.fileName} onMouseEnter={()=> setState({isHovered:true})} onMouseLeave={_=> setState({isHovered:false})} 
            onClick={_=> props.handleSelect(props.item)}>
        <div className="col-auto overflow-hidden flex-shrink-1" style={{textOverflow:'ellipsis'}}>
            <span className={`pe-1 flex-shrink-0 text-nowrap ${props.item.changeType === EnumChangeType.DELETED?"text-decoration-line-through":""}`}>{props.item.fileName}</span>
            <span className="small text-secondary text-nowrap">{props.item.path}</span>
        </div>
        
        <div className="col-auto align-items-center flex-nowrap overflow-hidden flex-grow-1 text-end pe-1">
            {state.isHovered && <Fragment>
                <span className="hover" title="Unstage" onClick={_=> {_.stopPropagation(); props.handleUnstage()}}><FaMinus /></span>                                    
            </Fragment>}
            <span>
                <span className={`ps-1 fw-bold ${UiUtils.getChangeTypeHintColor(props.item.changeType)}`} title={StringUtils.getStatusText(props.item.changeType)}>{getStatusText()}</span>
            </span>
        </div>
    </div>
    )
}

interface IStagedChangesProps{
    changes:IFile[];
    repoInfoInfo?:RepositoryInfo;    
}

interface IState{
    // isStagedChangesExpanded:boolean;    
}

function StagedChangesComponent(props:IStagedChangesProps){
    const [state,setState] = useMultiState<IState>({});
    const store = useSelectorTyped(state => ({
        selectedFile:state.changes.selectedFile?.changeGroup === EnumChangeGroup.STAGED?state.changes.selectedFile:undefined,
        focusVersion:state.ui.versions.appFocused,
    }),shallowEqual);

    const dispatch = useDispatch();

    const refData = useRef({fileContentAfterChange:[] as string[],isMounted:false});

    const handleUnstageItem = (item:IFile)=>{
        IpcUtils.unstageItem([item.path],props.repoInfoInfo!).then(_=>{
            GitUtils.getStatus();
        });
    }

    const unStageAll=()=>{
        if(!props.changes.length) return;
        IpcUtils.unstageItem([],props.repoInfoInfo!).then(_=>{
            GitUtils.getStatus();
        });        
    }

    const showChanges=()=>{                    
        return new Promise<boolean>((resolve)=>{            
            if(store.selectedFile!.changeType !== EnumChangeType.DELETED){
                IpcUtils.getGitShowResultOfStagedFile(store.selectedFile!.path).then(res=>{
                    const lines = StringUtils.getLines(res.result!);
                    const hasChanges = UiUtils.hasChanges(refData.current.fileContentAfterChange,lines);
                    if(!hasChanges) {
                        resolve(true);
                        return;
                    }
                    refData.current.fileContentAfterChange = lines;
                    if(store.selectedFile?.changeType === EnumChangeType.MODIFIED){
                        const options =  ["--staged","--word-diff=porcelain", "--word-diff-regex=.","--diff-algorithm=minimal",store.selectedFile!.path];            
                        IpcUtils.getDiff(options).then(res=>{
                            let lineConfigs = DiffUtils.GetUiLines(res,refData.current.fileContentAfterChange);
                            ChangesData.changeUtils.currentLines = lineConfigs.currentLines;
                            ChangesData.changeUtils.previousLines = lineConfigs.previousLines;
                            ChangesData.changeUtils.showChanges();                            
                            resolve(true);
                        })
                    }
                    else if(store.selectedFile?.changeType === EnumChangeType.RENAMED){
                        const options =  ["--staged","--word-diff=porcelain", "--word-diff-regex=.","--diff-algorithm=minimal","--",store.selectedFile!.oldPath!,store.selectedFile!.path!];            
                        IpcUtils.getDiff(options).then(res=>{
                            let lineConfigs = DiffUtils.GetUiLines(res,refData.current.fileContentAfterChange);
                            ChangesData.changeUtils.currentLines = lineConfigs.currentLines;
                            ChangesData.changeUtils.previousLines = lineConfigs.previousLines;
                            ChangesData.changeUtils.showChanges();
                            resolve(true);
                        })                    
                    }
                    else{
                        const lineConfigs = lines.map(l=> ({text:l,textHightlightIndex:[]} as ILine))
                        ChangesData.changeUtils.currentLines = lineConfigs;
                        ChangesData.changeUtils.previousLines = null!;
                        ChangesData.changeUtils.showChanges();
                        resolve(true);
                    }
                                        
                })
            }
            else{
                IpcUtils.getGitShowResult([`HEAD:${store.selectedFile!.path}`]).then(content=>{                
                    const lines = StringUtils.getLines(content);
                    const hasChanges = UiUtils.hasChanges(refData.current.fileContentAfterChange,lines);
                    if(!hasChanges) return;
                    refData.current.fileContentAfterChange = lines;
                    const lineConfigs = lines.map(l=> ({text:l,textHightlightIndex:[]} as ILine))
                    ChangesData.changeUtils.currentLines = null!;
                    ChangesData.changeUtils.previousLines = lineConfigs!;
                    ChangesData.changeUtils.showChanges();
                    resolve(true);
                })
            }
            ChangesData.changeUtils.file = store.selectedFile;
        })
    }

    useEffect(()=>{
        if(!store.selectedFile || !refData.current.isMounted)
            return ;
        showChanges().then(()=>{
            dispatch(ActionChanges.updateData({currentStep:1, totalStep:ChangesData.changeUtils.totalChangeCount}));
        })
    },[store.selectedFile])

    useEffect(()=>{
        if(!store.selectedFile || !refData.current.isMounted)
            return;
        if(store.selectedFile.changeType === EnumChangeType.DELETED)
            return;
        showChanges().then(()=>{
            dispatch(ActionChanges.updateData({totalStep:ChangesData.changeUtils.totalChangeCount}));
            dispatch(ActionChanges.increamentStepRefreshVersion());
        })
    },[store.focusVersion])

    const handleSelect = (file?:IFile)=>{
        dispatch(ActionChanges.updateData({selectedFile:file,currentStep:0,totalStep:0}));
    }

    useEffect(()=>{
        refData.current.isMounted = true;
    },[])

    return <div className="h-100" id={EnumHtmlIds.stagedChangesPanel}>
    <div className="d-flex hover py-1" style={{height:40}}
     >
        <div id={EnumHtmlIds.unstage_unstage_allPanel} className="d-flex justify-content-center ps-1">
            <span className="d-flex align-items-center hover-shadow hover-brighter bg-success px-2 cur-default" title="Unstage all" onClick={_=>unStageAll()}>
                <FaMinus />
            </span>
        </div>        
    </div>
    
    <div className="container ps-2 border overflow-auto" style={{height:`calc(100% - 40px)`}}>
        {props.changes.map(f=>(
            <SingleFile key={f.path} item={f} handleSelect={handleSelect}
                handleUnstage={() => handleUnstageItem(f)}
                isSelected ={f.path === store.selectedFile?.path} />
        ))}        
    </div>
</div>
}

export const StagedChanges = React.memo(StagedChangesComponent);