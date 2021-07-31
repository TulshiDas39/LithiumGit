/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.dataClasses;

import javafx.scene.Group;

/**
 *
 * @author ASUS
 */
public class RepositoryInfo {
    public CommitInfo[] allCommits = new CommitInfo[0];
    public BranchDetails branchDetails;
    public LastReference[] lastReferencesByBranch = new LastReference[0];;
    public String[] uniqueBrancNames=new String[0];;
    public RemoteInfo[] remotes = new RemoteInfo[0];
    public BranchDetails[] branchTree = new BranchDetails[0];;
    public BranchDetails[] resolvedBranches = new BranchDetails[0];;
    public CommitInfo headCommit;
    public String[] mergeCommitMessages = new String[0];;
    public CommitInfo[] sourceCommits= new CommitInfo[0];
    public final RepoInfo repoInfo;
    public Group branchPanel;
    
    public RepositoryInfo(RepoInfo repoInfo) {
		this.repoInfo = repoInfo;
	}
}
