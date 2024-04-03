import { IpcUtils } from "./IpcUtils";

export class GitUtils{
    //git diff-tree --no-commit-id 0a2f033 -r

    static GetFileListByCommit(commitHash:string){
        const options = ["diff-tree", "--no-commit-id", commitHash, "-r"];
        IpcUtils.getRaw(options).then(r=>{
            let res = r.response
        });

    }
}