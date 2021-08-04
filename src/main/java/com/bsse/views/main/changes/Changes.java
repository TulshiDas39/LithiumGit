package com.bsse.views.main.changes;

import com.bsse.business.GitManager;
import com.bsse.dataClasses.StatusResult;

import javafx.scene.layout.VBox;

public class Changes extends VBox{
	private final ChangesActionTab actionBar = new ChangesActionTab();
	private final VBox changedFiles = new VBox();
	private StatusResult statusResult;
	public Changes() {
		super();
		addChilds();
	}
	private void addChilds() {
		this.getChildren().addAll(actionBar,changedFiles);
	}
	
	private void createChangedFilesArea() {
		changedFiles.getChildren().addAll(new StagedFiles(statusResult.stagedChanges),new UnstagedChanges());
	}
	
	public void updateUi() {
		this.statusResult = GitManager.getStatus();
		createChangedFilesArea();
	}
}
