import React, { useEffect, useMemo } from "react"
import { useMultiState } from "../../../../lib";
import { Form } from "react-bootstrap";
import { AppButton } from "../../../common";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual } from "react-redux";
import Select from 'react-select'
import { Constants } from "common_library";


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
    const allBranch = "All branches";
    const store = useSelectorTyped(state=>({
        branchList:state.ui.branchList,
    }),shallowEqual);

    const [state,setState] = useMultiState<IState>({searchText:"",branchList:[]});
    useEffect(()=>{
        const options = store.branchList.map<IBranchOption>(br=> ({label:br,value:br}));
        setState({branchList:options});
    },[store.branchList]);

    const branches = useMemo(()=>{
        const list:IBranchOption[] = [{label: allBranch,value:allBranch}];
        for(let br of store.branchList){
            if(br.startsWith(Constants.originBranPrefix)){
                br = br.substring(Constants.originBranPrefix.length);
            }
            list.push({label:br,value:br});
        }
        return list;
    },[store.branchList])

    const handleBranchSelect=(option:IBranchOption)=>{
        if(option.value === allBranch){
            props.onBranchSelect(undefined);
        }
        else{
            props.onBranchSelect(option.value);
        }
    }

    const commonHeight = 30;

    return <div className="w-100 d-flex py-2 px-2 align-items-center commit-list-filter">        
            <div className="d-flex align-items-stretch" style={{height:commonHeight}}>
                <Form.Control type="text" value={state.searchText} onChange={e=>setState({searchText:e.target.value})} style={{maxWidth:'300px',minWidth:'200px'}}
                            placeholder="Enter commit hash" />
            </div>            
            <div className="d-flex align-items-stretch ps-2" style={{height:commonHeight}}>
                <AppButton text="Search" type="default" onClick={()=>props.onSearch(state.searchText)}  />
            </div>
            
        <div className="ps-5 d-flex align-items-center" style={{height:commonHeight,maxHeight:commonHeight}}>
            <Select options={branches} defaultValue={branches[0]} placeholder="Select branch" onChange={o=> handleBranchSelect(o as IBranchOption)}
             onBlur={e => {e.preventDefault();e.stopPropagation();e.nativeEvent.stopImmediatePropagation(); return false;}} 
             />
        </div>
    </div>
}

export const CommitFilter = React.memo(CommitFilterComponent);