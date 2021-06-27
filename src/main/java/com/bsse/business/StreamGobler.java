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

/**
 *
 * @author ASUS
 */
public class StreamGobler extends Thread {
    InputStream is;
    String type;
    StringBuffer output = new StringBuffer();

    StreamGobler(InputStream is, String type)
    {
        this.is = is;
        this.type = type;
    }

    public void run()
    {
        try
        {
            InputStreamReader isr = new InputStreamReader(is);
            BufferedReader br = new BufferedReader(isr);
            String line=null;
            while ( (line = br.readLine()) != null)
                System.out.println(type + ">" + line);
                output.append(line+"\r\n");
            } catch (IOException ioe)
              {
                ioe.printStackTrace();  
              }
    }
    public String getOutput()
    {
        return this.output.toString();
    }

}
