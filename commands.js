const { exec } = require("child_process");

copyUntrackedFiles();
copyModifiedFiles();

function copyUntrackedFiles(){
    const command = "git ls-files --others --exclude-standard common_library";
    runCommand(command,copyCommonFiles)
}

function copyModifiedFiles(){
    const command = "git ls-files --modified common_library";
    runCommand(command,copyCommonFiles)
}

function removeDeletedFiles(){
    const command = "git ls-files --deleted common_library";
    runCommand(command,copyCommonFiles)
}

function runCommand(command,handler){
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        handler(stdout);
    });
    
}


function copyCommonFiles(files){
    files = files.replace(/[\n\r]/g, " ").trim();
    console.log("files",files);
    if(!files)return;
    console.log('file exist');
    let command1 = `copyfiles -E ${files} frontend/node_modules`;
    let command2 = `copyfiles -E ${files} node_modules`;
    runCommand(command1,()=>{});
    runCommand(command2,()=>{});
}

function handleDelete(files){
    files = files.replace(/[\n\r]/g, " ").trim();
    console.log("files",files);
    if(!files)return;
    console.log('file exist');
    let command1 = `copyfiles -E ${files} frontend/node_modules`;
    let command2 = `copyfiles -E ${files} node_modules`;
    runCommand(command1,()=>{});
    runCommand(command2,()=>{});
}