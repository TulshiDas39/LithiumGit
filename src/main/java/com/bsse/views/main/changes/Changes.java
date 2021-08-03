package com.bsse.views.main.changes;

import javafx.scene.layout.VBox;

public class Changes extends VBox{
	private final ChangesActionTab actionBar = new ChangesActionTab();
	private final VBox changedFiles = new VBox();
	public Changes() {
		super();
		addChilds();
	}
	private void addChilds() {
		//var text = new Text("Selected Changes");
		createChangedFilesArea();
		this.getChildren().addAll(actionBar,changedFiles);
	}
	
	private void createChangedFilesArea() {
		changedFiles.getChildren().addAll(new StagedFiles(),new UnstagedChanges());
	}
}
