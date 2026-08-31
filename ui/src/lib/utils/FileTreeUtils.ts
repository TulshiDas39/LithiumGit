export interface IFileTreeNode<T>{
    name:string;
    path:string;
    item?:T;
    children:Map<string,IFileTreeNode<T>>;
}

export class FileTreeUtils{
    static buildTree<T extends {path:string}>(items:T[]):IFileTreeNode<T>{
        const root:IFileTreeNode<T> = {name:"",path:"",children:new Map()};
        for(const item of items){
            const parts = item.path.split("/");
            let current = root;
            let currentPath = "";
            for(let i=0;i<parts.length;i++){
                const part = parts[i];
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                const isLeaf = i === parts.length-1;
                let next = current.children.get(part);
                if(!next){
                    next = {name:part,path:currentPath,item:isLeaf?item:undefined,children:new Map()};
                    current.children.set(part,next);
                }
                current = next;
            }
        }
        return root;
    }

    static sortedChildren<T>(node:IFileTreeNode<T>):IFileTreeNode<T>[]{
        return Array.from(node.children.values()).sort((a,b)=>{
            const aIsFile = !!a.item, bIsFile = !!b.item;
            if(aIsFile !== bIsFile)
                return aIsFile ? 1 : -1;
            return a.name.localeCompare(b.name);
        });
    }

    static allFolderPaths<T>(node:IFileTreeNode<T>):string[]{
        const paths:string[] = [];
        for(const child of node.children.values()){
            if(!child.item){
                paths.push(child.path);
                paths.push(...FileTreeUtils.allFolderPaths(child));
            }
        }
        return paths;
    }
}
