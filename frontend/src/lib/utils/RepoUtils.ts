import { Constants, createBranchDetailsObj, createMergeLineObj, IBranchDetails, IBranchRemote, ICommitInfo, ILastReference, IRepositoryDetails, IStatus } from "common_library";
import { IViewBox } from "../interfaces";
import { ArrayUtils } from "./ArrayUtils";

export class RepoUtils{
    static repositoryDetails:IRepositoryDetails = null!;    
    static readonly MergedCommitMessagePrefix = "Merge branch \'";
    static readonly remoteBranchNamePrefix = "remotes"
    static readonly distanceBetweenBranchLine = 30;    
    static readonly branchPanelFontSize = 12;    
    static readonly commitRadius = RepoUtils.branchPanelFontSize;
    static readonly distanceBetweenCommits = RepoUtils.commitRadius*3;

    static getRepoDetails(repoDetails:IRepositoryDetails){
        if(!repoDetails.allCommits.length)
            return;
        RepoUtils.getBranchDetails(repoDetails);
        RepoUtils.enListSourceCommits(repoDetails);
        RepoUtils.finaliseSourceCommits(repoDetails);
        RepoUtils.specifyDrawOrdersOfBranch(repoDetails);
        RepoUtils.setBranchVerticalOffset(repoDetails);
        RepoUtils.sortBranches(repoDetails);
        RepoUtils.setBranchHeights(repoDetails);
        RepoUtils.reversBranches(repoDetails);
        RepoUtils.createMergeLines(repoDetails);

    }

    private static createMergeLines(repoDetails:IRepositoryDetails){
        let mergeCommits = repoDetails.allCommits.filter(c=>c.parentHashes.length > 1);
        const mergedLines = repoDetails.mergedLines;
        for (let commit of mergeCommits) {
    		var sourceCommitOfMerge = repoDetails.allCommits.find(c => c.avrebHash === commit.parentHashes[1]);
    		if(!sourceCommitOfMerge) continue;
    		var line =  createMergeLineObj();
            line.srcX = sourceCommitOfMerge.x;
            line.srcY = sourceCommitOfMerge.ownerBranch.y;
            line.endX = commit.x;
            line.endY = commit.ownerBranch.y;
    		// line.addEventFilter(MouseEvent.MOUSE_CLICKED, e->{    				
    		// 		line.setIsSelected(true);
    		// });
    		mergedLines.push(line);
		}
    }

    private static reversBranches(repoDetails:IRepositoryDetails){
        repoDetails.resolvedBranches.reverse();
    }        

    private static setBranchHeights(repoDetails:IRepositoryDetails){
        let y = 30;
        const maxOffset = ArrayUtils.findMax(repoDetails.resolvedBranches.map(_=>_.verticalOffset));

        for(let offset = 1;offset <= maxOffset;offset++){
            const branchesOfThisOffset = repoDetails.resolvedBranches.filter(_=> _.verticalOffset == offset);
            for(let branch of branchesOfThisOffset){
                branch.y = y + (branch.maxRefCount* RepoUtils.branchPanelFontSize);
            }

            y = ArrayUtils.findMax(branchesOfThisOffset.map(_=>_.y)) + RepoUtils.distanceBetweenBranchLine;
        }
        
        repoDetails.branchPanelHeight = y + 50;
    }

    private static isOverlappingBranches(branch1:IBranchDetails,branch2:IBranchDetails){
        const start1 = branch1.parentCommit!.x  - RepoUtils.commitRadius;
        const end1 = branch1.commits[branch1.commits.length-1].x  + RepoUtils.commitRadius;

        const start2 = (branch2.parentCommit?.x || branch2.commits[0]?.x)  - RepoUtils.commitRadius;
        const end2 = branch2.commits[branch2.commits.length-1].x - RepoUtils.commitRadius;

        if(start1 >= start2 && start1 <= end2)
            return true;
        if(end1 >= start2 && end1 <= end2)
            return true;        
        if(start1 <= start2 && end1 >= end2)
            return true;

        return false;
    }

    private static setBranchVerticalOffset(repoDetails:IRepositoryDetails){

        const branchesWithoutParent = repoDetails.resolvedBranches.filter(_=> !_.parentCommit);
        const mainBranches = ["master","main"];
        branchesWithoutParent.sort((a,_) => !mainBranches.includes(a.name) ? 1:-1);
        for(let i = 0; i < branchesWithoutParent.length; i++){
            const branch = branchesWithoutParent[i];
            branch.verticalOffset = i + 1;
        }

        const setOffset = (branch:IBranchDetails)=>{
            const parentBranch = branch.parentCommit!.ownerBranch!;            
            if(!parentBranch.verticalOffset){
                setOffset(parentBranch);
            }
            const offsetOfParentBranch = parentBranch.verticalOffset;
            const branchesBelowParent = repoDetails.resolvedBranches.filter(_=> _.verticalOffset > offsetOfParentBranch);
            let offset = offsetOfParentBranch + 1;
            for(let i = 0; i < branchesBelowParent.length; i++ ){
                const branchesHavingOffset = branchesBelowParent.filter(_=> _.verticalOffset == offset);
                if(!branchesHavingOffset.length){
                    break;
                }
                else{
                    const hasOverlapping = branchesHavingOffset.some(_=> RepoUtils.isOverlappingBranches(branch,_));
                    if(!hasOverlapping){
                        break;
                    }
                }
                offset++;
            }
            branch.verticalOffset = offset;
        }

        const branches = repoDetails.resolvedBranches.filter(_ => !!_.parentCommit);

        for(let branch of branches){
            if(!branch.verticalOffset)
                setOffset(branch);
        }
    }

    private static sortBranches(repoDetails:IRepositoryDetails){        
        repoDetails.resolvedBranches.sort((x,y)=> x.drawOrder > y.drawOrder ?1:-1);
    }

    private static specifyDrawOrdersOfBranch(repoDetails:IRepositoryDetails){
        const getDrawOrder=(branch:IBranchDetails):number=>{
            if(branch.drawOrder != 0) return branch.drawOrder;	  
            let parentDrawOrder = getDrawOrder(branch.parentCommit?.ownerBranch!);
            let commitInex=0;
            if(!!branch.name)commitInex = branch.parentCommit!.ownerBranch.commits.indexOf(branch.parentCommit!)+1;
            else commitInex = branch.parentCommit!.ownerBranch.commits.length+1;
            let measuredDrawOrder = parentDrawOrder+ parentDrawOrder * (1.0/(10.0*commitInex));
            return measuredDrawOrder;
        }

        repoDetails.resolvedBranches.forEach(br=>{
            br.drawOrder = getDrawOrder(br);
        });
    }

    private static enListSourceCommits(repoDetails:IRepositoryDetails) {    	
    	repoDetails.sourceCommits = repoDetails.allCommits.filter(c => c.branchesFromThis.length > 0);
    }

    private static finaliseSourceCommits(repoDetails:IRepositoryDetails) {
    	for (let i = repoDetails.sourceCommits.length-1; i>=0; i--) {
    		let sourceCommit = repoDetails.sourceCommits[i];			
			if(sourceCommit.branchNameWithRemotes.length != 0) continue;
			
			let currentOwnerBranch = sourceCommit.ownerBranch;
			let realOwnerBranch:IBranchDetails = null!;
			
			if(!currentOwnerBranch.name && sourceCommit.branchesFromThis.length == 1)
				realOwnerBranch = sourceCommit.branchesFromThis[0];
			else {
				for(let br of sourceCommit.branchesFromThis) {
					if(!br.name)continue;
                    if(br.name === "master"){
                        realOwnerBranch = br;
                        break;
                    }
					if(repoDetails.lastReferencesByBranch.some(ref => ref.branchName ===  br.name  && ref.dateTime < sourceCommit.date)){
                        realOwnerBranch = br;
					    break;
                    }
				}
			}					
			
			if(!realOwnerBranch)continue;			
			
			if(!!currentOwnerBranch.parentCommit) {
				currentOwnerBranch.parentCommit.branchesFromThis = 
                    currentOwnerBranch.parentCommit.branchesFromThis.filter(x=>x._id !== currentOwnerBranch._id);
				currentOwnerBranch.parentCommit.branchesFromThis.push(realOwnerBranch);	
			}
			
			sourceCommit.branchesFromThis = sourceCommit.branchesFromThis.filter(x=>x._id !== realOwnerBranch._id);
			sourceCommit.branchesFromThis.push(currentOwnerBranch);
			sourceCommit.nextCommit = realOwnerBranch.commits[0];
			realOwnerBranch.parentCommit = currentOwnerBranch.parentCommit;
			currentOwnerBranch.parentCommit = sourceCommit;	
						
			if(currentOwnerBranch.drawOrder != 0.0) realOwnerBranch.drawOrder = currentOwnerBranch.drawOrder; 
			currentOwnerBranch.drawOrder = 0.0;
			
			let commitToMove = sourceCommit;
			while (commitToMove != realOwnerBranch.parentCommit) {
				if(commitToMove.ownerBranch.name !== currentOwnerBranch.name) break;
				commitToMove.ownerBranch.commits = commitToMove.ownerBranch.commits.filter(x=>x.hash !== commitToMove.hash);
				commitToMove.ownerBranch = realOwnerBranch;
				realOwnerBranch.commits= [commitToMove,...realOwnerBranch.commits];
				commitToMove = commitToMove.previousCommit;
			}
        }
	}
    

    private static getBranchDetails(repoDetails:IRepositoryDetails){
        let branchTree:IBranchDetails[] = [];
        let ownerBranch:IBranchDetails = null!;
        const branchDetails:IBranchDetails[] = [];
        const lastReferencesByBranch:ILastReference[] = [];        
        
        const createNewBranch =  (parentCommit:ICommitInfo) => {
          let newOwnerBranch = createBranchDetailsObj();          
          newOwnerBranch.parentCommit = parentCommit;          
          if(!parentCommit) {
        	  branchTree.push(newOwnerBranch);
        	  newOwnerBranch.drawOrder = branchTree.length;
          }
          branchDetails.push(newOwnerBranch);
          return newOwnerBranch;
        };

        let x = 150;
        
        for(let i = 0; i < repoDetails.allCommits.length; i++){
            const currentCommit = repoDetails.allCommits[i];            
            let lastRef = RepoUtils.CheckBranchReferenceInCommitMessage(currentCommit);
            if(!!lastRef) lastReferencesByBranch.push(lastRef);                    
            
            let previousCommit = repoDetails.allCommits.find(x=>x.avrebHash === currentCommit.parentHashes[0]); 
            
            if(!!previousCommit){
            	currentCommit.previousCommit = previousCommit;
                if(previousCommit.nextCommit || previousCommit.ownerBranch.name){            
                  ownerBranch = createNewBranch(previousCommit);
                  previousCommit.branchesFromThis.push(ownerBranch);
                }else{              
                    ownerBranch=previousCommit.ownerBranch;
                    previousCommit.nextCommit = currentCommit;                    
                }                  
            }
            else{
                ownerBranch = createNewBranch(null!);
            }
            
            currentCommit.ownerBranch = ownerBranch;
            currentCommit.ownerBranch.commits.push(currentCommit);

            RepoUtils.setReferences(currentCommit,repoDetails);
            RepoUtils.setX(currentCommit,x);
            x = currentCommit.x + RepoUtils.distanceBetweenCommits;

	        if(currentCommit.branchNameWithRemotes.length){
	        	let remoteBranches = currentCommit.branchNameWithRemotes.filter((arg0) => !!arg0.remote);	         	
	            if(remoteBranches.length) currentCommit.ownerBranch.name = remoteBranches[0].branchName;
	            else currentCommit.ownerBranch.name = currentCommit.branchNameWithRemotes[0].branchName;
	            
	            let parentBranch = currentCommit.ownerBranch?.parentCommit?.ownerBranch;
	            
	            if(!!parentBranch){
	                let branchNameWithRemotes = currentCommit.branchNameWithRemotes;                
	                let isParentBranch = branchNameWithRemotes.some(branchNameWithRemote => branchNameWithRemote.branchName === parentBranch?.name);                    
	                if(isParentBranch){
                        currentCommit.ownerBranch.parentCommit!.branchesFromThis = currentCommit.ownerBranch.parentCommit!.branchesFromThis.filter(x=>x._id !== currentCommit.ownerBranch._id);
	                	parentBranch.commits[parentBranch.commits.length-1].nextCommit = ownerBranch.commits[0];
	                    parentBranch.commits = [...parentBranch.commits,...ownerBranch.commits];
	                    for (let commit of ownerBranch.commits) {
	                        commit.ownerBranch = parentBranch;
	                    }
	                    currentCommit.ownerBranch = parentBranch;
                        const ownBranchIndex = branchDetails.findIndex(x=>x._id === ownerBranch._id);                        
                        branchDetails.splice(ownBranchIndex,1);
	                }                
	            }
	
	        }

        }
        
        repoDetails.branchTree = branchTree;
        repoDetails.resolvedBranches = branchDetails;
        repoDetails.lastReferencesByBranch = lastReferencesByBranch;
        repoDetails.branchPanelWidth = x+50;
    }

    private static setX(commit:ICommitInfo,x:number){
        
        if(!commit.refValues.length){
            commit.x = x;
            return;
        }

        let extraSpace = RepoUtils.getExtraSpaceForRefs(commit);
        if(extraSpace > RepoUtils.distanceBetweenCommits) {
            commit.x = x + extraSpace - RepoUtils.distanceBetweenCommits;
        }
        else commit.x = x;
    }

    private static getExtraSpaceForRefs(commit:ICommitInfo){
        const maxRefSize = Math.max(...commit.refs.split(",").map(x=>x.length));
        const spaceForRef = (RepoUtils.branchPanelFontSize * 0.8) * maxRefSize;
        let previousCommit = commit.previousCommit;
        let extraSpace = 0;
        let availableSpace = 0;
        while(previousCommit){
            if(previousCommit.ownerBranch !== commit.ownerBranch){
                break;
            }
            if(!previousCommit.refValues.length){
                availableSpace += RepoUtils.distanceBetweenCommits;                                
            }
            else{
                break;
            }

            if(availableSpace >= spaceForRef){
                break;
            }
            previousCommit = previousCommit.previousCommit;
        }

        if(availableSpace > spaceForRef){
            availableSpace = spaceForRef;
        }
        
        extraSpace = spaceForRef - availableSpace;

        return extraSpace;
    }

    private static isBranch(str:string,repoDetails:IRepositoryDetails){
        if(repoDetails.branchList.includes(str)) return true;
        if(str.includes('/')) {
            str = this.remoteBranchNamePrefix +"/"+str;
            if(repoDetails.branchList.includes(str)) return true;
        }
        return false;
    }

    private static setReferences(commit:ICommitInfo,repoDetails:IRepositoryDetails) {        
    	if(!commit.refValues.length) return;                
        const refLenght = commit.refValues.length;
        if(refLenght > commit.ownerBranch.maxRefCount) {
            commit.ownerBranch.maxRefCount = refLenght;
        }

    	const branches:string[] = commit.refValues.filter(sp=> this.isBranch(sp,repoDetails));                   

        commit.branchNameWithRemotes = branches.map(x=> RepoUtils.getBranchRemote(x));
    }

    private static CheckBranchReferenceInCommitMessage(commit:ICommitInfo) {
    	let indexOfPrefix = commit.message.indexOf(RepoUtils.MergedCommitMessagePrefix);
    	if(indexOfPrefix == -1) return null;
    	let branchName = commit.message.substring(indexOfPrefix+RepoUtils.MergedCommitMessagePrefix.length);
    	branchName = branchName.substring(0, branchName.indexOf("\'"));
    	let lastRef:ILastReference = {
            branchName,
            dateTime:commit.date
        };
    	return lastRef;
    }

    private static getBranchRemote(branchNameStr:string){
        let branchName = "";
        let remote = "";
        let splits = branchNameStr.split("/");
        if (splits.length > 1) {
          branchName = splits[1];
          remote = splits[0];
        }
        else {
          branchName = branchNameStr;
        }
        const branchRemote = { } as IBranchRemote;
        branchRemote.branchName = branchName;
        branchRemote.remote = remote;        
        return branchRemote;
    }

    static getViewBoxValue(initialValue:IViewBox,zoomStep:number){
        if(zoomStep === 0) return {...initialValue,};
        const newViewBox = {} as IViewBox;
        const pxPerZoom = 1;
        const changedPx = pxPerZoom*zoomStep;
        newViewBox.x = initialValue.x + changedPx;
        newViewBox.y = initialValue.y + changedPx;
        newViewBox.width = initialValue.width - (changedPx*2);
        newViewBox.height = initialValue.height - (changedPx*2);        
        if(newViewBox.width <= 0)newViewBox.width = 10;
        if(newViewBox.height <= 0)newViewBox.height = 10;

        return newViewBox;
    }

    static getAllBranchNames(){
        const branchNames:string[]=[];
        if(!this.repositoryDetails) return branchNames;
        for(let branchName of this.repositoryDetails.branchList){
            if(branchName.includes('/')){
                const lastIndex = branchName.lastIndexOf('/');
                branchName = branchName.substring(lastIndex+1);
            }
            if(!branchNames.includes(branchName))branchNames.push(branchName);
        }

        return branchNames;
    }

    static handleCheckout(commit:ICommitInfo,repoDetails:IRepositoryDetails,newStatus:IStatus){
        const existingHead = repoDetails.headCommit;
        existingHead.isHead = false;
        const newHeadCommit = repoDetails.allCommits.find(x=>x.hash === commit.hash);
        if(!newHeadCommit) throw "New checkout commit not found";
        repoDetails.headCommit = newHeadCommit;
        newHeadCommit.isHead = true;        

        const existingStatus = repoDetails.status;
        repoDetails.status = newStatus;                

        if(existingStatus.isDetached){
            existingHead.refValues = existingHead.refValues.filter(x=> x !== Constants.detachedHeadIdentifier);
            if(existingHead.ownerBranch.increasedHeightForDetached > 0){
                existingHead.ownerBranch.maxRefCount -= existingHead.ownerBranch.increasedHeightForDetached;                
                existingHead.ownerBranch.increasedHeightForDetached = 0;
            }            
        }

        const existingMaxRefLength = newHeadCommit.ownerBranch.maxRefCount;

        if(newStatus.isDetached){
            newHeadCommit.refValues.push(Constants.detachedHeadIdentifier);
            if(newHeadCommit.refValues.length > existingMaxRefLength){
                newHeadCommit.ownerBranch.increasedHeightForDetached = newHeadCommit.refValues.length - existingMaxRefLength;
                newHeadCommit.ownerBranch.maxRefCount = newHeadCommit.refValues.length;
            }
        }

        
                
    }

    static HasBranchNameRef(commit:ICommitInfo){
        return commit.branchNameWithRemotes.some(ref=> ref.branchName === commit.ownerBranch.name && !ref.remote);
    }

    static canCheckoutBranch(commit:ICommitInfo){
        if(!commit.branchNameWithRemotes.length) return false;
        if(RepoUtils.HasBranchNameRef(commit)) return true;
        if(commit.branchNameWithRemotes.some(ref=> ref.branchName === commit.ownerBranch.name && !!ref.remote)
         && !RepoUtils.repositoryDetails.branchList.includes(commit.ownerBranch.name)) return true;
        return false;
    }

    static generateMergeCommit(){
        const srcCommitHash = RepoUtils.repositoryDetails.status.mergingCommitHash;
        if(!srcCommitHash) return;
        const sourceCommit = RepoUtils.repositoryDetails.allCommits.find(x=> x.hash === srcCommitHash);
        if(!sourceCommit) return;
        let mergerCommitMessage = `Merge commit '${sourceCommit.avrebHash}'`;
        if(RepoUtils.HasBranchNameRef(sourceCommit)){            
            mergerCommitMessage = `Merge branch '${sourceCommit.ownerBranch.name}'`;
        }

        return mergerCommitMessage;
        
    }

    static generateMergeCommitMessage(hash:string){
        const sourceCommit = RepoUtils.repositoryDetails.allCommits.find(x=> x.hash === hash);
        if(!sourceCommit) return;
        let mergerCommitMessage = `Merge commit '${sourceCommit.avrebHash}'`;
        return mergerCommitMessage;
    }

    static generateMergeBranchMessage(branch:string){
        let mergerCommitMessage = `Merge branch '${branch}'`;
        return mergerCommitMessage;
    }

    static isOriginBranch(str:string){
        if(!str.startsWith("remotes/"))
            str = "remotes/"+str;
        if(RepoUtils.repositoryDetails.branchList.includes(str))
            return true;
    }

    static hasLocalBranch(originBranch:string){
        if(!RepoUtils.isOriginBranch(originBranch))
            return false;
        const localBranch = RepoUtils.getLocalBranch(originBranch);
        if(RepoUtils.repositoryDetails.branchList.includes(localBranch))
            return true;
        return false;
    }

    static getLocalBranch(originBranch:string){
        let localBranch = originBranch;
        if(originBranch.startsWith("remotes/")){
            localBranch = localBranch.substring("remotes/".length);            
        }
        const remotes = RepoUtils.repositoryDetails.remotes;
        const remote = remotes.find(_ => localBranch.startsWith(`${_.name}/`))
        if(remote){
            localBranch = localBranch.substring(`${remote.name}/`.length);
        }

        return localBranch;
        
    }

    static get activeOriginName(){
        if(!RepoUtils.repositoryDetails.remotes.length)
            return "";
        const orignName = RepoUtils.repositoryDetails.repoInfo.activeOrigin;
        if(!RepoUtils.repositoryDetails.remotes.some(_=> _.name === orignName)){
            return RepoUtils.repositoryDetails.remotes[0].name;
        }
        return orignName;
    }

    static enSureUpdate(repoPath:string){
        return new Promise((res)=>{
            let trycount = 0;
            const timer = setInterval(()=>{
                if(RepoUtils.repositoryDetails.repoInfo.path == repoPath || trycount > 5){
                    clearInterval(timer);
                    res(true);
                }
                trycount++;
            },1000)
        })
    }
}