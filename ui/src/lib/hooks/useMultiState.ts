import { useState } from "react";

export function useMultiState<T>(initialState: T) :[T,(newState:Partial<T> | ((prevState:T)=>T))=>void]{
    const [state, setState] = useState(initialState);
    const setMultiState = (newState: Partial<T> | ((prevState:T)=>T)) => {
        if(typeof newState === 'function'){
            setState(newState);
        }
        else {
            setState(prevState => ({
                ...prevState,
                ...newState
            }));
        }        
    };

    return [state, setMultiState];
};