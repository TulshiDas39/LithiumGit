// import { FetchState } from "../../store";

import { FetchState } from "../enums";

export class DataUtils{
    static clone = {
        progress:0,
        stage:FetchState.Remote,
        timer: undefined! as NodeJS.Timeout,
    }    
}