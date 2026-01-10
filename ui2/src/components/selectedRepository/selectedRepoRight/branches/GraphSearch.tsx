import React, { useEffect } from "react"
import { AppInputField } from "../../../common";
import { GraphUtils, RepoUtils, useMultiState } from "../../../../lib";

interface IState{
    text:string;
}

function GraphSearchComponent(){   
    const [state,setState] = useMultiState<IState>({text:""});
    useEffect(()=>{
        if(!state.text){
            GraphUtils.state.highlightedCommit.publish(undefined);
            return;
        }
        const str = state.text.toLowerCase();
        const commit = RepoUtils.repositoryDetails?.allCommits.find(_=> _.hash.includes(str) || _.refValues.some(r=>r.toLowerCase().includes(str)));
        GraphUtils.state.highlightedCommit.publish(commit);
    },[state.text])
    return <div className="h-100 pe-1" style={{minWidth:200}}>
        <AppInputField placeholder="Search" value={state.text} onChange={e => setState({text:e.target.value})} />
    </div>
}

export const GraphSearch = React.memo(GraphSearchComponent);