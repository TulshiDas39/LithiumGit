import { EnumChangeGroup, IFile, StringUtils } from "common_library";
import { IpcUtils } from "./IpcUtils";

export class GitUtils{
    //git diff-tree --no-commit-id 0a2f033 -r

    static async GetFileListByCommit(commitHash:string){
        const files:IFile[]  = [];
        const options = ["diff-tree", "--no-commit-id", commitHash, "-r"];
        const result = await IpcUtils.getRaw(options);
        if(!result.response)
            return files;

        const lines = StringUtils.getLines(result.response).filter(l => !!l).slice(0,1000);
        for(let line of lines){
            const words = StringUtils.getWords(line);
            const file = {
                changeGroup:EnumChangeGroup.REVISION
                ,path:words[words.length-1],
                fileName:StringUtils.getFileName(words[words.length-1]),
                changeType:StringUtils.getChangeType(words[words.length-2])
            } as IFile;
            files.push(file);
        }

        return files;
    }
}