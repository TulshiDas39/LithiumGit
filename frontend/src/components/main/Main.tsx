import React from "react";
import { RepositorySelection } from "../repositorySelection";

function MainComponent(){
    return <div>
        <RepositorySelection />
    </div>
}

export const Main = React.memo(MainComponent);