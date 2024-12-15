import React, { useEffect, useMemo, useRef } from "react"
import { FaBuffer } from "react-icons/fa";
import { GraphUtils, useMultiState } from "../../../../lib";
import { Overlay } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { AppButton } from "../../../common";
import { ModalData } from "../../../modals/ModalData";
import { useDispatch } from "react-redux";
import { ActionModals } from "../../../../store";
import { ICommitFilter } from "common_library";

interface IState{
    show:boolean;
    fromDate?:string;
    toDate?:string;
    at?:string;
    commitCount?:string;
    isModified?:boolean;
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

    useEffect(()=>{
        if(!state.show){
            const filter = GraphUtils.state.filter.value;
            setState({at:filter.baseDate,
                commitCount:filter.limit?filter.limit+"":"",
                fromDate:filter.fromDate,
                toDate:filter.toDate,
                isModified:!!filter.userModified,
            });
        }
    },[state.show])

    const isValid = useMemo(()=>{
        if(state.fromDate && state.toDate){       
            if(state.fromDate > state.toDate)
                return false;
        }
        if(!state.fromDate && !state.toDate && !state.at)
            return false;
        return true;
    },[state.at,state.commitCount,state.fromDate,state.toDate])

    const handleFromDateChange=(date:Date | null)=>{
        setState({fromDate:date?.toISOString(),at:null!});
    }
    const handleToDateChange=(date:Date | null)=>{
        setState({toDate:date?.toISOString(),at:null!});
    }

    const handleBaseDateChange=(date:Date | null)=>{
        setState({at :date?.toISOString(),fromDate:null!,toDate:null!});
    }

    const handleCommitCountChange=(value:string | null)=>{
        setState({commitCount: value ?? ""});
    }

    const handleApply = ()=>{
        if(!isValid){
            ModalData.appToast.message = "Invalid filter data";
            ModalData.appToast.customClass = "bg-danger";
            dispatch(ActionModals.showToast());
            return;
        }
        const maxLimit = 2000;
        let limit:number | undefined = undefined;
        if(!state.commitCount){
            if(state.at){
                limit = GraphUtils.defaultLimit;
            }else {
                limit = maxLimit;
            }
        }else{
            limit = Number(state.commitCount);
        }

        GraphUtils.state.filter.publish({
            userModified:true,
            fromDate:state.fromDate,
            toDate:state.toDate,
            baseDate:state.at,
            limit
        });
        
        setState({show:false});
    }

    const handleReset=()=>{
        GraphUtils.state.filter.reset();
        setState({show:false});
    }



    return <div className="bg-color">
        <span title="Filter" ref={target} onClick={() => setState({show:!state.show})}>
            <FaBuffer />
            {!!state.isModified && <span className="star">*</span>}
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
                        <DatePicker yearDropdownItemNumber={15} showYearDropdown
                            scrollableYearDropdown selected={state.fromDate? new Date(state.fromDate):null} onChange={(date) => handleFromDateChange(date)}
                            placeholderText="mm/dd/yyyy" />
                    </div>
                    <div className="ps-2 d-flex align-items-center">
                        <span>To:</span>
                        <DatePicker yearDropdownItemNumber={15} showYearDropdown
                            scrollableYearDropdown selected={state.toDate? new Date(state.toDate):null} onChange={(date) => handleToDateChange(date)}
                            placeholderText="mm/dd/yyyy" />
                    </div>
                </div>
                <div className="text-center py-2">or</div>
                <div className="d-flex align-items-center justify-content-center">
                    <div className="d-flex align-items-center">
                        <span className="text-nowrap">Surroundings At:</span>
                        <DatePicker yearDropdownItemNumber={15} showYearDropdown
                            scrollableYearDropdown selected={state.at? new Date(state.at):null} onChange={(date) => handleBaseDateChange(date)}
                            placeholderText="mm/dd/yyyy" />
                    </div>
                </div>
                <hr />
                <div className="d-flex align-items-center justify-content-center">
                    <div className="d-flex align-items-center">
                        <span>Commit count:</span>
                        <input type="number" value={state.commitCount} onChange={e=> handleCommitCountChange(e.target.value)} />
                    </div>
                </div>
                <div className="row g-0 py-3">
                    <div className="col-4"></div>
                    <div className="col-4 d-flex justify-content-center">
                        <AppButton className="" onClick={()=>handleApply()}>Apply</AppButton>
                        <span className="px-2" />
                        <AppButton className="" onClick={()=>handleReset()}>Reset</AppButton>
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