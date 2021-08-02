/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.views.main;

import com.bsse.business.StateManager;
import com.bsse.dataClasses.StaticData;
import com.bsse.enums.SelectedTab;
import com.bsse.views.main.changes.Changes;

import javafx.scene.layout.BorderPane;

/**
 *
 * @author ASUS
 */
public class SelectedRepo extends BorderPane{
	private final TabSelection tabSelection = new TabSelection();
	private final BranchExplorer branchExplorer = new BranchExplorer();
	private final Changes changes = new Changes();

    public SelectedRepo() {
        super();
        StaticData.selectedRepoRightPanel = branchExplorer;
        addStyle();
        addChildNode();
    }
    
    private void addStyle(){
        //getStyleClass().addAll("border-red");
    }
    
    private void addChildNode(){                
        this.setLeft(tabSelection);
        updateUi();
                   
    }
    
    public void updateUi(){
    	if(StateManager.getSelectedTab() == SelectedTab.BranchExplorer) this.setCenter(branchExplorer);                
        else if(StateManager.getSelectedTab() == SelectedTab.Changes) this.setCenter(changes);
    }
    
}
