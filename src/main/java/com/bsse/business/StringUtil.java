/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.business;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.regex.Pattern;

/**
 *
 * @author ASUS
 */
public class StringUtil {
    public static boolean isNullOrEmpty(String str){
        if(str == null) return true;
        if(str.trim().equals("")) return true;
        return false;
    }
    
    public static ArrayList<String> getWords(String ids){
        Pattern p = Pattern.compile("\\s+");//. represents single
        var splitedValues = ids.split("\\s+");
        var words = new ArrayList<String>();
        for (String splitedValue : splitedValues) {
            if(!splitedValue.trim().equals("")) words.add(splitedValue);
        }
        return new ArrayList<String>(Arrays.asList(splitedValues));

    }
}
