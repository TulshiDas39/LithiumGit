import { DerivedPublisher } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";

export class HorizontalScrollLeft extends DerivedPublisher<number>{
    getDerivedValue(): number {
        const scrolRatio = BranchGraphUtils.state.horizontalScrollRatio2.value;        
        return 0;
    }

}