package com.bsse.views.main.changes;

import java.util.function.Consumer;

import javafx.scene.input.MouseEvent;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.paint.Color;
import javafx.scene.shape.Line;
import javafx.scene.text.Text;

public class ChangedFile extends BorderPane{
	private final String fileName;
	private final String path;
	private final Consumer<String> plusMinusClickHandler;
	private final boolean isStaged;
	
	private final Text fileNameNode = new Text();
	private final Text filePathNode = new Text();
	private final Text minusNode = new Text();
	private final HBox plusMinusNode = new HBox();
	private final Line line = new Line(0,10,10,10);
	
	
	public ChangedFile(String fileName,String path,boolean isStaged, Consumer<String> plusClickHandler) {
		this.fileName = fileName;
		this.path = path;
		this.plusMinusClickHandler = plusClickHandler;
		this.isStaged = isStaged;
		addStyles();
		addChilds();
	}
	
	private void addStyles() {
		this.getStyleClass().addAll("pl-5");
	}
	
	private void addChilds() {
		var leftNodeContainer = new HBox();
		
		leftNodeContainer.getChildren().add(fileNameNode);
		fileNameNode.setText(fileName);
		
		var filePathContainer = new HBox();
		filePathNode.setText(path);
		filePathContainer.getChildren().add(filePathNode);
		filePathContainer.getStyleClass().addAll("pl-2");
		leftNodeContainer.getChildren().add(filePathContainer);						
		
		if(isStaged) {
			line.setStroke(Color.BLACK);
			line.setStrokeWidth(2);
			var hBoxRight = new HBox();
			hBoxRight.getStyleClass().addAll("pr-3","cur-point");			
			hBoxRight.getChildren().add(line);
			this.plusMinusNode.getChildren().add(hBoxRight);
		}
		else this.plusMinusNode.getChildren().add(new Text("+"));		
		minusNode.addEventFilter(MouseEvent.MOUSE_CLICKED, e-> plusMinusClickHandler.accept(path));
		
		this.setLeft(leftNodeContainer);
		this.setRight(this.plusMinusNode);
	}
	
	
}
