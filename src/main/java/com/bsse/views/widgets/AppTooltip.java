package com.bsse.views.widgets;

import javafx.scene.control.Label;
import javafx.scene.layout.HBox;


public class AppTooltip extends HBox{
	private final Label text = new Label();
	public AppTooltip() {
		super();
		addChilds();
	}
	
	private void addChilds() {
		this.getChildren().addAll(text);
	}
	
	public void setText(String text) {
		this.text.setText(text);
	}
}
