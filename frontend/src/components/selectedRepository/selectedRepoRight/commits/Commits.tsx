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


interface ISingleCommitProps{
    commit:ICommitInfo;
}

function SingleCommit(props:ISingleCommitProps){
    const getTimeZonOffsetStr = ()=>{
        return UiUtils.getTimeZonOffsetStr();
    }
    return <div className="py-1 w-100 overflow-auto">
     <div className="border border-primary ps-2">
        <div>
            <span>Sha: </span>
            <span>{props.commit.hash}</span>
            {!!props.commit.refs && 
             <b className="text-danger"> ({props.commit.refs})</b>}
        </div>
        <div>
            <span>Date: </span>
            <span title={getTimeZonOffsetStr()}>{moment(props.commit.date).format("MMMM Do YYYY, h:mm:ss a") }</span>
        </div>
        <div>
            <span>Author: </span>
            <span>{props.commit.author_name}({props.commit.author_email})</span>
        </div>
        <div>
            <span>Message: </span>
            <span>{props.commit.message}</span>
        </div>
    </div>
    </div>
}

interface IState{
    total:number;
    pageIndex:number;
    pageSize:number;
    commits:ICommitInfo[];
    loading:boolean;
    searchText:string;
    selectedBranch?:string;
    refreshKey:string;
}

function CommitsComponent(){
    const store = useSelectorTyped(state=>({
        repo:state.savedData.recentRepositories.find(_=>_.isSelected)?.path,
    }),shallowEqual);

    const [state,setState]=useMultiState<IState>({pageIndex:0,
        pageSize:500,
        total:0,
        commits:[],
        loading:true,
        searchText:"",
        refreshKey: new Date().toISOString(),
    });

    useEffect(()=>{
        const filterOptions:ILogFilterOptions = {
            pageIndex:state.pageIndex,
            pageSize:state.pageSize,            
        }
        if(state.searchText){
            filterOptions.message = state.searchText;
        }
        if(state.selectedBranch){
            filterOptions.branchName = state.selectedBranch;
        }
        
        IpcUtils.getCommitList(filterOptions).then(result=>{
            setState({commits:result.list.reverse(),total:result.count,loading:false});
        });
        
    },[state.pageIndex,state.pageSize,state.searchText,state.selectedBranch,state.refreshKey]);

    useEffect(()=>{
        RepoUtils.enSureUpdate(store.repo!).then((r)=>{
            setState({pageIndex:0,refreshKey:new Date().toISOString()});
        })
    },[store.repo])

    const handleSearch = (text:string)=>{
        setState({searchText:text});
    }

    return <div className="h-100 w-100">
        <div className="w-100" style={{height:'10%'}}>
            <CommitFilter onSearch={handleSearch} onBranchSelect={br=>setState({selectedBranch:br})} />
        </div>
        <CommitList commits={state.commits}  loading={state.loading} onPageChange={(pageIndex)=> setState({pageIndex})}
        pageIndex={state.pageIndex} pageSize={state.pageSize} total={state.total} />        
        
    </div>
}

export const Commits = React.memo(CommitsComponent);