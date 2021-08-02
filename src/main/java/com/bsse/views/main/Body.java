/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.views.main;

import com.bsse.business.StateManager;
import com.bsse.dataClasses.RepoInfo;
import com.bsse.dataClasses.StaticData;

import java.util.ArrayList;
import javafx.scene.Node;
import javafx.scene.layout.VBox;

/**
 *
 * @author ASUS
 */
public class Body extends VBox{

    private RepoInfo selectedRepoInfo;
    private RepoSelection repoSelection=new RepoSelection();
    private SelectedRepo selectedRepo = new SelectedRepo();

    public Body() {
        super();
        StaticData.selectedRepo = selectedRepo;
        selectedRepoInfo = StateManager.getSelectedRepoInfo();
        addStyle();
        addChildNodes();
    }
    
    private void addStyle(){
        
    }
    
    private void addChildNodes(){
        var childs = new ArrayList<Node>();
        
        if(this.selectedRepoInfo == null){            
            childs.add(this.repoSelection);
        }
        else{            
            childs.add(this.selectedRepo);
        }
        
        this.getChildren().addAll(childs);
    }
    
    public void updateUi(){    	
        if(this.selectedRepoInfo == null || StateManager.getSelectedRepoInfo() == null){
            this.selectedRepoInfo = StateManager.getSelectedRepoInfo();
            handleRepoSelection();
        }
    }
    
    private void handleRepoSelection(){
        var childs = getChildren();
        if(selectedRepoInfo == null){
            childs.remove(this.selectedRepo);
            childs.add(this.repoSelection);
        }
        else{
            this.getChildren().remove(this.repoSelection);
            this.getChildren().add(this.selectedRepo);
        }
    }
    
}
