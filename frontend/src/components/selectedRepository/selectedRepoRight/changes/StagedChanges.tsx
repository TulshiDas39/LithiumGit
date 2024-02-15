import { EnumChangeType, IChanges, IFile, IStatus, RendererEvents, RepositoryInfo } from "common_library";
import React, { Fragment, useEffect, useMemo, useRef } from "react";
import { FaAngleDown, FaAngleRight, FaMinus } from "react-icons/fa";
import { DiffUtils, EnumChangeGroup, EnumHtmlIds, ILine, UiUtils, useMultiState } from "../../../../lib";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { StringUtils } from "../../../../lib/utils/StringUtils";
import { ChangeUtils } from "../../../../lib/utils/ChangeUtils";

interface ISingleFileProps{
    item:IFile
    handleSelect:(path:string)=>void;
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
        return "D";
    }
    return (
        <div key={props.item.path} className={`row g-0 align-items-center flex-nowrap hover w-100 ${props.isSelected ? "selected":""}`} 
        title={props.item.fileName} onMouseEnter={()=> setState({isHovered:true})} onMouseLeave={_=> setState({isHovered:false})} 
            onClick={_=> props.handleSelect(props.item.path)}>
        <div className="col-auto overflow-hidden flex-shrink-1" style={{textOverflow:'ellipsis'}}>
            <span className={`pe-1 flex-shrink-0 ${props.item.changeType === EnumChangeType.DELETED?"text-decoration-line-through":""}`}>{props.item.fileName}</span>
            <span className="small text-secondary">{props.item.path}</span>
        </div>
        
        <div className="col-auto align-items-center flex-nowrap overflow-hidden flex-grow-1 text-end pe-1">
            {state.isHovered && <Fragment>
                <span className="hover" title="Unstage" onClick={_=> {_.stopPropagation(); props.handleUnstage()}}><FaMinus /></span>                                    
            </Fragment>}
            <span>
                <span className="ps-1 text-success fw-bold">{getStatusText()}</span>
            </span>
        </div>
    </div>
    )
}

interface IStagedChangesProps{
    changes:IFile[];
    repoInfoInfo?:RepositoryInfo;    
    handleSelect:(file:IFile)=>void;
    selectedFile?:IFile;
}

interface IState{
    // isStagedChangesExpanded:boolean;
    containerHeight?:number;
    firstPaneHeight?:number;
}

function StagedChangesComponent(props:IStagedChangesProps){
    const [state,setState] = useMultiState<IState>({});

    const headerRef = useRef<HTMLDivElement>();
    const refData = useRef({fileContentAfterChange:[] as string[]});

    const handleUnstageItem = (item:IFile)=>{
        IpcUtils.unstageItem([item.path],props.repoInfoInfo!).then(_=>{
            IpcUtils.getRepoStatus();
        });
    }

    const unStageAll=()=>{
        if(!props.changes.length) return;
        IpcUtils.unstageItem(props.changes.map(_=>_.path),props.repoInfoInfo!).then(_=>{
            IpcUtils.getRepoStatus();
        });        
    }

    useEffect(()=>{
        const setContainerHeight=()=>{
            UiUtils.resolveHeight(EnumHtmlIds.stagedChangesPanel).then(height=>{
                setState({containerHeight:height});
            })
        }
        setContainerHeight();

        window.addEventListener("resize",setContainerHeight);
        return ()=>{
            window.removeEventListener("resize",setContainerHeight);
        }
    },[])

    useEffect(()=>{
        if(!props.selectedFile)
            return ;
        if(props.selectedFile.changeType !== EnumChangeType.DELETED){
            IpcUtils.getGitShowResultOfStagedFile(props.selectedFile.path).then(content=>{
                const lines = new StringUtils().getLines(content);
                const hasChanges = UiUtils.hasChanges(refData.current.fileContentAfterChange,lines);
                if(!hasChanges) return;
                refData.current.fileContentAfterChange = lines;
                const options =  ["--staged","--word-diff=porcelain", "--word-diff-regex=.","--diff-algorithm=minimal",props.selectedFile!.path];            
                IpcUtils.getDiff(options).then(res=>{
                    let lineConfigs = DiffUtils.GetUiLines(res,refData.current.fileContentAfterChange);
                    ChangeUtils.currentLines = lineConfigs.currentLines;
                    ChangeUtils.previousLines = lineConfigs.previousLines;
                    ChangeUtils.showChanges();
                })                    
            })
        }
        else{
            IpcUtils.getGitShowResult(props.selectedFile.path).then(content=>{                
                const lines = new StringUtils().getLines(content);
                const hasChanges = UiUtils.hasChanges(refData.current.fileContentAfterChange,lines);
                if(!hasChanges) return;
                refData.current.fileContentAfterChange = lines;
                const lineConfigs = lines.map(l=> ({text:l,textHightlightIndex:[]} as ILine))
                ChangeUtils.currentLines = null!;
                ChangeUtils.previousLines = lineConfigs!;
                ChangeUtils.showChanges();
            })
        }
    },[props.selectedFile])
    
    useEffect(()=>{
        if(!state.containerHeight)
            return;
        UiUtils.resolveHeight(EnumHtmlIds.unstage_unstage_allPanel).then(height=>{
            setState({firstPaneHeight:height});
        })
    },[state.containerHeight]);

    return <div className="h-100" id={EnumHtmlIds.stagedChangesPanel}>
    <div ref={headerRef as any} className="d-flex hover overflow-auto"
     >
        <div id={EnumHtmlIds.unstage_unstage_allPanel} className="d-flex justify-content-center align-items-center pt-2 ps-1">
            <span className="h4 hover-brighter bg-success py-1 px-2 cur-default" title="Discard all" onClick={_=>unStageAll()}>
                <FaMinus />
            </span>
        </div>        
    </div>
    { state.firstPaneHeight &&
    <div className="container ps-2 border overflow-auto" style={{height:`${state.containerHeight! - state.firstPaneHeight}px`}}>
        {props.changes.map(f=>(
            <SingleFile key={f.path} item={f} handleSelect={_ => props.handleSelect(f)}
                handleUnstage={() => handleUnstageItem(f)}
                isSelected ={f.path === props.selectedFile?.path} />
        ))}        
    </div>
    }
</div>
}

export const StagedChanges = React.memo(StagedChangesComponent);