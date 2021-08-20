
import { exec } from "child_process";
import * as fs from 'fs';
import * as path from "path";
import * as fse from 'fs-extra';

const libraryName = "common_library";
const frontendProjectName = "frontend";
const node_modulesFolder = "node_modules";
const frontendDestinationFolder = path.join(frontendProjectName,"node_modules",libraryName);
const backendDestinationFolder = path.join("node_modules",libraryName) ;




// synchUpdates();
syncAll();

function syncAll(){
    const destinations = [frontendDestinationFolder,backendDestinationFolder];
    // destinations.forEach(dest=>{
    //     if(fs.existsSync(dest)) fs.rmdirSync(dest,{maxRetries:3});        
    // });
    copyAll();
}

function synchUpdates(){
    copyUntrackedFiles();
    copyModifiedFiles();
    removeDeletedFiles();
}

function copyUntrackedFiles(){
    const command = "git ls-files --others --exclude-standard common_library";
    runCommand(command,copyCommonFiles);
}

function copyAll(){
    [path.join(frontendProjectName,node_modulesFolder,libraryName) , path.join(node_modulesFolder,libraryName)].forEach(folder=>{
        fse.copySync(libraryName,folder,{recursive:true});
    });
}


function resolveFiles(str:string){
    return str.replace(/\s/g," ").trim().split(" ");
}

function copyModifiedFiles(){
    const command = "git ls-files --modified common_library";
    runCommand(command,copyCommonFiles)
}

function removeDeletedFiles(){
    const command = "git ls-files --deleted common_library";
    runCommand(command,handleDelete)
}

function runCommand(command:string,handler:(output:string)=>void){
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        handler(stdout);
    });
    
}


function copyCommonFiles(files:string){
    let fileList = resolveFiles(files);
    console.log("files",fileList.join(","));
    if(!fileList.length)return;
    console.log('file exist');

    fileList.forEach(file=>{  
        let frontendPath = path.join(frontendProjectName,'node_modules',file);      
        let backendPath = path.join('node_modules',file);      
        copy(file,frontendPath);
        copy(file,backendPath);
    });

    function copy(src:string,dest:string){        
        let dir = path.dirname(dest);
        if(!fs.existsSync(src)) return;
        if(!fs.existsSync(dir) ){
            console.log('creating dir',dir);
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.copyFile(src, dest, (err) => {
            if (err) console.error(err);
        });
    }
}

function handleDelete(files:string){
    let fileList = resolveFiles(files);
    console.log("files to delete:",fileList.join(","));
    if(!fileList.length)return;          
    for (let file of fileList) {
        file = file.substring(file.indexOf('/')+1);
        const frontendPath = path.join(frontendDestinationFolder,file);
        const backendpath = path.join(backendDestinationFolder,file);
        if(fs.existsSync(frontendPath)){
            fs.unlink( frontendPath, err => {
                if (err) console.error(err);
            });
        }
        if(fs.existsSync(backendpath)){
            fs.unlink( backendpath, err => {
                if (err) console.error(err);
            });
        }
        
    }
    
}