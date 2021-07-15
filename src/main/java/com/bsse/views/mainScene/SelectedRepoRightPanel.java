
package com.bsse.views.mainScene;

import java.util.ArrayList;

import com.bsse.business.StateManager;
import com.bsse.dataClasses.BranchDetails;
import com.bsse.dataClasses.CommitInfo;
import com.bsse.dataClasses.Constants;
import com.bsse.dataClasses.RepositoryInfo;
import com.bsse.utils.ArrayUtil;

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
    	    	    	    	    
    	for (BranchDetails branch : this.repositoryInfo.resolvedBranches) {    		
    		var singleBranch = new SingleBranch(branch);
    		this.branches.add(singleBranch);
    		if(branch.parentCommit != null) {
    			//var vLine = new Line(branch.parentCommit.x,branch.parentCommit.ownerBranch.y,branch.parentCommit.x,branch.y);
    			//this.getChildren().add(vLine);
    		}
		}
    	drawCommits();
    	
    }
    
    private void drawCommits() {
    	int x = 0;
    	int increamenter = Constants.CommitRadius*3;
    	for (var commit :this.repositoryInfo.allCommits) {
    		commit.x = x;    		
			x += increamenter;
		}
    	
    	int y = 0;
    	
    	for (SingleBranch singleBranch : branches) {
    		singleBranch.getBranch().y = y;
			singleBranch.draw();			 
			y = singleBranch.getBranch().y + Constants.DistanceBetweenBranches;
		}
    	
    	var mergeCommits = ArrayUtil.filter(this.repositoryInfo.allCommits, c -> c.parentHashes.size() > 1);
    	ArrayList<Line> mergeLines = new ArrayList<>();
    	for (CommitInfo commit : mergeCommits) {
    		var sourceCommitOfMerge = ArrayUtil.find(this.repositoryInfo.allCommits, c -> c.avrebHash.equals(commit.parentHashes.get(1)));
    		if(sourceCommitOfMerge == null) continue;
    		var line = new Line(sourceCommitOfMerge.x,sourceCommitOfMerge.ownerBranch.y,commit.x,commit.ownerBranch.y);
    		mergeLines.add(line);
		}
    	var branchGroups = new Group();
    	branchGroups.getChildren().addAll(branches);
    	branchGroups.getChildren().addAll(mergeLines);
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
