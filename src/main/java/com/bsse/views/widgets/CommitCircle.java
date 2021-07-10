package com.bsse.views.widgets;

import com.bsse.dataClasses.CommitCircleProps;

import javafx.scene.shape.Circle;

public class CommitCircle extends Circle{
	private CommitCircleProps props;
	public CommitCircle(CommitCircleProps props) {
		super();
		this.props = props;
		setStyles();		
	}
	
	private void setStyles(){
		setCenterX(11);
		setCenterY(11);
		setRadius(this.props.radius);
		setStrokeWidth(this.props.strokeWidth);
		setFill(props.color);
				
		
	}
}
