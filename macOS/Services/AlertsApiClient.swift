//
//  AlertsApiClient.swift
//  COPsync911
//
//  Created by aj on 03/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation
import PromiseKit
import Alamofire

enum TriggerMethod: String {
    case location = "Location pick-list"
    case systemTray = "System Tray"
    case hotkey = "Hot Key"
    case gps = "GPS"
    case desktopIcon = "Desktop Icon"
    case copsync = "COPsync 2.0"
    case launchIcon = "Launchpad Icon"
}

class AlertsApiClient: DataonixApiClientCore {
    
    override init() {
        super.init()
    }
    
    private func getSendAlertsUri() -> URL {
        return self.getUri(endPoint: Dataonix.Endpoints.sendAlert)!
    }
    
    static func getDeviceLocationId() -> String {
        let defaults = UserDefaults.standard
        let data = defaults.object(forKey: DeviceSettings.deviceLocationId) as? String
        
        if data != nil {
            return data!
        }
        return ""
    }
    
    static func getRecentCurrentLocationName() -> String {
        let identityResponse: NSData? = UserDefaults.standard.object(forKey: UserSettings.chatCredentials) as? NSData
        var response: NSDictionary?
        if identityResponse != nil {
            response = NSKeyedUnarchiver.unarchiveObject(with: identityResponse as! Data) as? NSDictionary
        }
        
        let currentLocation = response?.object(forKey: "CurrentLocation") as? NSDictionary
        var name: String = ""
        
        if currentLocation != nil {
            let locationName = currentLocation?.object(forKey: "Name") as? String
            name = locationName ?? name
        }

        return name
    }
    
    private func getSendAlertsParams(payload: [String: String]) -> [String: Any] {
        DDLogInfo("[ALERT] \(triggerMethod.rawValue)")
        return [
            "CurrentLocationId": AlertsApiClient.getDeviceLocationId(),
            "RecentCurrentLocationName": AlertsApiClient.getRecentCurrentLocationName(),
            "Latitude": payload["Latitude"]! as String,
            "Longitude": payload["Longitude"]! as String,
            "TriggerMethod": triggerMethod.rawValue
        ]
    }
    
    func sendAlert(payload: [String: String]) -> Promise<Any> {
        let params = self.getSendAlertsParams(payload: payload)
        let headers = AuthHelper.getAuthHeadersByAuthType(type: AuthType.deviceAuthentication,
                                                          username: "",
                                                          password: "")
        DDLogInfo("[ALERT] send alert triggered")
        
        return Promise { fulfill, reject in
            if !reachability.isReachable {
                DDLogInfo("[NETWORK] Network notrechable")
                reject(NetworkError.unreachable)
                return
            }
            
            Alamofire
                .request(self.getSendAlertsUri(),
                         method: .post,
                         parameters: params,
                         encoding: JSONEncoding.default,
                         headers: headers)
                .responseJSON { response in
                    DataonixApiClient().sendSystemInfo()
                    switch response.result {
                    case .success(let data):
                        DDLogInfo("[ALERT] send alert success")
                        fulfill(data)
                        self.sendAlertEmail()
                    case .failure( _):
                        if response.response != nil {
                            let code = (response.response?.statusCode)! as Int
                            
                            if code == 204 {
                                self.sendAlertEmail()
                                DDLogInfo("[ALERT] send alert success")
                                fulfill(true)
                            } else {
                                self.sendFailedAlertEmail(response: response)
                                self.logAlertFail(response: response)
                                DDLogInfo("[ALERT] send alert fail")
                                reject(SendAlertError.officerOffline)
                            }
                        } else {
                            DDLogInfo("[NETWORK] network unrechable")
                            self.logAlertFail(response: response)
                            reject(NetworkError.unreachable)
                        }
                    }
            }
        }
    }
    
    func logAlertFail(response: Alamofire.DataResponse<Any>) {
        if response.response != nil {
            let statusCode = (response.response?.statusCode)! as Int
            DDLogInfo("[ALERT REQUEST URL] \(response.request?.url)")
            DDLogInfo("[ALERT RESPONSE STATUS_CODE] \(statusCode)")
            
            switch statusCode {
            case 200 ... 299:
                let dAuthCode = response.response?.allHeaderFields["DAuth-Code"] as? String
                let dAuthDesc = response.response?.allHeaderFields["DAuth-CodeDesc"] as? String
                self.logErrorMessage(code: dAuthCode, message: dAuthDesc)
                break
            case 400 ... 499:
                let dspErrorCode = response.response?.allHeaderFields["DSPErrorCode"] as? String
                let dspErrorDesc = response.response?.allHeaderFields["DSPErrorDesc"] as? String
                self.logErrorMessage(code: dspErrorCode, message: dspErrorDesc)
                break
            case 500 ... 599:
                DDLogInfo("500 ... 599 error")
                break
            default:
                DDLogInfo("default case")
            }
        } else {
            DDLogInfo("[NETWORK] network unrechable")
        }
    }
    
    func logErrorMessage(code: String?, message: String?) {
        DDLogInfo(Dataonix.Error.MessageText.error400)
        DDLogInfo("[ALERT-FAILURE] \(code!) - \(message!)")
    }
    
    func getJoiningInfoUri(alertId: String) -> URL {
        let path = Dataonix.Endpoints.alertJoin.replacingOccurrences(of: "{ALERT_ID}", with: alertId)
        return self.getUri(endPoint: path)!
    }
    
    func sendJoiningInfo(alertId: String) {
        if !reachability.isReachable {
            return
        }
        
        let headers = AuthHelper.getAuthHeadersByAuthType(type: AuthType.deviceAuthentication,
                                                          username: "",
                                                          password: "")
        
        Alamofire
            .request(self.getJoiningInfoUri(alertId: alertId),
                     method: .post,
                     parameters: ["alertId":alertId],
                     encoding: JSONEncoding.default,
                     headers: headers)
            .responseJSON { response in
                DDLogInfo("send join info success")
        }
    }
    
    func getEmailUri() -> URL {
        return self.getUri(endPoint: Dataonix.Endpoints.email)!
    }
    
    func getdeviceInfoFromLocal() -> NSDictionary? {
        let deviceResponse: NSData? = UserDefaults.standard.object(forKey: UserSettings.chatCredentials) as? NSData
        var response: NSDictionary? = nil
        if deviceResponse != nil {
            response = NSKeyedUnarchiver.unarchiveObject(with: deviceResponse as! Data) as? NSDictionary

        }
        return response

    }
    
    func getSubject(status: String) -> String {
        let address = DataonixHelper.getOrganizationLocationAddress()
        
        let subject = "[\(applicationEnvironment.uppercased())] [COPsync911 MacOS] \(status.uppercased()) from: \(address)"
        
        return subject
    }
    
    func getAttachments() -> [String: String] {
        return MailHtmlGenerator().getlogfile()
    }
    
    func sendAlertEmail() {
       
        let headers = AuthHelper.getAuthHeadersByAuthType(type: AuthType.deviceAuthentication,
                                                          username: "",
                                                          password: "")
        
        var attachments = MailHtmlGenerator().getlogfile()
        let filePath = attachments["FilePath"]
        attachments.removeValue(forKey: "FilePath")
        
        let params: [String: Any] = [
            "BccAddress": [],
            "Body": MailHtmlGenerator().getMailContent(),
            "CcAddress": [],
            "FromAddress": Dataonix.Email.noreply,
            "IsHtml": true,
            "Subject": self.getSubject(status: "ALERT SENT SUCCESSFULLY"),
            "ToAddress": [getEmailAddress()],
            "Attachments": [attachments]
        ]
        
        Alamofire
            .request(self.getEmailUri(),
                     method: .post,
                     parameters: params,
                     encoding: JSONEncoding.default,
                     headers: headers)
            .responseJSON { response in
                DispatchLevel.background.dispatchQueue.async {
                    DataonixHelper.removeFileAtPath(path: filePath!)
                }
        }
    }
    
    func sendFailedAlertEmail(response: Alamofire.DataResponse<Any>) {
        var errorMessage: String! = ""
        
        //get error code and message
        if response.response != nil {
            let statusCode = (response.response?.statusCode)! as Int
            
            switch statusCode {
            case 200 ... 299:
                let dAuthCode = response.response?.allHeaderFields["DAuth-Code"] as? String
                let dAuthDesc = response.response?.allHeaderFields["DAuth-CodeDesc"] as? String
                errorMessage = "\(dAuthCode!) - \(dAuthDesc!)"
                break
            case 400 ... 499:
                let dspErrorCode = response.response?.allHeaderFields["DSPErrorCode"] as? String
                let dspErrorDesc = response.response?.allHeaderFields["DSPErrorDesc"] as? String
                errorMessage = "\(dspErrorCode!) - \(dspErrorDesc!)"
                break
            case 500 ... 599:
                DDLogError("error")
                break
            default:
                DDLogError("error")
                break
            }
        }
        
        
        let headers = AuthHelper.getAuthHeadersByAuthType(type: AuthType.deviceAuthentication,
                                                          username: "",
                                                          password: "")
        var attachments: [String: String] = MailHtmlGenerator().getlogfile()
        let filePath = attachments["FilePath"]
        attachments.removeValue(forKey: "FilePath")
        
        let params: [String: Any] = [
            "BccAddress": [],
            "Body": MailHtmlGenerator().getFailedMailContent(errorMessage:errorMessage),
            "CcAddress": [],
            "FromAddress": Dataonix.Email.noreply,
            "IsHtml": true,
            "Subject": self.getSubject(status: "ALERT FAILED TO SEND"),
            "ToAddress": [getEmailAddress()],
            "Attachments": [attachments]
        ] 
        
        Alamofire
            .request(self.getEmailUri(),
                     method: .post,
                     parameters: params,
                     encoding: JSONEncoding.default,
                     headers: headers)
            .responseJSON { response in
                DispatchLevel.background.dispatchQueue.async {
                    DataonixHelper.removeFileAtPath(path: filePath!)
                }
        }
    }
    
}
