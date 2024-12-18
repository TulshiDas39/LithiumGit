import React from "react"

interface IProps{
    data:{message:string};
}

function SingleNotificationComponent(props:IProps){
    return <div className="border py-2" style={{width:300}}>
        {props.data.message}
    </div>
}

export const SingleNotification = React.memo(SingleNotificationComponent);