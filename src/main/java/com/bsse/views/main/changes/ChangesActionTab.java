package com.bsse.views.main.changes;

import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;

public class ChangesActionTab extends VBox{
	private final HBox hBox = new HBox();
	private final HBox refresh = new HBox();
	private final HBox commitOption = new HBox();
	private final HBox discard = new HBox();
	private final HBox discardAll = new HBox();
	private final HBox stashAll = new HBox();
	
	public ChangesActionTab() {
		super();
		addChilds();
	}
	
	private void addChilds() {
		createRefreshOption();
		createCommitOption();
		createDiscardOption();
		createDiscardAllOption();
		createStashAllOption();
		
		this.getChildren().addAll(hBox);
		
	}
	
	private void createRefreshOption() {
		var text = new Text("Refresh");
		refresh.getChildren().add(text);
		refresh.getStyleClass().addAll("px-2");
		hBox.getChildren().add(refresh);
	}
	private void createCommitOption() {
		var text = new Text("Commit");
		commitOption.getChildren().add(text);
		commitOption.getStyleClass().addAll("px-2");
		hBox.getChildren().add(commitOption);
	}
	
	private void createDiscardOption() {
		var text = new Text("Discard");
		discard.getChildren().add(text);
		discard.getStyleClass().addAll("px-2");
		hBox.getChildren().add(discard);
	}
	
	private void createDiscardAllOption() {
		var text = new Text("Discard all");
		discardAll.getChildren().add(text);
		discardAll.getStyleClass().addAll("px-2");
		hBox.getChildren().add(discardAll);
	}
	
	private void createStashAllOption() {
		var text = new Text("Stash all");
		stashAll.getChildren().add(text);
		stashAll.getStyleClass().addAll("px-2");
		hBox.getChildren().add(stashAll);
	}
	
	
}
