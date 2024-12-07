import React, { useRef } from "react"
import { FaBuffer } from "react-icons/fa";
import { useMultiState } from "../../../../lib";
import { Overlay } from "react-bootstrap";

interface IState{
    show:boolean;
}

function GraphFilterComponent(){
    const [state,setState] = useMultiState<IState>({show:false});
    const target = useRef<HTMLElement>(null!);
    return <div>
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
            className="border"
            style={{
              position: 'absolute',
              padding: '2px 10px',
              borderRadius: 3,              
              ...props.style,
            }}
          >
            Simple tooltip
          </div>
        )}
      </Overlay>
    </div>
}

export const GraphFilter = React.memo(GraphFilterComponent);