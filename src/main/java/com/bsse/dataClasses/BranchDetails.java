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
public class BranchDetails {
  public String name="";
  public ArrayList<CommitInfo> commits = new ArrayList<>();
  //public LastCommitsByRemotes:ILastCommitByRemote[];
  public boolean noDerivedCommits;
  public CommitInfo parentCommit;
}
