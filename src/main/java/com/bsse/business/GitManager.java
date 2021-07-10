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
import java.util.Comparator;
import java.util.Map;
import java.util.function.Consumer;
import java.util.function.Function;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
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

/**
 *
 * @author ASUS
 */
public class GitManager {
    private static Git git ;
//    private static ArrayList<BranchDetails> branchDetails;        
    //private static ArrayList<LastReference> lastReferencesByBranch ;
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
            StringBuilder cmd = new StringBuilder("git log --all --max-count=5 --date=iso ");
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
    
    public static void setLogs() throws GitAPIException{
        var logCommand = git.log();
        logCommand.setMaxCount(500);
        var commits = logCommand.call();        
        var test = git.branchList().call();
        var lef = test.get(0).getLeaf();        
        //var notes = git.notesList().call();
        //var notname = notes.get(0).getName();
        //var name = lef.getName();
        //lef.
        var test3 = 3;
       
        
        commits.forEach(new Consumer<RevCommit>() {
            @Override
            public void accept(RevCommit x) {
                var commit = new CommitInfo();
                commit.hash = x.getId().name();
                commit.avrebHash = x.getId().abbreviate(7).name();
                for (RevCommit parent : x.getParents()) {
                 commit.parentHashes.add(parent.getId().name());
                }
                commit.message = x.getFullMessage();
                commit.author_email = x.getAuthorIdent().getEmailAddress();
                commit.author_name = x.getAuthorIdent().getName();
                var time = x.getCommitTime();
                var tree = x.getTree();
                var footerLines = x.getFooterLines();
//                footerLines.get(0).
                var shortMessage = x.getShortMessage();                
                var ray = new String(x.getRawBuffer(),x.getEncoding());
                Map<ObjectId, String> map = null;
                try {
                    map = git.nameRev()
                            .add(ObjectId.fromString(commit.hash)).call();
                } catch (Exception ex) {
                    
                }
                if(map != null){
                    var value = map.get(x.getId());
                }
                
                System.out.println(".accept()");
            }
        });
    }    
    
    private static void createTree(){        
        CommitInfo[] commits = new CommitInfo[repositoryInfo.allCommits.length];
        System.arraycopy(repositoryInfo.allCommits, 0, commits, 0, repositoryInfo.allCommits.length);
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
        	  newOwnerBranch.serial = parentCommit.ownerBranch.serial +  (1 / serialOfParentCommit);
          }
          branchDetails.add(newOwnerBranch);
          return newOwnerBranch;
        };
        
        for(var i = commits.length-1; i>=0; i--){
            final var currentCommit = commits[i];
            setReference(currentCommit,lastReferencesByBranch);
            currentCommit.referedBranches = getBranchFromReference(currentCommit.refs);
        
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
            //check parent branch is same
            BranchDetails parentBranch = NullUtil.withSafe(()-> currentCommit.ownerBranch.parentCommit.ownerBranch);            
            if(parentBranch != null && currentCommit.branchNameWithRemotes.length != 0){
                var branchNameWithRemotes = currentCommit.branchNameWithRemotes;                
                var isParentBranch = ArrayUtil.any(branchNameWithRemotes,(branchNameWithRemote) -> {                        
                    return branchNameWithRemote.branchName.equals(parentBranch.name);                        
                });                    
                if(isParentBranch){
                    parentBranch.commits.addAll(ownerBranch.commits);
                    for (CommitInfo commit : ownerBranch.commits) {
                        commit.ownerBranch = parentBranch;
                    }
                    currentCommit.ownerBranch = parentBranch;
                }                
            }
            else{
            	
            	BranchRemote remoteBranch = ArrayUtil.find(currentCommit.branchNameWithRemotes, (arg0)-> !StringUtil.isNullOrEmpty(arg0.remote));
            	                                 	
                if(remoteBranch != null) currentCommit.ownerBranch.name = remoteBranch.branchName;                        
                else currentCommit.ownerBranch.name = currentCommit.branchNameWithRemotes[0].branchName;
                
//                for (CommitInfo commit : currentCommit.ownerBranch.commits) {
//                    commit.ownerBranch = ownerBranch;
//                }
                                        
//                final var parentCommitOfOwnerBranch = ownerBranch.parentCommit;
//                if(parentCommitOfOwnerBranch != null) parentCommitOfOwnerBranch.branchesFromThis.add(ownerBranch);                        
            }
        }

//        currentCommit.ownerBranch.commits.add(currentCommit);
//        if(!StringUtil.isNullOrEmpty(currentCommit.ownerBranch.name) ) {        
//          currentCommit.previousCommit = previousCommit;
//        }


        }
        
        repositoryInfo.branchTree = branchTree.toArray(new BranchDetails[0]);
        branchDetails.sort((x,y)->{
        	return x.serial > y.serial? 1:-1 ;
        });
        repositoryInfo.resolvedBranches = branchDetails.toArray(new BranchDetails[0]);        
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

    }

    private static void setReference(CommitInfo commit,ArrayList<LastReference> lastReferencesByBranch ) {
        if(commit.message.contains("branch ") ){
            var reference = new LastReference();
            reference.dateTime = commit.date;
            reference.message = commit.message;
            lastReferencesByBranch.add(reference);
        }
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
