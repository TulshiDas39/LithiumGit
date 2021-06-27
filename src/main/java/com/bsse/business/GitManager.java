/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.business;

import com.bsse.dataClasses.BranchDetails;
import com.bsse.dataClasses.CommitInfo;
import com.bsse.dataClasses.RepoInfo;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.function.Consumer;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.eclipse.jgit.transport.RemoteConfig;

/**
 *
 * @author ASUS
 */
public class GitManager {
    private static Git git ;
    private String s= "";
    private static ArrayList<RemoteConfig> remotes;
    //private static Iterable<RevCommit> logs;    
    private static ArrayList<CommitInfo> logs;

    private static ArrayList<BranchDetails> tree = new ArrayList<>();
    
    public static void setRemotes() throws GitAPIException{
        var remotesTemp = git.remoteList().call();
        remotes = new ArrayList<>(remotesTemp);
    }
    
    public static void setLogs() throws GitAPIException{
        var logCommand = git.log();
        logCommand.setMaxCount(500);
        var commits = logCommand.call();
        
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
                var ray = new String(x.getRawBuffer(),x.getEncoding());
                System.out.println(".accept()");
            }
        });
    }
    
    private static void createNewBranch(CommitInfo parentCommit){
//        ownerBranch = {
//          commits:[],
//          name:"",
//          parentCommit:parentCommit,
//          lastCommitsByRemotes:[],
//          noDerivedCommits:false,
//        }
//        if(!parentCommit)this.repoInfo.branchTree.push(ownerBranch);
//        this.repoInfo.branchDetails.push(ownerBranch);

        var branch = new BranchDetails();
        branch.parentCommit = parentCommit;
        if(parentCommit == null){
            tree.add(branch);
        }
    }
    
    public static void createTree(){
        
    }
    
    public static void setRepo(RepoInfo repo){
        FileRepositoryBuilder builder = new FileRepositoryBuilder();
        Repository repository;
        try {
            repository = builder.setGitDir(new File(repo.url)).readEnvironment().findGitDir().build(); // scan environment GIT_* variables.findGitDir()
            
        } catch (IOException ex) {
            ex.printStackTrace();
            return;
        }  
        git = new Git(repository);

    }
}
