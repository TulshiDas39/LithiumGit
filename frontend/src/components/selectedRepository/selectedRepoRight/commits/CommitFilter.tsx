import React from "react"
import { useMultiState } from "../../../../lib";
import { Form } from "react-bootstrap";
import { AppButton } from "../../../common";

interface IProps{
    onSearch:(str:string)=>void;
}

interface IState{
    searchText:string;
}
function CommitFilterComponent(props:IProps){
    const [state,setState] = useMultiState<IState>({searchText:""});
    return <div className="w-100 d-flex py-2 px-2">
        <Form.Control type="text" value={state.searchText} onChange={e=>setState({searchText:e.target.value})} style={{maxWidth:'300px'}}
        placeholder="Search by commit message" />
        <div className="ps-2 d-flex align-items-center">
            <AppButton text="Search" type="default" onClick={()=>props.onSearch(state.searchText)}  />
        </div>
    </div>
}

export const CommitFilter = React.memo(CommitFilterComponent);