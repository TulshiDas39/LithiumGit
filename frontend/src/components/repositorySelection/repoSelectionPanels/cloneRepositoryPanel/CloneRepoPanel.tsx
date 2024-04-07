import React from "react"
import { Form } from "react-bootstrap";
import { AppButton } from "../../../common";

function CloneRepoPanelRepository(){
    return <div>
        <div className="text-center">
            <h2>Clone Repository</h2>
        </div>
        <div className="row g-0">
            <div className="col-2 d-flex align-items-center justify-content-end">                
                <span>URL: </span>
            </div>
            <div className="col-8">
                <Form.Control type="text" />
            </div>            
        </div>

        <div className="row g-0 pt-2">
            <div className="col-2 d-flex align-items-center justify-content-end">                
                <span>Directory Path: </span>
            </div>
            <div className="col-8">
                <Form.Control type="text" />
            </div>            
        </div>

        <div className="d-flex justify-content-center pt-3">
              <AppButton text="Clone Repository" type="default" />
        </div>
    </div>
}

export const CloneRepoPanel = React.memo(CloneRepoPanelRepository);