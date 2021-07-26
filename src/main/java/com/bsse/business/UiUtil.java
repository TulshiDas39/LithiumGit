package com.bsse.business;


import javafx.scene.Node;
import javafx.scene.control.ScrollPane;

public class UiUtil {
    public static void ensureVisible(ScrollPane pane, Node node) {
        double width = pane.getContent().getBoundsInLocal().getWidth();
        double height = pane.getContent().getBoundsInLocal().getHeight();

        double x = node.getBoundsInParent().getMaxX();
        double y = node.getBoundsInParent().getMinY();

        System.out.println(x);
        System.out.println(y);
        // scrolling values range from 0 to 1
        pane.setVvalue(y/height);
        pane.setHvalue(x/width);

        // just for usability
        node.requestFocus();
    }
}
