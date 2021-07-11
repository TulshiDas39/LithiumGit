package com.bsse.views.mainScene;

import java.util.ArrayList;

import com.bsse.dataClasses.SingleBranchProps;

import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Line;

public class SingleBranch extends HBox{
	public SingleBranchProps props;
	private ArrayList<VBox> addedCommits = new ArrayList<>();
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
		this.line.setStartY(props.y);
		this.line.setEndY(props.y);
		var startX = this.props.commitHorizontalPositions.get(0);
		var endX = this.props.commitHorizontalPositions.get(this.props.commitHorizontalPositions.size()-1);
		this.line.setStartX(startX);		
		this.line.setEndX(endX);
		this.getChildren().add(line);
		
		ArrayList<VBox> commitBoxes = new ArrayList<>(); 
		
		for (var positionX : this.props.commitHorizontalPositions) {
			var vBox = new VBox();
			//var commit = this.props.branch.commits.get(this.addedCommits.size());
			var circle = new Circle(positionX,this.props.y,30);
			vBox.getChildren().add(circle);
			commitBoxes.add(vBox);			
		}
		
		this.getChildren().addAll(commitBoxes);
	}
	
	
	private void addStyle() {
		getStyleClass().addAll("border-green");
	}
}
