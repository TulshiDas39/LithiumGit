import { Modal } from "react-bootstrap";
import { EnumModals, UiUtils, useEscape, useMultiState } from "../../lib";
import { useSelectorTyped } from "../../store/rootReducer";
import { shallowEqual, useDispatch } from "react-redux";
import { ActionModals } from "../../store";
import { FaCopy, FaTimes } from "react-icons/fa";
import React from "react";
import { ModalData } from "./ModalData";
import moment from "moment";
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
    }), shallowEqual);
    const dispatch = useDispatch();

    const handleSiteCopy = () => {
        UiUtils.copy("https://lithiumgit.com");
        ModalData.appToast.message = "Website URL copied to clipboard";
        dispatch(ActionModals.showToast());
    }
    const openWebsite = () => {
        IpcUtils.openLink("https://lithiumgit.com");
    }

    const openGitHub = () => {
        IpcUtils.openLink("https://github.com/tulshidas39/lithiumgit");
    }

    const openDocumentation = () => {
        IpcUtils.openLink("https://lithiumgit.com/docs");
    }

    const openIssueTracker = () => {
        IpcUtils.openLink("https://github.com/tulshidas39/lithiumgit/issues")
    }

    return <div>
        <h4 className="text-center">About LithiumGit</h4>
        <div className="ps-4">
            <div>Product Name: LithiumGit</div>
            <div>Version: {store.version}</div>
            <div>Release date:  {moment(store.releaseDate).format('MMMM DD, YYYY')}</div>
            <div>Website: <span className="hover-color cur-point" onClick={openWebsite}>https://lithiumgit.com</span> <span className="small hover-color cur-point overflow-ellipsis" onClick={()=> handleSiteCopy()}><FaCopy className="click-effect" /></span> </div>
            <div>Software Category: Open Source Software</div>            
            <div>License: MIT License</div>     
            <div>Github: <span className="hover-color cur-point" onClick={openGitHub}>https://github.com/tulshidas39/lithiumgit</span></div>
            <div>Documentation: <span className="hover-color cur-point" onClick={openDocumentation}>https://lithiumgit.com/docs</span></div>
            <div>Issue Tracker: <span className="hover-color cur-point" onClick={openIssueTracker}>https://github.com/tulshidas39/lithiumgit/issues</span></div>
            
            <div>Copyright: &copy;2020-Present LithiumGit community</div>
        </div>
    </div>
}

export const AboutInfo = React.memo(AboutInfoComponent);

function NewFeaturesComponent() {
    const store = useSelectorTyped(state => ({
        version:state.savedData.appInfo.version,
    }), shallowEqual);
    return <div>
        <div>
            Whats new in LithiumGit version {store.version}:
        </div>
        <div className="pt-2">
        </div>
    </div> 
}

export const NewFeatures = React.memo(NewFeaturesComponent);