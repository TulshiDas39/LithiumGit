import React, { Fragment } from "react";
import { CommitContextModal } from "./CommitContextModal";

function ModalsComponent(){
    return(
        <Fragment>
            <CommitContextModal />
        </Fragment>
    )
}

export const Modals = React.memo(ModalsComponent);