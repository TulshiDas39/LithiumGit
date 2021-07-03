/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.utils;

import java.util.function.Supplier;

/**
 *
 * @author ASUS
 */
public class NullUtil {
    public static <R> R withSafe(Supplier<R> chainSupplier){
        try {
          return chainSupplier.get();
      } catch (Exception e) {
          return null;
      }
    }
}
