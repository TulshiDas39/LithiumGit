package com.bsse.views.main.changes;

import java.util.Set;

import com.bsse.dataClasses.StatusResult;

import javafx.scene.input.MouseEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;

public class StagedFiles extends VBox{
	private final HBox header = new HBox();
	private final VBox filesPanel = new VBox();
	private final Text iconText = new Text("V");	
	
	private boolean expanded = true;
	private final Set<String> status;
	
	 public StagedFiles(Set<String> status) {
		super();
		this.status = status;
		addChilds();
		addStyles();		
	 }
	 
	 private void addStyles() {
		 this.getStyleClass().addAll("pt-2");
	 }
	 private void addChilds() {
		 createHeader();
		 createFilePanel();
		 this.getChildren().addAll(header,this.filesPanel);
	 }
	 
	 private void updateUi() {
		 if(this.expanded) {
			 iconText.setText("V");
			 this.getChildren().add(this.filesPanel);
		 }
		 else {
			 iconText.setText(">");
			 this.getChildren().remove(this.filesPanel);
		 }
	 }
	 
	 private void createFilePanel() {
		 var file1 = new ChangedFile("File1", "C:/users/te.txt", true, path->{
			System.out.println(path); 
		 });
		 var file2 = new ChangedFile("File1", "C:/users/te.txt", true, path->{
				System.out.println(path); 
			 });
		 var file3 = new ChangedFile("File1", "C:/users/te.txt", true, path->{
				System.out.println(path); 
			 });
		 var file4 = new ChangedFile("File1", "C:/users/te.txt", true, path->{
				System.out.println(path); 
			 });
		 
		 filesPanel.getChildren().addAll(file1,file2,file3,file4);
		 
		 
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
