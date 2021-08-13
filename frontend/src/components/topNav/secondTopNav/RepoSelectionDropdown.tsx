import { Constants } from "common_library"
import React from "react"
import { Dropdown } from "react-bootstrap";

function RepoSelectionDropdownComponent(){
    const selectedDropDown = Constants.recentRepositories[0];
    return <div>
        <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-reposelection">
                {selectedDropDown.name}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {Constants.recentRepositories.map(rp=>(
                    <Dropdown.Item>{rp.name}</Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    </div>
}

export const RepoSelectionDropdown = React.memo(RepoSelectionDropdownComponent)