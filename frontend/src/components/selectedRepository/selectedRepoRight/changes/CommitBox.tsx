import React, {  } from "react"
import { Button, Form } from "react-bootstrap";
import { FaCheck } from "react-icons/fa";
import { useMultiState } from "../../../../lib";

interface IState{
    value:string;
    rows?:number;
}

function CommitBoxComponent(){
    const [state,setState]= useMultiState({value:"",cols:20} as IState);        

    return <div className="w-100">
            <Form.Control as="textarea" rows={2} onChange={e=> setState({value:e.target.value})} onKeyUp={e=> {if (e.key === 'Enter' ) e.preventDefault(); }}        
                type="textarea" className="w-100 rounded-0 no-resize" placeholder="Commit message" />
            <div className="row g-0 align-items-center pt-2 justify-content-center flex-nowrap overflow-hidden">  
                <div className="col-3 pe-1"></div>              
                <div className="col-6 d-flex bg-success cur-point overflow-hidden">
                    <div className="row g-0 align-items-center py-2 w-100">
                        <div className="col-4 text-end pe-2">
                            <FaCheck className="ps-2 h5 m-0"/>
                        </div>
                        <div className="col-8">
                            <span className="">Commit</span> 
                        </div>
                    </div>
                </div>
                <div className="col-3"></div>
            </div>
            <div className="row g-0 border-bottom pb-2 justify-content-center flex-nowrap overflow-hidden">
                <div className="col-auto ps-1">
                    <Form.Check id="auto_stage" />
                </div>
                <div className="col-auto ps-1">
                    <label htmlFor="auto_stage" className="small no-wrap">Automatically Stage all</label>
                </div>
            </div>
    </div>
}

export const CommitBox = React.memo(CommitBoxComponent);