/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.business;

import com.bsse.dataClasses.CommitInfo;
import com.bsse.dataClasses.LogFields;
import java.util.ArrayList;

/**
 *
 * @author ASUS
 */
public class LogParser {
    
    private static void addCommitField(String line,CommitInfo commit){
        if(line.startsWith(LogFields.Hash)) {
            commit.hash = line.replace(LogFields.Hash+":","");
        }
        if(line.startsWith(LogFields.Abbrev_Hash)) {
            commit.avrebHash = line.replace(LogFields.Abbrev_Hash+":","");
        }

        else if(line.startsWith(LogFields.Parent_Hashes)){
            var ids = line.replace(LogFields.Parent_Hashes+":","");
            commit.parentHashes =  StringUtil.getWords(ids);
        }
        else if(line.startsWith(LogFields.Author_Name)){
            commit.author_name = line.replace(LogFields.Author_Name+":","");
        }
        else if(line.startsWith(LogFields.Author_Email)){
            commit.author_email = line.replace(LogFields.Author_Email+":","");
        }
        else if(line.startsWith(LogFields.Date)){
            commit.date = line.replace(LogFields.Date+":","").trim();
        }
        else if(line.startsWith(LogFields.Message)) {
            commit.message = line.replace(LogFields.Message+":","");
        }
        else if(line.startsWith(LogFields.Ref)){
            commit.refs =line.replace(LogFields.Ref+":","");
        }
    }
    
    private static CommitInfo getCommit(ArrayList<String> lines, IndexObj indexObj){
        var commit = new CommitInfo();
        while(true){
            if(indexObj.index >= lines.size()) return commit;
            //console.log(indexObj.index);            
            var line = lines.get(indexObj.index);
            //console.log(line);
            if(line == null) {
                indexObj.index++;
                continue;
            }
            if(!StringUtil.isNullOrEmpty(commit.hash) && line.startsWith(LogFields.Hash)){
                indexObj.index--;
                return commit;
            }
            
            addCommitField(line,commit);
            indexObj.index++;
        }
    }
    
    public static ArrayList<CommitInfo> Parse(ArrayList<String> lines){
        //var lines =  str.split("\n");
        var commits = new ArrayList<CommitInfo>();
        var indexObj = new IndexObj();

        while(indexObj.index < lines.size()){
            var commit = getCommit(lines,indexObj);
            commits.add(commit);
            indexObj.index++;
        }
        return commits;
    }
}

class IndexObj{
    public int index;
}