package com.bsse.views.mainScene;

import java.util.ArrayList;

import com.bsse.business.StateManager;
import com.bsse.dataClasses.BranchDetails;
import com.bsse.dataClasses.CommitInfo;
import com.bsse.dataClasses.Constants;

import javafx.event.EventType;
import javafx.geometry.Pos;
import javafx.scene.Group;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.VBox;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Line;
import javafx.scene.text.Font;
import javafx.scene.text.FontPosture;
import javafx.scene.text.FontWeight;
import javafx.scene.text.Text;

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
		
		this.setLayoutX(startXOfBranch);		
		
		ArrayList<Group> commitBoxes = new ArrayList<>(); 
		var translateX = 0;
		for (var commit : this.branch.commits) {			
			translateX = commit.x - startXOfBranch;
			var group = new Group();
			addRefs(group, commit);
			var circle = new Circle(0,0,Constants.CommitRadius);
			circle.addEventFilter(MouseEvent.MOUSE_CLICKED, e -> {
				StateManager.setSelectedCommit(commit);
			});
			
			group.getChildren().add(circle);				
			group.setLayoutX(translateX);
			commitBoxes.add(group);
		}
		
		this.getChildren().addAll(commitBoxes);
		this.setLayoutY(branch.y);
		
	}
	
	private void addRefs(Group group, CommitInfo commit) {
		if(commit.refs.isBlank())return;
		var vBox = new VBox();
		var refs = commit.refs.split(",");
		var maxRefLength = 0;
		//var maxLengthTextNode;
		ArrayList<Text> textList = new ArrayList<>();
		var totalTextHeight = 0;
		for (String ref : refs) {
			if(ref.startsWith(Constants.HeadPrefix))ref = ref.substring(Constants.HeadPrefix.length());
			var text = new Text(ref);
		    text.setFont(Font.font("verdana", FontWeight.NORMAL, FontPosture.REGULAR, Constants.ParagraphTextFontSize));
		    textList.add(text);
			//vBox.getChildren().add(text);
			this.branch.y += Constants.ParagraphTextFontSize;
			if(maxRefLength < text.getLayoutBounds().getWidth())maxRefLength = (int) text.getLayoutBounds().getWidth();
			totalTextHeight += text.getLayoutBounds().getHeight();
		}
		vBox.getChildren().addAll(textList);
		var spacing = 2;
		var layoutY = -2*Constants.CommitRadius - textList.get(0).getLayoutBounds().getHeight() * (refs.length -1) - spacing;
		vBox.setLayoutY(layoutY);		
		vBox.setLayoutX(-maxRefLength+Constants.CommitRadius);
		
		vBox.setAlignment(Pos.BASELINE_RIGHT);
		group.getChildren().add(vBox);
	}
	
	
	private void addStyle() {
		//getStyleClass().addAll("border-green");
		//setPadding(new Insets(0,0,Constants.DistanceBetweenBranches,0));
	}
}
