import React, { useCallback, useMemo } from "react"
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual } from "react-redux";
import { EnumChangeGroup, useMultiState } from "../../../../lib";
import { ModifiedChanges } from "./ModifiedChanges";
import { EnumChangeType, IFile } from "common_library";

interface IState{
    selectedTab:EnumChangeGroup;
    selectedFilePath?:string;
    selectedFileGroup:EnumChangeGroup;
    selectedFileChangeType:EnumChangeType;
}

function ChangesTabPaneComponent(){
    const store = useSelectorTyped(state=>({
       status:state.ui.status,
       recentRepositories:state.savedData.recentRepositories,
    }),shallowEqual);

    const [state,setState] = useMultiState({
        selectedTab:EnumChangeGroup.UN_STAGED
    } as IState)
    
    const handleSelect = useCallback((changedFile:IFile,changeGroup:EnumChangeGroup)=>{
        setState({selectedFilePath:changedFile.path,selectedFileGroup:changeGroup,selectedFileChangeType:changedFile.changeType});
    },[])

    const repoInfo = useMemo(()=>{
        return store.recentRepositories.find(x=>x.isSelected);
    },[store.recentRepositories])

    return <div className="flex-grow-1 d-flex flex-column">
        <div className="row g-0 px-1 flex-nowrap overflow-auto">
            <div className={`col border cur-default text-center ${state.selectedTab === EnumChangeGroup.UN_STAGED ?"bg-select-color":""}`}
            onClick={_=> setState({selectedTab:EnumChangeGroup.UN_STAGED})}>
                <span>Modified</span><br/>
                <span>({store.status?.unstaged.length || 0})</span>
            </div>
            <div className={`col border cur-default text-center ${state.selectedTab === EnumChangeGroup.STAGED ?"bg-select-color":""}`} 
            onClick={_=> setState({selectedTab:EnumChangeGroup.STAGED})}>
                <span>Staged</span><br/>
                <span>({store.status?.staged.length || 0})</span>
            </div>
            <div className={`col border cur-default text-center ${state.selectedTab === EnumChangeGroup.CONFLICTED ?"bg-select-color":""}`} onClick={_=> setState({selectedTab:EnumChangeGroup.CONFLICTED})}>
                <span>Clonflicted</span><br/>
                <span>({store.status?.conflicted.length || 0})</span>
            </div>
        </div>
        <div className="flex-grow-1">
            {state.selectedTab === EnumChangeGroup.UN_STAGED &&
            <ModifiedChanges changes={store.status?.unstaged!} onFileSelect={file=> handleSelect(file, EnumChangeGroup.STAGED)} 
            selectedMode={state.selectedTab} repoInfoInfo={repoInfo} />}
        </div>
    </div>
}

export const ChangesTabPane = React.memo(ChangesTabPaneComponent);