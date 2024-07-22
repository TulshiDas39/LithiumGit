import React, { useMemo } from "react"
import { EnumConfigTab } from "../../../../lib";
import { ActionUI } from "../../../../store/slices/UiSlice";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual, useDispatch } from "react-redux";

interface IConfigMenu{
    type:EnumConfigTab;
    text:string;
    marked?:boolean;
    className?:string;
    innerHtml?:JSX.Element;
    title?:string;
}

function ConfigLeftComponent(){
    const store = useSelectorTyped(state=>({
        tab:state.ui.configTab,
    }),shallowEqual);
    const dispatch = useDispatch();
    const menus = useMemo(()=>{
        const items:IConfigMenu[]=[
            {text:"User",type:EnumConfigTab.USER},
            {text:"Remotes",type:EnumConfigTab.REMOTES},                                
        ];
        return items;
    },[])
    return <div className="d-flex flex-column" style={{width:`100px`}} >
            {menus.map((t)=>(
                <div key={t.type} title={t.title || ""}
                className={`tabItem w-100 py-2 hover ps-1 border-bottom 
                    ${t.className ? t.className:""} ${store.tab === t.type?"bg-select-color":""}`}
                onClick={()=> dispatch(ActionUI.setConfigTab(t.type))}>
                    <span className="">{t.text}</span>
                    {!!t.innerHtml && t.innerHtml}
                    {!!t.marked && <span className="text-primary">*</span>}
            </div>
            ))}
    </div>
}

export const ConfigLeft = React.memo(ConfigLeftComponent);