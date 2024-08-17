import { ICommitFilter } from "common_library";
import { DerivedPublisher } from "../../publishers";
import { GraphUtils } from "../GraphUtils";


export class PbCommitFilter extends DerivedPublisher<ICommitFilter>{
    constructor(){
        super();
        GraphUtils.state.fromDate.subscribe(this.update.bind(this));
        GraphUtils.state.toDate.subscribe(this.update.bind(this));
        GraphUtils.state.limit.subscribe(this.update.bind(this));
        this._val = this.getDerivedValue();
    }

    protected getDerivedValue(): ICommitFilter {
        const data = {} as ICommitFilter;
        data.fromDate = GraphUtils.state.fromDate.value!;
        data.toDate = GraphUtils.state.toDate.value;
        data.limit = GraphUtils.state.limit.value;
        return data;
    }

}