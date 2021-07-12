package com.bsse.views.mainScene;

import java.util.ArrayList;

import com.bsse.dataClasses.CommitInfo;
import com.bsse.dataClasses.Constants;
import com.bsse.dataClasses.SingleBranchProps;

import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Line;

public class SingleBranch extends HBox{
	public SingleBranchProps props;
	private Line line = new Line();
	
	public SingleBranch(SingleBranchProps branch) {
		this.props = branch;
		addStyle();
		addChilds();
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
		if(this.props.branch.parentCommit != null) translateXOfBranch = this.props.branch.parentCommit.x;
		this.line.setStartY(props.y);
		this.line.setEndY(props.y);
		//var startX = this.props.branch.commits.get(0).x;
		var endX = this.props.branch.commits.get(this.props.branch.commits.size()-1).x;
		//this.line.setStartX(startX);		
		//this.line.setEndX(endX);
		var branchWidth = endX - translateXOfBranch + Constants.CommitRadius*2;
		this.setMaxWidth(branchWidth);
		this.setMinWidth(branchWidth);
		
		this.setTranslateX(translateXOfBranch);
		
		ArrayList<VBox> commitBoxes = new ArrayList<>(); 
		var translateX = 0;
		var previousCommitX = this.props.branch.commits.get(0).x;
		for (var commit : this.props.branch.commits) {			
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
	}
}
