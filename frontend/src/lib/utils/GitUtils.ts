import { EnumChangeGroup, IFile, StringUtils, createRepositoryInfo } from "common_library";
import { IpcUtils } from "./IpcUtils";
import { ReduxUtils } from "./ReduxUtils";
import { ActionModals, ActionSavedData } from "../../store";
import { EnumModals } from "../enums";
import { ModalData } from "../../components/modals/ModalData";

export class GitUtils{
    //git diff-tree --no-commit-id 0a2f033 -r

    static async GetFileListByCommit(commitHash:string){
        const files:IFile[]  = [];
        const options = ["diff-tree", "--no-commit-id", commitHash, "-r", "-m"];
        const result = await IpcUtils.getRaw(options);
        if(!result.result)
            return files;

        const lines = StringUtils.getLines(result.result).filter(l => !!l).slice(0,1000);
        const statResult = await GitUtils.getNumStat(commitHash);
        for(let line of lines){
            const words = StringUtils.getWords(line);
            const path = words[words.length-1];
            if(files.some(_=> _.path === path))
                continue;
            const stat = statResult.find(_=> _.path === path);
            const addCount = stat?.addCount;
            const deleteCount = stat?.deleteCount;
            const file = {
                changeGroup:EnumChangeGroup.REVISION
                ,path,
                fileName:StringUtils.getFileName(words[words.length-1]),
                changeType:StringUtils.getChangeType(words[words.length-2]),
                addCount,
                deleteCount

            } as IFile;
            files.push(file);
        }




        return files;
    }

    static async getNumStat(commitHash:string){
        const files:{path:string;addCount:number;deleteCount:number}[]  = [];
        const options = ["diff-tree", "--no-commit-id", commitHash, "-r","-m","--numstat"];
        const result = await IpcUtils.getRaw(options);
        if(!result.result)
            return files;

        const lines = StringUtils.getLines(result.result).filter(l => !!l).slice(0,1000);
        for(let line of lines){
            const words = StringUtils.getWords(line);
            const path = words[2];
            if(!files.some(_=> path === _.path)){
                files.push({addCount:Number(words[0]),deleteCount:Number(words[1]),path});
            }
            
        }

        return files;
    }

    static OpenRepository(path:string){
        const isValidPath = IpcUtils.isValidRepositoryPath(path);
        if(!isValidPath) {
            ModalData.errorModal.message = "The path is not a git repository";
            ReduxUtils.dispatch(ActionModals.showModal(EnumModals.ERROR));            
        }
        else {
            const newRepoInfo = createRepositoryInfo({
                name:StringUtils.getFolderName(path),
                path:path
            });
            ReduxUtils.dispatch(ActionSavedData.setSelectedRepository(newRepoInfo));
        }
    }
}