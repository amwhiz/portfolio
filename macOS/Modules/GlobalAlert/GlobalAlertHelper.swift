//
//  GlobalAlertHelper.swift
//  COPsync911
//
//  Created by Shaul Hameed on 28/10/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class GlobalAlertHelper: NSObject, GlobalAlertDelegate {
    
    static let sharedInstance = GlobalAlertHelper()
    
    private var alertWindow: GlobalAlertWindowController?
    
    private var actions: [OnCompletionHandler] = [OnCompletionHandler]()
    
    public var alertDetail: NSDictionary?
    
    override init(){
        super.init()
    }
    
    
    func show(onJoin: OnCompletionHandler?, alertDetails: NSDictionary?) {
        self.alertWindow = nil
        
        self.alertWindow = GlobalAlertWindowController(windowNibName: "GlobalAlertWindowController") as GlobalAlertWindowController
        
        self.alertWindow?.delegate = self
        
        self.alertDetail = alertDetails
        self.alertWindow?.window?.level = Int(CGWindowLevelForKey(.floatingWindow)) - 1
        self.alertWindow?.showWindow(self)
        
        
        if let onJoinTrigger = onJoin{
            
            self.actions.append(onJoinTrigger)
            
        }
        
    }
    
    
    func hide(onComplete: OnCompletionHandler?) {
        isChatInProgress = false
        self.alertWindow?.window?.performClose(self)
        self.actions.removeAll()
    }
    
    
    //@description - AlertDelegate
    func alertAccepted() {
        
        for (_, action) in self.actions.enumerated(){
            
            action()
            self.alertWindow?.window?.performClose(self)
        }
    }
    
    func alertClosed() {
        self.actions.removeAll()
    }
}
