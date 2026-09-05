import { Modal } from "react-bootstrap";
import { Data, EnumModals, UiUtils, useEscape, useMultiState } from "../../lib";
import { useSelectorTyped } from "../../store/rootReducer";
import { shallowEqual, useDispatch } from "react-redux";
import { ActionModals } from "../../store";
import { FaCopy, FaFingerprint, FaHandPointRight, FaTimes } from "react-icons/fa";
import React from "react";
import { ModalData } from "./ModalData";
import {moment} from "common_library";
import { IpcUtils } from "../../lib/utils/IpcUtils";


enum AboutTabs{
    ABOUT="ABOUT",
    WHATS_NEW="WHATS_NEW",
}

interface IState{
    activeTab:AboutTabs;
}

function AboutLithiumGitModalComponent() {
    const store = useSelectorTyped(state => ({
        show: state.modal.openedModals.includes(EnumModals.ABOUT_LITHIUMGIT),
    }), shallowEqual);

    const dispatch = useDispatch();
    const [state,setState] = useMultiState<IState>({
        activeTab: AboutTabs.ABOUT,
    });

    useEscape(store.show,()=> dispatch(ActionModals.hideModal(EnumModals.ABOUT_LITHIUMGIT)));

    return <Modal show={store.show} dialogClassName="" 
        backdropClassName="bg-transparent" animation={false} size="lg" >
        <Modal.Body>
            <div className="row g-0 border-bottom align-items-center py-2">
                <div className="col-11">
                    About
                </div>
                <div className="col-1 text-end">
                    <span className="hover" onClick={_=> dispatch(ActionModals.hideModal(EnumModals.ABOUT_LITHIUMGIT))}><FaTimes className="" /></span>
                </div>
            </div>
            <div className="row g-0 py-3">
                <div className="col-2">
                    <div className={`py-2 ps-2 pe-4 bg-third-color border-bottom cur-default hover ${state.activeTab === AboutTabs.ABOUT ? "selected" : ""}`} 
                    onClick={()=>setState({activeTab:AboutTabs.ABOUT})}>About</div>
                    <div className={`py-2 ps-2 pe-4 bg-third-color cur-default hover ${state.activeTab === AboutTabs.WHATS_NEW ? "selected" : ""}`}
                    onClick={()=>setState({activeTab:AboutTabs.WHATS_NEW})}>What's new?</div>
                </div>
                <div className="col-10">
                    {state.activeTab === AboutTabs.ABOUT && <AboutInfo />}
                    {state.activeTab === AboutTabs.WHATS_NEW && <NewFeatures />}
                </div>
            </div>           
        </Modal.Body>
    </Modal>
}

export const AboutLithiumGitModal = React.memo(AboutLithiumGitModalComponent);


function AboutInfoComponent() {
    const store = useSelectorTyped(state => ({
        version:state.savedData.appInfo.version,
        releaseDate:state.savedData.appInfo.releaseDate,
        website:state.savedData.appInfo.website,
        repository:state.savedData.appInfo.repository,
        documentation:state.savedData.appInfo.documentation,
        issueTracker:state.savedData.appInfo.issueTracker,
    }), shallowEqual);
    const dispatch = useDispatch();

    const handleSiteCopy = () => {
        UiUtils.copy(store.website);
        ModalData.appToast.message = "Website URL copied to clipboard";
        dispatch(ActionModals.showToast());
    }
    const handleRepositoryCopy = () => {
        UiUtils.copy(store.repository);
        ModalData.appToast.message = "Repository URL copied to clipboard";
        dispatch(ActionModals.showToast());
    }

    const handleDocumentationCopy = () => {
        UiUtils.copy(store.documentation);
        ModalData.appToast.message = "Documentation URL copied to clipboard";
        dispatch(ActionModals.showToast());
    }
    const handleIssueTrackerCopy = () => {
        UiUtils.copy(store.issueTracker);
        ModalData.appToast.message = "Issue Tracker URL copied to clipboard";
        dispatch(ActionModals.showToast());
    }
    const openWebsite = () => {
        IpcUtils.openLink(store.website);
    }

    const openGitHub = () => {
        IpcUtils.openLink(store.repository);
    }

    const openDocumentation = () => {
        IpcUtils.openLink(store.documentation);
    }

    const openIssueTracker = () => {
        IpcUtils.openLink(store.issueTracker);
    }

    return <div>
        <h4 className="text-center">About LithiumGit</h4>
        <div className="ps-4">
            <div className="py-1">Product Name: LithiumGit</div>
            <div className="py-1">Version: {store.version}</div>
            <div className="py-1">Release date:  {moment(store.releaseDate).format('MMMM DD, YYYY')}</div>
            <div className="py-1">Website: <span className="hover-color cur-point" onClick={openWebsite}>{store.website}</span> <span className="small hover-color cur-point overflow-ellipsis" onClick={()=> handleSiteCopy()}> <FaCopy title="Copy url" className="click-effect" /></span> </div>
            <div className="py-1">Software Category: Open Source Software</div>            
            <div className="py-1">License: MIT License</div>     
            <div className="py-1">Github: <span className="hover-color cur-point" onClick={openGitHub}>{store.repository}</span><span className="small hover-color cur-point overflow-ellipsis" onClick={handleRepositoryCopy}> <FaCopy title="Copy url" className="click-effect" /></span></div>
            <div className="py-1">Documentation: <span className="hover-color cur-point" onClick={openDocumentation}>{store.documentation}</span> <span className="small hover-color cur-point overflow-ellipsis" onClick={handleDocumentationCopy}> <FaCopy title="Copy url" className="click-effect" /></span> </div>
            <div className="py-1">Issue Tracker: <span className="hover-color cur-point" onClick={openIssueTracker}>{store.issueTracker}</span><span className="small hover-color cur-point overflow-ellipsis" onClick={handleIssueTrackerCopy}> <FaCopy title="Copy url" className="click-effect" /></span></div>            
            <div className="py-1">Copyright: &copy;2020-Present LithiumGit community</div>
        </div>
    </div>
}

export const AboutInfo = React.memo(AboutInfoComponent);

function NewFeaturesComponent() {
    const store = useSelectorTyped(state => ({
        version:state.savedData.appInfo.version,
    }), shallowEqual);
    return <div className="px-5">
        <div className="">
            <h4>New features in LithiumGit version {store.version}</h4>
        </div>
        <div className="pt-2">
            {Data.newChangesInLatestVersion.map((change,idx)=><div key={idx} className="pb-2 py-1">
                <div><FaHandPointRight /> <strong>{change}</strong></div>
            </div>)
            }
        </div>
    </div> 
}

export const NewFeatures = React.memo(NewFeaturesComponent);