import React, { Fragment, useCallback, useEffect } from "react";
import { SingleCommit } from "./SingleCommit";
import { ICommitInfo, ILogFilterOptions } from "common_library";
import { Paginator } from "../../../common";
import { RepoUtils, useMultiState } from "../../../../lib";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual } from "react-redux";

interface IProps{
    searchText:string;
    selectedBranch?:string;
    onCommitSelect:(commit:ICommitInfo)=>void;
    selectedCommit?:ICommitInfo;
}

interface IState{
    pageIndex:number;
    pageSize:number;
    commits:ICommitInfo[];
    loading:boolean;
    total:number;
    refreshKey:string;
}

function CommitListComponent(props:IProps){

    const store = useSelectorTyped(state=>({
        repo:state.savedData.recentRepositories.find(_=>_.isSelected)?.path,
    }),shallowEqual);

    const [state,setState] = useMultiState<IState>({
        pageIndex:0,
        pageSize:500,
        commits:[],
        loading:true,
        total:0,
        refreshKey:new Date().toISOString(),
    });

    useEffect(()=>{
        const filterOptions:ILogFilterOptions = {
            pageIndex:state.pageIndex,
            pageSize:state.pageSize,            
        }
        if(props.searchText){
            filterOptions.message = props.searchText;
        }
        if(props.selectedBranch){
            filterOptions.branchName = props.selectedBranch;
        }
        
        IpcUtils.getCommitList(filterOptions).then(result=>{
            setState({commits:result.list.reverse(),total:result.count,loading:false});
        });
        
    },[state.pageIndex,state.pageSize,props.searchText,props.selectedBranch,state.refreshKey]);

    useEffect(()=>{
        RepoUtils.enSureUpdate(store.repo!).then((r)=>{
            setState({pageIndex:0,refreshKey:new Date().toISOString()});
        })
    },[store.repo])

    const handleSelect = useCallback((commit:ICommitInfo)=>{
        props.onCommitSelect(commit);
    },[props.onCommitSelect])

    return <Fragment>
        <div className="w-100 overflow-auto d-flex justify-content-center align-items-start" style={{height:'80%'}}>
            {state.loading && <div className="w-100 d-flex justify-content-center">
                <span>Loading...</span> 
            </div>
            }
            {!state.loading && <div className="w-100 px-2">
                {
                    state.commits.map(commit=>(
                        <SingleCommit key={commit.avrebHash} commit={commit} 
                            isSelected={props.selectedCommit?.hash === commit.hash} onSelect={handleSelect} />
                    ))
                }
            </div> }           
        </div>
        <div className="pt-2 d-flex justify-content-center align-items-start" style={{height:'10%'}}>
            <Paginator total={state.total} pageIndex={state.pageIndex} pageSize={state.pageSize}
                onPageChange={(pageIndex) => setState({pageIndex})} />
        </div>
    </Fragment>
}

export const CommitList = React.memo(CommitListComponent);