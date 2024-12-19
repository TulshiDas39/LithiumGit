import React, { Fragment, useMemo, useRef } from "react"
import { FaRegBell } from "react-icons/fa";
import { AppButton, BellWithDot } from "../../common";
import { Overlay } from "react-bootstrap";
import { useMultiState } from "../../../lib";
import { SingleNotification } from "./SingleNotification";
import { useSelectorTyped } from "../../../store/rootReducer";
import { shallowEqual, useDispatch } from "react-redux";
import { IpcUtils } from "../../../lib/utils/IpcUtils";
import { ActionUI } from "../../../store/slices/UiSlice";

interface IState{
    show:boolean;
}
function NotificationsComponent(){
    const store = useSelectorTyped(state=>({
        notifications:state.ui.notifications,        
    }),shallowEqual);

    const dispatch = useDispatch();

    const [state, setState] = useMultiState<IState>({show:false});
    const target = useRef<HTMLElement>(null!);
    const bottomHeight = useMemo(()=>{
        return !!store.notifications.length ? 30:0;
    },[store.notifications.length])

    const activeNotifications = useMemo(()=>{
        return store.notifications.filter(_ => _.isActive);
    },[store.notifications]);

    const handleClear=()=>{
        IpcUtils.clearNotifications().then(r=>{
            if(!r.error){
                dispatch(ActionUI.increamentVersion("notifications"));
            }
        });
    }

    return <div className="ps-1 pe-2 position-relative">
            {!!activeNotifications.length && <div className="py-2 overflow-auto position-absolute" style={{width:450, maxHeight:`95vh`,bottom:'100%',right:'0px'}}>
                        {activeNotifications.map(n=>(
                            <div className="py-1" key={n._id}>
                                <SingleNotification data={n} showMinus={true}  />
                            </div>
                        ))}                                                                      
                    </div>}
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
                    {!!store.notifications.length && <div className="d-flex small align-items-end justify-content-end" style={{height:bottomHeight}}>
                        <AppButton onClick={handleClear}>Clear all</AppButton>
                    </div>}
                    
                </div>
                )}
        </Overlay>
        </div>
    
}

export const Notifications = React.memo(NotificationsComponent);