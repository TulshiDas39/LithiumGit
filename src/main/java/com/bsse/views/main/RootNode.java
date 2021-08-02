
package com.bsse.views.main;

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
    
    private void addStyles(){
        getStyleClass().add("border");
    }
            
    private void addChildNodes(){
        var childs = new ArrayList<Node>();
                
        var topNav = new TopNav();
        StaticData.topNav = topNav;
        childs.add(topNav);
        
        var body = new Body();
        StaticData.body = body;
        childs.add(body);
        
        this.getChildren().addAll(childs);
    }
        
    
}
