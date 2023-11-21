import { IRepositoryDetails } from "common_library";
import { SingleBranch2 } from "./SingleBranch2";

interface IBranchPanelProps {
    height: number;
    width: number;
    repoDetails: IRepositoryDetails;
}

export function BranchPanel2(props: IBranchPanelProps) {    
    return <svg
        width={props.width} height={props.height} viewBox={`0 0 ${props.width} ${props.height}`} style={{ transform: `scale(1)` }}>
        <g>
            {
                props.repoDetails.mergedLines.map(line => (
                    <line key={`${line.srcX}-${line.srcY}-${line.endX}-${line.endY}`} x1={line.srcX} y1={line.srcY} x2={line.endX} y2={line.endY} stroke="green" strokeWidth={1} />
                ))
            }
            {
                props.repoDetails.resolvedBranches.map(branch => (
                    <SingleBranch2 key={branch._id}
                        branchDetails={branch}
                        selectedCommit={props.repoDetails.headCommit}
                        scrollLeft={props.repoDetails.branchPanelWidth}
                        scrollTop={0}
                        panelWidth={props.width}

                    />
                ))
            }
        </g>
    </svg>
}

// export const BranchPanel2 = React.memo(BranchPanelComponent);