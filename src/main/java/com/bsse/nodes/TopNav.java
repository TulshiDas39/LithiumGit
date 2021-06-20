/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.nodes;

import com.bsse.dataClasses.Constants;
import com.bsse.dataClasses.RepoInfo;
import com.bsse.dataClasses.StaticData;
import com.bsse.interfaces.AppNode;
import java.util.ArrayList;
import java.util.function.Consumer;
import javafx.scene.Node;
import javafx.scene.control.ComboBox;
import javafx.scene.layout.HBox;
import javafx.scene.text.Text;

/**
 *
 * @author ASUS
 */
public class TopNav extends HBox{    

    public TopNav() {
        super();
        addStyles();
        addChildNodes();
        StaticData.topNav = this;
    }
    
    private void addStyles(){
        setWidth(300);
        getStyleClass().add("border");
    }
    
    private void addChildNodes(){
        var childNodes = new ArrayList<Node>();
                
        childNodes.add(getRepositoryOption());
        childNodes.add(getRepoDropdown());
        
        
        getChildren().addAll(childNodes);
        
    }
    
    private Node getRepositoryOption(){
        var option = new HBox();
        option.getStyleClass().add("cur-point");
        var text = new Text("Repositories");
        option.getChildren().add(text);
        option.getStyleClass().add("border");
        return option;
    }
    
    private Node getActionTools(){
        var hBox = new HBox();
                                      
        hBox.getChildren().add(getRepoDropdown());
        
        
        return hBox;
    }
    
    private Node getRepoDropdown(){
        var repos = new ComboBox<String>();
        var options = new ArrayList<String>();
        Constants.repos.forEach(new Consumer<RepoInfo>() {
            @Override            
            public void accept(RepoInfo repo) {
                options.add(repo.name);
            }
        });
        
        repos.getItems().addAll(options);
        repos.setValue(options.get(0));
        return repos;
    }
    
}
