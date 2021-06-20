
package com.bsse.nodes;

import com.bsse.dataClasses.RepoInfo;
import com.bsse.dataClasses.StaticData;
import java.util.ArrayList;
import javafx.scene.Node;
import javafx.scene.layout.VBox;


public class RootNode extends VBox{
    private RepoInfo selectedRepo;

    private RepoSelectionPanel repoSelectionPanel;
    
    public RootNode() {
        super();
        addStyles();
        addChildNodes();
    }
    
    public void handleRepoSelection(){
        if(this.selectedRepo != StaticData.selectedRepo){
            this.selectedRepo = StaticData.selectedRepo;
            
            if(selectedRepo != null) getChildren().removeAll(this.repoSelectionPanel);
        }
    }
    
    private void addStyles(){
        getStyleClass().add("border");
    }
    
    
    
    private void addChildNodes(){
        var childs = new ArrayList<Node>();
                
        childs.add(new TopNav());
        if(this.selectedRepo == null){
            this.repoSelectionPanel = new RepoSelectionPanel();
            childs.add(this.repoSelectionPanel);
        }
        else{
            
        }
        this.getChildren().addAll(childs);
    }        
    
}
