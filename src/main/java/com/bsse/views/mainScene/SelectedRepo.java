/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.views.mainScene;

import java.util.ArrayList;

import com.bsse.dataClasses.StaticData;

import javafx.scene.Node;
import javafx.scene.layout.HBox;
import javafx.scene.text.Text;

/**
 *
 * @author ASUS
 */
public class SelectedRepo extends HBox{

    public SelectedRepo() {
        super();
        addStyle();
        addChildNode();
    }
    
    private void addStyle(){
        
    }
    
    private void addChildNode(){
        var childs = new ArrayList<Node>();
                
        
        childs.add(new SelectedRepoLeftPanel());
        var selectedRepoRightPanel = new SelectedRepoRightPanel();
        StaticData.selectedRepoRightPanel = selectedRepoRightPanel;
        childs.add(selectedRepoRightPanel);
        
        getChildren().addAll(childs);
        
    }
    
}
