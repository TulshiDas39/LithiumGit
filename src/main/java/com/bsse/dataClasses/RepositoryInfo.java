/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.dataClasses;

/**
 *
 * @author ASUS
 */
public class RepositoryInfo {
    public CommitInfo[] allCommits;
    public BranchDetails branchDetails;
    //branchSummery:undefined!,
    public CommitInfo[] commits;
    public LastReference[] lastReferencesByBranch;
    public String[] uniqueBrancNames;
    public RemoteInfo[] remotes;
    public BranchDetails[] branchTree;
    public BranchDetails[] resolvedBranches;
    public CommitInfo headCommit;
    public String[] mergeCommitMessages;
}
