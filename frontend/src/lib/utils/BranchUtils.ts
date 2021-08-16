import { createBranchDetailsObj, IBranchDetails, IBranchRemote, ICommitInfo, ILastReference, IRepositoryDetails, StringUtils } from "common_library";

export class BranchUtils{
    static readonly headPrefix = "HEAD -> ";
    static readonly MergedCommitMessagePrefix = "Merge branch \'";

    static getBranchDetails(repoDetails:IRepositoryDetails){
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
        
        for(var i = 0; i < repoDetails.allCommits.length; i++){
            const currentCommit = repoDetails.allCommits[i];
            currentCommit.referedBranches = BranchUtils.getBranchFromReference(currentCommit.refs);
            let lastRef = BranchUtils.CheckBranchReferenceInCommitMessage(currentCommit);
            if(!!lastRef) lastReferencesByBranch.push(lastRef);
        
            const branchRemoteList = currentCommit.referedBranches.map(x=> BranchUtils.getBranchRemote(x));
            currentCommit.branchNameWithRemotes = branchRemoteList;
            
            let previousCommit = repoDetails.allCommits.find(x=>x.avrebHash === currentCommit.parentHashes[0]); 
            
            if(previousCommit != null){
            	currentCommit.previousCommit = previousCommit;            	
                if(previousCommit.nextCommit != null){            
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

	        if(currentCommit.branchNameWithRemotes.length != 0 ){
	        	let remoteBranch = currentCommit.branchNameWithRemotes.find((arg0) => !!arg0.remote);
	         	
	            if(!!remoteBranch) currentCommit.ownerBranch.name = remoteBranch.branchName;
	            else currentCommit.ownerBranch.name = currentCommit.branchNameWithRemotes[0].branchName;
	            
	            let parentBranch = currentCommit.ownerBranch?.parentCommit?.ownerBranch;
	            
	            if(!!parentBranch){
	                var branchNameWithRemotes = currentCommit.branchNameWithRemotes;                
	                var isParentBranch = branchNameWithRemotes.some(branchNameWithRemote => branchNameWithRemote.branchName === parentBranch?.name);                    
	                if(isParentBranch){
	                	parentBranch.commits[parentBranch.commits.length-1].nextCommit = ownerBranch.commits[0];
	                    parentBranch.commits = [...parentBranch.commits,...ownerBranch.commits];
	                    for (let commit of ownerBranch.commits) {
	                        commit.ownerBranch = parentBranch;
	                    }
	                    currentCommit.ownerBranch = parentBranch;
                        const ownBranchIndex = branchDetails.findIndex(x=>x.name !== ownerBranch.name);
                        branchDetails.splice(ownBranchIndex,1);
	                }                
	            }
	
	        }

        }
        
        repoDetails.branchTree = branchTree;
        repoDetails.resolvedBranches = branchDetails;
        repoDetails.lastReferencesByBranch = lastReferencesByBranch;
    }

    private static getBranchFromReference(commitRef:string) {
    	const branches:string[] = [];
    	if(commitRef.startsWith(BranchUtils.headPrefix)) commitRef = commitRef.substring(BranchUtils.headPrefix.length);
    	if(!!commitRef) {
    		const splits = commitRef.split(",");        
            for (let split of splits) {
              split = split.trim();
              if(split.startsWith("tag:")) continue;
              branches.push(split);  
            }
    	}
                        
        return branches;
    }

    private static CheckBranchReferenceInCommitMessage(commit:ICommitInfo) {
    	var indexOfPrefix = commit.message.indexOf(BranchUtils.MergedCommitMessagePrefix);
    	if(indexOfPrefix == -1) return null;
    	var branchName = commit.message.substring(indexOfPrefix+BranchUtils.MergedCommitMessagePrefix.length);
    	branchName = branchName.substring(0, branchName.indexOf("\'"));
    	let lastRef:ILastReference = {
            branchName,
            dateTime:commit.date
        };
    	return lastRef;
    }

    private static getBranchRemote(branchNameStr:string){
        var branchName = "";
        var remote = "";
        var splits = branchNameStr.split("/");
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
}