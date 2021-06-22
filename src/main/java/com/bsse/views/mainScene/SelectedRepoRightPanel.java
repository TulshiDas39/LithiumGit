
package com.bsse.views.mainScene;

import javafx.scene.layout.HBox;
import javafx.scene.text.Text;

public class SelectedRepoRightPanel extends HBox{

    public SelectedRepoRightPanel() {
        super();
        this.addStyles();
        this.addChildNodes();
    }
    
    private void addStyles(){
        
    }
    
    private void addChildNodes(){
        var text = new Text("Selected repo panel");
        
        getChildren().addAll(text);
    }
    
    
}
