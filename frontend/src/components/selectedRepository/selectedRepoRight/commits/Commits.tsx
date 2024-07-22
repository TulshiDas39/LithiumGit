import React, { useEffect } from "react"
import { RepoUtils, UiUtils, useMultiState } from "../../../../lib";
import moment from "moment";
import { Paginator } from "../../../common";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { ICommitInfo, ILogFilterOptions } from "common_library";
import { CommitFilter } from "./CommitFilter";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual } from "react-redux";
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
        <CommitList searchText={state.searchText} selectedBranch={state.selectedBranch} />        
        
    </div>
}

export const Commits = React.memo(CommitsComponent);