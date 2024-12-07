import React, { useRef } from "react"
import { FaBuffer } from "react-icons/fa";
import { useMultiState } from "../../../../lib";
import { Overlay } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { AppButton } from "../../../common";

interface IState{
    show:boolean;
    fromDate?:string;
    toDate?:string;
}

function GraphFilterComponent(){
    const [state,setState] = useMultiState<IState>({show:false});
    const target = useRef<HTMLElement>(null!);
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
                <div className="d-flex align-items-center">
                    <div className="d-flex align-items-center">
                        <span>From:</span>
                        <DatePicker selected={state.fromDate? new Date(state.fromDate):null} onChange={(date) => setState({fromDate:date?.toISOString()})} />
                    </div>
                    <div className="ps-2 d-flex align-items-center">
                        <span>To:</span>
                        <DatePicker selected={state.toDate? new Date(state.toDate):null} onChange={(date) => setState({toDate:date?.toISOString()})} />
                    </div>
                </div>
                <div className="row g-0 py-2">
                    <div className="col-4"></div>
                    <div className="col-4 d-flex justify-content-center">
                        <AppButton className="">Apply</AppButton>
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