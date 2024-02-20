import React, { useMemo } from "react"
import { BranchUtils, ICommitFlatInfo, ObjectUtils, useMultiState } from "../../../../lib";
import moment from "moment";
import { Paginator } from "../../../common";


interface ISingleCommitProps{
    commit:ICommitFlatInfo;
}

function SingleCommit(props:ISingleCommitProps){
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
            <span>{moment(props.commit.date).format("MMMM Do YYYY, h:mm:ss a") }</span>
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
    pageSize:number
}

function CommitsComponent(){
    const [state,setState]=useMultiState<IState>({pageIndex:0,
        pageSize:500,
        total:BranchUtils.repositoryDetails.allCommits.length
    });

    const commitList = useMemo(()=>{
        const startIndex = state.pageIndex*state.pageSize;
        const list = BranchUtils.repositoryDetails.allCommits.slice().reverse().slice(startIndex,startIndex+state.pageSize);
        const objUtils = new ObjectUtils();
        const flatList = list.map(c => objUtils.mapToFlatObject(c));
        return flatList;
    },[state.pageIndex,state.pageSize])

    const paginateToLast=()=>{
        const index = Math.floor(state.total/state.pageSize);
        setState({pageIndex:index});        
    }

    return <div className="h-100 w-100">
        <div className="w-100" style={{height:'10%'}}>

        </div>
        <div className="w-100 overflow-auto d-flex justify-content-center align-items-start" style={{height:'80%'}}>
            <div className="w-100 px-2">
                {
                    commitList.map(commit=>(
                        <SingleCommit key={commit.avrebHash} commit={commit} />
                    ))
                }
            </div>            
        </div>
        <div className="pt-2 d-flex justify-content-center align-items-start" style={{height:'10%'}}>
            <Paginator total={state.total} pageIndex={state.pageIndex} pageSize={state.pageSize}
                onPageChange={(pageIndex) => setState({pageIndex})} />
        </div>
        
    </div>
}

export const Commits = React.memo(CommitsComponent);