// import { Constants } from "common_library"
import React from "react"
import { Dropdown } from "react-bootstrap";
import { useSelectorTyped } from "../../../store/rootReducer";

function RepoSelectionDropdownComponent(){
    const store = useSelectorTyped(state=>({
        recentRepos:state.savedData.recentRepositories,
    }))
    // const selectedDropDown = Constants.recentRepositories[0];
    return <div>
        <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-reposelection">
                {"selectedDropDown.name"}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {store.recentRepos.map(rp=>(
                    <Dropdown.Item>{rp.name}</Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    </div>
}

export const RepoSelectionDropdown = React.memo(RepoSelectionDropdownComponent)