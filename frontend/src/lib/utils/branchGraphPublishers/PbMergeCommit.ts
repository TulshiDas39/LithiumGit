import { ICommitInfo } from "common_library";
import { EnumIdPrefix } from "../../enums";
import { DerivedState } from "../../publishers";
import { BranchGraphUtils } from "../BranchGraphUtils";
import { BranchUtils } from "../BranchUtils";

export class PbMergeCommit extends DerivedState<ICommitInfo|undefined>{
    getDerivedValue(): ICommitInfo|undefined {
        const commitHash = BranchUtils.repositoryDetails?.status.mergingCommitHash;
        if(!commitHash)
            return undefined;
        return {
            hash:commitHash,
        } as ICommitInfo;
    }
    applyChange(): void {
        this.updateMergingStateUi();
    }

    private updateMergingStateUi(){
        if(this.prevValue)
            this.removeMergingStateUi();
        this.createMerginStategUi();
    }

    private createMerginStategUi(){
        if(!BranchGraphUtils.state.mergingCommit.value)return;
        const head = BranchUtils.repositoryDetails.headCommit;
        const allCommits = BranchUtils.repositoryDetails.allCommits;
        const latestCommit = allCommits[allCommits.length-1];
        const endX = latestCommit.x + BranchUtils.distanceBetweenCommits;
        const y = head.ownerBranch.y;

        const branchLineElem = document.querySelector(`#${EnumIdPrefix.BRANCH_LINE}${head.ownerBranch._id}`)!;
        //d={`M${data.startX},${data.startY} ${data.vLinePath} h${data.hLineLength}`}
        const branchDetails = head.ownerBranch;
        const lineData = BranchGraphUtils.getBranchLinePathData(branchDetails);
        const hLineLength = endX - lineData.startX;
        const linePath = BranchGraphUtils.getBranchLinePath(lineData.startX,lineData.startY,lineData.vLinePath,hLineLength);
        branchLineElem.setAttribute("d",linePath);

        const gElem = document.querySelector('#branchPanel')?.getElementsByTagName('g').item(0)!;

        const srcCommit = allCommits.find(x=>x.hash === BranchUtils.repositoryDetails.status.mergingCommitHash)!;
        const pointFromCircle = BranchGraphUtils.getStartingPointOfLineFromCommitCircle(srcCommit.x,srcCommit.ownerBranch.y,endX,y);
        const line = BranchGraphUtils.createMergedStateLine(pointFromCircle.x,pointFromCircle.y, endX,y);
        gElem.appendChild(line);
        const commitBox = BranchGraphUtils.createMergeCommit(head, endX,srcCommit);
        gElem.appendChild(commitBox);

    }

    private removeMergingStateUi(){
        if(BranchUtils.repositoryDetails.status.mergingCommitHash)return;

        const head = BranchUtils.repositoryDetails.headCommit;
        const allCommits = BranchUtils.repositoryDetails.allCommits;
        const latestCommit = allCommits[allCommits.length-1];
        const endX = latestCommit.x;
        const y = head.ownerBranch.y;

        const branchLineElem = document.querySelector(`#${EnumIdPrefix.BRANCH_LINE}${head.ownerBranch._id}`)!;
        //d={`M${data.startX},${data.startY} ${data.vLinePath} h${data.hLineLength}`}
        const branchDetails = head.ownerBranch;
        const lineData = BranchGraphUtils.getBranchLinePathData(branchDetails);
        const hLineLength = endX - lineData.startX;
        const linePath = BranchGraphUtils.getBranchLinePath(lineData.startX,lineData.startY,lineData.vLinePath,hLineLength);
        branchLineElem.setAttribute("d",linePath);

        const elems = document.querySelectorAll(".mergingState");
        elems.forEach(elem=> elem.remove());

    }

}