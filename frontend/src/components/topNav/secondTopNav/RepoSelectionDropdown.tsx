import { RepositoryInfo } from "common_library";
import React from "react"
import { Dropdown } from "react-bootstrap";
import { shallowEqual, useDispatch } from "react-redux";
import { useSelectorTyped } from "../../../store/rootReducer";
import { ActionSavedData } from "../../../store/slices";

function RepoSelectionDropdownComponent(){
    const store = useSelectorTyped(state=>({
        recentRepos:state.savedData.recentRepositories,
    }),shallowEqual);
    const dispatch = useDispatch();

    const handleSelect=(repo:RepositoryInfo)=>{
        dispatch(ActionSavedData.setSelectedRepository(repo));
    }

    return <div className="">
        <Dropdown className="">
            <Dropdown.Toggle id="dropdown-reposelection" className="rounded-0 default-button hover-brighter">
                {store.recentRepos.find(x=>x.isSelected)?.name || ""}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {store.recentRepos.map(rp=>(
                    <Dropdown.Item key={rp._id} onClick={()=> handleSelect(rp)}>{rp.name}</Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    </div>
}

export const RepoSelectionDropdown = React.memo(RepoSelectionDropdownComponent)