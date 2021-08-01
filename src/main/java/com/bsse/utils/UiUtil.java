package com.bsse.utils;

import javafx.scene.Node;

public class UiUtil {
	public static boolean inHierarchy(Node node, Node potentialHierarchyElement) {
	    if (potentialHierarchyElement == null) {
	        return true;
	    }
	    while (node != null) {
	        if (node == potentialHierarchyElement) {
	            return true;
	        }
	        node = node.getParent();
	    }
	    return false;
	}
}
