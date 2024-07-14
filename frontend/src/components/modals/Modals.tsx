import React, { Fragment } from "react";
import { CommitContextModal } from "./CommitContextModal";
import { CreateBranchModal } from "./CreateBranchModal";
import { ErrorModal } from "./ErrorModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { PushToModal } from "./PushToModal";
import { PullFromModal } from "./PullFromModal";
import { CheckoutBranchModal } from "./CheckoutBranchModal";
import { AppToast } from "./AppToast";

function ModalsComponent(){
    return(
        <Fragment>
            <CommitContextModal />
            <CreateBranchModal />
            <ErrorModal />
            <ConfirmationModal />
            <PushToModal />
            <PullFromModal />
            <CheckoutBranchModal />
            <AppToast />
        </Fragment>
    )
}

export const Modals = React.memo(ModalsComponent);