/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.business;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.function.Function;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;

import com.bsse.dataClasses.BranchDetails;
import com.bsse.dataClasses.BranchRemote;
import com.bsse.dataClasses.CommitInfo;
import com.bsse.dataClasses.Constants;
import com.bsse.dataClasses.LastReference;
import com.bsse.dataClasses.RemoteInfo;
import com.bsse.dataClasses.RepoInfo;
import com.bsse.dataClasses.RepositoryInfo;
import com.bsse.utils.ArrayUtil;
import com.bsse.utils.NullUtil;
import com.bsse.utils.StringUtil;

/**
 *
 * @author ASUS
 */
public class GitManager {
    private static Git git ;   
    private static final String headPrefix = "HEAD -> ";
    
    private static RepositoryInfo repositoryInfo = new RepositoryInfo();
    
    
    public static void setRemotes() throws GitAPIException{
        var remotesTemp = git.remoteList().call();
        
        repositoryInfo.remotes = ArrayUtil.map(remotesTemp, (x)-> {
        	var remoteInfo = new RemoteInfo();
        	remoteInfo.name = x.getName();
        	remoteInfo.url = x.getURIs().get(0).getHost();
        	return remoteInfo;
        }).toArray(new RemoteInfo[0]);
        
    }
    
    public static RepositoryInfo getRepositoryInfo() {
    	return repositoryInfo;
    }
    
    public static void setLogs2(){
        
        String[] output ;
        try{
            Runtime rt = Runtime.getRuntime();
            StringBuilder cmd = new StringBuilder("git log --exclude=refs/stash --all --max-count="+Constants.CommitLimit+" --date=iso ");
            cmd.append(Constants.logFormat);
            var url = StateManager.getSelectedRepoInfo().url;
            Process proc = rt.exec(cmd.toString(),null, new File(url));
            
            StreamGobler errorGobbler = new 
                    StreamGobler(proc.getErrorStream(), "ERROR");
            StreamGobler outputGobbler = new 
                    StreamGobler(proc.getInputStream(), "OUTPUT");

            outputGobbler.read();
            errorGobbler.read();
            
            //errorGobbler.start();
            int exitVal = proc.waitFor();
            
            System.out.println("ExitValue: " + exitVal);   

            output = outputGobbler.getOutput();
            var error = errorGobbler.getOutput();
            
            System.out.println("Final output: " + output.length);
            if(output.length> 0) {            	
            	repositoryInfo.allCommits = LogParser.Parse(output); 
            }
            else System.out.println("error:"+error);
            System.out.println("com.bsse.business.GitManager.setLogs2()");

        }catch(Throwable t){
            t.printStackTrace();
        }
        
    }        
    
    private static void createTree(){        
        CommitInfo[] commits = repositoryInfo.allCommits;
        var branchTree = new ArrayList<BranchDetails>();
        BranchDetails ownerBranch ;
        ArrayList<BranchDetails> branchDetails = new ArrayList<>();
        ArrayList<LastReference> lastReferencesByBranch = new ArrayList<LastReference>();        
        
        Function<CommitInfo,BranchDetails> createNewBranch =  (CommitInfo parentCommit) -> {
          var newOwnerBranch = new BranchDetails();
          newOwnerBranch.name = "";
          newOwnerBranch.parentCommit = parentCommit;
          newOwnerBranch.noDerivedCommits = false;          
          if(parentCommit == null) {
        	  branchTree.add(newOwnerBranch);
        	  newOwnerBranch.serial = branchDetails.size();
          }
          else {
        	  var serialOfParentCommit = parentCommit.ownerBranch.commits.indexOf(parentCommit)+1;
        	  newOwnerBranch.serial = parentCommit.ownerBranch.serial +  (1.0 / serialOfParentCommit);
          }
          branchDetails.add(newOwnerBranch);
          return newOwnerBranch;
        };
        
        for(var i = 0; i < commits.length; i++){
            final var currentCommit = commits[i];
            currentCommit.referedBranches = getBranchFromReference(currentCommit.refs);
            var lastRef = CheckBranchReferenceInCommitMessage(currentCommit);
            if(lastRef != null) lastReferencesByBranch.add(lastRef);
        
            ArrayList<BranchRemote> branchRemoteList = ArrayUtil.map(currentCommit.referedBranches, r-> getBranchRemote(r));
            currentCommit.branchNameWithRemotes = branchRemoteList.toArray(new BranchRemote[0]);                        
            
            CommitInfo previousCommit = ArrayUtil.find(commits, commit -> commit.avrebHash.equals(currentCommit.parentHashes.get(0)));
            
            if(previousCommit != null){
            	currentCommit.previousCommit = previousCommit;            	
                if(previousCommit.nextCommit != null){            
                  ownerBranch = createNewBranch.apply(previousCommit);
                  previousCommit.branchesFromThis.add(ownerBranch);
                }else{              
                    ownerBranch=previousCommit.ownerBranch;
                    previousCommit.nextCommit = currentCommit;                    
                }                  
            }
            else{
                ownerBranch = createNewBranch.apply(null);
            }
            
            currentCommit.ownerBranch = ownerBranch;
            currentCommit.ownerBranch.commits.add(currentCommit);

	        if(currentCommit.branchNameWithRemotes.length != 0 ){
	        	BranchRemote remoteBranch = ArrayUtil.find(currentCommit.branchNameWithRemotes, (arg0)-> !StringUtil.isNullOrEmpty(arg0.remote));
	         	
	            if(remoteBranch != null) currentCommit.ownerBranch.name = remoteBranch.branchName;                        
	            else currentCommit.ownerBranch.name = currentCommit.branchNameWithRemotes[0].branchName;
	            
	            BranchDetails parentBranch = NullUtil.withSafe(()-> currentCommit.ownerBranch.parentCommit.ownerBranch);
	            
	            if(parentBranch != null){
	                var branchNameWithRemotes = currentCommit.branchNameWithRemotes;                
	                var isParentBranch = ArrayUtil.any(branchNameWithRemotes,(branchNameWithRemote) -> {                        
	                    return branchNameWithRemote.branchName.equals(parentBranch.name);                        
	                });                    
	                if(isParentBranch){
	                	parentBranch.commits.get(parentBranch.commits.size()-1).nextCommit = ownerBranch.commits.get(0);
	                    parentBranch.commits.addAll(ownerBranch.commits);
	                    for (CommitInfo commit : ownerBranch.commits) {
	                        commit.ownerBranch = parentBranch;
	                    }
	                    currentCommit.ownerBranch = parentBranch;
	                    branchDetails.remove(ownerBranch);
	                }                
	            }
	
	        }

        }
        
        repositoryInfo.branchTree = branchTree.toArray(new BranchDetails[0]);
//        branchDetails.sort((x,y)->{
//        	return x.serial > y.serial? 1:-1 ;
//        });
        repositoryInfo.resolvedBranches = branchDetails.toArray(new BranchDetails[0]);
        repositoryInfo.lastReferencesByBranch = lastReferencesByBranch.toArray(new LastReference[0]);        
    }
    
    private static LastReference CheckBranchReferenceInCommitMessage(CommitInfo commit) {
    	var indexOfPrefix = commit.message.indexOf(StringUtil.MergedCommitMessagePrefix);
    	if(indexOfPrefix == -1) return null;
    	var branchName = commit.message.substring(indexOfPrefix+StringUtil.MergedCommitMessagePrefix.length());
    	branchName = branchName.substring(0, branchName.indexOf("\'"));
    	var lastRef =  new LastReference(branchName, commit.date);
    	return lastRef;
    }
    
    private static void generateSourceCommits() {
    	var sourceCommits = ArrayUtil.filter(repositoryInfo.allCommits, c -> c.branchesFromThis.size() > 0);
    	repositoryInfo.sourceCommits = sourceCommits.toArray(new CommitInfo[0]);
    }
    
    private static void fixSourceCommits() {
    	for (int i = repositoryInfo.sourceCommits.length-1; i>=0; i--) {
    		var sourceCommit = repositoryInfo.sourceCommits[i];			
			if(sourceCommit.branchNameWithRemotes.length != 0) continue;
			
			for(var branch: sourceCommit.branchesFromThis) {
				if(branch.name.isBlank())continue;
				
				if(ArrayUtil.any(repositoryInfo.lastReferencesByBranch, ref -> ref.branchName.equals(branch.name) && ref.dateTime.compareTo(sourceCommit.date) < 0 )) {
					var currentOwnerBranch = sourceCommit.ownerBranch;
					if(currentOwnerBranch.parentCommit != null) {
						currentOwnerBranch.parentCommit.branchesFromThis.remove(currentOwnerBranch);
						currentOwnerBranch.parentCommit.branchesFromThis.add(branch);	
					}
					
					sourceCommit.branchesFromThis.remove(branch);
					sourceCommit.branchesFromThis.add(currentOwnerBranch);
					sourceCommit.nextCommit = branch.commits.get(0);
					branch.parentCommit = currentOwnerBranch.parentCommit;
					currentOwnerBranch.parentCommit = sourceCommit;	
					
					var currentOwnerBranchSerial =  currentOwnerBranch.serial;
					currentOwnerBranch.serial = branch.serial;
					branch.serial = currentOwnerBranchSerial;
					
					var commitToMove = sourceCommit;
					while (commitToMove != branch.parentCommit) {
						if(!commitToMove.ownerBranch.name.equals(currentOwnerBranch.name)) break;
						commitToMove.ownerBranch.commits.remove(commitToMove);
						commitToMove.ownerBranch = branch;
						branch.commits.add(0, commitToMove);
						commitToMove = commitToMove.previousCommit;						
					}
					
					break;
				}
				
			}					
		}
    }
    
    public static void setRepo(RepoInfo repo){
        FileRepositoryBuilder builder = new FileRepositoryBuilder();
        Repository repository;
        try {
            repository = builder.setGitDir(new File(Paths.get(repo.url,".git").toString())).readEnvironment().findGitDir().build(); // scan environment GIT_* variables.findGitDir()
            
        } catch (IOException ex) {
            ex.printStackTrace();
            return;
        }  
        git = new Git(repository);
        
        try {
            setRemotes();
        } catch (GitAPIException ex) {
            ex.printStackTrace();
        }
        
        try {
            setLogs2();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        
        createTree();        
        generateSourceCommits();
        fixSourceCommits();
        
        Arrays.sort(repositoryInfo.resolvedBranches,(x,y)->  x.serial > y.serial?1:-1);        
        
        StateManager.setRepositoryInfo(repositoryInfo);

    }


    private static String[] getBranchFromReference(String commitRef) {
    	final ArrayList<String> branches = new ArrayList<>();
    	if(commitRef.startsWith(headPrefix)) commitRef = commitRef.substring(headPrefix.length());
    	if(!StringUtil.isNullOrEmpty(commitRef)) {
    		final var splits = commitRef.split(",");        
            for (String split : splits) {
              split = split.trim();
              if(split.startsWith("tag:")) continue;
              branches.add(split);  
            }
    	}
                        
        return branches.toArray(new String[0]);
    }
    
    private static BranchRemote getBranchRemote(String branchNameStr){
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
      final BranchRemote branchRemote= new BranchRemote();
      branchRemote.branchName = branchName;
      branchRemote.remote = remote;
      
      return branchRemote;
    }

}
