
package com.bsse.views.mainScene;

import java.util.ArrayList;

import com.bsse.business.StateManager;
import com.bsse.dataClasses.BranchDetails;
import com.bsse.dataClasses.CommitInfo;
import com.bsse.dataClasses.Constants;
import com.bsse.dataClasses.RepositoryInfo;
import com.bsse.utils.ArrayUtil;

import javafx.scene.Group;
import javafx.scene.layout.ColumnConstraints;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.shape.Line;

public class SelectedRepoRightPanel extends VBox{
	private RepositoryInfo repositoryInfo;
	private ArrayList<SingleBranch> branches = new ArrayList<>();
	private CommitInfo selectedCommit;
	
	private HBox row1 = new HBox();
	private GridPane row2 = new GridPane();
	private VBox col21 = new VBox();
	private CommitProperty col22 = new CommitProperty(null);
	private Group BranchPanel = new Group();
	
    public SelectedRepoRightPanel() {
        super();
        this.addStyles();
        this.addChildNodes();
    }
    
    private void addChildNodes() {
    	this.getChildren().add(row1);
    	ColumnConstraints col1 = new ColumnConstraints();
        col1.setPercentWidth(80);
        ColumnConstraints col2 = new ColumnConstraints();
        col1.setPercentWidth(20);
        row2.getColumnConstraints().addAll(col1,col2);
        this.col21.getChildren().add(BranchPanel);
        
        row2.add(this.col21, 0, 0);
        row2.add(col22, 1, 0);
    	this.getChildren().add(row2);
    }
    
    public void updateUi() {
    	if(this.repositoryInfo != StateManager.getRepositoryInfo()) {
    		this.repositoryInfo = StateManager.getRepositoryInfo();
    		createBranchPanel();
    		setSelectedCommit();
    		this.col22.updateUi(this.selectedCommit);
    	}
    }
    
    private void setSelectedCommit() {
    	if(this.selectedCommit != null) return;    	
    	for(int i = this.repositoryInfo.allCommits.length -1; i >= 0; i--) {
    		var commit = this.repositoryInfo.allCommits[i];
    		if(commit.refs.contains(Constants.HeadPrefix)) {
    			this.selectedCommit = commit;
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
    	this.BranchPanel.getChildren().addAll(branches);
    	this.BranchPanel.getChildren().addAll(mergeLines);
    	
    }    
    
    private void addStyles(){
        getStyleClass().addAll("border-red","px-5");
    }    
    
    
}
