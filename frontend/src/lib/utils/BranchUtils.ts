import { Constants, createBranchDetailsObj, createMergeLineObj, IBranchDetails, IBranchRemote, ICommitInfo, ILastReference, IMergeLine, IRepositoryDetails, IStatus, StringUtils } from "common_library";
import { ReduxStore } from "../../store";
import { IViewBox } from "../interfaces";

export class BranchUtils{
    static repositoryDetails:IRepositoryDetails = null!;    
    static readonly MergedCommitMessagePrefix = "Merge branch \'";
    static readonly remoteBranchNamePrefix = "remotes"
    static readonly distanceBetweenBranchLine = 30;    
    static readonly branchPanelFontSize = 12;    
    static readonly commitRadius = BranchUtils.branchPanelFontSize;
    static readonly distanceBetweenCommits = BranchUtils.commitRadius*3;

    static getRepoDetails(repoDetails:IRepositoryDetails){
        BranchUtils.getBranchDetails(repoDetails);
        BranchUtils.enListSourceCommits(repoDetails);
        BranchUtils.finaliseSourceCommits(repoDetails);
        BranchUtils.specifySerialsOfBranch(repoDetails);
        BranchUtils.sortBranches(repoDetails);
        BranchUtils.setBranchHeights(repoDetails);
        BranchUtils.reversBranches(repoDetails);
        BranchUtils.createMergeLines(repoDetails);

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
        repoDetails.resolvedBranches.forEach(branch=>{
            branch.y = y + (branch.maxRefCount* BranchUtils.branchPanelFontSize);
            y = branch.y + BranchUtils.distanceBetweenBranchLine;
        });
        repoDetails.branchPanelHeight = y;
    }

    private static sortBranches(repoDetails:IRepositoryDetails){        
        repoDetails.resolvedBranches.sort((x,y)=> x.serial > y.serial ?1:-1);
    }

    private static specifySerialsOfBranch(repoDetails:IRepositoryDetails){
        const getSerial=(branch:IBranchDetails):number=>{
            if(branch.serial != 0) return branch.serial;	  
            let parentSerial = getSerial(branch.parentCommit?.ownerBranch!);
            let commitInex=0;
            if(!!branch.name)commitInex = branch.parentCommit!.ownerBranch.commits.indexOf(branch.parentCommit!)+1;
            else commitInex = branch.parentCommit!.ownerBranch.commits.length+1;
            let measuredSerial = parentSerial+ parentSerial * (1.0/(10.0*commitInex));
            return measuredSerial;
        }

        repoDetails.resolvedBranches.forEach(br=>{
            br.serial = getSerial(br);
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
						
			if(currentOwnerBranch.serial != 0.0) realOwnerBranch.serial = currentOwnerBranch.serial; 
			currentOwnerBranch.serial = 0.0;
			
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
        	  newOwnerBranch.serial = branchTree.length;
          }
          branchDetails.push(newOwnerBranch);
          return newOwnerBranch;
        };

        let x = 20;
        
        for(let i = 0; i < repoDetails.allCommits.length; i++){
            const currentCommit = repoDetails.allCommits[i];            
            let lastRef = BranchUtils.CheckBranchReferenceInCommitMessage(currentCommit);
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

            BranchUtils.setReferences(currentCommit,repoDetails);
            BranchUtils.setX(currentCommit,x);
            x = currentCommit.x + BranchUtils.distanceBetweenCommits;

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
        repoDetails.branchPanelWidth = x;
    }

    private static setX(commit:ICommitInfo,x:number){
        
        if(!!commit.previousCommit?.refs && !!commit.refs){
            const maxRefSize = Math.max(...commit.refs.split(",").map(x=>x.length));
            commit.x = x + BranchUtils.branchPanelFontSize * maxRefSize;
        }
        else commit.x = x;
        
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

        commit.branchNameWithRemotes = branches.map(x=> BranchUtils.getBranchRemote(x));
    }

    private static CheckBranchReferenceInCommitMessage(commit:ICommitInfo) {
    	let indexOfPrefix = commit.message.indexOf(BranchUtils.MergedCommitMessagePrefix);
    	if(indexOfPrefix == -1) return null;
    	let branchName = commit.message.substring(indexOfPrefix+BranchUtils.MergedCommitMessagePrefix.length);
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
        if(BranchUtils.HasBranchNameRef(commit)) return true;
        if(commit.branchNameWithRemotes.some(ref=> ref.branchName === commit.ownerBranch.name && !!ref.remote)
         && !BranchUtils.repositoryDetails.branchList.includes(commit.ownerBranch.name)) return true;
        return false;
    }

    static generateMergeCommit(){
        const srcCommitHash = BranchUtils.repositoryDetails.status.mergingCommitHash;
        if(!srcCommitHash) return;
        const sourceCommit = BranchUtils.repositoryDetails.allCommits.find(x=> x.hash === srcCommitHash);
        if(!sourceCommit) return;
        let mergerCommitMessage = `Merge commit '${sourceCommit.avrebHash}'`;
        if(BranchUtils.HasBranchNameRef(sourceCommit)){            
            mergerCommitMessage = `Merge branch '${sourceCommit.ownerBranch.name}'`;
        }

        return mergerCommitMessage;
        
    }
}