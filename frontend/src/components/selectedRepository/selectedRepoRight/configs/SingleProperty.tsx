import React, { useEffect } from "react"
import { useMultiState } from "../../../../lib";
import { Form } from "react-bootstrap";
import { FaPencilAlt } from "react-icons/fa";
import { AppButton } from "../../../common";

interface IProps{
    name:string;
    value:string
    onUpdate:(value:string)=>void;
}

interface IState{
    editing:boolean;
    value:string;
}

function SinglePropertyComponent(props:IProps){
    const [state,setState] = useMultiState<IState>({editing:false,value:props.value});

    useEffect(()=>{
        setState({value:props.value});
    },[props.value]);

    const handleSave=()=>{
        setState({editing:false});
        props.onUpdate(state.value);
    }

    return <div className="d-flex align-items-center config-item">
            <span className="config-header">
                {props.name}:
            </span>
            <span className="config-value d-flex align-items-center">
                {!state.editing && <span className="flex-grow-1">{props.value}</span>}
                {state.editing &&
                    <div className="flex-grow-1">
                        <Form.Control type="text" value={state.value} onChange={e=> setState({value:e.target.value})} />
                    </div>                    
                }
                {!state.editing && <span className="hover" onClick={()=> setState({editing:true})}><FaPencilAlt /></span>}
                {state.editing && <div className="ps-3 pe-1 d-flex align-items-center">
                    <div className="pe-1">
                        <AppButton type="success" className="" onClick={()=> handleSave()}>Save</AppButton>
                    </div>
                    <div>
                        <AppButton type="danger" className="" onClick={()=> setState({editing:false})}>Cancel</AppButton>
                    </div>
                </div> }
            </span>
        </div>
}

export const SingleProperty = React.memo(SinglePropertyComponent);