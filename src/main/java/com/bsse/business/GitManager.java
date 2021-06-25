/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.business;
import java.io.File;
import java.io.IOException;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;

/**
 *
 * @author ASUS
 */
public class GitManager {
    //private Git git =new Git();
    private String s= "";
    
    public void init(String path){
        FileRepositoryBuilder builder = new FileRepositoryBuilder();
        Repository repository;
        try {
            repository = builder.setGitDir(new File("/my/git/directory")).readEnvironment().findGitDir().build(); // scan environment GIT_* variables.findGitDir()
            
        } catch (IOException ex) {
            ex.printStackTrace();
            return;
        }  
        Git git = new Git(repository);

    }
}
