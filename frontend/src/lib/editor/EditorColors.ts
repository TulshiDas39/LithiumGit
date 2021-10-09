interface ILineHighlight{
    forgound:string;
    background:string;
}
export interface IEditorLineColor{
    previous:ILineHighlight;
    current:ILineHighlight;
}

export class EditorColors{
    // static previousChangeBackground="#4B1818";
    // static previousChangeForground="#751A1A";
    // static currentChangeBackground="#373D29";
    // static currentChangeForground="#515C38";

    static line:IEditorLineColor={
        previous:{
            forgound:"#FFA3A3",
            background:"#FFCCCC"
        },
        current:{
            forgound:"#DBE6C2",
            background:"#EBF1DD"
        }
    }    

    static noLine = "white";


}