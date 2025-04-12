export class UiConstants{
    static screenWidth = 0;
    static screenHeight = 0;
    static readonly selectedRepoLeftMinWidth = 200;
    static readonly selectedRepoLeftMaxWidth = 300;
    static get selectedRepoLeftWidth(){
        const calculatedWidth = this.screenWidth * 0.1;
        if(calculatedWidth < this.selectedRepoLeftMinWidth) return this.selectedRepoLeftMinWidth;
        if(calculatedWidth > this.selectedRepoLeftMaxWidth) return this.selectedRepoLeftMaxWidth;        
        return calculatedWidth;
    }

    static readonly selectedRepoRightMinWidth = 200;
    static readonly selectedRepoRightMaxWidth = 300;

    static get selectedRepoRightsWidth(){
        const calculatedWidth = this.screenWidth * 0.1;
        if(calculatedWidth < this.selectedRepoRightMinWidth) return this.selectedRepoRightMinWidth;
        if(calculatedWidth > this.selectedRepoRightMaxWidth) return this.selectedRepoRightMaxWidth;        
        return calculatedWidth;
    }

    static get SelectedRepoMidPanelWidth(){
        return this.screenWidth - this.selectedRepoLeftWidth - this.selectedRepoRightsWidth;
    }
    
    static readonly siteBaseUrl = "https://lithiumgit.github.io";
    static get downloadUrl(){
        return UiConstants.siteBaseUrl + "/download";
    }

}