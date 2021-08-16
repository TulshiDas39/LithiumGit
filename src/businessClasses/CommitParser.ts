import {ICommitInfo,StringUtils,CreateCommitInfoObj} from "common_library"
import { LogFields } from "../dataClasses";
export class CommitParser{
    private static addCommitField(line:string,commit:ICommitInfo){
        if(line.startsWith(LogFields.Hash)) {
            commit.hash = line.replace(LogFields.Hash+":","");
        }
        if(line.startsWith(LogFields.Abbrev_Hash)) {
            commit.avrebHash = line.replace(LogFields.Abbrev_Hash+":","");
        }

        else if(line.startsWith(LogFields.Parent_Hashes)){
            let ids = line.replace(LogFields.Parent_Hashes+":","");
            commit.parentHashes =  StringUtils.getWords(ids);
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
    private static getCommit(lines:string[], indexObj:{index:number}){
        var commit = CreateCommitInfoObj();
        while(true){
            if(indexObj.index >= lines.length) return commit;
            var line = lines[indexObj.index];
            if(!line) {
                indexObj.index++;
                continue;
            }
            if(!!commit.hash && line.startsWith(LogFields.Hash)){
                indexObj.index--;
                return commit;
            }
            
            CommitParser.addCommitField(line,commit);
            indexObj.index++;
        }
    }
    static parse(str:string){       
        let commits:ICommitInfo[] = [];
        let indexObj = {index:0};
        let lines:string[] = str.split('\n');

        while(indexObj.index < lines.length){
            let commit = CommitParser.getCommit(lines,indexObj);                        
            commits = [commit,...commits];
            indexObj.index++;
        }
        return commits;
    }    
}