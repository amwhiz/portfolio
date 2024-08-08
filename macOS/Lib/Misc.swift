//
//  Misc.swift
//  COPsync911
//
//  Created by Shaul Hameed on 10/16/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation

class Misc {

    
    
    //use this function to get date time as string 
    // in the following format - 2016/10/21 1:23:22 AM
    class func GetTimeStamp(timestamp: Date) -> String{
        
        
        let formatter = DateFormatter()
        
        formatter.dateFormat = "MM/dd/yyyy h:mm:ss a"
        
        return formatter.string(from: timestamp)
        
    }
    
    class func GetDate(dateFromString: String?) -> Date?{
        
        guard let _ = dateFromString else {
            return nil
        }
        let formatter = DateFormatter()
        
        formatter.dateFormat = "MM/dd/yyyy h:mm:ss a"
        
        return formatter.date(from: dateFromString!)!
    }
}
