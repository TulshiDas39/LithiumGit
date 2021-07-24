/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.business;

import java.util.ArrayList;

import com.bsse.dataClasses.BranchDetails;
import com.bsse.dataClasses.CommitInfo;
import com.bsse.dataClasses.RepoInfo;
import com.bsse.dataClasses.RepositoryInfo;
import com.bsse.dataClasses.StaticData;

/**
 *
 * @author ASUS
 */
public class StateManager {

    private static RepoInfo selectedRepoInfo;
    private static ArrayList<BranchDetails> branchTree;
    private static RepositoryInfo repositoryInfo;
    private static CommitInfo selectedCommit;

    public static RepoInfo getSelectedRepoInfo() {
        return selectedRepoInfo;
    }

    public static void setSelectedRepoInfo(RepoInfo selectedRepoInfo) {
        StateManager.selectedRepoInfo = selectedRepoInfo;
        StaticData.topNav.updateUi();
        StaticData.body.updateUi();
        GitManager.setRepo(StateManager.getSelectedRepoInfo());
    }
    
    public static ArrayList<BranchDetails> getBranchTree(){
    	return branchTree;
    }
    
    public static void setBranchTree(ArrayList<BranchDetails> tree) {
    	branchTree = tree;
    }
    
    public static void setRepositoryInfo(RepositoryInfo repositoryInfo) {
    	StateManager.repositoryInfo = repositoryInfo;
    	StaticData.selectedRepoRightPanel.updateUi();
    }
    
    public static RepositoryInfo getRepositoryInfo() {
    	return repositoryInfo;
    }
    
    public static void setSelectedCommit(CommitInfo commit) {
    	selectedCommit = commit;
    	StaticData.commitProperty.updateUi(commit);
    }
    public static CommitInfo getSelectedCommit() {
    	return selectedCommit;    	
    }
    
}
