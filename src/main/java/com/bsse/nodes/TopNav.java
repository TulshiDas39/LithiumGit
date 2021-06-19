/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.nodes;

import java.util.ArrayList;
import javafx.scene.Node;
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
    }
    
    private void addStyles(){
        setWidth(300);
    }
    
    private void addChildNodes(){
        var childNodes = new ArrayList<Node>();
        
        var repositoryOption = this.getRepositoryOption();
        childNodes.add(repositoryOption);
        
        
        
        this.getChildren().addAll(childNodes);
        
    }
    
    private Node getRepositoryOption(){
        var option = new HBox();
        var text = new Text("Repositories");
        option.getChildren().add(text);
        return option;        
    }
    
}
