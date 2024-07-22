import React, { Fragment } from "react";
import { SingleCommit } from "./SingleCommit";
import { ICommitInfo } from "common_library";
import { Paginator } from "../../../common";

interface IProps{
    loading:boolean;
    commits:ICommitInfo[];
    total:number;
    pageIndex:number;
    pageSize:number;
    onPageChange:(pageIndex:number)=>void;
}

function CommitListComponent(props:IProps){
    return <Fragment>
        <div className="w-100 overflow-auto d-flex justify-content-center align-items-start" style={{height:'80%'}}>
            {props.loading && <div className="w-100 d-flex justify-content-center">
                <span>Loading...</span> 
            </div>
            }
            {!props.loading && <div className="w-100 px-2">
                {
                    props.commits.map(commit=>(
                        <SingleCommit key={commit.avrebHash} commit={commit} />
                    ))
                }
            </div> }           
        </div>
        <div className="pt-2 d-flex justify-content-center align-items-start" style={{height:'10%'}}>
            <Paginator total={props.total} pageIndex={props.pageIndex} pageSize={props.pageSize}
                onPageChange={(pageIndex) => props.onPageChange(pageIndex)} />
        </div>
    </Fragment>
}

export const CommitList = React.memo(CommitListComponent);