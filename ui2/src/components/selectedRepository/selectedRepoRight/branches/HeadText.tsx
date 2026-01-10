import { RepoUtils, EnumIdPrefix } from "../../../../lib";

interface IHeadTextProps{
    commitHash:string;
    y:number;
    x:number;
    handleContext:(e:React.MouseEvent<SVGTextElement, MouseEvent>)=>void;
    
}
export function HeadText(props:IHeadTextProps){
    return (
        <text id={`${EnumIdPrefix.COMMIT_TEXT}${props.commitHash}`} className={`cur-default`} x={props.x} onContextMenu={(e) => props.handleContext(e)} y={props.y} textAnchor="middle" alignmentBaseline="middle" fontSize={RepoUtils.branchPanelFontSize} fill="green" fontWeight="bold">H</text>
    )
}