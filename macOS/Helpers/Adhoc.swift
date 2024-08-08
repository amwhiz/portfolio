//
//  Adhoc.swift
//  COPsync911
//
//  Created by Shaul Hameed on 04/11/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation
import PromiseKit
import Alamofire

typealias ApiCallback = (_ result: Bool) -> Void

class Adhoc: NSObject {
    
    override init() {
        super.init()
    }
    
    func getDeviceStatus(callback: @escaping ApiCallback, onFail: @escaping (_ error: Error) -> Void) throws {
        DispatchLevel.userInteractive.dispatchQueue.async {
            let isCurrentDeviceActivePromise = DeviceApiClient()
                .isCurrentDeviceActive()
            
            let serviceStatus = self.getServicesStatusAPI()
            
            when(fulfilled: isCurrentDeviceActivePromise,serviceStatus).then{ deviceStatus, service -> Void in
                
                let device = deviceStatus as! NSDictionary
                
                let isDeviceActive:Bool = (device["IsActive"] as! Int == 1)
                
                if isDeviceActive && service as! Bool{
                    callback(true)
                }
                else{
                    throw DeviceRegistrationError.deviceInactive
                }
                
                }.catch {
                    error in
                    
                    onFail(error)
                    DDLogError("\(error)")
            }
        }
    }
    
    func getServicesStatusAPI() -> Promise<Any> {
    
        let reqUrl = EnvironmentHelper.sharedInstance.get(key: "STATUS_CHECK")
        
        return Promise { fulfill, reject in
            Alamofire.request(reqUrl!, method: .get, parameters: ["":""], encoding: URLEncoding.default, headers: nil).responseJSON { (response: DataResponse<Any>) in
                switch(response.result) {
                case .success(_):
                    if let data = response.result.value {
                        let dataAsDictionary = data as! NSDictionary
                        if let status = dataAsDictionary["status"] {
                            if((status as! String) == "Online") {
                                if let subsystem = dataAsDictionary["subsystems"] as? NSArray {
                                    var isDspOnline = false
                                    var isIMOnline = false
                                    
                                    for (_, system) in subsystem.enumerated() {
                                        
                                        let subSystemNode = system as! NSDictionary
                                        
                                        let name =  subSystemNode["name"]
                                        
                                        if let status = subSystemNode["status"] {
                                            if (status as! String) == "Online" {
                                                switch (name as! String) {
                                                case "DSP":
                                                    isDspOnline = true
                                                    break
                                                case "IM-NONPROD01",
                                                     "IM-WUS-PROD01":
                                                    isIMOnline = true
                                                    break
                                                default:
                                                    break
                                                }
                                            }
                                        }
                                    }
                                    
                                    fulfill(isDspOnline && isIMOnline)
                                } else {
                                    fulfill(false)
                                }
                            } else {
                                fulfill(false)
                            }
                        } else {
                            fulfill(false)
                        }
                    }
                    break
                case .failure(_):
                    fulfill(false)
                    break
                }
            }
        }
    }
    
    func getServiceStatus(callback: @escaping (_ isActive: Bool) throws -> Void) {}
}
