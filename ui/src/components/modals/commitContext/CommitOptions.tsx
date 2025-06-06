import React, { Fragment } from "react";
import { Checkout } from "./Checkout";
import { Option } from "./ContextData";
import { CreateBranch } from "./CreateBranch";
import { MergeBranch } from "./MergeBranch";
import { RebaseBranch } from "./RebaseBranch";
import { CherryPick } from "./CherryPick";
import { ShowMore } from "./ShowMore";
import { MoreOptions } from "./MoreOptions";
import { RevertCommit } from "./RevertCommit";

interface IProps{
    hideModal:()=>void;
    mouseOver?:Option;
    onMouseHover:(o:Option)=>void;
    referredLocalBranches:string[];
    showMore:boolean;
    moreOptionList:Option[];
    onShowMore:()=>void;
}

function CommitOptionsComponent(props:IProps){
    return <Fragment>
                <Checkout hideModal={()=>props.hideModal()} mouseOver={props.mouseOver} onMouseHover={(op) => props.onMouseHover(op)}
                    referredLocalBranches={props.referredLocalBranches} />
                <CreateBranch hideModal={() => props.hideModal()} onMouseHover={(o)=> props.onMouseHover(o)} />
                <MergeBranch hideModal={()=> props.hideModal()} onMouseHover={(op) =>props.onMouseHover(op)} referredLocalBranches={props.referredLocalBranches} mouseOver={props.mouseOver} />
                <RebaseBranch hideModal={()=> props.hideModal()} onMouseHover={(op) =>props.onMouseHover(op)} referredLocalBranches={props.referredLocalBranches} mouseOver={props.mouseOver} />
                <CherryPick hideModal={()=> props.hideModal()} onMouseHover={(op) => props.onMouseHover(op)} />
                <RevertCommit hideModal={()=> props.hideModal()} onMouseHover={(op) => props.onMouseHover(op)} />
                {!!props.moreOptionList.length && !props.showMore && <ShowMore onClick={()=> props.onShowMore()} hideModal={()=>props.hideModal()} onMouseHover={(o)=> props.onMouseHover(o)} />}
                {props.showMore && <MoreOptions hideModal={()=> props.hideModal()} moreOptionList={props.moreOptionList} onMouseHover={(o) => props.onMouseHover(o)} mouseOver={props.mouseOver} referredLocalBranches={props.referredLocalBranches}
                    showMore={props.showMore} />} 
    </Fragment>
}

export const CommitOptions = React.memo(CommitOptionsComponent);