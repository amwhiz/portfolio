//
//  ServiceCheckHelper.swift
//  COPsync911
//
//  Created by Shaul Hameed on 29/10/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation
import Alamofire


@objc protocol DeviceStatusDelegate {
    
    @objc optional func onDeviceStatusUpdated()
    @objc optional func onIMWentOffline()
    @objc optional func onIMOnline()
    @objc optional func onDSPWentOffline()
    @objc optional func onDSPOnline()
    @objc optional func onMasterSystemWentOffline()
}

enum SystemStatus: String {
    case Online
    case Offline
}

enum Services: String {
    case DSP
    case IMProd
}

struct Subsystem {
    
    let name: String
    
    let status: SystemStatus
    
    let message: String
    
    let onlineTimeStamp: String
    
    let offlineTimeStamp: String?
    
}

struct ServiceStatus {
    
    let status: SystemStatus
    
    let message: String
    
    let subsystems: [Subsystem]
    
    func isDSPOnline() -> Bool {
        var defaultState = true
        for (_, system) in subsystems.enumerated() {
            if system.name == "DSP"
                && system.status.rawValue != "Online" {
                defaultState = false
                break
            }
        }
        
        return defaultState
    }

    func isIMOnline() -> Bool {
        var defaultState = true
        for(_, system) in subsystems.enumerated() {
            if (system.name == "IM-NONPROD01" || system.name == "IM-WUS-PROD01")
                && system.status.rawValue != "Online" {
                
                defaultState = false
                break
            }
        }
        
        return defaultState
    }
}

class ServiceCheckHelper: NSObject {

    static let sharedInstance = ServiceCheckHelper()
    
    var state: ServiceStatus?
    
    let delegate: MulticastDelegate<DeviceStatusDelegate> = MulticastDelegate<DeviceStatusDelegate>()
    
    override init() {
        super.init()
    }
    
    private func serviceWentOffline(name: String){
    
        switch (name){
        case "DSP":
            self.delegate |> {
                delegates in
                
                if let onDSPWentOffline = delegates.onDSPWentOffline {
                    onDSPWentOffline()
                }
            }
            break
        case "IM-NONPROD01",
             "IM-WUS-PROD01":
            self.delegate |> {
                delegates in
                
                if let onIMWentOffline = delegates.onIMWentOffline {
                    onIMWentOffline()
                }
            }
            break
        default:
            break
        }
    }
    
    private func serviceCameOnline(name: String) {
        switch (name) {
        case "DSP":
            self.delegate |> {
                delegates in
                
                if let onDSPOnline = delegates.onDSPOnline {
                    onDSPOnline()
                }
            }
            break
        case "IM-NONPROD01",
             "IM-WUS-PROD01":
            self.delegate |> {
                delegates in
                
                if let onIMOnline = delegates.onIMOnline {
                    onIMOnline()
                }
            }
            break
        default:
            break
        }
    }

    func start() {
        DDLogInfo("[ISALIVE] Checking isalive status")
        let reqUrl = EnvironmentHelper.sharedInstance.get(key: "STATUS_CHECK")
        
        Alamofire.request(reqUrl!, method: .get, parameters: ["":""], encoding: URLEncoding.default, headers: nil).responseJSON { (response: DataResponse<Any>) in
            
            switch(response.result) {
            case .success(_):
                if let data = response.result.value {
                    let dataAsDictionary = data as! NSDictionary
                    var overAllStatus: SystemStatus = .Online
                    if let status = dataAsDictionary["status"] {
                        if (status as! String) != "Online" {
                            overAllStatus = .Offline
                            
                            self.delegate |> {
                                delegates in
                                
                                if let onMasterSystemWentOffline = delegates.onMasterSystemWentOffline {
                                    DDLogInfo("[ISALIVE] Master system went offline")
                                    onMasterSystemWentOffline()
                                }
                            }
                        }
                    }
                    
                    
                    let messageStatus = dataAsDictionary["message"]
                    
                    var subSystesm: [Subsystem] = [Subsystem]()
                    
                    if let subsystem = dataAsDictionary["subsystems"] as? NSArray {
                        for(_, system) in subsystem.enumerated() {
                            
                            let subSystemNode = system as! NSDictionary
                            
                            let name =  subSystemNode["name"]
                            
                            var subSystemStatus:SystemStatus = .Online
                            
                            if let status = subSystemNode["status"] {
                                if (status as! String) != "Online" {
                                    subSystemStatus = .Offline
                                } else {
                                    subSystemStatus = .Online
                                }
                            }
                            
                            let message = subSystemNode["message"]
                            
                            let onlineTimeStamp = subSystemNode["onlineTimeStamp"]
                            
                            let offlineTimeStamp = subSystemNode["offlineTimeStamp"]
                            
                            let subSystemInstance = Subsystem(name: name as! String, status: subSystemStatus, message: message as! String, onlineTimeStamp: onlineTimeStamp! as! String , offlineTimeStamp: offlineTimeStamp as! String? )
                            
                            subSystesm.append(subSystemInstance)
                        }
                    }
                    
                    self.state = ServiceStatus(status: overAllStatus, message: messageStatus as! String, subsystems: subSystesm)

                    for (_, system) in subSystesm.enumerated() {
                        if (system.status == .Offline) {
                            self.serviceWentOffline(name: system.name)
                        } else {
                            self.serviceCameOnline(name: system.name)
                        }
                    }
                }
                break
            case .failure(_):
                DDLogError("\(response.result.error)")
                break
            }
        }
        
        let date = Date().addingTimeInterval(0xA)
        let timer = Timer(fireAt: date, interval: 0, target: self, selector: #selector(start), userInfo: nil, repeats: false)
        
        self.delegate |> {
            delegates in
            if let onDeviceStatusUpdated = delegates.onDeviceStatusUpdated{
                onDeviceStatusUpdated()
            }
        }
        
        RunLoop.main.add(timer, forMode: RunLoopMode.commonModes)
    }
}
