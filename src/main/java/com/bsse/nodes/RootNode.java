
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
        getStyleClass().add("border");
    }
    
    private void addChildNodes(){
        var childs = new ArrayList<Node>();
                
        childs.add(new TopNav());
        this.getChildren().addAll(childs);
    }        
    
}
