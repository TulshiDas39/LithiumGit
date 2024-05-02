import {ICommitInfo,StringUtils,CreateCommitInfoObj, Constants} from "common_library"
import { LogFields } from "../dataClasses";
export class CommitParser{
    private static readonly commitFieldCount = LogFields.FieldCount();
    private static readonly logFields = LogFields.Fields();


    private static getHash(line:string){
        return line.replace(CommitParser.logFields.Hash+":","");
    }

    private static getAbbrevHash(line:string){
        return line.replace(CommitParser.logFields.Abbrev_Hash+":","");
    }

    private static getParentHash(line:string){
        let ids = line.replace(CommitParser.logFields.Parent_Hashes+":","");
        return StringUtils.getWords(ids);
    }

    private static getAuthorName(line:string){
        return line.replace(CommitParser.logFields.Author_Name+":","");
    }

    private static getAuthorEmail(line:string){
        return line.replace(CommitParser.logFields.Author_Email+":","");
    }
    private static getDate(line:string){
        return line.replace(CommitParser.logFields.Date+":","").trim();
    }
    private static getMessage(line:string){
        return line.replace(CommitParser.logFields.Message+":","");
    }
    private static getBody(lines:string[],indexObj:{index:number}){
        let line = lines[indexObj.index];
        let body = line.replace(CommitParser.logFields.Body+":","") ;
        indexObj.index++;
        line = lines[indexObj.index];
        while(!line.startsWith(CommitParser.logFields.Ref+":")){
            body += "\n"+line;            
            indexObj.index++;
            line = lines[indexObj.index];
        }
        if(body.endsWith('\n')){
            body = body.substring(0,body.length-1);
        }
        return body;
    }

    private static getRefs(line:string){
        return line.replace(CommitParser.logFields.Ref+":","");
    }

    private static setRefs(commit:ICommitInfo){
        let commitRef = commit.refs;
        if(commitRef){
            if(commitRef.includes(Constants.headPrefix)) {                
                commit.isHead = true;
                commitRef = commitRef.substring(Constants.headPrefix.length);
            }
            const splits = commitRef.split(",");
            commit.refValues = splits.map(x=> x.trim());
        }
    }

    private static addCommitFields(lines:string[],indexObj:{index:number},commit:ICommitInfo){
        //"--pretty="+LogFields.Hash+":%H%n"+LogFields.Abbrev_Hash+":%h%n"+LogFields.Parent_Hashes+":%p%n"+LogFields.Author_Name+":%an%n"+LogFields.Author_Email+":%ae%n"+LogFields.Date+":%ad%n"+LogFields.Message+":%s%n"+LogFields.Body+":%b%n"+LogFields.Ref+":%D%n";
        commit.hash = CommitParser.getHash(lines[indexObj.index]);
        indexObj.index++;
        commit.avrebHash = CommitParser.getAbbrevHash(lines[indexObj.index]);
        indexObj.index++;
        commit.parentHashes = CommitParser.getParentHash(lines[indexObj.index]);
        indexObj.index++;
        commit.author_name = CommitParser.getAuthorName(lines[indexObj.index]);
        indexObj.index++;
        commit.author_email = CommitParser.getAuthorEmail(lines[indexObj.index]);
        indexObj.index++;
        commit.date = CommitParser.getDate(lines[indexObj.index]);
        indexObj.index++;
        commit.message = CommitParser.getMessage(lines[indexObj.index]);
        indexObj.index++;
        commit.body = CommitParser.getBody(lines,indexObj);
        commit.refs = CommitParser.getRefs(lines[indexObj.index]);
        CommitParser.setRefs(commit);        
        indexObj.index++;
    }
    private static addCommitField(lines:string[],indexObj:{index:number},line:string,commit:ICommitInfo){
        const fields = LogFields.Fields();
        if(line.startsWith(fields.Hash)) {
            commit.hash = line.replace(fields.Hash+":","");
        }
        if(line.startsWith(fields.Abbrev_Hash)) {
            commit.avrebHash = line.replace(fields.Abbrev_Hash+":","");
        }

        else if(line.startsWith(fields.Parent_Hashes)){
            let ids = line.replace(fields.Parent_Hashes+":","");
            commit.parentHashes =  StringUtils.getWords(ids);
        }
        else if(line.startsWith(fields.Author_Name)){
            commit.author_name = line.replace(fields.Author_Name+":","");
        }
        else if(line.startsWith(fields.Author_Email)){
            commit.author_email = line.replace(fields.Author_Email+":","");
        }
        else if(line.startsWith(fields.Date)){
            commit.date = line.replace(fields.Date+":","").trim();
        }
        else if(line.startsWith(fields.Message)) {
            commit.message = line.replace(fields.Message+":","");
        }
        else if(line.startsWith(fields.Body)) {
            commit.body = line.replace(fields.Body+":","");
        }
        else if(line.startsWith(fields.Ref)){
            commit.refs =line.replace(fields.Ref+":","");
        }

        let commitRef = commit.refs;    	
        if(commitRef){
            if(commitRef.includes(Constants.headPrefix)) {                
                commit.isHead = true;
                commitRef = commitRef.substring(Constants.headPrefix.length);
            }
            const splits = commitRef.split(",");
            commit.refValues = splits.map(x=> x.trim());
        }
        
    }
    private static getCommit(lines:string[], indexObj:{index:number}){
        var commit = CreateCommitInfoObj();
        CommitParser.addCommitFields(lines, indexObj,commit);
        return commit;
        // while(true){
        //     if(indexObj.index >= lines.length) return commit;
        //     var line = lines[indexObj.index];
        //     if(!line?.startsWith(CommitParser.logFields.Hash)) {
        //         indexObj.index++;
        //         continue;
        //     }                        
        //     CommitParser.addCommitFields(lines, indexObj,commit);
        //     indexObj.index++;
        //     return commit;
        // }
    }
    private static removeGurbageLines(lines:string[]){            
        while(!lines[lines.length - 1]?.startsWith(CommitParser.logFields.Ref+":")){
            lines.pop();
            if(!lines.length)
                break;
        }
    }

    static parse(str:string){       
        let commits:ICommitInfo[] = [];
        let indexObj = {index:0};
        let lines:string[] = str.split('\n');
        CommitParser.removeGurbageLines(lines);
        if(!lines.length)
            return commits;
        while(indexObj.index < lines.length){
            let commit = CommitParser.getCommit(lines,indexObj);
            if(!commit.refValues.some(_=> _.startsWith('refs/notes/')))
                commits = [commit,...commits];
            indexObj.index++;
        }
        return commits;
    }    
}