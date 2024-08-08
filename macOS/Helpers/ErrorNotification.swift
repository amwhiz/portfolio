//
//  ErrorNotification.swift
//  COPsync911
//
//  Created by Shaul Hameed on 03/11/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation

class ErrorNotification: NSObject {
    
    static let sharedInstance = ErrorNotification()

    override init() {
        super.init()
    }
    
    func netWorkOffline() {
        let title = "There is a problem with your network connection - COPsync911 Alerts are NOT active."
        GlobalNotificationHelper.sharedInstance.trigger(title: title, message: .NetworkNotReachable)
    }
    
    func netWorkOnline() {
        GlobalNotificationHelper.sharedInstance.close()
    }
    
    func dspOffline() {
        let title = "COPsync servers are temporarily offline for maintenance - COPsync911 Alerts are NOT active."
        GlobalNotificationHelper.sharedInstance.trigger(title: title, message: .Default)
    }
}
