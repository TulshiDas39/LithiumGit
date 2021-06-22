
package com.bsse.views.mainScene;

import com.bsse.dataClasses.Constants;
import com.bsse.dataClasses.RepoInfo;
import com.bsse.dataClasses.StaticData;
import java.util.ArrayList;
import java.util.function.Consumer;
import javafx.scene.Node;
import javafx.scene.control.ComboBox;
import javafx.scene.layout.HBox;
import javafx.scene.text.Text;

/**
 *
 * @author ASUS
 */
public class TopNav extends HBox{

    private HBox toolBoxForRepo = new HBox();
    private RepoInfo selectedRepo;

    public TopNav() {
        super();
        addStyles();
        addChildNodes();
    }
    
    private void addStyles(){
        setWidth(300);
        getStyleClass().add("border");
    }
    
    private void addChildNodes(){
        var childNodes = new ArrayList<Node>();
                
        childNodes.add(getRepositoryOption());        
        childNodes.add(this.toolBoxForRepo);
        getChildren().addAll(childNodes);
        
    }
    
    public void updateUi(){
        if(StaticData.selectedRepo != this.selectedRepo){
            this.selectedRepo = StaticData.selectedRepo;
            handleRepoSelection();
        }
    }
    
    private void handleRepoSelection(){
        if(this.selectedRepo == null){
            this.toolBoxForRepo.getChildren().removeAll(this.toolBoxForRepo.getChildren());
        }
        else{
            createToolboxForRepo();            
        }
    }
    
    private void createToolboxForRepo(){
        this.toolBoxForRepo.getChildren().add(getRepoDropdown());                
    }
    
    
    
    private Node getRepositoryOption(){
        var option = new HBox();
        option.getStyleClass().add("cur-point border");
        var text = new Text("Repositories");
        option.getChildren().add(text);       
        return option;
    }
    
    private Node getActionTools(){
        var hBox = new HBox();
                                      
        hBox.getChildren().add(getRepoDropdown());
        
        
        return hBox;
    }
    
    private Node getRepoDropdown(){
        var repos = new ComboBox<String>();
        var options = new ArrayList<String>();
        Constants.repos.forEach(new Consumer<RepoInfo>() {
            @Override            
            public void accept(RepoInfo repo) {
                options.add(repo.name);
            }
        });
        
        repos.getItems().addAll(options);
        repos.setValue(options.get(0));
        return repos;
    }
    
}
