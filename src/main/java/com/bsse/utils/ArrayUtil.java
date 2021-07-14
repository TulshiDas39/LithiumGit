/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.utils;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

/**
 *
 * @author ASUS
 */
public class ArrayUtil {
    public static boolean IsNullOrEmpty(Object[] array){
        if(array == null) return true;
        if(array.length == 0) return true;
        return false;
    }
    
    public static boolean IsNullOrEmpty(List<Object> array){
        if(array == null) return true;
        if(array.isEmpty()) return true;
        return false;
    }
    
    public static <T> T find(T[] array,Function<T,Boolean> lamba){
        if(array == null) return null;
        for (T t : array) {
            if(lamba.apply(t)) return t;
        }
        return null;
    }    
    
    public static <T> T find(List<T> array,Function<T,Boolean> lamba){
    	if(array == null) return null;
        for (T t : array) {
            if(lamba.apply(t)) return t;
        }
        return null;
    }
    
    public static <T> boolean any(T[] array,Function<T,Boolean> lamba){
        for (T t : array) {
            if(lamba.apply(t)) return true;
        }
        return false;
    }
    
    public static <R,T> ArrayList<R> map(T[] array,Function<T,R> lambda){
    	
    	ArrayList<R> newList = new ArrayList<>();
    	if(array == null) return newList;    	
    	for(var item:array) {
    		newList.add(lambda.apply(item));
    	}
    	return newList;    	
    }
    
    public static <R,T> ArrayList<R> map(List<T> array,Function<T,R> lambda){
    	ArrayList<R> newList = new ArrayList<>();
    	if(array == null) return newList;    	
    	for(var item:array) {
    		newList.add(lambda.apply(item));
    	}
    	return newList;    	
    }
    
    public static <T> ArrayList<T> filter(T[] array,Function<T,Boolean> lambda){    	
    	ArrayList<T> newList = new ArrayList<>();
    	if(array == null) return newList;    	
    	for(var item:array) {
    		if(lambda.apply(item)) newList.add(item);
    	}
    	return newList;    	
    }
    
    public static <T> ArrayList<T> filter(List<T> array,Function<T,Boolean> lambda){    	
    	ArrayList<T> newList = new ArrayList<>();
    	if(array == null) return newList;    	
    	for(var item:array) {
    		if(lambda.apply(item)) newList.add(item);
    	}
    	return newList;    	
    }
    
    
}
