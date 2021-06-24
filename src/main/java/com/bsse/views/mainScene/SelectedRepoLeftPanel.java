/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.views.mainScene;

import java.util.ArrayList;
import javafx.scene.Node;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;

/**
 *
 * @author ASUS
 */
public class SelectedRepoLeftPanel extends VBox{

    public SelectedRepoLeftPanel() {
        super();
        addStyles();
        addChildNodes();
    }
    private void addStyles(){
        getStyleClass().addAll("border-green","cur-point");
    }
    private void addChildNodes(){
        var childs = new ArrayList<Node>();
        var branchExplorer = getBranchExplorerTab();
        childs.add(branchExplorer);
        
        getChildren().addAll(childs);
    }
    
    private Node getBranchExplorerTab(){
        var node = new HBox();
        
        var text = new Text("Branch Explorer");
        
        node.getChildren().addAll(text);
        return node;
    }
    
}
