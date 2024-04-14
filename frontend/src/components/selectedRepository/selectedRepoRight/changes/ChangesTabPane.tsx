import React, { useEffect, useMemo } from "react"
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual } from "react-redux";
import { EnumChangeGroup, useMultiState } from "../../../../lib";
import { ModifiedChanges } from "./ModifiedChanges";
import { StagedChanges } from "./StagedChanges";
import { ConflictedChanges } from "./ConflictedChanges";

interface IState{
    selectedTab:EnumChangeGroup;
}


function ChangesTabPaneComponent(){
    const store = useSelectorTyped(state=>({
       status:state.ui.status,
       recentRepositories:state.savedData.recentRepositories,
    }),shallowEqual);

    const [state,setState] = useMultiState({
        selectedTab:EnumChangeGroup.UN_STAGED
    } as IState)
    
    useEffect(()=>{
        if(!store.status?.staged.length && state.selectedTab === EnumChangeGroup.STAGED){
            setState({selectedTab:EnumChangeGroup.UN_STAGED});
        }
    },[!!store.status?.staged.length])

    const repoInfo = useMemo(()=>{
        return store.recentRepositories.find(x=>x.isSelected);
    },[store.recentRepositories])

    if(!store.status)
        return <div></div>;

    return <div className="flex-grow-1 d-flex flex-column">
        <div className="row g-0 px-1 flex-nowrap overflow-auto">
            <div className={`col border cur-default text-center ${state.selectedTab === EnumChangeGroup.UN_STAGED ?"bg-select-color":""}`}
            onClick={_=> setState({selectedTab:EnumChangeGroup.UN_STAGED})}>
                <span>Modified</span><br/>
                <span>({store.status?.totalUnStagedItem || 0})</span>
            </div>
            {!!store.status?.staged?.length && <div className={`col border cur-default text-center ${state.selectedTab === EnumChangeGroup.STAGED ?"bg-select-color":""}`} 
            onClick={_=> setState({selectedTab:EnumChangeGroup.STAGED})}>
                <span>Staged</span><br/>
                <span>({store.status?.totalStagedItem || 0})</span>
            </div>}
            {!!store.status?.conflicted?.length && <div className={`col border cur-default text-center ${state.selectedTab === EnumChangeGroup.CONFLICTED ?"bg-select-color":""}`} onClick={_=> setState({selectedTab:EnumChangeGroup.CONFLICTED})}>
                <span>Clonflicts</span><br/>
                <span>({store.status?.totalConflictedItem || 0})</span>
            </div>}
        </div>
        <div className="flex-grow-1">            
            {state.selectedTab === EnumChangeGroup.UN_STAGED && <ModifiedChanges changes={store.status?.unstaged!} 
             repoInfoInfo={repoInfo} />}
            {state.selectedTab === EnumChangeGroup.STAGED &&
            <StagedChanges changes={store.status?.staged!} 
             repoInfoInfo={repoInfo} />}
             {state.selectedTab === EnumChangeGroup.CONFLICTED &&
            <ConflictedChanges changes={store.status?.conflicted!} 
             repoInfoInfo={repoInfo} />}
        </div>
    </div>
}

export const ChangesTabPane = React.memo(ChangesTabPaneComponent);