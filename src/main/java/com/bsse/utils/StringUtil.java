/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.utils;

/**
 *
 * @author ASUS
 */
public class StringUtil {
    public static boolean IsNullWhiteSpace(String str){
        if(str == null) return true;
        if(str.isBlank()) return true;
        return false;
    }
}
