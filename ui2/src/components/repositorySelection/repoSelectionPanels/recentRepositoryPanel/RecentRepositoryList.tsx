import { RepositoryInfo } from "common_library";
import React from "react";
import { shallowEqual, useDispatch } from "react-redux";
import { useSelectorTyped } from "../../../../store/rootReducer";
import { ActionModals, ActionSavedData } from "../../../../store/slices";
import { IpcUtils } from "../../../../lib/utils/IpcUtils";
import { ModalData } from "../../../modals/ModalData";
import { CacheUtils, EnumModals } from "../../../../lib";
import { FaTrashAlt } from "react-icons/fa";

export interface IRecentRepositoryListProps{
    onSelectItem:(item:RepositoryInfo)=>void;
    selectedItem?:RepositoryInfo;
}

interface IState{
    hoverRepoId:string;
}

function RecentRepositoryListComponent(props:IRecentRepositoryListProps){
    const store = useSelectorTyped(state=>({
        recentRepos:state.savedData.recentRepositories,
    }),shallowEqual);

    const [state, setState] = React.useState<IState>({ hoverRepoId: "" });

    const dispatch = useDispatch();

    const handleSelect=(item:RepositoryInfo)=>{
        props.onSelectItem(item);
    }
    const handleDoubleClick = (item:RepositoryInfo)=>{
        const isValidPath = IpcUtils.isValidRepositoryPath(item.path);
        if(!isValidPath){
            ModalData.confirmationModal.message = "Project does not exist. Remove this from list?";
            ModalData.confirmationModal.YesHandler = ()=>{
                dispatch(ActionSavedData.removeRepositoryFromRecentList(item));
            }
            dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));
        }
        else{
            props.onSelectItem(item);
            dispatch(ActionSavedData.setSelectedRepository(item));
        }
    }

    const handleDelete=(e:React.MouseEvent,repo:RepositoryInfo)=>{
        e.stopPropagation();        

        ModalData.confirmationModal.message = "Are you sure you want to remove this repository from recent list?";
        ModalData.confirmationModal.YesHandler = ()=>{
            dispatch(ActionSavedData.removeRepositoryFromRecentList(repo));
            CacheUtils.clearRepoDetails(repo.path);
        }
        dispatch(ActionModals.showModal(EnumModals.CONFIRMATION));
    }

    return <div id="recentRepoList" className="w-75 h-100 d-flex flex-column">
        <h4 className="px-1 py-2 m-0">Recent Repositories</h4>
        <hr className="m-0" />
        <div className="d-flex flex-column align-items-center pt-2 overflow-auto">
            {
                store.recentRepos.map(repo=>(
                    <div key={repo._id} className={`repoItem hover border-bottom pt-2 ${props.selectedItem?._id === repo._id?"selected":""}`}                        
                        onClick={()=>handleSelect(repo)} onMouseEnter={() => setState({hoverRepoId:repo._id})} onMouseLeave={() => setState({hoverRepoId: ""})}>
                        <div className="d-flex flex-column px-1 w-100" onDoubleClick={()=>handleDoubleClick(repo)}>
                            <div className="d-flex">
                                <h6 className="flex-grow-1 overflow-ellipsis">{repo.name}</h6>
                                {state.hoverRepoId === repo._id && <span className="small"><FaTrashAlt title="Delete" className="hover-danger" onClick={(e) => handleDelete(e,repo)} /></span>}
                            </div>
                            <span className="overflow-ellipsis">{repo.path}</span>
                        </div>                        
                    </div>
                ))
            }
        </div>
    </div>
}

export const RecentRepositoryList = React.memo(RecentRepositoryListComponent);