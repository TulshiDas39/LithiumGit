import React, { useEffect, useRef } from "react"
import { Form } from "react-bootstrap";
import { useMultiState } from "../../../../lib";

interface IState{
    value:string;
}

function CommitBoxComponent(){
    const [state,setState]= useMultiState({value:""} as IState);
    const inputRef = useRef<HTMLInputElement>();
    const refData = useRef({rows:1,cols:0});

    useEffect(()=>{
        if(!inputRef.current) return;
        const width = inputRef.current.getBoundingClientRect().width;
        const fontSize = Number(inputRef.current.style.fontSize);
        const cols = Math.floor(width/fontSize);
        if(refData.current.cols !== cols){
            inputRef.current.setAttribute("cols",`${cols}`);
            refData.current.cols = cols;
        }
        const neededCols = Math.floor(state.value.length/fontSize);
        if(neededCols > cols){
            refData.current.rows++;
            inputRef.current.setAttribute("rows",`${refData.current.rows}`);            
        }

    },[state.value,inputRef.current]);

    return <div className="w-100">
        <Form.Control ref={inputRef as any} onChange={e=> setState({value:e.target.value})} onKeyUp={e=> {if (e.key === 'Enter' ) e.preventDefault(); }}        
            type="textarea" className="w-100 rounded-0" />
    </div>
}

export const CommitBox = React.memo(CommitBoxComponent);