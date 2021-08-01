package com.bsse.views.mainScene;

import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.Date;
import com.bsse.dataClasses.CommitInfo;
import javafx.geometry.Insets;
import javafx.scene.control.TextArea;
import javafx.scene.layout.Background;
import javafx.scene.layout.BackgroundFill;
import javafx.scene.layout.Border;
import javafx.scene.layout.BorderStroke;
import javafx.scene.layout.BorderStrokeStyle;
import javafx.scene.layout.BorderWidths;
import javafx.scene.layout.CornerRadii;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.Text;

public class CommitProperty extends VBox{
  
  private CommitInfo commit = new CommitInfo();
	
  private final Text abreviatedHash = new Text();	
  private Text date = new Text();
  private Text author = new Text();
  private final TextArea textAreaForMessage = new TextArea();

  
  public CommitProperty(CommitInfo commit) {
	super();
	addStyles();
	addChildNodes();
	updateUi(commit);
  }
  
  private void addStyles() {
	  var stoke =  new BorderStroke(Color.BLACK, BorderStrokeStyle.SOLID, CornerRadii.EMPTY, new BorderWidths(0,0,0,1));	  
	  var border = new Border(null,null,null,stoke);	  
	  this.setBorder(border);
	  this.setPadding(new Insets(0, 0, 0, 5));
  }
  
  public void updateUi(CommitInfo commit) {
	  if(commit == null) return;	  
	  
	  if(this.commit != commit) {
		  if(this.commit.UiObj != null) this.commit.UiObj.setSelection(false);
		  if(commit.UiObj != null) commit.UiObj.setSelection(true);		  
	  }
	  if(!commit.avrebHash.equals(this.commit.avrebHash)) this.abreviatedHash.setText(commit.avrebHash);
	  if(!commit.date.equals(this.commit.date)) {
		  var dateObj = Date.from( Instant.parse( commit.date ));
		  SimpleDateFormat dateFormat = new SimpleDateFormat("dd MMM, yyyy hh:mm:ss a");
		  this.date.setText(dateFormat.format(dateObj));
	  }
	  if(!commit.author_email.equals(this.commit.author_email)) this.author.setText(commit.author_name+"<"+commit.author_email+">");
	  if(!commit.message.equals(this.commit.message)) {		  
		  this.textAreaForMessage.setText(commit.message);		  
	  }
	  
	  this.commit = commit;
	  
	  
  }
  
  private void addChildNodes() {
	  var heading = new HBox();
	  var title = new Text("Commit properties");
	  title.setFont(Font.font(14));
	  heading.getChildren().add(title);	  
	  this.getChildren().add(heading);
	  
	  var hashAndDate = new HBox();
	  
	  var hashLevel = new Text("Sha: ");
	  hashAndDate.getChildren().add(hashLevel);
	  this.abreviatedHash.setDisable(false);
	  hashAndDate.getChildren().add(this.abreviatedHash);
	  
	  var dateLevel = new Text(" | Date: ");
	  hashAndDate.getChildren().add(dateLevel);	  
	  hashAndDate.getChildren().add(this.date);
	  
	  this.getChildren().add(hashAndDate);
	  
	  var author = new HBox();	  
	  var authorLevel = new Text("Author: ");
	  author.getChildren().add(authorLevel);
	  author.getChildren().add(this.author);
	  this.getChildren().add(author);
	  
	  var message = new HBox();
	  this.textAreaForMessage.setMaxWidth(250);
	  this.textAreaForMessage.setWrapText(true);
	  this.textAreaForMessage.setEditable(false);
	  var backfill = new BackgroundFill(Color.TRANSPARENT, new CornerRadii(0), new Insets(0));
	  var background = new Background(backfill);
	  this.textAreaForMessage.setBackground(background);	  	  
	  this.textAreaForMessage.setPadding(new Insets(5,0,0,0));	  	  
	  message.getChildren().add(this.textAreaForMessage);
	  this.getChildren().add(message);
	  
  }
}
