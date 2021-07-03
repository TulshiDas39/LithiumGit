/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.business;

import com.bsse.dataClasses.BranchDetails;
import com.bsse.dataClasses.CommitInfo;
import com.bsse.dataClasses.Constants;
import com.bsse.dataClasses.RepoInfo;
import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.ObjectId;
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
    
    public static void setLogs2(){
        
        ArrayList<String> output ;
        try{
            Runtime rt = Runtime.getRuntime();
            StringBuilder cmd = new StringBuilder("git log --all --max-count=500 --date=iso ");
            cmd.append(Constants.logFormat);
//            var url = "C:/Users/ASUS/Documents/workspace/joylist/joylist-client";
            var url = StateManager.getSelectedRepoInfo().url;
            //cmd.append(" -o ").append(StateManager.getSelectedRepoInfo().url);
            Process proc = rt.exec(cmd.toString(),null, new File(url));
//            Process proc = new ProcessBuilder(cmd.toString())
//                .directory(new File(StateManager.getSelectedRepoInfo().url))
//                .start();
            
            StreamGobler errorGobbler = new 
                    StreamGobler(proc.getErrorStream(), "ERROR");
//           
            StreamGobler outputGobbler = new 
                    StreamGobler(proc.getInputStream(), "OUTPUT");

            outputGobbler.read();
            errorGobbler.read();
            
            //errorGobbler.start();
            int exitVal = proc.waitFor();
            
            //outputGobbler.join();
            //errorGobbler.join();
            System.out.println("ExitValue: " + exitVal);   

            output = outputGobbler.getOutput();
            var error = errorGobbler.getOutput();
            
            System.out.println("Final output: " + output.size());
            if(output.size()> 0) logs  = LogParser.Parse(output);
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

    }

}
