package com.bsse.views.mainScene;

import java.util.ArrayList;

import com.bsse.dataClasses.BranchDetails;
import com.bsse.dataClasses.Constants;

import javafx.scene.Group;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Line;

public class SingleBranch extends Group{
	private final BranchDetails branch;
	private Line line = new Line();
	
	public SingleBranch(BranchDetails branch) {
		this.branch = branch;		
		addStyle();
		addChilds();
	}
	
	public BranchDetails getBranch() {
		return branch;
	}
	
	
	private void addChilds() {

	}
	
	public void draw() {
		var startXOfBranch = 0;
		if(this.branch.parentCommit != null) startXOfBranch = this.branch.parentCommit.x;
		this.line.setStartY(0);
		this.line.setEndY(0);
		this.line.setStartX(0);		
		var endX = this.branch.commits.get(this.branch.commits.size()-1).x;
		this.line.setEndX(endX - startXOfBranch);
		this.getChildren().add(line);
		//var branchWidth = endX - translateXOfBranch + Constants.CommitRadius*2;
//		this.setMaxWidth(branchWidth);
//		this.setMinWidth(branchWidth);
		
		this.setLayoutX(startXOfBranch);
		this.setLayoutY(branch.y);
		
		ArrayList<Group> commitBoxes = new ArrayList<>(); 
		var translateX = 0;
		for (var commit : this.branch.commits) {			
			translateX = commit.x - startXOfBranch;
			var group = new Group();			
			var circle = new Circle(0,0,Constants.CommitRadius);
			group.getChildren().add(circle);				
			//group.getStyleClass().addAll("border-red");
			group.setLayoutX(translateX);
			commitBoxes.add(group);
		}
		
		this.getChildren().addAll(commitBoxes);
		
	}
	
	
	private void addStyle() {
		//getStyleClass().addAll("border-green");
		//setPadding(new Insets(0,0,Constants.DistanceBetweenBranches,0));
	}
}
