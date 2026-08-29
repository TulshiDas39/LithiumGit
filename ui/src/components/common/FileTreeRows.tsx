import React, { useEffect, useMemo } from "react"
import { MdChevronRight, MdExpandMore, MdFolder, MdFolderOpen } from "react-icons/md";
import { FileTreeUtils, IFileTreeNode, useMultiState } from "../../lib";

interface IProps<T extends {path:string}>{
    items:T[];
    renderLeaf:(item:T, depth:number)=>React.ReactNode;
}

interface IState<T>{
    expanded:Set<string>;
    lastItems:T[];
}

function FolderRow<T>(props:{node:IFileTreeNode<T>,depth:number,expanded:Set<string>,onToggle:(path:string)=>void,renderLeaf:(item:T,depth:number)=>React.ReactNode}){
    const {node,depth,expanded,onToggle,renderLeaf} = props;
    if(node.item){
        return <>{renderLeaf(node.item,depth)}</>
    }
    const isOpen = expanded.has(node.path);
    return <div>
        <div className="hover cur-point d-flex align-items-center" style={{paddingLeft:depth*16}} onClick={()=> onToggle(node.path)}>
            <span className="text-secondary d-flex align-items-center" style={{width:16, fontSize:'1.1em'}}>{isOpen ? <MdExpandMore /> : <MdChevronRight />}</span>
            {isOpen ? <MdFolderOpen className="text-warning ps-1" style={{fontSize:'1.3em'}} /> : <MdFolder className="text-warning ps-1" style={{fontSize:'1.3em'}} />}
            <span className="ps-1">{node.name}</span>
        </div>
        {isOpen && FileTreeUtils.sortedChildren(node).map(child=>(
            <FolderRow key={child.path} node={child} depth={depth+1} expanded={expanded} onToggle={onToggle} renderLeaf={renderLeaf} />
        ))}
    </div>
}

function FileTreeRowsComponent<T extends {path:string}>(props:IProps<T>){
    const tree = useMemo(()=> FileTreeUtils.buildTree(props.items),[props.items]);

    const [state,setState] = useMultiState<IState<T>>({
        expanded:new Set(FileTreeUtils.allFolderPaths(tree)),
        lastItems:props.items,
    });

    useEffect(()=>{
        if(state.lastItems === props.items)
            return;
        setState({expanded:new Set(FileTreeUtils.allFolderPaths(tree)), lastItems:props.items});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.items])

    const handleToggle=(path:string)=>{
        const next = new Set(state.expanded);
        if(next.has(path))
            next.delete(path);
        else
            next.add(path);
        setState({expanded:next});
    }

    return <>
        {FileTreeUtils.sortedChildren(tree).map(child=>(
            <FolderRow key={child.path} node={child} depth={0} expanded={state.expanded} onToggle={handleToggle} renderLeaf={props.renderLeaf} />
        ))}
    </>
}

export const FileTreeRows = React.memo(FileTreeRowsComponent) as <T extends {path:string}>(props:IProps<T>)=>JSX.Element;
