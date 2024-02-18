import React from "react"
import { useSelectorTyped } from "../../../../store/rootReducer";
import { shallowEqual } from "react-redux";
import { AddRemote } from "./AddRemote";

function RemoteListComponent(){
    const store = useSelectorTyped(state=>({
        remotes:state.ui.remotes,
    }),shallowEqual);

    return <div className="w-100 p-1">
        <div>
            <AddRemote />
        </div>
        {
            store.remotes.map(r=>(
                <div key={r.url+r.name} className="border w-100">
                    <div className="d-flex">
                        <b className="">{r.name}</b>
                    </div>
                    <div>
                        <span>{r.url}</span>
                    </div>
                </div>
            ))
        }
    </div>
}

export const RemoteList = React.memo(RemoteListComponent);