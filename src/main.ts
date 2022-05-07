import { Startup } from "./Startup";


function setDevConfig(){
    process.env.NODE_ENV = 'development';
    process.env.FRONTEND_PORT = 54533;
}

setDevConfig();

const startUp = new Startup();
startUp.start();