import React from "react"
import { useMultiState } from "../../../../lib";
import { CommitFilter } from "./CommitFilter";
import { CommitList } from "./CommitList";

interface IState{
    searchText:string;
    selectedBranch?:string;
}

function CommitsComponent(){    

    const [state,setState]=useMultiState<IState>({                
        searchText:"",
    });   

    const handleSearch = (text:string)=>{
        setState({searchText:text});
    }

    return <div className="h-100 w-100">
        <div className="w-100" style={{height:'10%'}}>
            <CommitFilter onSearch={handleSearch} onBranchSelect={br=>setState({selectedBranch:br})} />
        </div>
        <div className="w-100 h-100">
            <div className="d-flex h-75 w-100">
                <div className="w-75 h-100">
                    <CommitList searchText={state.searchText} selectedBranch={state.selectedBranch} />
                </div>
                <div className="w-25">

                </div>
            </div>
            <div>

            </div>
        </div>
        
    </div>
}

export const Commits = React.memo(CommitsComponent);