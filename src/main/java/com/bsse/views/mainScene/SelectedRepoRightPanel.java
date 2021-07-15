
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
	
	
	private Group BranchPanel;
	
    public SelectedRepoRightPanel() {
        super();
        this.addStyles();
        this.repositoryInfo = StateManager.getRepositoryInfo();
    }
    
    public void updateUi() {
    	if(this.repositoryInfo != StateManager.getRepositoryInfo()) {
    		this.repositoryInfo = StateManager.getRepositoryInfo();
    		createBranchPanel();
    		addChildNodes();    		
    	}
    }
        
    
    public void createBranchPanel() {    	    	    	    	    
    	int x = 0;
    	int increamenter = Constants.CommitRadius*3;
    	for (var commit :this.repositoryInfo.allCommits) {
    		commit.x = x;    		
			x += increamenter;
		}
    	
    	int y = 0;
    	
    	for (BranchDetails branch : this.repositoryInfo.resolvedBranches) {
    		var singleBranch = new SingleBranch(branch);    		 
    		singleBranch.getBranch().y = y;
			singleBranch.draw();			 			
			this.branches.add(singleBranch);
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
    	this.BranchPanel = new Group();
    	this.BranchPanel.getChildren().addAll(branches);
    	this.BranchPanel.getChildren().addAll(mergeLines);    	
    	
    }    
    
    private void addStyles(){
        getStyleClass().addAll("border-red","px-5");
    }
    
    private void addChildNodes(){
        var child = this.getChildren();
        child.add(BranchPanel);
    }
    
    private Pane getBranchNode() {
    	var container = new VBox();
    	
    	return container;
    }
    
    
}
