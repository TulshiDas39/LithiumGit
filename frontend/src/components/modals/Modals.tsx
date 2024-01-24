import React, { Fragment } from "react";
import { CommitContextModal } from "./CommitContextModal";
import { CreateBranchModal } from "./CreateBranchModal";
import { ErrorModal } from "./ErrorModal";
import { ConfirmationModal } from "./ConfirmationModal";

function ModalsComponent(){
    return(
        <Fragment>
            <CommitContextModal />
            <CreateBranchModal />
            <ErrorModal />
            <ConfirmationModal />
        </Fragment>
    )
}

export const Modals = React.memo(ModalsComponent);