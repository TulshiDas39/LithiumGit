/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.business;

import com.bsse.dataClasses.RepoInfo;
import com.bsse.dataClasses.StaticData;

/**
 *
 * @author ASUS
 */
public class StateManager {

    private static RepoInfo selectedRepoInfo;

    public static RepoInfo getSelectedRepoInfo() {
        return selectedRepoInfo;
    }

    public static void setSelectedRepoInfo(RepoInfo selectedRepoInfo) {
        StateManager.selectedRepoInfo = selectedRepoInfo;
        StaticData.topNav.updateUi();
        StaticData.body.updateUi();
    }
    
}
