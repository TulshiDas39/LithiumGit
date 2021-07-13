package com.bsse.views.mainScene;

import java.util.ArrayList;

import com.bsse.dataClasses.BranchDetails;
import com.bsse.dataClasses.Constants;

import javafx.geometry.Insets;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Line;

public class SingleBranch extends HBox{
	private final int y;
	private final BranchDetails branch;
	private Line line = new Line();
	
	public SingleBranch(int y,BranchDetails branch) {		
		this.y = y;
		this.branch = branch;		
		addStyle();
		addChilds();
	}
	
	public BranchDetails getBranch() {
		return branch;
	}
	
	
	private void addChilds() {
//		this.line.setStartY(props.y);
//		this.line.setEndY(props.y);
//		this.line.setStartX(0);
//		this.line.setEndX(500);
//		this.getChildren().addAll(addedCommits);
//		this.getChildren().add(line);
//		var circle = new Circle(10,this.props.y,100);
//		this.getChildren().add(circle);
	}
	
	public void draw() {
		var translateXOfBranch = 0;
		if(this.branch.parentCommit != null) translateXOfBranch = this.branch.parentCommit.x;
		this.line.setStartY(this.y);
		this.line.setEndY(this.y);
		//var startX = this.props.branch.commits.get(0).x;
		var endX = this.branch.commits.get(this.branch.commits.size()-1).x;
		//this.line.setStartX(startX);		
		//this.line.setEndX(endX);
		var branchWidth = endX - translateXOfBranch + Constants.CommitRadius*2;
		this.setMaxWidth(branchWidth);
		this.setMinWidth(branchWidth);
		
		this.setTranslateX(translateXOfBranch);
		
		ArrayList<VBox> commitBoxes = new ArrayList<>(); 
		var translateX = 0;
		var previousCommitX = this.branch.commits.get(0).x;
		for (var commit : this.branch.commits) {			
			translateX = commit.x - previousCommitX;
			var vBox = new VBox();			
			var circle = new Circle(0,0,Constants.CommitRadius);
			vBox.getChildren().add(circle);				
			vBox.getStyleClass().addAll("border-red");
			vBox.setTranslateX(translateX);
			commitBoxes.add(vBox);
			previousCommitX = commit.x;
		}
		
		this.getChildren().addAll(commitBoxes);
		
	}
	
	
	private void addStyle() {
		getStyleClass().addAll("border-green");
		setPadding(new Insets(0,0,Constants.DistanceBetweenBranches,0));
	}
}
