/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.views.main;

import com.bsse.business.StateManager;
import com.bsse.enums.SelectedTab;

import javafx.scene.input.MouseEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;

/**
 *
 * @author ASUS
 */
public class TabSelection extends VBox{
	private final HBox changesTab = new HBox();
	private final HBox branchExplorer = new HBox();

    public TabSelection() {
        super();
        addStyles();
        addChildNodes();
    }
    private void addStyles(){
        getStyleClass().addAll("border-green","cur-point");
    }
    private void addChildNodes(){
    	
        createBranchExplorerTab();
        createChangeTab();                
        getChildren().addAll(this.changesTab,this.branchExplorer);
    }
    
    private void createChangeTab(){
        
        var text = new Text("Changes");
        changesTab.getStyleClass().addAll("py-2");
        changesTab.addEventFilter(MouseEvent.MOUSE_CLICKED, e-> StateManager.setSelectedTab(SelectedTab.Changes));
        changesTab.getChildren().addAll(text);        
    }
    
    private void createBranchExplorerTab(){
    	branchExplorer.getStyleClass().addAll("py-2");
    	
    	//branchExplorer.setBorder(new Border());;
        var text = new Text("Branch Explorer");     
        branchExplorer.addEventFilter(MouseEvent.MOUSE_CLICKED, e-> StateManager.setSelectedTab(SelectedTab.BranchExplorer));
        
        branchExplorer.getChildren().addAll(text);
    }
    
}
