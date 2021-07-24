/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.views.mainScene;

import com.bsse.dataClasses.StaticData;

import javafx.scene.layout.BorderPane;

/**
 *
 * @author ASUS
 */
public class SelectedRepo extends BorderPane{

    public SelectedRepo() {
        super();
        addStyle();
        addChildNode();
    }
    
    private void addStyle(){
        //getStyleClass().addAll("border-red");
    }
    
    private void addChildNode(){
                
        this.setLeft(new SelectedRepoLeftPanel());
        var selectedRepoRightPanel = new SelectedRepoRightPanel();        
        StaticData.selectedRepoRightPanel = selectedRepoRightPanel;
        this.setCenter(selectedRepoRightPanel);
        
        
    }
    
}
