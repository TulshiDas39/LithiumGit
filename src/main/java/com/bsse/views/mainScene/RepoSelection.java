/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.views.mainScene;

import java.util.ArrayList;
import javafx.scene.Node;
import javafx.scene.layout.HBox;

/**
 *
 * @author ASUS
 */
public class RepoSelection extends HBox{

    public RepoSelection() {
        super();
        addStyle();
        addChildNodes();
    }
    
    private void addStyle(){
        
    }
    
    private void addChildNodes(){
        var childs = new ArrayList<Node>();
        var recentRepoPanel = new RepoSelectionPanel();
        childs.add(recentRepoPanel);
        
        
        
        getChildren().addAll(childs);
        
    }
    
}
