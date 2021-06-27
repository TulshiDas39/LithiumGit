/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.business;

import com.bsse.dataClasses.RepoInfo;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.Repository;
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
    
    public static void setRemotes() throws GitAPIException{
        var remotesTemp = git.remoteList().call();
        remotes = new ArrayList<>(remotesTemp);
    }
    
    public static void setLogs(){
        var logCommand = git.log();
        
        //remotes = new ArrayList<>(remotesTemp);
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
