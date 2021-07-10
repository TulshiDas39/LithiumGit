
package com.bsse.views.mainScene;

import com.bsse.business.GitManager;
import com.bsse.dataClasses.BranchDetails;
import com.bsse.dataClasses.CommitInfo;
import com.bsse.dataClasses.RepositoryInfo;

import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;

public class SelectedRepoRightPanel extends HBox{
	private RepositoryInfo repositoryInfo;
	
    public SelectedRepoRightPanel() {
        super();
        this.addStyles();
        this.addChildNodes();
        this.repositoryInfo = GitManager.getRepositoryInfo();
        drawBranch();
    }
    
    private void drawBranch() {
    	
    	final int branchLineHeight = 30;
    	int lineNumber = 0;
    	
    	for (BranchDetails branch : this.repositoryInfo.branchTree) {
    		lineNumber = drawSingleBranch(branch,lineNumber);
		}
    	
    }
    
    private int drawSingleBranch(BranchDetails branch,int lineNumber) {    	
		int height = lineNumber*10;
		int x = 10;
		
		for (CommitInfo commit : branch.commits) {
			
		}
		
		return lineNumber;
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
