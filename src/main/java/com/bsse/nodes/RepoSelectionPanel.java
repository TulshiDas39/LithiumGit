
package com.bsse.nodes;

import com.bsse.dataClasses.Constants;
import java.util.ArrayList;
import javafx.scene.Node;
import javafx.scene.control.ListView;
import javafx.scene.control.ScrollPane;
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
        childNodes.add(getRecentRepositoryListPanel());
        
        getChildren().addAll(childNodes);
    }
    
    private Node getRecentRepositoryListPanel(){
        var bBox = new VBox();
        var childNodes = bBox.getChildren();
        
        var text = new Text("Select repository");
        childNodes.add(text);
        
        var repoNodes = getRepoNodes();
        childNodes.addAll(repoNodes);
        
        ScrollPane scrollPane = new ScrollPane();
        scrollPane.setContent(bBox);
        
        return scrollPane;
    }
    
    private ArrayList<Node> getRepoNodes(){
        var nodes = new ArrayList<Node>();
        for(var repo : Constants.repos){
            var node = new VBox();
            
            var firstRow = new HBox();
            var repoName = new Text(repo.name);
            firstRow.getChildren().add(repoName);
            node.getChildren().add(firstRow);
            
            var secondRow = new HBox();
            var url = new Text(repo.url);
            secondRow.getChildren().add(url);
            node.getChildren().add(secondRow);
            
            nodes.add(node);
        }
        return nodes;
    }
    
     
}
