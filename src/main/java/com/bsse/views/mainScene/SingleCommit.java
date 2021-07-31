package com.bsse.views.mainScene;

import java.util.ArrayList;

import com.bsse.business.StateManager;
import com.bsse.dataClasses.CommitInfo;
import com.bsse.dataClasses.Constants;

import javafx.geometry.Pos;
import javafx.scene.Group;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.StrokeType;
import javafx.scene.text.Font;
import javafx.scene.text.FontPosture;
import javafx.scene.text.FontWeight;
import javafx.scene.text.Text;

public class SingleCommit extends Group{
	  public final CommitInfo commitInfo;
	  private final Circle circle = new Circle(0,0,Constants.CommitRadius);
	  private final Color circlFillColor = Color.CADETBLUE;
	  private final Color circlHeadColor = Color.BLUEVIOLET;
	  private final VBox refBox = new VBox();
	  private final double translateX;
	  private boolean isSelected;
	  private boolean isHead;
	  
	  
	  public SingleCommit(CommitInfo commitInfo,double translateX) {
		this.commitInfo = commitInfo;
		this.commitInfo.UiObj = this;
		this.translateX = translateX;
		configureChilds();
		addChilds();
		addClickListener();
		addRefs();
		addStyles();
	  }
	  
	  private void configureChilds() {
		  circle.setStrokeWidth(0);
		  circle.setStrokeMiterLimit(10);
		  circle.setStrokeType(StrokeType.CENTERED);
		  circle.setStroke(Color.GREEN);
		  circle.setFill(circlFillColor);
	  }
	  
	  private void addStyles() {
		  this.getStyleClass().addAll("border-green");		  	  
	  }
	  
	  private void addChilds() {
		  this.getChildren().addAll(this.circle);
		  this.getChildren().add(refBox);
		  this.setLayoutX(translateX);
	  }
	  
	  private void addClickListener() {
		  this.circle.addEventFilter(MouseEvent.MOUSE_CLICKED, e -> {
				StateManager.setSelectedCommit(commitInfo);
			});
	  }
	  
	  private void addRefs() {
			if(this.commitInfo.refs.isBlank())return;
			
			var refs = commitInfo.refs.split(",");
			var maxRefLength = 0;
			ArrayList<Text> textList = new ArrayList<>();
			for (String ref : refs) {
				if(ref.startsWith(Constants.HeadPrefix))ref = ref.substring(Constants.HeadPrefix.length());
				var text = new Text(ref);
			    text.setFont(Font.font("verdana", FontWeight.NORMAL, FontPosture.REGULAR, Constants.ParagraphTextFontSize));
			    textList.add(text);				
				if(maxRefLength < text.getLayoutBounds().getWidth())maxRefLength = (int) text.getLayoutBounds().getWidth();
			}
			refBox.getChildren().addAll(textList);
			var spacing = 2;
			var layoutY = -2*Constants.CommitRadius - textList.get(0).getLayoutBounds().getHeight() * (refs.length -1) - spacing;
			refBox.setLayoutY(layoutY);		
			refBox.setLayoutX(-maxRefLength+Constants.CommitRadius);
			
			refBox.setAlignment(Pos.BASELINE_RIGHT);
	  }
	  
	  public void setSelection(boolean isSelected){
		  if(this.isSelected == isSelected) return;
		  this.isSelected = isSelected;
		  handleSelection();
	  }
	  
	  private void handleSelection() {
		  if(this.isSelected) {
			  	circle.setStrokeWidth(3);			    
		  }
		  else circle.setStrokeWidth(0);
	  }
	  
	  public void setIsHead(boolean isHead) {
		  if(this.isHead == isHead) return;
		  this.isHead = isHead;
		  handleHeadChange();
	  }
	  
	  private void handleHeadChange() {
		  if(this.isHead) {
			  this.circle.setFill(circlHeadColor);
		  }
		  else this.circle.setFill(circlFillColor);
	  }
	  
}
