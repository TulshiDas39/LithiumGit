import React, { useRef } from "react"
import { FaBuffer } from "react-icons/fa";
import { useMultiState } from "../../../../lib";
import { Overlay } from "react-bootstrap";
import DatePicker from "react-datepicker";

interface IState{
    show:boolean;
    selectedDate?:string;
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
            <div className="d-flex align-items-center">
                <div className="d-flex align-items-center">
                    <span>From:</span>
                    <DatePicker selected={state.selectedDate? new Date(state.selectedDate):null} onChange={(date) => setState({selectedDate:date?.toISOString()})} />
                </div>
                <div className="d-flex align-items-center">
                    <span>To:</span>
                    <DatePicker selected={state.selectedDate? new Date(state.selectedDate):null} onChange={(date) => setState({selectedDate:date?.toISOString()})} />
                </div>
            </div>
          </div>
        )}
      </Overlay>
    </div>
}

export const GraphFilter = React.memo(GraphFilterComponent);