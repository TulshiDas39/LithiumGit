import { Form } from "react-bootstrap";
import { AppButton } from "../../../common";
import React from "react";

interface IProps{
    text:string;
    onContinue:()=>void;
    onSkip:()=>void;
    onAbort:()=>void;
    label:string;
}

function ContinueBoxComponent(props:IProps){
    return (
        <div className="w-100 pb-2 d-flex flex-column" style={{height:116}}>
            <div className="">
                <Form.Control as="textarea" rows={2} value={props.text} onChange={_ => {}} onKeyUp={e=> {if (e.key === 'Enter' ) e.preventDefault(); }}        
                    type="textarea" className="w-100 h-100 rounded-0 no-resize bg-color" placeholder="Commit message" />
            </div>
            <div className="w-100 overflow-auto">
                <div className="d-flex pt-1 px-1 align-items-center justify-content-around flex-nowrap">
                    <div className="">
                        <AppButton type="text" onClick={()=>props.onContinue()} className="h-100 py-2 underline">                                    
                            <span className="">Continue</span>                    
                        </AppButton>
                    </div>
                    <div className="px-1">
                        <AppButton type="text" onClick={props.onSkip} className="h-100 py-2 underline"
                        style={{paddingRight:5,paddingLeft:5}}>                                    
                            <span className="">Skip</span>                    
                        </AppButton>
                    </div>
                    <div>
                        <AppButton type="text" onClick={props.onAbort} className="h-100 py-2 underline"
                        style={{paddingRight:5,paddingLeft:5}}>                                    
                            <span className="">Abort</span>                    
                        </AppButton> 
                    </div>
                                
                </div>
                <div className="text-center small">
                    <span className="small">
                        {props.label}
                    </span>
                </div>
            </div>
    </div>
    )
}

export const ContinueBox = React.memo(ContinueBoxComponent);