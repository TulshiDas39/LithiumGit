import { EnumHtmlIds } from "../../enums";
import { DerivedPublisher } from "../../publishers";

export class PbPanelHeight extends DerivedPublisher<number>{
    protected getDerivedValue(): number {
        const elem = document.querySelector(`#${EnumHtmlIds.branchPanel}`);
        if(!elem)
            return 0;

        return elem.getBoundingClientRect().height;
    }    

}