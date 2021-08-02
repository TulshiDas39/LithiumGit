package com.bsse.views.main.changes;

import javafx.scene.layout.VBox;
import javafx.scene.text.Text;

public class Changes extends VBox{
	public Changes() {
		super();
		addChilds();
	}
	private void addChilds() {
		var text = new Text("Selected Changes");
		this.getChildren().addAll(text);
	}
}
