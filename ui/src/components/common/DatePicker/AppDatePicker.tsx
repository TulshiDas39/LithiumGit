import React from "react"
import DatePicker from "react-datepicker";

interface IProps{
    date?:string;
    onChange:(date?:string)=>void;
}

function AppDatePickerComponent(props:IProps){

    const handleChange=(date:Date | null)=>{
        props.onChange(date?.toISOString());
    }
    
    return <DatePicker yearDropdownItemNumber={15} showYearDropdown scrollableYearDropdown 
        selected={props.date? new Date(props.date):null} onChange={handleChange}
                    placeholderText="mm/dd/yyyy" />
}

export const AppDatePicker = React.memo(AppDatePickerComponent);