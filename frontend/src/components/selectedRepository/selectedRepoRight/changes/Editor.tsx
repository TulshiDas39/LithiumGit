import React, { useState } from "react"
import { Descendant} from "slate";
import ReactQuill from "react-quill";

interface IEditorProps{
    document:Descendant[];
    onChange: (value: Descendant[]) => void;
}

function EditorComponent(props:IEditorProps){
  const [value, setValue] = useState(''); 
  return (
    <ReactQuill  theme="snow" value={value} onChange={setValue} 
      modules={{"toolbar":false}}
      />
  );      
}

export const Editor = React.memo(EditorComponent);