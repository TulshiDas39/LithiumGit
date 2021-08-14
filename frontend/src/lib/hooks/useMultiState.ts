import { useState } from "react";

export function useMultiState<T>(initialState: T) :[T,(newState:Partial<T>)=>void]{
    const [state, setState] = useState(initialState);
    const setMultiState = (newState: Partial<T>) => {
        setState(prevState => ({
            ...prevState,
            ...newState
        }));
    };

    return [state, setMultiState];
};