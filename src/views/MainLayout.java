
package views;

import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.scene.text.Text;

/**
 *
 * @author ASUS
 */
public class MainLayout extends Scene{
    public MainLayout() {
		super(getScene(),300, 275);
    }
    
    private static Parent getScene() {
		var grid = new GridPane();
		grid.setAlignment(Pos.CENTER);
		grid.setHgap(10);
		grid.setVgap(10);
		grid.setPadding(new Insets(25, 25, 25, 25));
		
		var scenetitle = new Text("Welcome");
		scenetitle.setFont(Font.font("Tahoma", FontWeight.NORMAL, 20));
		grid.add(scenetitle, 0, 0, 2, 1);

		var userName = new Label("User Name:");
		grid.add(userName, 0, 1);

		var userTextField = new TextField();
		grid.add(userTextField, 1, 1);

		var pw = new Label("Password:");
		grid.add(pw, 0, 2);

		var pwBox = new PasswordField();
		grid.add(pwBox, 1, 2);
		
		var btn = new Button("Sign in");
		
		final Text actiontarget = new Text();
                grid.add(actiontarget, 1, 6);
        
		btn.setOnAction(new EventHandler<ActionEvent>() {
			 
		    @Override
		    public void handle(ActionEvent e) {
		        actiontarget.setFill(Color.FIREBRICK);
		        actiontarget.setText("Sign in button pressed");
		    }
		});
		
		      HBox hbBtn = new HBox(10);
		hbBtn.setAlignment(Pos.BOTTOM_RIGHT);
		hbBtn.getChildren().add(btn);
		grid.add(hbBtn, 1, 4);		
		
		return grid;		
	}
	
}