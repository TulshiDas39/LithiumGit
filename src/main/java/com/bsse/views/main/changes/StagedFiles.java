package com.bsse.views.main.changes;

import javafx.scene.input.MouseEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;

public class StagedFiles extends VBox{
	private final HBox header = new HBox();
	private final Text iconText = new Text();
	
	private boolean expanded = true;
	
	 public StagedFiles() {
		super();
		addChilds();
		addStyles();		
	 }
	 
	 private void addStyles() {
		 this.getStyleClass().addAll("pt-2");
	 }
	 private void addChilds() {
		 createHeader();
		 updateUi();
		 this.getChildren().addAll(header);
	 }
	 
	 private void updateUi() {
		 if(this.expanded) {
			 iconText.setText("V");
		 }
		 else iconText.setText(">");
	 }
	 
	 private void createHeader() {
		 var hbox = new HBox();
		 hbox.getChildren().add(iconText);		 
		 hbox.getStyleClass().addAll("px-2");
		 
		 var text = new Text("Staged Changes");
		 
		 header.getStyleClass().addAll("cur-point");
		 header.addEventFilter(MouseEvent.MOUSE_CLICKED, e->{
			 this.expanded = !this.expanded;
			 updateUi();
		 });
		 header.getChildren().addAll(hbox,text);
		 
	 }
}
