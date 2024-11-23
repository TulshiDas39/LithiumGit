import React, { Fragment, useMemo } from "react";
import { ModalData } from "../ModalData";
import { useSelectorTyped } from "../../../store/rootReducer";
import { EnumModals, GraphUtils, ReduxUtils, RepoUtils } from "../../../lib";
import { shallowEqual } from "react-redux";
import { ContextData, IBaseProps, Option } from "./ContextData";
import { IpcUtils } from "../../../lib/utils/IpcUtils";
import { GitUtils } from "../../../lib/utils/GitUtils";

interface IProps extends IBaseProps{
    mouseOver?: Option;
    referredLocalBranches:string[];
}

function CheckoutComponent(props:IProps){

    const store = useSelectorTyped((state)=>({
        show:state.modal.openedModals.includes(EnumModals.COMMIT_CONTEXT),
        repo:state.savedData.recentRepositories.find(x=>x.isSelected),
    }),shallowEqual);

    const Data = ModalData.commitContextModal;

    const branchNamesForCheckout = useMemo(()=>{
        if(!store.show || !Data.selectedCommit?.refValues.length)
            return [];
        const branches = props.referredLocalBranches.slice();
        for(let ref of Data.selectedCommit.refValues){
            if(!RepoUtils.isOriginBranch(ref) || RepoUtils.hasLocalBranch(ref))
                continue;
            const localBranch = RepoUtils.getLocalBranch(ref);
            if(localBranch)
                branches.push(localBranch);
        }
        return branches;
    },[props.referredLocalBranches,store.show,Data.selectedCommit])

    const checkOutCommit=(destination:string)=>{
        const options:string[]=[destination];
        IpcUtils.checkout(options).then((r)=>{
            if(!r.error){
                IpcUtils.getRepoStatusSync().then(status=>{                    
                    GraphUtils.handleCheckout(Data.selectedCommit,status);
                    ReduxUtils.setStatus(status);
                })
            }            
        });
        props.hideModal();
    }

    return (
        <Fragment>
{
                        branchNamesForCheckout.length > 0 && <div>
                            <div className={`row g-0 border-bottom ${ContextData.optionClasses}`}>
                                {
                                    branchNamesForCheckout.length > 1 ? <div className="col-12 cur-default position-relative">
                                        <div className="d-flex hover" onMouseEnter={()=> props.onMouseHover(Option.Checkout)}>
                                            <span className="flex-grow-1">Checkout branch</span>
                                            <span>&gt;</span>
                                        </div>
                                        
                                        {(props.mouseOver === Option.Checkout) && <div className="position-absolute border bg-white" style={{left:'100%',top:0}}>
                                            {
                                                branchNamesForCheckout.map((br=>(
                                                    <div key={br} className="border-bottom py-1 px-3">
                                                        <span className="hover" onClick={() => checkOutCommit(br)}>{br}</span>
                                                    </div>
                                                )))
                                            }
                                        </div>}
                                    </div>:
                                    <div className="col-12 hover cur-default " onClick={() => checkOutCommit(branchNamesForCheckout[0])}>Checkout branch '{branchNamesForCheckout[0]}'</div>
                                }                                
                            </div>
                        </div>
                    }

                    <div className={`row g-0 ${ContextData.optionClasses}`} onMouseEnter={()=> props.onMouseHover(null!)}>
                        <div className="col-12 hover cur-default " onClick={()=>checkOutCommit(Data.selectedCommit.hash)}>Checkout this commit</div> 
                    </div>
        </Fragment>
    )
}

export const Checkout = React.memo(CheckoutComponent);