import { EnumChangeGroup, EnumChangeType, IFile, StringUtils, createRepositoryInfo } from "common_library";
import { IpcUtils } from "./IpcUtils";
import { ReduxUtils } from "./ReduxUtils";
import { ActionModals, ActionSavedData } from "../../store";
import { EnumModals } from "../enums";
import { ModalData } from "../../components/modals/ModalData";

export class GitUtils{
    //git diff-tree --no-commit-id 0a2f033 -r

    static async GetFileListByCommit(commitHash:string,opts?:string[]){
        const files:IFile[]  = [];
        const options = ["diff-tree", "--no-commit-id", commitHash, "-r", "-m"];
        if(opts?.length){
            options.push(...opts);
        }
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
            const file = statResult.find(_=> _.path === path);
            if(!file)
                continue;            

            file.changeType = StringUtils.getChangeType(words[words.length-2]);
            file.changeGroup = EnumChangeGroup.REVISION;
            files.push(file);
        }




        return files;
    }

    static async getNumStat(commitHash:string){
        const files:IFile[]  = [];
        const options = ["diff-tree", "--no-commit-id", commitHash, "-r","-m","--numstat"];
        const result = await IpcUtils.getRaw(options);
        if(!result.result)
            return files;

        const lines = StringUtils.getLines(result.result).filter(l => !!l).slice(0,1000);
        for(let line of lines){
            const words = StringUtils.getWords(line);
            const path = words[2];
            if(!files.some(_=> path === _.path)){
                files.push({
                    addCount:Number(words[0]),
                    deleteCount:Number(words[1]),
                    path,
                    changeGroup:EnumChangeGroup.REVISION,
                    changeType:EnumChangeType.MODIFIED,
                    fileName:StringUtils.getFileName(path),
                });
            }
            
        }

        return files;
    }

    private static async getFileStatusOfStash(index:number){
        const files:IFile[]  = [];
        const options = ["stash", "show", `stash@{${index}}`, "-u", "-r","-m","--name-status"];
        const result = await IpcUtils.getRaw(options);
        if(!result.result)
            return files;

        const lines = StringUtils.getLines(result.result).filter(l => !!l).slice(0,1000);
        for(let line of lines){
            const words = StringUtils.getWords(line);
            const path = words[1];
            if(!files.some(_=> path === _.path)){
                files.push({                                        
                    path,
                    changeGroup:EnumChangeGroup.REVISION,
                    changeType:StringUtils.getChangeType(words[0]),
                    fileName:StringUtils.getFileName(path),
                });
            }
            
        }

        return files;
    }

    static async getChangedFileOfStatsh(index:number){
        const files:IFile[]  = [];
        const options = ["stash", "show", `stash@{${index}}`, "-u", "-r","-m","--numstat"];
        const result = await IpcUtils.getRaw(options);
        if(!result.result)
            return files;

        const lines = StringUtils.getLines(result.result).filter(l => !!l).slice(0,1000);

        let fileStatus:IFile[] = [];
        try{
           fileStatus = await GitUtils.getFileStatusOfStash(index);
        }catch(e){
        }
        for(let line of lines){
            const words = StringUtils.getWords(line);
            const path = words[2];
            const changeType = fileStatus.find(_=> _.path == path)?.changeType || EnumChangeType.MODIFIED;
            if(!files.some(_=> path === _.path)){
                files.push({
                    addCount:Number(words[0]),
                    deleteCount:Number(words[1]),
                    path,
                    changeGroup:EnumChangeGroup.REVISION,
                    changeType,
                    fileName:StringUtils.getFileName(path),
                });
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