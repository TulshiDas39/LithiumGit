/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gitstudio;

import javafx.application.Application;
import javafx.stage.Stage;
import views.MainLayout;

/**
 *
 * @author ASUS
 */
public class Main extends Application{

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage stage){
        stage.setTitle("Hello World!");		
        stage.setScene(new MainLayout());        
        
        stage.show();
    }
    
}
