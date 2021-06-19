
package com.bsse.nodes;

import java.util.ArrayList;
import javafx.scene.Node;
import javafx.scene.layout.VBox;

public class RootNode extends VBox{

    public RootNode() {
        super();
        addStyles();
        addChildNodes();
    }
    
    private void addStyles(){
        
    }
    
    private void addChildNodes(){
        var childs = new ArrayList<Node>();
        
        var topNav = new TopNav();        
        
        childs.add(topNav);
        this.getChildren().addAll(childs);
    }        
    
}
