import React from "react";
import { Button, Form } from "react-bootstrap";

function OpenRepoPanelComponent(){
    return <div className="d-flex flex-column">
        <div className="d-flex">
            <Form.Control placeholder="Enter path or browse"></Form.Control>
            <Button>Open</Button>
        </div>
    </div>
}

export const OpenRepoPanel = React.memo(OpenRepoPanelComponent);