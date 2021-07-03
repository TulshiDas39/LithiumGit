/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.bsse.business;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 *
 * @author ASUS
 */
public class StreamGobler{
    InputStream is;
    String type;
    ArrayList<String> output = new ArrayList<String>();

    StreamGobler(InputStream is, String type)
    {
        this.is = is;
        this.type = type;
    }

    public void read()
    {
        try
        {
            InputStreamReader isr = new InputStreamReader(is);
            BufferedReader br = new BufferedReader(isr);
            String line=null;
            while ( (line = br.readLine()) != null){
                System.out.println(type + ">" + line);
                output.add(line);
                System.out.println("size:"+output.size());
            }                
        }
        catch (IOException ioe)
        {
            ioe.printStackTrace();  
        }
    }
    public ArrayList<String> getOutput()
    {
        return output;
    }

}
