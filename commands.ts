
import { exec } from "child_process";
import * as fs from 'fs';
import * as path from "path";

const libraryName = "common_library"
const frontendDestinationFolder = path.join("frontend","node_modules",libraryName);
const backendDestinationFolder = path.join("node_modules",libraryName) ;

function synchUpdates(){
    copyUntrackedFiles();
    copyModifiedFiles();
    removeDeletedFiles();
}


synchUpdates();
// synchAll();

function synchAll(){
    cleanAndCopyFiles();
}

function copyUntrackedFiles(){
    const command = "git ls-files --others --exclude-standard common_library";
    runCommand(command,copyCommonFiles);
}

function cleanAndCopyFiles(){
    let iteration = 0;
    const folders = [backendDestinationFolder,frontendDestinationFolder];
    folders.forEach(folder=>{
        iteration++;
        if(!fs.existsSync(folder)) return;
        fs.rmdir(folder, { recursive: true }, (err) => {
            if (err) {
                console.error(err);
            } 
            
            if(iteration === folders.length){
                const command = "git ls-files common_library";
                runCommand(command,copyCommonFiles);
            }
        });
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
        let frontendPath = path.join('frontend','node_modules',file);      
        let backendPath = path.join('node_modules',file);      
        copy(file,frontendPath);
        copy(file,backendPath);
    });

    function copy(src:string,dest:string){        
        let dir = path.dirname(dest);
        if(!fs.existsSync(src)) return;
        if(!fs.existsSync(dir) ){
            console.log('creating dir');
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