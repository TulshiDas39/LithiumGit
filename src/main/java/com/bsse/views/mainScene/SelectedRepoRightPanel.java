
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
import javafx.scene.paint.Color;
import javafx.scene.shape.Arc;
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
        this.col22.setMinWidth(200);
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
    		var adjustment = 100.0;    		
    		var height = this.col21.getContent().getBoundsInParent().getHeight();
    		var width = this.col21.getContent().getBoundsInParent().getWidth();
    		var minXOfBranch = this.headCommit.ownerBranch.uiObj.getBoundsInParent().getMinX();
    		var minYOfBranch = this.headCommit.ownerBranch.uiObj.getBoundsInParent().getMinY();
    		double x = this.headCommit.UiObj.getBoundsInParent().getCenterX();    		
    		if(x < width/2) x = this.headCommit.UiObj.getBoundsInParent().getMinX()-adjustment;    		
    		else x = this.headCommit.UiObj.getBoundsInParent().getMaxX()+adjustment;
    		var y = this.headCommit.ownerBranch.uiObj.getBoundsInParent().getCenterY();
    		if(y < height / 2) y = this.headCommit.ownerBranch.uiObj.getBoundsInParent().getMinY()-adjustment;
    		else y = this.headCommit.ownerBranch.uiObj.getBoundsInParent().getMaxY()+adjustment;
    		x += minXOfBranch;
    		this.col21.setHvalue(x/width);
    		this.col21.setVvalue(y/height);	    		
    	}
    }
    
    private void setHeadCommit() {
    	if(this.headCommit != null) return;    	
    	for(int i = this.repositoryInfo.allCommits.length -1; i >= 0; i--) {
    		var commit = this.repositoryInfo.allCommits[i];
    		if(commit.refs.isBlank())continue;
    		if(commit.refs.contains(Constants.HeadPrefix)) {
    			this.headCommit = commit;
    			break;
    		}
    		var refSplits = commit.refs.split(",");
    		
    		if( ArrayUtil.any(refSplits, ref -> ref.equals(Constants.DetachedHeadPrefix ))){
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
    	createVerticalLinesOfBranch();    	
    	
    }
    
    private void createVerticalLinesOfBranch() {
    	var lineEndingGap = Constants.getGapOfBranchArch();
    	var vLines = new ArrayList<Line>();
    	var arcs = new ArrayList<Arc>();
    	for(var commit: repositoryInfo.sourceCommits) {
    		for(var branch: commit.branchesFromThis) {
    			var vline = new Line(commit.x,commit.ownerBranch.y,commit.x,branch.y-lineEndingGap);
    			vLines.add(vline);
    			
    			double radiusX = Constants.getGapOfBranchArch(); 
    			double radiusY = Constants.getGapOfBranchArch();
    			double centerX = commit.x + radiusX; 
    			double centerY = branch.y - Constants.getGapOfBranchArch(); 

    			double startAngle = 180;
    			double length = 90.0;
    			Arc arc = new Arc(centerX,centerY,radiusX,radiusY,startAngle,length);  
    			arc.setFill(Color.TRANSPARENT);
    			arc.setStroke(Color.BLACK);
    			arc.setStrokeWidth(1);
    			
    			arcs.add(arc);
    		}
    	}
    	
    	this.branchPanel.getChildren().addAll(vLines);
    	this.branchPanel.getChildren().addAll(arcs);
    }
    
    private void addStyles(){
        getStyleClass().addAll("border-red");
    }    
    
    
}
