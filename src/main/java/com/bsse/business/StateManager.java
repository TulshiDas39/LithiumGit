/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.business;

import java.util.ArrayList;
import java.util.Iterator;

import com.bsse.dataClasses.BranchDetails;
import com.bsse.dataClasses.CommitInfo;
import com.bsse.dataClasses.RepoInfo;
import com.bsse.dataClasses.StaticData;
import com.bsse.enums.SelectedTab;
import com.bsse.interfaces.GlobalClickListenable;
import com.bsse.views.main.SingleCommit;

import javafx.scene.input.MouseEvent;

/**
 *
 * @author ASUS
 */
public class StateManager {

    private static RepoInfo selectedRepoInfo;
    private static ArrayList<BranchDetails> branchTree;
    private static CommitInfo selectedCommit;
    private static SingleCommit headCommit;
    private static ArrayList<GlobalClickListenable> globalClickListeners = new ArrayList<>();
    private static Iterator<GlobalClickListenable> globalClickListerIterator;
    private static SelectedTab selectedTab = SelectedTab.Changes;

    public static RepoInfo getSelectedRepoInfo() {
        return selectedRepoInfo;
    }

    public static void setSelectedRepoInfo(RepoInfo selectedRepoInfo) {
    	if(StateManager.selectedRepoInfo != null &&  StateManager.selectedRepoInfo.name.equals(selectedRepoInfo.name))return;
        StateManager.selectedRepoInfo = selectedRepoInfo;
        StaticData.topNav.updateUi();
        StaticData.body.updateUi();
        StaticData.selectedRepoRightPanel.updateUi();       
    }
    
    public static ArrayList<BranchDetails> getBranchTree(){
    	return branchTree;
    }
    
    public static void setBranchTree(ArrayList<BranchDetails> tree) {
    	branchTree = tree;
    }
    
    public static void setSelectedCommit(CommitInfo commit) {    	
    	selectedCommit = commit;
    	StaticData.commitProperty.updateUi(commit);
    }
    public static CommitInfo getSelectedCommit() {
    	return selectedCommit;    	
    }
    
    public static void setHeadCommit(SingleCommit commit) {
    	if(StateManager.headCommit == commit)return;
    	if(headCommit != null) headCommit.setIsHead(false);
    	headCommit = commit;
    	headCommit.setIsHead(true);
    }
    public static SingleCommit getHeadCommit() {
    	return headCommit;    	
    }

	public static void handleClickGlobally(MouseEvent e) {
		globalClickListerIterator = globalClickListeners.iterator();		
		while(globalClickListerIterator.hasNext()) {
			globalClickListerIterator.next().handleGlobalClick(e);
		}		
		
	}
	
	public static void addGlobalListener(GlobalClickListenable listener) {
		globalClickListeners.add(listener);
	}
	
	public static void removeGlobalClickListener(GlobalClickListenable listener) {
		if(globalClickListerIterator != null) globalClickListerIterator.remove();
	}
	
	public static void setSelectedTab(SelectedTab tab) {
		if(selectedTab == tab)return;
		selectedTab = tab;
		StaticData.selectedRepo.updateUi();
	}
	public static SelectedTab getSelectedTab() {		
		return selectedTab;
	}
    
}
