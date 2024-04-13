import { EnumChangeGroup, IFile, RendererEvents, RepositoryInfo } from "common_library";
import React, { useEffect, useRef } from "react"
import { ConflictUtils, EnumHtmlIds, RepoUtils, UiUtils, useMultiState } from "../../../../lib";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual, useDispatch } from "react-redux";
import { ActionUI } from "../../../../store/slices/UiSlice";
import { AppButton } from "../../../common";
import { ChangeUtils } from "../../../../lib/utils/ChangeUtils";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";

interface ISingleFileProps{
    item:IFile
    handleSelect:(file:IFile)=>void;
    isSelected:boolean;
}

function SingleFile(props:ISingleFileProps){
    const [state,setState]=useMultiState({isHovered:false});

    return (
        <div key={props.item.path} className={`row g-0 align-items-center flex-nowrap hover w-100 ${props.isSelected ? "selected":""}`} 
        title={props.item.fileName} onMouseEnter={()=> setState({isHovered:true})} onMouseLeave={_=> setState({isHovered:false})} 
            onClick={_=> props.handleSelect(props.item)}>
            <div className="col-auto overflow-hidden flex-shrink-1" style={{textOverflow:'ellipsis'}}>
                <span className={`pe-1 flex-shrink-0`}>{props.item.fileName}</span>
                <span className="small text-secondary">{props.item.path}</span>
            </div>
        </div>
    )
}

interface IProps{
    changes:IFile[];
    repoInfoInfo?:RepositoryInfo;
}

interface IState{
    containerHeight?:number;
    firstPaneHeight?:number;
}

function ConflictedChangesComponent(props:IProps){
    const store = useSelectorTyped(state => ({
        selectedFile:state.ui.selectedFile?.changeGroup === EnumChangeGroup.CONFLICTED?state.ui.selectedFile:undefined,
    }),shallowEqual);
    
    const [state,setState] = useMultiState<IState>({});
    const dispatch = useDispatch();

    const headerRef = useRef<HTMLDivElement>();
    const refData = useRef({fileContentAfterChange:[] as string[]});

    useEffect(()=>{
        const setContainerHeight=()=>{
            UiUtils.resolveHeight(EnumHtmlIds.conflictedChangesPanel).then(height=>{
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
        if(!store.selectedFile)
            return ;
        ChangeUtils.containerId = EnumHtmlIds.diffview_container;
        const joinedPath = window.ipcRenderer.sendSync(RendererEvents.joinPath().channel, RepoUtils.repositoryDetails.repoInfo.path,store.selectedFile.path);
        IpcUtils.getFileContent(joinedPath).then(res=>{
            //const lines = StringUtils.getLines(res.result!);
            const lineConfig = ConflictUtils.GetUiLinesOfConflict(res);
            console.log("content");
            console.log(lineConfig);
            // const options =  ["--staged","--word-diff=porcelain", "--word-diff-regex=.","--diff-algorithm=minimal",store.selectedFile!.path];                    
        })
    },[store.selectedFile])

    useEffect(()=>{
        if(!state.containerHeight)
            return;
        UiUtils.resolveHeight(EnumHtmlIds.acceptIncomingCurrentAllPanel).then(height=>{
            setState({firstPaneHeight:height});
        })
    },[state.containerHeight]);

    const handleSelect = (file?:IFile)=>{
        dispatch(ActionUI.setSelectedFile(file));
    }
    
    return <div className="h-100" id={EnumHtmlIds.conflictedChangesPanel}>
    <div ref={headerRef as any} className="d-flex overflow-auto"
     >
        <div id={EnumHtmlIds.acceptIncomingCurrentAllPanel} className="d-flex justify-content-center align-items-center pt-2 ps-1">
            <div className="text-center">
                <div>
                    <AppButton type="default">Accept Current Changes</AppButton>
                </div>
                <div className="py-2">
                    <AppButton type="default">Accept Incoming Changes</AppButton>
                </div>
            </div>            
        </div>        
    </div>
    { state.firstPaneHeight &&
    <div className="container ps-2 border overflow-auto" style={{height:`${state.containerHeight! - state.firstPaneHeight}px`}}>
        {props.changes.map(f=>(
            <SingleFile key={f.path} item={f} handleSelect={handleSelect}
                isSelected ={f.path === store.selectedFile?.path} />
        ))}        
    </div>
    }
    </div>
}

export const ConflictedChanges = React.memo(ConflictedChangesComponent);