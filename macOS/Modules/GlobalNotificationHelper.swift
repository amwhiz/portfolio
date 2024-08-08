//
//  GlobalNotificationHelper.swift
//  COPsync911
//
//  Created by Shaul Hameed on 03/11/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class GlobalNotificationHelper: NSObject {

    static let sharedInstance = GlobalNotificationHelper()
    
    private var notificationWindow: GlobalNotification?
    
    override init(){
        super.init()
        
        self.notificationWindow = GlobalNotification(windowNibName: "GlobalNotification") as GlobalNotification
    }
    
    func trigger(title: String, message: DataonixNotificationMessage){
        
        self.notificationWindow?.window?.level = Int(CGWindowLevelForKey(.floatingWindow)) - 1
        
        self.notificationWindow?.showWindow(self)
        
        self.notificationWindow?.notificationTitle.stringValue = title
        
        self.notificationWindow?.notificationMessage.stringValue = message.rawValue
        
    }
    
    func close(){
         self.notificationWindow?.close()
    }
    
    
}
