//
//  DataonixError.swift
//  COPsync911
//
//  Created by aj on 04/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation
import Alamofire

class DataonixError {
    
    static let sharedInstance = DataonixError()
    
    init() {}
    
    func handleError(error: String?, response: Alamofire.DataResponse<Any>) {
        if response.response != nil {
            let statusCode = (response.response?.statusCode)! as Int
            DDLogInfo("[URL] \(response.request?.url)")
            DDLogInfo("[STATUS_CODE] \(statusCode)")
            
            switch statusCode {
            case 200 ... 299:
                self.processSuccessResponse(error: error, response: response)
                break
            case 400 ... 499:
                self.processDirtyResponse(error: error, response: response)
                break
            case 500 ... 599:
                self.defaultError()
                break
            default:
                self.defaultError()
                break
            }
        } else {
            self.showAlert(title: NetworkError.unreachable.rawValue, value: Dataonix.ErrorMessageText.unreachable)
        }
    }
    
    func processSuccessResponse(error: String?, response: Alamofire.DataResponse<Any>) {
        if response.response != nil {
            let dAuthCode = response.response?.allHeaderFields["DAuth-Code"] as? String
            if dAuthCode != nil {
                let errormessage :[String : String] = self.userReadableErrorMessage(errorCode: Int(dAuthCode!)!)
                DDLogError(errormessage["logmessage"]!)
                if ( Int(dAuthCode!) == 412) && isAdminApprovalRequired {
                    isAdminApprovalRequired = false
                    
                    self.showAlert(title:Dataonix.Error.TitleText.errorAdminApprovel, value:Dataonix.Error.MessageText.errorAdminApprovel)
                } else {
                    
                    self.showAlert(title:errormessage["title"]!, value: errormessage["message"]!)
                }
               
            } else {
                self.showDefaultAlert()
            }
        } else {
            self.showDefaultAlert()
        }
    }
    
    func processDirtyResponse(error: String?, response: Alamofire.DataResponse<Any>) {
        if response.response != nil {
            let dspErrorCode = response.response?.allHeaderFields["DSPErrorCode"] as? String
            if dspErrorCode != nil {
                let errormessage :[String : String] = self.userReadableErrorMessage(errorCode: Int(dspErrorCode!)!)
                DDLogError(errormessage["logmessage"]!)
                self.showAlert(title:errormessage["title"]!, value: errormessage["message"]!)
            } else {
                self.showDefaultAlert()
            }
        } else {
            self.showDefaultAlert()
        }
    }
    
    func showDefaultAlert() {
        DDLogError(Config.Error.Wrong)
        self.showAlert(title: Bundle.main.infoDictionary?["CFBundleName"] as! String, value: Config.Error.Wrong)
    }
    
    func defaultError() {
        self.showAlert(title: Alert.title, value: Alert.wrong)
    }
    
    func showAlert(title: String, value: String) {
        AlertHelper.showAlert(question: title, text: value)
    }
    
    func showNotification() {
        if UserDefaultsHelper.isDeviceRegistered() {
            let notification: NSUserNotification = NSUserNotification()
            notification.title = "COPsync911"
            notification.informativeText = "Device Inactive"
            
            notification.soundName = nil
            if UserDefaultsHelper.isDeviceRegistered() {
                if NotificationHelper.isAudibleAlertEnabled() {
                    notification.soundName = "notify.wav"
                }
            } else {
                notification.soundName = "notify.wav"
            }
            
            notification.hasReplyButton = false
            
            let notificationcenter:NSUserNotificationCenter = NSUserNotificationCenter.default
            notificationcenter.deliver(notification)
        }
    }
    
    func userReadableErrorMessage(errorCode: Int) -> [String: String] {
        var errorCode = errorCode
        if sendAlertInProgress && errorCode == 407 {
            errorCode = 400
        }
        
        switch errorCode {
        case 400:
            return [
                "title" :Dataonix.Error.TitleText.error400 ,
                "message" :Dataonix.Error.MessageText.error400,
                "logmessage" :Dataonix.Error.LogMessage.log400
            ]
            
        case 401 :
            return [
                "title" :Dataonix.Error.TitleText.errorForCommon ,
                "message" :Dataonix.Error.MessageText.message,
                "logmessage" : Dataonix.Error.LogMessage.log401
            ]
        case 402 :
            return [
                "title" :Dataonix.Error.TitleText.error402 ,
                "message" :Dataonix.Error.MessageText.message,
                "logmessage" : Dataonix.Error.LogMessage.log402
            ]
        case 403 :
            return [
                "title" :Dataonix.Error.TitleText.error403 ,
                "message" :Dataonix.Error.MessageText.message,
                "logmessage" : Dataonix.Error.LogMessage.log403
            ]
        case 404 :
            return [
                "title" :Dataonix.Error.TitleText.errorForCommon ,
                "message" :Dataonix.Error.MessageText.message,
                "logmessage" : Dataonix.Error.LogMessage.log404
            ]
        case 405 :
            return [
                "title" :Dataonix.Error.TitleText.errorForCommon ,
                "message" :Dataonix.Error.MessageText.message,
                "logmessage" : Dataonix.Error.LogMessage.log405
            ]
        case 406 :
            return [
                "title" :Dataonix.Error.TitleText.error406 ,
                "message" :Dataonix.Error.MessageText.message,
                "logmessage" : Dataonix.Error.LogMessage.log406
            ]
        case 407 :
            return [
                "title" :Dataonix.Error.TitleText.error407 ,
                "message" :Dataonix.Error.MessageText.error407,
                "logmessage" : Dataonix.Error.LogMessage.log407
            ]
        case 408 :
            return [
                "title" :Dataonix.Error.TitleText.errorForCommon ,
                "message" :Dataonix.Error.MessageText.message,
                "logmessage" : Dataonix.Error.LogMessage.log408
            ]
        case 409 :
            return [
                "title" :Dataonix.Error.TitleText.errorForCommon ,
                "message" :Dataonix.Error.MessageText.message,
                "logmessage" : Dataonix.Error.LogMessage.log409
            ]
        case 410 :
            return [
                "title" :Dataonix.Error.TitleText.errorForCommon ,
                "message" :Dataonix.Error.MessageText.message,
                "logmessage" : Dataonix.Error.LogMessage.log410
            ]
        case 411 :
            return [
                "title" :Dataonix.Error.TitleText.error411 ,
                "message" :Dataonix.Error.MessageText.message,
                "logmessage" : Dataonix.Error.LogMessage.log411
            ]
        case 412 :
            return [
                "title" :Dataonix.Error.TitleText.error412 ,
                "message" :Dataonix.Error.MessageText.message,
                "logmessage" : Dataonix.Error.LogMessage.log412
            ]
        case 413 :
            return [
                "title" :Dataonix.Error.TitleText.errorForCommon ,
                "message" :Dataonix.Error.MessageText.message,
                "logmessage" : Dataonix.Error.LogMessage.log413
            ]
        case 414 :
            return [
                "title" :Dataonix.Error.TitleText.errorForCommon ,
                "message" :Dataonix.Error.MessageText.message,
                "logmessage" : Dataonix.Error.LogMessage.log414
            ]
        case 415 :
            return [
                "title" :Dataonix.Error.TitleText.errorForCommon ,
                "message" :Dataonix.Error.MessageText.message,
                "logmessage" : Dataonix.Error.LogMessage.log415
            ]
        case 416 :
            return [
                "title" :Dataonix.Error.TitleText.error416 ,
                "message" :Dataonix.Error.MessageText.message,
                "logmessage" : Dataonix.Error.LogMessage.log416
            ]
        case 46 :
            return [
                "title": Dataonix.Error.TitleText.invalidActivationCode,
                "message": Dataonix.Error.MessageText.invalidActivationCode,
                "logmessage": Dataonix.Error.LogMessage.log46
            ]
        default:
          return  [
                "title" : "Unauthorized" ,
                "message" :Config.Error.Wrong,
                "logmessage" :"unauthorized"
            ]

        }
    }
}
