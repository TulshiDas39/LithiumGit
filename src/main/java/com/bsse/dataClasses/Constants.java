/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.dataClasses;

import java.util.ArrayList;
import java.util.Arrays;

public class Constants {
    public static final ArrayList<RepoInfo> repos = new ArrayList<RepoInfo>(Arrays.asList(
            new RepoInfo("C:\\Users\\ASUS\\Documents\\workspace\\projects\\GitStudio\\.git","Git Studio"),
            new RepoInfo("C:\\Users\\ASUS\\Documents\\workspace\\joylist\\joylist-client\\.git", "joylist-client"),
            new RepoInfo("C:\\Users\\ASUS\\Documents\\workspace\\projects\\audio-academy","audio-academy"),
            new RepoInfo("C:\\Users\\ASUS\\Documents\\workspace\\piston\\P1stonUIRepo","P1stonUIRepo")));
    
    public static final String logFormat = "--pretty="+LogFields.Hash+":%H%n"+LogFields.Abbrev_Hash+":%h%n"+LogFields.Parent_Hashes+":%p%n$"+LogFields.Author_Name+":%an%n"+LogFields.Author_Email+":%ae%n"+LogFields.Date+":%ad%n"+LogFields.Ref+":%D%n"+LogFields.Message+":%s%n";
}
