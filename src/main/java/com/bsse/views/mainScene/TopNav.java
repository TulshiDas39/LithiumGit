
package com.bsse.views.mainScene;

import java.util.ArrayList;

import com.bsse.business.StateManager;
import com.bsse.dataClasses.Constants;
import com.bsse.dataClasses.RepoInfo;
import com.bsse.utils.ArrayUtil;

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
    private ComboBox<String> repoSelectionDropdown = new ComboBox<String>();
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
        createToolboxForRepo();        
        childNodes.add(getRepositoryOption());        
        childNodes.add(this.toolBoxForRepo);
        getChildren().addAll(childNodes);
        
    }
    
    public void updateUi(){
        if(StateManager.getSelectedRepoInfo() != this.selectedRepo){
            this.selectedRepo = StateManager.getSelectedRepoInfo();
            handleRepoSelection();
        }
    }
    
    private void handleRepoSelection(){
    	this.repoSelectionDropdown.setValue(this.selectedRepo.name);        
    }
    
    private void createToolboxForRepo(){
    	createRepoDropdown();
        this.toolBoxForRepo.getChildren().add(this.repoSelectionDropdown);                
    }
    
    
    
    private Node getRepositoryOption(){
        var option = new HBox();
        option.getStyleClass().add("cur-point border");
        var text = new Text("Repositories");
        option.getChildren().add(text);       
        return option;
    }
    
    private void createRepoDropdown(){
        this.repoSelectionDropdown = new ComboBox<String>();
        var options = new ArrayList<String>();

        Constants.repos.forEach((RepoInfo repo) -> {            
                options.add(repo.name);            
        });
        
        repoSelectionDropdown.getItems().addAll(options);
        repoSelectionDropdown.setValue(options.get(0));
        repoSelectionDropdown.setOnAction(e->{
        	 var repoName = repoSelectionDropdown.getValue();
        	 var selectedRepo = ArrayUtil.find(Constants.repos, r->r.name.equals(repoName));
        	 StateManager.setSelectedRepoInfo(selectedRepo);
        });        
    }
    
}
