package com.bsse.views.mainScene;


import java.util.ArrayList;
import java.util.function.Consumer;
import com.bsse.dataClasses.BranchDetails;
import com.bsse.dataClasses.Constants;
import javafx.geometry.Point2D;
import javafx.scene.Group;
import javafx.scene.paint.Color;
import javafx.scene.paint.CycleMethod;
import javafx.scene.paint.LinearGradient;
import javafx.scene.paint.Stop;
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
		createLine();
		this.getChildren().add(line);
	}
	
	private void createLine() {
		this.line.setStartY(0);
		this.line.setEndY(0);
		this.line.setStartX(0);					
		this.line.setViewOrder(100);
		this.line.setStrokeWidth(10);
		var gradient = new LinearGradient(0d, -5d, 0d, 5d, false,CycleMethod.NO_CYCLE,
                 					  new Stop(0.399,Color.TRANSPARENT),                                       
                                      new Stop(0.40,Color.BLACK),
                                      new Stop(0.50,Color.BLACK),
                                      new Stop(0.501,Color.TRANSPARENT));
		this.line.setStroke(gradient);
	}
	
	public void draw() {
		var startXOfBranch = 0.0;
		if(this.branch.parentCommit != null) startXOfBranch = this.branch.parentCommit.x+Constants.getGapOfBranchArch()+1;		
		var endX = this.branch.commits.get(this.branch.commits.size()-1).x;
		this.line.setEndX(endX - startXOfBranch);		
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
	
	public void setHoverHandler(Consumer<Point2D> onHover, Runnable onLeave) {
		this.line.setOnMouseEntered(e->{
			var x = e.getX()+15;
			if(branch.parentCommit != null) x += branch.parentCommit.x;
			var point = new Point2D(x,this.branch.y+15);			
			onHover.accept(point);
		});
		this.line.setOnMouseExited(e->{
			onLeave.run();
		});
	}
}
