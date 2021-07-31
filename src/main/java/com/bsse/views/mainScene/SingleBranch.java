package com.bsse.views.mainScene;

import java.util.ArrayList;

import com.bsse.dataClasses.BranchDetails;
import com.bsse.dataClasses.Constants;

import javafx.scene.Group;
import javafx.scene.shape.Line;

public class SingleBranch extends Group{
	private final BranchDetails branch;
	private Line line = new Line();
	
	public SingleBranch(BranchDetails branch) {
		this.branch = branch;
		this.branch.uiObj = this;
		addStyle();
		addChilds();
	}
	
	public BranchDetails getBranch() {
		return branch;
	}
	
	
	private void addChilds() {

	}
	
	public void draw() {
		var startXOfBranch = 0.0;
		if(this.branch.parentCommit != null) startXOfBranch = this.branch.parentCommit.x+Constants.getGapOfBranchArch();
		this.line.setStartY(0);
		this.line.setEndY(0);
		this.line.setStartX(0);		
		var endX = this.branch.commits.get(this.branch.commits.size()-1).x;
		this.line.setEndX(endX - startXOfBranch);
		this.line.setViewOrder(100);
		this.getChildren().add(line);		
		
		this.setLayoutX(startXOfBranch);		
		
		ArrayList<SingleCommit> commitBoxes = new ArrayList<>(); 
		var translateX = 0.0;
		var extendedHeightForRef = 0.0;
		for (var commit : this.branch.commits) {			
			translateX = commit.x - startXOfBranch;
			var singleCommit = new SingleCommit(commit,translateX);
			var refHeight = commit.refs.split(",").length * Constants.ParagraphTextFontSize;
			if(refHeight > extendedHeightForRef) extendedHeightForRef = refHeight;
			singleCommit.setViewOrder(50);
			commitBoxes.add(singleCommit);			
		}
		this.branch.y += extendedHeightForRef;
		this.getChildren().addAll(commitBoxes);
		this.setLayoutY(branch.y);
		
	}
	
	private void addStyle() {
		//getStyleClass().addAll("border-green");
		//setPadding(new Insets(0,0,Constants.DistanceBetweenBranches,0));
	}
}
