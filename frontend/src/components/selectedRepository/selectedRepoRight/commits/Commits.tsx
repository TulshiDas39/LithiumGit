import React, { useCallback } from "react"
import { useMultiState } from "../../../../lib";
import { CommitFilter } from "./CommitFilter";
import { CommitList } from "./CommitList";
import { ICommitInfo } from "common_library";
import { CommitProperty } from "../branches/CommitProperty";

interface IState{
    searchText:string;
    selectedBranch?:string;
    selectedCommit?:ICommitInfo;
}

function CommitsComponent(){    

    const [state,setState]=useMultiState<IState>({                
        searchText:"",
    });   

    const handleSearch = (text:string)=>{
        setState({searchText:text});
    }

    const handleSelect = useCallback((commit:ICommitInfo)=>{
        setState({selectedCommit:commit});
    },[])

    return <div className="h-100 w-100">
        <div className="w-100" style={{height:'10%'}}>
            <CommitFilter onSearch={handleSearch} onBranchSelect={br=>setState({selectedBranch:br})} />
        </div>
        <div className="w-100 h-100">
            <div className="d-flex h-75 w-100">
                <div className="w-75 h-100">
                    <CommitList searchText={state.searchText} selectedBranch={state.selectedBranch}
                     onCommitSelect={handleSelect} selectedCommit={state.selectedCommit} />
                </div>
                <div className="w-25">
                    {!!state.selectedCommit && <CommitProperty selectedCommit={state.selectedCommit}  />}
                </div>
            </div>
            <div>

            </div>
        </div>
        
    </div>
}

export const Commits = React.memo(CommitsComponent);