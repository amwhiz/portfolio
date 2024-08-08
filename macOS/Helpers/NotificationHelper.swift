//
//  NotificationHelper.swift
//  COPsync911
//
//  Created by aj on 24/10/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation

enum DataonixNotificationMessage:String{
    
    case DeviceActivationSucess = "Your device successfully registered"
    
    case DeviceActivationFailed = "Please contact organization admin, In case of emergency, please call 911"
    
    case IssueSendingAlert = "There was an issue sending the alert, Please call 9-1-1."
    
    case NetworkNotReachable = "You will need to dial 9-1-1 in an emergency situation until you resolve this issue.\nShould you require assistance with this issue please contact COPSync Support at 972-865-6192 Option 2."
    
    case DSPIMOffline = "COPsync911 is unable to connect to server. You will not be able to send an alert during this time. Please call 9-1-1."
    
    case Default = "You will need to dial 9-1-1 in an emergency situation.\nShould you require assitance with this issue please contact COPsync Support at 972-865-6192 Option 2."
}


class NotificationHelper {
    
    class func showDefault(title: String, informativeText: DataonixNotificationMessage) -> Void {
        
        let notification = NSUserNotification()
        
        notification.title = title
        
        notification.informativeText = informativeText.rawValue
        
        notification.soundName = nil
        
        if UserDefaultsHelper.isDeviceRegistered() {
            if NotificationHelper.isAudibleAlertEnabled() {
                notification.soundName = "notify.wav"
            }
        } else {
            notification.soundName = "notify.wav"
        }
        
        notification.hasActionButton = false
        
        NSUserNotificationCenter.default.deliver(notification)
    }
    
    class func showAlertNotification() -> Void{
        
        let notification = NSUserNotification.init()
        
        notification.title = "Alert"
        
        notification.informativeText = "An Emergency Alert Received, Would you like to join the Crisis portal?"
        
        notification.soundName = nil
        
        if UserDefaultsHelper.isDeviceRegistered() {
            if NotificationHelper.isAudibleAlertEnabled() {
                notification.soundName = "notify.wav"
            }
        } else {
            notification.soundName = "notify.wav"
        }
        
        notification.userInfo = ["type": "alert"]
        
        notification.actionButtonTitle = "Join"
        
        notification.otherButtonTitle = "Ignore"
        
        notification.hasActionButton = true
        
        NSUserNotificationCenter.default.deliver(notification)
        
    }
    
    static func isAudibleAlertEnabled() -> Bool {
        let deviceResponse: NSData? = UserDefaults.standard.object(forKey: UserSettings.chatCredentials) as? NSData
        var response: NSDictionary?
        if deviceResponse != nil {
            response = NSKeyedUnarchiver.unarchiveObject(with: deviceResponse as! Data) as? NSDictionary
        }
        
        let state = response?.object(forKey: "AudibleAlert") as? Bool
        
        if state != nil {
            return state!
        }
        
        return false
    }
}
