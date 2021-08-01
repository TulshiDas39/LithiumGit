package com.bsse.views.mainScene;


import com.bsse.business.StateManager;
import com.bsse.interfaces.GlobalClickListenable;
import com.bsse.utils.UiUtil;
import javafx.scene.input.MouseEvent;
import javafx.scene.paint.Color;
import javafx.scene.shape.Line;

public class MergeLine extends Line implements GlobalClickListenable{
	private boolean isSelected;
	private Color selectedColor = Color.AQUAMARINE;
	private Color defaultColor = Color.CORNFLOWERBLUE;;	
	private Color activeColor = defaultColor;
	public MergeLine() {
		super();
		addStyles();
	}
	public MergeLine(double startX,double startY,double endX,double endY) {
		super(startX,startY,endX,endY);
		addStyles();
	}
	
	private void addStyles() {
		this.setColorAndStoke();
	}
	
	private void setColorAndStoke() {
		this.setStroke(activeColor);
	}
	
	public boolean getIsSelected() {
		return isSelected;
	}
	
	public void setIsSelected(boolean isSelectedValue) {
		if(this.isSelected == isSelectedValue)return;
		this.isSelected = isSelectedValue;
		if(this.isSelected) {
			this.activeColor = this.selectedColor;
			this.setColorAndStoke();
			StateManager.addGlobalListener(this);
		}
		else {
			this.activeColor = this.defaultColor;
			this.setColorAndStoke();
			StateManager.removeGlobalClickListener(this);
		}
	}

	@Override
	public void handleGlobalClick(MouseEvent e) {
		if (!UiUtil.inHierarchy(e.getPickResult().getIntersectedNode(), this)) {
            System.out.println("not in hirarchy");
           setIsSelected(false);
        }
		else {
			System.out.println("In hirarchy");
			setIsSelected(true);
		}
		
	}
}
