import React, { useEffect, useMemo, useRef } from "react"
import { FaBuffer } from "react-icons/fa";
import { EnumModals, GraphUtils, useMultiState } from "../../../../lib";
import { Overlay } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { AppButton } from "../../../common";
import { ModalData } from "../../../modals/ModalData";
import { useDispatch } from "react-redux";
import { ActionModals } from "../../../../store";
import { ActionUI } from "../../../../store/slices/UiSlice";
import { ICommitFilter } from "common_library";

interface IState{
    show:boolean;
    fromDate?:string;
    toDate?:string;
    at?:string;
    commitCount?:string;
}

function GraphFilterComponent(){
    const [state,setState] = useMultiState<IState>({show:false,commitCount:""});
    const target = useRef<HTMLElement>(null!);
    const dispatch = useDispatch();
    useEffect(()=>{
        const onFilterChange = (filter:ICommitFilter)=>{
            const commitCount = filter.limit ? filter.limit+"":"";
            setState({at:filter.baseDate,commitCount,fromDate:filter.fromDate,toDate:filter.toDate});
        }
        GraphUtils.state.filter.subscribe(onFilterChange);

        return ()=>{
            GraphUtils.state.filter.unSubscribe(onFilterChange);
        }
    },[])

    const isValid = useMemo(()=>{
        if(state.fromDate && state.toDate){
            if(state.fromDate > state.toDate)
                return false;
            return true;
        }
        if(state.at && state.commitCount)
            return true;
        return false;
    },[state.at,state.commitCount,state.fromDate,state.toDate])

    const handleApply = ()=>{
        if(!isValid){
            ModalData.errorModal.message = "Invalid filter data";
            dispatch(ActionModals.showModal(EnumModals.ERROR));
            return;
        }
        if(state.fromDate && state.toDate){
            GraphUtils.state.filter.publish({userModified:true,fromDate:state.fromDate,toDate:state.toDate});
        }
        if(state.at && state.commitCount){
            GraphUtils.state.filter.publish({userModified:true,baseDate:state.at,limit: Number(state.commitCount)});
        }

    }



    return <div className="bg-color">
        <span ref={target} onClick={() => setState({show:!state.show})}>
            <FaBuffer />
        </span>
        <Overlay target={target.current} show={state.show} placement="bottom"
            rootClose={true} rootCloseEvent="click" onHide={() => setState({show:!state.show})}>
        {({
          placement: _placement,
          arrowProps: _arrowProps,
          show: _show,
          popper: _popper,
          hasDoneInitialMeasure: _hasDoneInitialMeasure,
          ...props
        }) => (
          <div
            {...props}
            className="bg-color border"
            style={{
              position: 'absolute',
              padding: '2px 10px',
              borderRadius: 3,              
              ...props.style,
            }}
          >
            <div className="pt-3">
                <div className="d-flex align-items-center justify-content-center">
                    <div className="d-flex align-items-center">
                        <span>From:</span>
                        <DatePicker selected={state.fromDate? new Date(state.fromDate):null} onChange={(date) => setState({fromDate:date?.toISOString()})} />
                    </div>
                    <div className="ps-2 d-flex align-items-center">
                        <span>To:</span>
                        <DatePicker selected={state.toDate? new Date(state.toDate):null} onChange={(date) => setState({toDate:date?.toISOString()})} />
                    </div>
                </div>
                <div className="text-center py-2">or</div>
                <div className="d-flex align-items-center justify-content-center">
                    <div className="d-flex align-items-center">
                        <span>At:</span>
                        <DatePicker selected={state.at? new Date(state.at):null} onChange={(date) => setState({at:date?.toISOString()})} />
                    </div>
                    <div className="px-2" />
                    <div className="d-flex align-items-center">
                        <span>Commit count:</span>
                        <input type="number" value={state.commitCount} onChange={e=>setState({commitCount:e.target.value})} />
                    </div>
                </div>
                <div className="row g-0 py-3">
                    <div className="col-4"></div>
                    <div className="col-4 d-flex justify-content-center">
                        <AppButton className="" onClick={()=>handleApply()}>Apply</AppButton>
                        <span className="px-2" />
                        <AppButton className="">Reset</AppButton>
                    </div>
                    <div className="col-4"></div>                    
                </div>
            </div>
            
          </div>
        )}
      </Overlay>
    </div>
}

export const GraphFilter = React.memo(GraphFilterComponent);