//
//  ErrorHelper.swift
//  COPsync911
//
//  Created by Shaul Hameed on 03/11/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation


enum DataonixErrorCodes: Int {
    
    case InvalidAuthenticationType = 400
    
    case InCompleteRequestHeaders = 401
    
    case InvalidUser = 402
    
    case InvalidDevice = 403
    
    case RequestDuplicated = 404
    
    case InvalidNonce = 405
    
    case SignatureMismatch = 406
    
    case RequestMessageExpired = 407
    
    case InvalidTimeStamp = 408
    
    case RequestTokenExpired = 409
    
    case InvalidRequestToken = 410
    
    case UserPasswordExpired = 411
    
    case InactiveDevice = 412
    
    case InvalidOrigin = 413
    
    case InactiveDeviceForRequestOrigin = 414
    
    case DeviceIsNotAssociatedWithRequestOrigin = 415
    
    case InactiveUser = 416
}


struct DataonixErrorMessage {
    
    private var ErrorMessages:[DataonixErrorCodes:String] = [
        
        .InvalidAuthenticationType : "There is a problem with your authentication - COPsync911 Alerts are NOT active.\n You will need to dial 9-1-1 in an emergency situation until you resolve this issue.",
        
        .InCompleteRequestHeaders : "There is a problem with your connection - COPsync911 Alerts are NOT active.\nYou will need to dial 9-1-1 in an emergency situation until you resolve this issue.",
        
        .InvalidUser: "Your user name is invalid - COPsync911 Alerts are NOT active.\nYou will need to dial 9-1-1 in an emergency situation until you resolve this issue.",
        
        .InvalidDevice: "Your device is invalid - COPsync911 Alerts are NOT active.\nYou will need to dial 9-1-1 in an emergency situation until you resolve this issue.",
        
        .RequestDuplicated: "There is a problem with your connection - COPsync911 Alerts are NOT active.\nYou will need to dial 9-1-1 in an emergency situation until you resolve this issue.",
        
        .InvalidNonce: "There is a problem with your connection - COPsync911 Alerts are NOT active.\nYou will need to dial 9-1-1 in an emergency situation until you resolve this issue.",
        
        .SignatureMismatch: "Incorrect user credentials - COPsync911 Alerts are NOT active.\nYou will need to dial 9-1-1 in an emergency situation until you resolve this issue.",
        
        .RequestMessageExpired: "There is a problem with your connection - COPsync911 Alerts are NOT active.\nYou will need to dial 9-1-1 in an emergency situation until you resolve this issue.",
        
        .InvalidTimeStamp: "There is a problem with your connection - COPsync911 Alerts are NOT active.\nYou will need to dial 9-1-1 in an emergency situation until you resolve this issue.",
        
        .RequestTokenExpired: "There is a problem with your connection - COPsync911 Alerts are NOT active.\nYou will need to dial 9-1-1 in an emergency situation until you resolve this issue.",
        
        .InvalidRequestToken: "There is a problem with your connection - COPsync911 Alerts are NOT active.\nYou will need to dial 9-1-1 in an emergency situation until you resolve this issue.",
        
        .UserPasswordExpired: "Your password has expired - COPsync911 Alerts are NOT active.\nYou will need to dial 9-1-1 in an emergency situation until you resolve this issue.",
        
        .InactiveDevice: "Your device has been deactivated - COPsync911 Alerts are NOT active.\nYou will need to dial 9-1-1 in an emergency situation until you resolve this issue.",
        
        .InvalidOrigin: "There is a problem with your connection - COPsync911 Alerts are NOT active.\nYou will need to dial 9-1-1 in an emergency situation until you resolve this issue.",
        
        .InactiveDeviceForRequestOrigin: "There is a problem with your connection - COPsync911 Alerts are NOT active.\nYou will need to dial 9-1-1 in an emergency situation until you resolve this issue.",
    
        .DeviceIsNotAssociatedWithRequestOrigin: "There is a problem with your connection - COPsync911 Alerts are NOT active.\nYou will need to dial 9-1-1 in an emergency situation until you resolve this issue.",
    
        .InactiveUser: "Your user name has been deactivated - COPsync911 Alerts are NOT active.\nYou will need to dial 9-1-1 in an emergency situation until you resolve this issue."
    ]
    
    
    var error: String
    
    
    init(errorCode: Int, withSecondOption: Bool){
        
        if let errorType = DataonixErrorCodes(rawValue: errorCode){
            
            self.error = "\(self.ErrorMessages[errorType]!)"
            
            if(withSecondOption){
                self.error += "\n Should you require assitance with this issue please contact COPsync Support at 972-865-6192 Option 2."
            }
            return
        }
        
        self.error = "Invalid ErrorCode."
    }
}

