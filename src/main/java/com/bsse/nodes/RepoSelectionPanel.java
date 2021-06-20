
package com.bsse.nodes;

import java.util.ArrayList;
import javafx.scene.Node;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;

/**
 *
 * @author ASUS
 */
public class RepoSelectionPanel extends HBox{

    public RepoSelectionPanel() {
        super();
        addStyles();
        addChildNodes();
    }
    
    private void addStyles(){
        getStyleClass().add("border-red");
    }
    
    private void addChildNodes(){
        var childNodes = new ArrayList<Node>();
        childNodes.add(getRecentRepositoryPanel());
        
        getChildren().addAll(childNodes);
    }
    
    private Node getRecentRepositoryPanel(){
        var node = new VBox();
        var childNodes = node.getChildren();
        
        var text = new Text("Select repository");
        childNodes.add(text);
        
        return node;
    }
     
}
