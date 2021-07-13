
package com.bsse.views.mainScene;

import java.util.ArrayList;

import com.bsse.business.StateManager;
import com.bsse.dataClasses.BranchDetails;
import com.bsse.dataClasses.Constants;
import com.bsse.dataClasses.RepositoryInfo;
import javafx.scene.Group;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.layout.VBox;
import javafx.scene.shape.Line;

public class SelectedRepoRightPanel extends HBox{
	private RepositoryInfo repositoryInfo;
	private ArrayList<SingleBranch> branches = new ArrayList<>();
	
    public SelectedRepoRightPanel() {
        super();
        this.addStyles();
        //this.addChildNodes();
        this.repositoryInfo = StateManager.getRepositoryInfo();
       // drawBranch();
    }
    
    public void updateUi() {
    	if(this.repositoryInfo != StateManager.getRepositoryInfo()) {
    		this.repositoryInfo = StateManager.getRepositoryInfo();
    		drawBranch();
    	}
    }
        
    
    public void drawBranch() {
    	this.repositoryInfo = StateManager.getRepositoryInfo();
    	    	
    	int y = 0;    	    	
    	for (BranchDetails branch : this.repositoryInfo.resolvedBranches) {
    		branch.y = y;
    		var singleBranch = new SingleBranch(branch);
    		this.branches.add(singleBranch);
    		if(branch.parentCommit != null) {
    			var vLine = new Line(branch.parentCommit.x,branch.parentCommit.ownerBranch.y,branch.parentCommit.x,branch.y);
    			this.getChildren().add(vLine);
    		}
    		y += Constants.DistanceBetweenBranches;
		}
    	drawCommits();
    	
    }
    
    private void drawCommits() {
    	int x = 0;
    	int increamenter = Constants.CommitRadius*3;
    	for (var commit :this.repositoryInfo.allCommits) {
    		commit.x = x; 
			//var branch = ArrayUtil.find(this.branches, b -> b.getBranch().name == commit.ownerBranch.name);
			//branch.commitHorizontalPositions.add(x);			
			x += increamenter;
		}
    	
    	for (SingleBranch singleBranch : branches) {
			singleBranch.draw();
		}
    	var branchGroups = new Group();
    	branchGroups.getChildren().addAll(branches);
    	this.getChildren().add(branchGroups);
    }
    
    private void addStyles(){
        getStyleClass().addAll("border-red","px-5");
    }
    
    private void addChildNodes(){
        
    }
    
    private Pane getBranchNode() {
    	var container = new VBox();
    	
    	return container;
    }
    
    
}
