
package com.bsse.views.mainScene;

import java.util.ArrayList;

import com.bsse.business.StateManager;
import com.bsse.dataClasses.BranchDetails;
import com.bsse.dataClasses.CommitInfo;
import com.bsse.dataClasses.Constants;
import com.bsse.dataClasses.RepositoryInfo;
import com.bsse.dataClasses.StaticData;
import com.bsse.utils.ArrayUtil;

import javafx.scene.Group;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.ColumnConstraints;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.shape.Line;

public class SelectedRepoRightPanel extends VBox{
	private RepositoryInfo repositoryInfo;
	private ArrayList<SingleBranch> branches = new ArrayList<>();
	private CommitInfo headCommit;
	
	private HBox row1 = new HBox();
	private GridPane row2 = new GridPane();
	private ScrollPane col21 = new ScrollPane();
	private CommitProperty col22 = new CommitProperty(null);
	private Group branchPanel = new Group();
	
    public SelectedRepoRightPanel() {
        super();
        StaticData.commitProperty = col22;
        this.addStyles();
        this.addChildNodes();
    }
    
    private void addChildNodes() {
        //row2.setGridLinesVisible(true); // FOR VISUAL CLARITY

    	ColumnConstraints col1 = new ColumnConstraints();
        col1.setPercentWidth(75);
        ColumnConstraints col2 = new ColumnConstraints();
        col2.setPercentWidth(25);
        row2.getColumnConstraints().addAll(col1,col2);
//        var branchPanelContainer = new VBox();
//        branchPanelContainer.getChildren().add(branchPanel);
        this.col21.setContent(branchPanel);
        this.col21.setMaxHeight(500);
        this.col21.setMinHeight(200);
        this.col21.setPrefHeight(500);
        this.col21.getStyleClass().addAll("border-green");
        row2.add(this.col21, 0, 0);
        row2.add(this.col22, 1, 0);
        row2.add(new VBox(), 1, 0);
        //this.col22.getStyleClass().addAll("border-green");
        //row2.getStyleClass().addAll("border-red");
    	this.getChildren().add(row2);    	
    }
    
    public void updateUi() {
    	if(this.repositoryInfo != StateManager.getRepositoryInfo()) {
    		this.repositoryInfo = StateManager.getRepositoryInfo();
    		createBranchPanel();
    		setHeadCommit();
    		StateManager.setSelectedCommit(this.headCommit);
    		var xAdjustment = Constants.CommitRadius*2;
    		System.out.println(this.headCommit.UiObj.getBoundsInLocal().getCenterX());
    		if(this.headCommit.x < xAdjustment) xAdjustment *= -1;
    		this.col21.setHvalue((this.headCommit.x+xAdjustment)/this.branchPanel.getLayoutBounds().getWidth());
    		this.col21.setVvalue(this.headCommit.ownerBranch.y/this.branchPanel.getLayoutBounds().getHeight());    		    		
    	}
    }
    
    private void setHeadCommit() {
    	if(this.headCommit != null) return;    	
    	for(int i = this.repositoryInfo.allCommits.length -1; i >= 0; i--) {
    		var commit = this.repositoryInfo.allCommits[i];
    		if(commit.refs.contains(Constants.HeadPrefix)) {
    			this.headCommit = commit;
    			break;
    		}
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
    	this.branchPanel.getChildren().addAll(branches);
    	this.branchPanel.getChildren().addAll(mergeLines);    	
    	
    }    
    
    private void addStyles(){
        getStyleClass().addAll("border-red");
    }    
    
    
}
