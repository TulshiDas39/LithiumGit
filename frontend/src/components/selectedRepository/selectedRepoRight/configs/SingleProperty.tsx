import React from "react"

interface IProps{
    name:string;
    value:string
}

function SinglePropertyComponent(props:IProps){
    return <div className="d-flex config-item">
            <span className="config-header">
                {props.name}:
            </span>
            <span className="config-value">
                <span>{props.value}</span>
            </span>
        </div>
}

export const SingleProperty = React.memo(SinglePropertyComponent);