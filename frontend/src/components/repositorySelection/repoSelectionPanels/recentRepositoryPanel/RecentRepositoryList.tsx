import React from "react";
import { shallowEqual } from "react-redux";
import { useSelectorTyped } from "../../../../store/rootReducer";

function RecentRepositoryListComponent(){
    const store = useSelectorTyped(state=>({
        recentRepos:state.savedData.recentRepositories,
    }),shallowEqual);
    return <div id="recentRepoList" className="w-75 h-100 d-flex flex-column">
        <h4 className="px-1 py-2 m-0">Recent Repositories</h4>
        <hr className="m-0" />
        <div className="d-flex flex-column align-items-center pt-2">
            {
                store.recentRepos.map(repo=>(
                    <div key={repo._id} className="repoItem d-flex flex-column px-1">
                        <h6>{repo.name}</h6>
                        <span>{repo.path}</span>
                    </div>
                ))
            }
        </div>
    </div>
}

export const RecentRepositoryList = React.memo(RecentRepositoryListComponent);