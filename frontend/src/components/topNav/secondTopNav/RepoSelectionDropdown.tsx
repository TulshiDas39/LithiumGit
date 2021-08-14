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

    return <div>
        <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-reposelection">
                {store.recentRepos.find(x=>x.isSelected)?.name || ""}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {store.recentRepos.map(rp=>(
                    <Dropdown.Item onClick={()=> handleSelect(rp)}>{rp.name}</Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    </div>
}

export const RepoSelectionDropdown = React.memo(RepoSelectionDropdownComponent)