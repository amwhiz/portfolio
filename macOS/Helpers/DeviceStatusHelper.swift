//
//  DeviceStatusHelper.swift
//  COPsync911
//
//  Created by aj on 24/10/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation



class DeviceStatusHelper {

    static var isDeviceActive: Bool = false
    
    static func isCurrentDeviceActive(silent: Bool?) {
        DDLogInfo("COPSYNC:: Checking current device status.")
        
        if !UserDefaultsHelper.isDeviceRegistered() {
            return
        }
        
        DispatchLevel.userInteractive.dispatchQueue.async {
            DeviceApiClient()
                .isCurrentDeviceActive()
                .then { data -> Void in
                    let device = data as? NSDictionary
                    
                    if device != nil {
                        if device?["IsActive"] as! Int == 1 {
                            UserDefaults.standard.set(true, forKey: DeviceSettings.isDeviceActive)
                            DDLogInfo("device is active")
                            self.getDeviceDetails(isSlient: silent)
                        } else {
                            UserDefaults.standard.set(false, forKey: DeviceSettings.isDeviceActive)
                        }
                    } else {
                        UserDefaults.standard.set(false, forKey: DeviceSettings.isDeviceActive)
                        DDLogInfo("device is inactive or invalid")
                    }
                    
                    UserDefaults.standard.synchronize()
                }
                .catch { error in
                    DDLogError("\(error)")
                    UserDefaults.standard.set(false, forKey: DeviceSettings.isDeviceActive)
                    DDLogInfo("device is inactive or invalid")
            }
        }
    }
    
    static func getDeviceDetails(isSlient: Bool?) {
        DDLogInfo("get device details by device id")
        DispatchLevel.userInteractive.dispatchQueue.async {
            DeviceApiClient()
                .getDeviceDetails()
                .then { data -> Void in
                    UserDefaults.standard.set(NSKeyedArchiver.archivedData(withRootObject: data), forKey: UserSettings.chatCredentials)
                    UserDefaults.standard.set(true, forKey: UserSettings.chatCredentialsExists)
                    UserDefaults.standard.synchronize()
                    self.isDeviceActive = true
                    if let silent = isSlient{
                        if !silent{
                            NotificationHelper.showDefault(title: "Device Status", informativeText: .DeviceActivationSucess)
                        }
                    }
                    else{
                        NotificationHelper.showDefault(title: "Device Status", informativeText: .DeviceActivationSucess)
                    }
                    
                    // Check is device registered, if registered connect DATAONIX IM Stream
                    if UserDefaultsHelper.isDeviceRegistered() &&
                        Bool.isDeviceActive() &&
                        !Messenger.sharedInstance.isStreamConnected(){
                        Messenger.sharedInstance.connect(onCompletion: {
                            DDLogInfo("DATA:: Connected to Stream")
                        })
                    }

                }
                .catch { error in
                    self.isDeviceActive = false
                    UserDefaults.standard.set(false, forKey: UserSettings.chatCredentialsExists)
                    DDLogError("\(error)")
            }
        }
    }
    
    static func getSilentDeviceDetails() {
        DDLogInfo("get device details by device id")
        DispatchLevel.userInteractive.dispatchQueue.async {
            DeviceApiClient()
                .getDeviceDetails()
                .then { data -> Void in
                    UserDefaults.standard.set(NSKeyedArchiver.archivedData(withRootObject: data), forKey: UserSettings.chatCredentials)
                    UserDefaults.standard.set(true, forKey: UserSettings.chatCredentialsExists)
                }
                .catch { error in
                    UserDefaults.standard.set(false, forKey: UserSettings.chatCredentialsExists)
                    DDLogError("\(error)")
            }
        }
    }
    
    @objc static func start() {
        self.isCurrentDeviceActive(silent: true)
        let date = Date().addingTimeInterval(600)
        let timer = Timer(fireAt: date, interval: 0, target: self, selector: #selector(DeviceStatusHelper.start), userInfo: nil, repeats: false)
        
        RunLoop.main.add(timer, forMode: RunLoopMode.commonModes)
    }
}
