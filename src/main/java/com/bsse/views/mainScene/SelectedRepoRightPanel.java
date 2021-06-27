
package com.bsse.views.mainScene;

import com.bsse.business.GitManager;
import javafx.scene.layout.HBox;
import javafx.scene.text.Text;
import org.eclipse.jgit.api.errors.GitAPIException;

public class SelectedRepoRightPanel extends HBox{

    public SelectedRepoRightPanel() {
        super();
        this.addStyles();
        this.addChildNodes();
        getTree();
    }
    
    private void getTree(){
        try {
            GitManager.setLogs();
        } catch (GitAPIException ex) {
            ex.printStackTrace();
        }
    }
    
    private void addStyles(){
        
    }
    
    private void addChildNodes(){
        var text = new Text("Selected repo panel");
        
        getChildren().addAll(text);
    }
    
    
}
