/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.views;

import com.bsse.business.StateManager;
import com.bsse.dataClasses.StaticData;
import com.bsse.views.main.RootNode;

import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.input.MouseEvent;

/**
 *
 * @author ASUS
 */
public class MainView extends Scene{
    private final String style = MainView.class.getResource("/compiled-css/style.css").toExternalForm();
    public MainView() {        
        super(getScene(),900, 500);     
        addStyleSheets();
        addClickListener();
    }    
    
    private void addClickListener() {
    	this.addEventFilter(MouseEvent.MOUSE_CLICKED, e -> {
            StateManager.handleClickGlobally(e);
        });
    }
    
    private void addStyleSheets(){
        getStylesheets().add(style);
    }
    
    private static Parent getScene() {
        var rootNode = new RootNode();
        StaticData.rootNode = rootNode;                
        return rootNode;
    }
	
}