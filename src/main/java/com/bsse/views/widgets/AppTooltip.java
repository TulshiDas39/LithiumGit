package com.bsse.views.widgets;

import javafx.geometry.Insets;
import javafx.scene.control.Label;
import javafx.scene.layout.Border;
import javafx.scene.layout.BorderStroke;
import javafx.scene.layout.BorderStrokeStyle;
import javafx.scene.layout.BorderWidths;
import javafx.scene.layout.CornerRadii;
import javafx.scene.layout.HBox;
import javafx.scene.paint.Color;


public class AppTooltip extends HBox{
	private final Label text = new Label();
	private double borderWidth = 0;
	
	public AppTooltip() {
		super();
		addChilds();
		addStyles();
	}
	
	private void addStyles() {
		setBorder();
		this.setPadding(new Insets(2,10,2,10));
	}
	
	private void setBorder() {
		var stoke =  new BorderStroke(Color.BLACK, BorderStrokeStyle.SOLID, CornerRadii.EMPTY, new BorderWidths(borderWidth,borderWidth,borderWidth,borderWidth));
		var border = new Border(stoke,stoke,stoke,stoke);		
		this.setBorder(border);
	}
	
	private void addChilds() {
		this.getChildren().addAll(text);
	}
	
	public void setText(String text) {
		this.text.setText(text);
	}
	
	public void show() {
		borderWidth = 1;
		setBorder();
		setViewOrder(-100);
	}
	
	public void hide() {
		borderWidth = 0.0;
		setText("");
		setBorder();
		setViewOrder(Integer.MAX_VALUE);
	}
}
