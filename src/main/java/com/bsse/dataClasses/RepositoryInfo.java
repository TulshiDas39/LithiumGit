/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.dataClasses;

import java.util.ArrayList;

/**
 *
 * @author ASUS
 */
public class RepositoryInfo {
    public ArrayList<CommitInfo> allCommits;
    public BranchDetails branchDetails;
    //branchSummery:undefined!,
    public ArrayList<CommitInfo> commits;
    public ArrayList<LastReference> lastReferencesByBranch;
    public ArrayList<String> uniqueBrancNames;
    public ArrayList<String> remotes;
    public ArrayList<BranchDetails> branchTree;
    public ArrayList<BranchDetails> resolvedBranches;
    public CommitInfo headCommit;
    public ArrayList<String> mergeCommitMessages;
}
