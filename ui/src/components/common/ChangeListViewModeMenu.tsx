import React from "react";
import { useDispatch } from "react-redux";
import { Dropdown } from "react-bootstrap";
import { EnumChangeListViewMode } from "common_library";
import { FaCheck, FaListUl } from "react-icons/fa";
import { useSelectorTyped } from "../../store/rootReducer";
import { ActionSavedData } from "../../store";

const OPTIONS:{mode:EnumChangeListViewMode,label:string}[] = [
    {mode:EnumChangeListViewMode.Tree,label:"View as Tree"},
    {mode:EnumChangeListViewMode.List,label:"View as List"},
    {mode:EnumChangeListViewMode.CombinedList,label:"View as Combined List"},
];

function ChangeListViewModeMenuComponent(){
    const viewMode = useSelectorTyped(state=>state.savedData.configInfo.changeListViewMode);
    const dispatch = useDispatch();

    return <Dropdown>
        <Dropdown.Toggle variant="link" id="change-list-view-mode" title="View mode" className="rounded-0 no-caret">
            <FaListUl />
        </Dropdown.Toggle>
        <Dropdown.Menu className="no-radius">
            {OPTIONS.map(opt=>(
                <Dropdown.Item key={opt.mode} onClick={()=> dispatch(ActionSavedData.setChangeListViewMode(opt.mode))}>
                    <span style={{width:16,display:'inline-block'}}>{viewMode === opt.mode && <FaCheck />}</span>
                    <span className="ps-1">{opt.label}</span>
                </Dropdown.Item>
            ))}
        </Dropdown.Menu>
    </Dropdown>
}

export const ChangeListViewModeMenu = React.memo(ChangeListViewModeMenuComponent);
