package com.bsse.views.main.changes;

import javafx.scene.layout.VBox;

public class Changes extends VBox{
	private final ChangesActionTab actionBar = new ChangesActionTab();
	public Changes() {
		super();
		addChilds();
	}
	private void addChilds() {
		//var text = new Text("Selected Changes");
		this.getChildren().addAll(actionBar);
	}
}
