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
public class CommitInfo {
  public String avrebHash;
  public ArrayList<BranchDetails> branchesFromThis ;
  public ArrayList<String> parentHashes;
  public BranchDetails ownerBranch;
  public String referedBranches;
  public BranchRemote branchNameWithRemotes;
  public CommitInfo nextCommit;
  public CommitInfo previousCommit ;
}
