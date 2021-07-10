
package com.bsse.views.mainScene;

import com.bsse.business.GitManager;
import com.bsse.business.StateManager;
import com.bsse.dataClasses.BranchDetails;
import com.bsse.dataClasses.RepositoryInfo;

import javafx.scene.Node;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.layout.VBox;
import javafx.scene.shape.Line;
import javafx.scene.text.Text;

public class SelectedRepoRightPanel extends HBox{
	private RepositoryInfo repositoryInfo;
	
    public SelectedRepoRightPanel() {
        super();
        this.addStyles();
        this.addChildNodes();
        this.repositoryInfo = StateManager.getRepositoryInfo();
       // drawBranch();
    }
    
    public void updateUi() {
    	if(this.repositoryInfo != StateManager.getRepositoryInfo()) drawBranch();
    }
    
    public void drawBranch() {
    	this.repositoryInfo = StateManager.getRepositoryInfo();
    	    	
    	int lineNumber = 0;
    	
    	var vBox = new VBox();
    	
    	for (BranchDetails branch : this.repositoryInfo.resolvedBranches) {
    		var line = drawSingleBranch(branch,lineNumber);
    		vBox.getChildren().add(line); 
    		lineNumber++;
		}
    	getChildren().add(vBox);
    	
    }
    
    private Node drawSingleBranch(BranchDetails branch,int lineNumber) {    	
		int height = lineNumber*10;
		int x = 10;
		var vBox = new VBox();
		var text = new Text(branch.name);
		var line = new Line(0, height, 100, height);		
		vBox.getChildren().addAll(text,line);
				
		return vBox;
	}
    
    
    private void addStyles(){
        
    }
    
    private void addChildNodes(){
        var text = new Text("Selected repo panel");
        
        getChildren().addAll(text);
    }
    
    private Pane getBranchNode() {
    	var container = new VBox();
    	
    	return container;
    }
    
    
}
