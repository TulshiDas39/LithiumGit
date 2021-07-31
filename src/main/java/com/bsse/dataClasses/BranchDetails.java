/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.dataClasses;

import java.util.ArrayList;

import javafx.scene.Group;

/**
 *
 * @author ASUS
 */
public class BranchDetails {
  public String name="";
  public ArrayList<CommitInfo> commits = new ArrayList<>();
  public LastCommitByRemote[] LastCommitsByRemotes;
  public boolean noDerivedCommits;
  public CommitInfo parentCommit;
  public double serial;
  public int y;
  public Group uiObj;
  
  public double getSerial() {
	  if(serial != 0.0) return serial;	  
	  var parentSerial = this.parentCommit.ownerBranch.getSerial();
	  int commitInex;
	  if(!name.isBlank())commitInex = this.parentCommit.ownerBranch.commits.indexOf(this.parentCommit)+1;
	  else commitInex = this.parentCommit.ownerBranch.commits.size()+1;
	  var measuredSerial = parentSerial+ parentSerial * (1.0/(10.0*commitInex));
	  return measuredSerial;
  }
  
}


