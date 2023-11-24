import { DerivedPublisher } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";

export class HorizontalScrollLeft extends DerivedPublisher<number>{
    onChange(): void {
        //throw new Error("Method not implemented.");
    }
    getDerivedValue(): number {
        const scrolRatio = BranchGraphUtils.state.horizontalScrollRatio2.value;
        const panelWidth = BranchGraphUtils.svgContainer.parentElement!.clientWidth;

        return 0;
    }

}