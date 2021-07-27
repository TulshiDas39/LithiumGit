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
public class LastReference {
  public final String dateTime;
  public final String branchName;
  
  public LastReference(String branchName,String dateTime) {
	this.branchName = branchName;
	this.dateTime = dateTime;
}
}
