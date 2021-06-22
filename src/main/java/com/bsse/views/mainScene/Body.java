/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.views.mainScene;

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
    private RepoSelection repoSelection;
    private SelectedRepo selectedRepo;

    public Body() {
        super();
        selectedRepoInfo = StaticData.selectedRepo;
        addStyle();
        addChildNodes();
    }
    
    private void addStyle(){
        
    }
    
    private void addChildNodes(){
        var childs = new ArrayList<Node>();
        
        if(this.selectedRepoInfo == null){
            this.repoSelection = new RepoSelection();
            childs.add(this.repoSelection);
        }
        else{
            this.selectedRepo = new SelectedRepo();
            childs.add(this.selectedRepo);
        }
        
        this.getChildren().addAll(childs);
    }
    
    public void updateUi(){
        if(StaticData.selectedRepo != this.selectedRepoInfo){
            this.selectedRepoInfo = StaticData.selectedRepo;
            handleRepoSelection();
        }
    }
    
    private void handleRepoSelection(){
        if(selectedRepoInfo == null){
            this.repoSelection = new RepoSelection();
            this.getChildren().add(this.repoSelection);
        }
        else{
            this.getChildren().remove(this.repoSelection);
        }
    }
    
}
