import React, { useEffect } from "react"
import { useMultiState } from "../../../../lib";
import { Form } from "react-bootstrap";
import { AppButton } from "../../../common";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual } from "react-redux";
import Select from 'react-select'


interface IProps{
    onSearch:(str:string)=>void;
    onBranchSelect:(branchName?:string)=>void;
}

interface IBranchOption{
    label:string;
    value:string;
}
interface IState{
    searchText:string;
    branchList:IBranchOption[];
}

function CommitFilterComponent(props:IProps){
    const store = useSelectorTyped(state=>({
        branchList:state.ui.branchList,
    }),shallowEqual);

    const [state,setState] = useMultiState<IState>({searchText:"",branchList:[]});
    useEffect(()=>{
        const options = store.branchList.map<IBranchOption>(br=> ({label:br,value:br}));
        setState({branchList:options});
    },[store.branchList]);

    return <div className="w-100 d-flex py-2 px-2 align-items-center">
        <div>
            <Form.Control type="text" value={state.searchText} onChange={e=>setState({searchText:e.target.value})} style={{maxWidth:'300px',minWidth:'200px'}}
                placeholder="Enter commit hash" />
        </div>
        
        <div className="ps-2 d-flex align-items-center">
            <AppButton text="Search" type="default" onClick={()=>props.onSearch(state.searchText)}  />
        </div>
        {/* <div className="px-2" style={{height:50}}>
            <Select options={state.branchList} className="h-100" onChange={o=> props.onBranchSelect(o?.value)} />
        </div> */}
    </div>
}

export const CommitFilter = React.memo(CommitFilterComponent);