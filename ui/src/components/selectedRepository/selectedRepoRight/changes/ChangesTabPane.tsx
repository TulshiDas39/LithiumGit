import React, { useEffect, useMemo } from "react"
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual, useDispatch } from "react-redux";
import { EnumChangeGroup, useMultiState } from "../../../../lib";
import { ModifiedChanges } from "./ModifiedChanges";
import { StagedChanges } from "./StagedChanges";
import { ConflictedChanges } from "./ConflictedChanges";
import { ActionChanges } from "../../../../store";



function ChangesTabPaneComponent(){
    const store = useSelectorTyped(state=>({
       status:state.ui.status,
       recentRepositories:state.savedData.recentRepositories,
       selectedTab: state.changes.selectedTab 
    }),shallowEqual);

    const dispatch = useDispatch();

    const setTab=(tab:EnumChangeGroup)=>{
        dispatch(ActionChanges.updateData({selectedTab:tab}));
    }
    
    useEffect(()=>{
        if(!store.status?.staged.length && store.selectedTab === EnumChangeGroup.STAGED){
            setTab(EnumChangeGroup.UN_STAGED);
        }
    },[!!store.status?.staged.length,store.selectedTab === EnumChangeGroup.STAGED])

    useEffect(()=>{
        if(!store.status?.conflicted.length && store.selectedTab === EnumChangeGroup.CONFLICTED){
            setTab(EnumChangeGroup.STAGED);
        }
    },[!!store.status?.conflicted.length,store.selectedTab === EnumChangeGroup.CONFLICTED])

    const repoInfo = useMemo(()=>{
        return store.recentRepositories.find(x=>x.isSelected);
    },[store.recentRepositories])

    if(!store.status)
        return <div></div>;

    return <div className="d-flex flex-column" style={{height:`calc(100% - 116px)`}}>
        <div className="row g-0 flex-nowrap overflow-auto" style={{height:40}}>
            <div className={`col border cur-default text-center ${store.selectedTab === EnumChangeGroup.UN_STAGED ?"bg-select-color":""}`}
            onClick={_=> setTab(EnumChangeGroup.UN_STAGED)}>
                <span className="px-1">Modified</span><br/>
                <span>({store.status?.totalUnStagedItem || 0})</span>
            </div>
            {!!store.status?.staged?.length && <div className={`col border cur-default text-center ${store.selectedTab === EnumChangeGroup.STAGED ?"bg-select-color":""}`} 
            onClick={_=> setTab(EnumChangeGroup.STAGED)}>
                <span className="px-1">Staged</span><br/>
                <span>({store.status?.totalStagedItem || 0})</span>
            </div>}
            {!!store.status?.conflicted?.length && <div className={`col border cur-default text-center ${store.selectedTab === EnumChangeGroup.CONFLICTED ?"bg-select-color":""}`} onClick={_=> setTab(EnumChangeGroup.CONFLICTED)}>
                <span className="px-1">Conflicts</span><br/>
                <span>({store.status?.totalConflictedItem || 0})</span>
            </div>}
        </div>
        <div className="" style={{height:`calc(100% - 40px)`}}>            
            {store.selectedTab === EnumChangeGroup.UN_STAGED && <ModifiedChanges changes={store.status?.unstaged!} 
             repoInfoInfo={repoInfo} />}
            {store.selectedTab === EnumChangeGroup.STAGED &&
            <StagedChanges changes={store.status?.staged!} 
             repoInfoInfo={repoInfo} />}
             {store.selectedTab === EnumChangeGroup.CONFLICTED &&
            <ConflictedChanges changes={store.status?.conflicted!} 
             repoInfoInfo={repoInfo} />}
        </div>
    </div>
}

export const ChangesTabPane = React.memo(ChangesTabPaneComponent);