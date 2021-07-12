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
public class CommitInfo{
  public String hash;
  public String avrebHash;
  public ArrayList<BranchDetails> branchesFromThis = new ArrayList<BranchDetails>() ;
  public ArrayList<String> parentHashes= new ArrayList<>();  
  public BranchDetails ownerBranch;
  public String[] referedBranches = new String[0];
  public BranchRemote[] branchNameWithRemotes= new BranchRemote[0];
  public CommitInfo nextCommit;
  public CommitInfo previousCommit ;
  public String date;
  public String message;
  public String refs="";
  public String body;
  public String author_name;
  public String author_email;
  public int x;
  public int y;
}
