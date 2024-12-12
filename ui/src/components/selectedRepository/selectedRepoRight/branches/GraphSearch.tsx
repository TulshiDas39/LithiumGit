import React from "react"
import { AppInputField } from "../../../common";
import { useMultiState } from "../../../../lib";

interface IState{
    text:string;
}

function GraphSearchComponent(){
    const [state,setState] = useMultiState<IState>({text:""});
    return <div className="h-100 pe-1" style={{minWidth:200}}>
        <AppInputField placeholder="Search" value={state.text} onChange={e => setState({text:e.target.value})} />
    </div>
}

export const GraphSearch = React.memo(GraphSearchComponent);