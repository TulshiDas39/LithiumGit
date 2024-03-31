# LithiumGit

**Download and install latest version from [releases](https://github.com/TulshiDas39/LithiumGit/releases)..**

This is a cross platform Git GUI application.

# Architecture

common_library: This is a local npm package which is used in both backend and frontend. Functions,classes,types etc needed both in backend and frontend are exported from here.

frontend: This is a react app built with create-react-app template. This is the application ui.

# Steps to run

build and install the common library:  
-navigate to common_library folder and run "npm run build"  
  
run the frontend:  
-navigate to frontend folder and run "npm start"  
  
run the backend:    
-open ./src/config.ts file  
-ensure static readonly ENV:'development'|'production' = 'development';      
-npm start  

# Steps to create distribution
-navigate to common_library folder and run "npm run build"  
-open ./src/config.ts file  
-ensure static readonly ENV:'development'|'production' = 'production';  
-delete ./dist/db and ./dist/log folders if exist.  
-run "npm run package" in root directory.  

## License

[MIT](LICENSE)
