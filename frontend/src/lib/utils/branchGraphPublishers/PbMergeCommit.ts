import { ICommitInfo } from "common_library";
import { EnumIdPrefix } from "../../enums";
import { DerivedState } from "../../publishers";
import { GraphUtils } from "../GraphUtils";
import { RepoUtils } from "../RepoUtils";

export class PbMergeCommit extends DerivedState<ICommitInfo|undefined>{
    protected getDerivedValue(): ICommitInfo|undefined {
        const commitHash = RepoUtils.repositoryDetails?.status.mergingCommitHash;
        if(!commitHash)
            return undefined;
        return {
            hash:commitHash,
        } as ICommitInfo;
    }
    protected applyChange(): void {
        this.updateMergingStateUi();
    }

    private updateMergingStateUi(){
        // if(this.prevValue)
        //     this.removeMergingStateUi();
        this.createMerginStategUi();
    }

    private createMerginStategUi(){
        if(!GraphUtils.state.mergingCommit.value)return;
        const head = RepoUtils.repositoryDetails.headCommit;
        const allCommits = RepoUtils.repositoryDetails.allCommits;
        const endX = this.value!.x;
        const y = this.value!.ownerBranch.y;

        const branchLineElem = document.querySelector(`#${EnumIdPrefix.BRANCH_LINE}${head.ownerBranch._id}`)!;
        //d={`M${data.startX},${data.startY} ${data.vLinePath} h${data.hLineLength}`}
        const branchDetails = head.ownerBranch;
        const lineData = GraphUtils.getBranchLinePathData(branchDetails);
        const hLineLength = endX - lineData.startX;
        const linePath = GraphUtils.getBranchLinePath(lineData.startX,lineData.startY,lineData.vLinePath,hLineLength);
        branchLineElem.setAttribute("d",linePath);

        const gElem = document.querySelector('#branchPanel')?.getElementsByTagName('g').item(0)!;

        const srcCommit = allCommits.find(x=>x.hash === RepoUtils.repositoryDetails.status.mergingCommitHash)!;
        const pointFromCircle = GraphUtils.getStartingPointOfLineFromCommitCircle(srcCommit.x,srcCommit.ownerBranch.y,endX,y);
        const line = GraphUtils.createMergedStateLine(pointFromCircle.x,pointFromCircle.y, endX,y);
        gElem.appendChild(line);
        const commitBox = GraphUtils.createMergeCommit(head, endX,this.value!);
        gElem.appendChild(commitBox);

    }

    private removeMergingStateUi(){
        if(RepoUtils.repositoryDetails.status.mergingCommitHash)return;

        const head = RepoUtils.repositoryDetails.headCommit;
        const allCommits = RepoUtils.repositoryDetails.allCommits;
        const latestCommit = allCommits[allCommits.length-1];
        const endX = latestCommit.x;
        const y = head.ownerBranch.y;

        const branchLineElem = document.querySelector(`#${EnumIdPrefix.BRANCH_LINE}${head.ownerBranch._id}`)!;
        //d={`M${data.startX},${data.startY} ${data.vLinePath} h${data.hLineLength}`}
        const branchDetails = head.ownerBranch;
        const lineData = GraphUtils.getBranchLinePathData(branchDetails);
        const hLineLength = endX - lineData.startX;
        const linePath = GraphUtils.getBranchLinePath(lineData.startX,lineData.startY,lineData.vLinePath,hLineLength);
        branchLineElem?.setAttribute("d",linePath);

        const elems = document.querySelectorAll(".mergingState");
        elems.forEach(elem=> elem.remove());

    }

}