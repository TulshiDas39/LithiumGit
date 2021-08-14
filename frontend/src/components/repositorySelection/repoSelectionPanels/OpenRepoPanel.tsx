import React from "react";
import { Button, Form } from "react-bootstrap";

function OpenRepoPanelComponent(){
    return <div className="d-flex flex-column align-items-center py-2">
        <div className="d-flex justify-content-center w-75">
            <Form.Control placeholder="Enter path"></Form.Control>
            <span className="px-1"/>
            <Button>Open</Button>
        </div>
        <span>or</span>
        <div>
            <Button>Browse</Button>
        </div>
    </div>
}

export const OpenRepoPanel = React.memo(OpenRepoPanelComponent);