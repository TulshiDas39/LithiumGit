import { RepositoryInfo } from "common_library";
import React from "react";
import { shallowEqual } from "react-redux";
import { useMultiState } from "../../../../lib";
import { useSelectorTyped } from "../../../../store/rootReducer";

export interface IRecentRepositoryListProps{
    onSelectItem:(item:RepositoryInfo)=>void;
    selectedItem?:RepositoryInfo;
}



function RecentRepositoryListComponent(props:IRecentRepositoryListProps){
    const store = useSelectorTyped(state=>({
        recentRepos:state.savedData.recentRepositories,
    }),shallowEqual);

    const handleSelect=(item:RepositoryInfo)=>{
        props.onSelectItem(item);
    }
    return <div id="recentRepoList" className="w-75 h-100 d-flex flex-column">
        <h4 className="px-1 py-2 m-0">Recent Repositories</h4>
        <hr className="m-0" />
        <div className="d-flex flex-column align-items-center pt-2">
            {
                store.recentRepos.map(repo=>(
                    <div key={repo._id} className={`repoItem d-flex flex-column px-1 ${props.selectedItem?._id === repo._id?"selected":""}`}
                        onClick={()=>handleSelect(repo)}>
                        <h6>{repo.name}</h6>
                        <span>{repo.path}</span>
                    </div>
                ))
            }
        </div>
    </div>
}

export const RecentRepositoryList = React.memo(RecentRepositoryListComponent);