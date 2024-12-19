import React, { Fragment, useMemo, useRef } from "react"
import { FaRegBell } from "react-icons/fa";
import { AppButton, BellWithDot } from "../../common";
import { Overlay } from "react-bootstrap";
import { useMultiState } from "../../../lib";
import { SingleNotification } from "./SingleNotification";
import { useSelectorTyped } from "../../../store/rootReducer";
import { shallowEqual } from "react-redux";

interface IState{
    show:boolean;
}
function NotificationsComponent(){
    const store = useSelectorTyped(state=>({
        notifications:state.ui.notifications,        
    }),shallowEqual);

    const [state, setState] = useMultiState<IState>({show:false});
    const target = useRef<HTMLElement>(null!);
    const bottomHeight = useMemo(()=>{
        return !!store.notifications.length ? 50:0;
    },[store.notifications.length])

    return <div className="ps-1 pe-2">
            <span title="Notifications" ref={target as any} className="d-flex align-items-center" 
                onClick={() => setState({show:!state.show})}>
                {true? <FaRegBell />: <BellWithDot /> }
            </span>
            <Overlay target={target.current} show={state.show} placement="top-end"
                rootClose={true} rootCloseEvent="click" onHide={() => setState({show:false})}>
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
                    width:450,
                    ...props.style,
                    }}
                >                    
                    <div className="py-2 overflow-auto" style={{maxHeight:`calc(95vh - ${bottomHeight}px)`}}>
                        {!store.notifications.length && <span>No new notifications</span>}
                        {store.notifications.map(n=>(
                            <div className="py-1" key={n._id}>
                                <SingleNotification data={n}  />
                            </div>
                        ))}                                                                      
                    </div>
                    {!!store.notifications.length && <div className="d-flex align-items-center justify-content-end" style={{height:bottomHeight}}>
                        <AppButton>Clear all</AppButton>
                    </div>}
                    
                </div>
                )}
        </Overlay>
        </div>
    
}

export const Notifications = React.memo(NotificationsComponent);