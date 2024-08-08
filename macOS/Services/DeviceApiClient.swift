//
//  DeviceApiClient.swift
//  COPsync911
//
//  Created by aj on 03/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation
import PromiseKit
import Alamofire

class DeviceApiClient: DataonixApiClientCore {
    
    override init() {
        super.init()
    }
    
    private func getDeviceRegistrationInfoUri() -> URL {
        return self.getUri(endPoint: Dataonix.Endpoints.getDeviceRegistration)!
    }
    
    func getDeviceRegistrationInfo() -> Promise<Any> {
        let headers = self.getAuthHeaders()
        
        return self.get(uri: self.getDeviceRegistrationInfoUri(),
                        parameters: [:],
                        headers: headers)
    }
    
    private func getDeviceRegistrationUri() -> URL {
        return self.getUri(endPoint: Dataonix.Endpoints.registerDevice)!
    }
    
    func registerDevice(payload: [String: Any]) -> Promise<Any> {
        return self.post(uri: self.getDeviceRegistrationUri(),
                         parameters: payload,
                         headers: self.getAuthHeaders())
    }
    
    private func getStartRegistrationUri() -> URL {
        let orgId = User.sharedInstance.currentUser.organizationID
        
        return self.getUri(endPoint: Dataonix.Endpoints.startRegistration + "/" + orgId!)!
    }
    
    func startRegistration() -> Promise<Any> {
        return self.post(uri: self.getStartRegistrationUri(),
                  parameters: [:],
                  headers: self.getAuthHeaders())
    }
    
    private func getCurrentDeviceActiveUri() -> URL {
        return self.getUri(endPoint: Dataonix.Endpoints.isCurrentDeviceActive)!
    }
    
    func isCurrentDeviceActive() -> Promise<Any> {
        return self.get(uri: self.getCurrentDeviceActiveUri(),
                        parameters: [:],
                        headers: AuthHelper.getAuthHeadersByAuthType(type: AuthType.deviceAuthentication, username: "", password: ""))
    }
    
    private func getDeviceByIdUri() -> URL {
        let deviceId = AuthHelper.getDeviceId()
        return self.getUri(endPoint: Dataonix.Endpoints.getDeviceDetails + "/" + deviceId)!
    }
    
    func getDeviceDetails() -> Promise<Any> {
        return self.get(uri: self.getDeviceByIdUri(),
                        parameters: [:],
                        headers: AuthHelper.getAuthHeadersByAuthType(type: AuthType.deviceAuthentication, username: "", password: ""))
    }
    
    private func getUpdateLocationUri() -> URL {
        let path = Dataonix.Endpoints.updateLocation.replacingOccurrences(of: "{DEVICE_ID}", with: AuthHelper.getDeviceId())
        
        return self.getUri(endPoint: path)!
    }
    
    func updateDeviceLocation(params: [String: Any]) -> Promise<Any> {
        let headers = AuthHelper.getAuthHeadersByAuthType(type: AuthType.deviceAuthentication,
                                                          username: "",
                                                          password: "")
        
        return Promise { fulfill, reject in
            var responseString: String?
            
            if !reachability.isReachable {
                reject(NetworkError.unreachable)
                return
            }
            
            let uri = self.getUpdateLocationUri()
            
            DDLogInfo("\(uri)")
            
            Alamofire
                .request(uri,
                         method: .post,
                         parameters: params,
                         encoding: JSONEncoding.default,
                         headers: headers)
                .responseString { response in
                    responseString = response.result.value
                }
                .responseJSON { response in
                    switch response.result {
                    case .success(let data):
                        fulfill(data)
                    case .failure(let error):
                        if response.response != nil {
                            let code = (response.response?.statusCode)! as Int
                            
                            if code == 204 {
                                fulfill(true)
                            } else {
                                DataonixError.sharedInstance.processDirtyResponse(error: responseString, response: response)
                            }
                        }
                        reject(error)
                    }
            }
            
        }
    }
    
    private func getUpdateDeviceUri() -> URL {
        let path = Dataonix.Endpoints.updateDevice.replacingOccurrences(of: "{DEVICE_ID}", with: AuthHelper.getDeviceId())
        
        return self.getUri(endPoint: path)!
    }
    
    func updateDevice(params: [String: Any]) -> Promise<Any> {
        let headers = AuthHelper.getAuthHeadersByAuthType(type: AuthType.deviceAuthentication,
                                                          username: "",
                                                          password: "")
        
        return Promise { fulfill, reject in
            var responseString: String?
            
            if !reachability.isReachable {
                reject(NetworkError.unreachable)
                return
            }
            
            let uri = self.getUpdateDeviceUri()
            DDLogInfo("\(uri)")
            
            Alamofire
                .request(uri,
                         method: .post,
                         parameters: params,
                         encoding: JSONEncoding.default,
                         headers: headers)
                .responseString { response in
                    responseString = response.result.value
                }
                .responseJSON { response in
                    switch response.result {
                    case .success(let data):
                        fulfill(data)
                    case .failure(let error):
                        if response.response != nil {
                            let code = (response.response?.statusCode)! as Int
                            
                            if code == 204 {
                                fulfill(true)
                            } else {
                                DataonixError.sharedInstance.processDirtyResponse(error: responseString, response: response)
                            }
                        }
                        reject(error)
                    }
            }
            
        }
    }
    
    private func getDeviceBySerialNumberUri() -> URL {
        let path = Dataonix.Endpoints.deviceBySerialNumber.replacingOccurrences(of: "{FINGER_PRINT}", with: String.macSerialNumber())
        
        return self.getUri(endPoint: path)!
    }
    
    func getDeviceDetailByFingerPrint() -> Promise<Bool> {
        let headers = self.getAuthHeaders()
        
        return Promise { fulfill, reject in
            if !reachability.isReachable {
                reject(NetworkError.unreachable)
                return
            }
            
            let uri = self.getDeviceBySerialNumberUri()
            
            DDLogInfo("\(uri)")
            
            DispatchLevel.background.dispatchQueue.async {
                Alamofire
                    .request(uri,
                             method: .get,
                             parameters: [:],
                             headers: headers)
                    .responseJSON { response in
                        if response.response != nil {
                            let statusCode = response.response?.statusCode
                            
                            if statusCode == 404 {
                                fulfill(false)
                            } else if statusCode == 200 {
                                switch response.result {
                                case .success(let data):
                                    self.setupDeviceDetails(data: data as! NSDictionary)
                                    fulfill(true)
                                case .failure(let error):
                                    reject(error)
                                }
                            }
                        }
                }
            }
        }
    }
    
    private func setupDeviceDetails(data: NSDictionary) {
        UserDefaults.standard.set(NSKeyedArchiver.archivedData(withRootObject: data), forKey: UserSettings.chatCredentials)
        UserDefaults.standard.set(true, forKey: UserSettings.chatCredentialsExists)
        UserDefaultsHelper.setDeviceRegistered(flag: true)
        
        UserDefaults.standard.set(data.object(forKey: "MainOrganizationTypeId") as! String, forKey: DeviceSettings.deviceOrganizationTypeId)
        
        
        
        let location = data.object(forKey: "CurrentLocation") as? NSDictionary
        
        var organizationName: String = ""
        
        let organizations = data.object(forKey: "Organizations") as? NSDictionary
        if organizations != nil {
            let values = organizations?.object(forKey: "$values") as? [NSDictionary]
            
            if values != nil && (values?.count)! > 0 {
                organizationName = values?[0].object(forKey: "Name") as! String
                UserDefaults.standard.set(values?[0].object(forKey: "Id") as! String, forKey: DeviceSettings.deviceOrganizationId)
            }
        }

        UserDefaults.standard.set(organizationName, forKey: DeviceSettings.organizationName)
        
        if location != nil {
            let recentLocation = location?.object(forKey: "Name") as? String ?? ""
            UserDefaultsHelper.addNewLocation(locationName: recentLocation)
            
            let locationData = location?.object(forKey: "Location") as? NSDictionary
            
            if locationData != nil {
                let locationName = locationData?.object(forKey: "Name") as! String
                let locationId = locationData?.object(forKey: "Id") as! String
                UserDefaults.standard.set(locationName, forKey: DeviceSettings.organizationLocationName)
                UserDefaults.standard.set(locationId, forKey: DeviceSettings.deviceLocationId)
            }
            
            let locationType = location?.object(forKey: "CurrentLocationType") as? NSDictionary
            if locationType != nil {
                let locationTypeId = locationType?.object(forKey: "Id") as? String ?? ""
                UserDefaults.standard.set(locationTypeId, forKey: DeviceSettings.locationTypeId)
            }
        }
        
        let deviceId = data.object(forKey: "Id") as! String
        
        let deviceInfo: NSDictionary = [
            "CurrentLocationId": "",
            "Id": deviceId,
            "IsActive": false,
            "IsAlreadyRegistered": false
        ]
        
        DDLogInfo("\(deviceInfo)")
        
        UserDefaults.standard.set(deviceInfo, forKey: UserSettings.deviceInfo)
        UserDefaults.standard.set(false, forKey: DeviceSettings.isDeviceActive)
        
        UserDefaults.standard.synchronize()
        
        DeviceStatusHelper.isCurrentDeviceActive(silent: true)
    }
}
