package com.bsse.views.mainScene;

import com.bsse.business.StateManager;
import com.bsse.dataClasses.Constants;
import com.bsse.dataClasses.StaticData;
import java.util.ArrayList;
import javafx.event.EventHandler;
import javafx.scene.Node;
import javafx.scene.control.ScrollPane;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;
import org.kordamp.bootstrapfx.BootstrapFX;

/**
 *
 * @author ASUS
 */
public class RepoSelectionPanel extends HBox {

    public RepoSelectionPanel() {
        super();
        addStyles();
        addChildNodes();
    }

    private void addStyles() {
        getStyleClass().add("border-red");
        getStyleClass().add(BootstrapFX.bootstrapFXStylesheet());
    }

    private void addChildNodes() {
        var childNodes = new ArrayList<Node>();
        childNodes.add(getRecentRepositoryListPanel());

        getChildren().addAll(childNodes);
    }

    private Node getRecentRepositoryListPanel() {
        var bBox = new VBox();
        var childNodes = bBox.getChildren();
        bBox.getStyleClass().add("pt-2");

        var text = new Text("Select repository");
        text.getStyleClass().add("");
        childNodes.add(text);

        var repoNodes = getRepoNodes();
        childNodes.addAll(repoNodes);

        ScrollPane scrollPane = new ScrollPane();
        scrollPane.getStyleClass().add("mt-2");
        scrollPane.setContent(bBox);

        return scrollPane;
    }

    private VBox getRepoNodes() {
        var bBox = new VBox();
        bBox.getStyleClass().add("pt-2");
        var childs = bBox.getChildren();
        for (var repo : Constants.repos) {
            var node = new VBox();
            node.getStyleClass().addAll("py-1","cur-point");
            var firstRow = new HBox();
            var repoName = new Text(repo.name);
            firstRow.getChildren().add(repoName);
            node.getChildren().add(firstRow);

            var secondRow = new HBox();
            var url = new Text(repo.url);
            secondRow.getChildren().add(url);
            
            
            node.setOnMouseClicked( new EventHandler<MouseEvent>() {
                @Override
                public void handle(MouseEvent arg0) {
                    StateManager.setSelectedRepoInfo(repo);
                }
            });
            
            node.getChildren().add(secondRow);

            childs.add(node);
        }
        return bBox;
    }

}
