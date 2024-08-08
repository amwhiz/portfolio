//
//  UserDefaultsHelper.swift
//  copsync
//
//  Created by aj on 07/07/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation


class UserDefaultsHelper  {
    
    init() {}
    
    static func isUserAcknowledged() -> Bool {
        let defaults = UserDefaults.standard
        
        guard let acknowldge = defaults.object(forKey: UserSettings.isUserAcknowledged) else {
            return false
        }
        
        return acknowldge as! Bool
    }
    
    static func setUserAcknowledged(flag: Bool) {
        UserDefaults.standard.set(flag, forKey: UserSettings.isUserAcknowledged)
    }
    
    static func isDeviceRegistered() -> Bool {
        let defaults = UserDefaults.standard
        
        guard let device = defaults.object(forKey: UserSettings.isDeviceRegistered) else {
            return false
        }
        
        return device as! Bool
    }
    
    static func setDeviceRegistered(flag: Bool) {
        UserDefaults.standard.set(flag, forKey: UserSettings.isDeviceRegistered)
    }
    
    static func addNewLocation(locationName: String) {
        var arrayOfLocation :[String] = [String]()
        let defaults = UserDefaults.standard
        
        // value contain user default
        if var locationValues:[String] = defaults.object(forKey:"ResentLocation") as? [String] {
            
            //check limit is less than 5
            if locationValues.count < 5 {
                // check location exist in array
                if let index = locationValues.index(of: locationName) {
                    locationValues.remove(at: index)
                }
                arrayOfLocation.append(locationName)
                arrayOfLocation += locationValues
            } else {
                // check location exist in array
                if let index = locationValues.index(of: locationName) {
                    locationValues.remove(at: index)
                    
                } else {
                    locationValues.removeLast()
                }
                arrayOfLocation.append(locationName)
                arrayOfLocation += locationValues
                
            }
        } else {
            // if userdefault is empty add
            arrayOfLocation.append(locationName)
        }
        
        defaults.set(arrayOfLocation, forKey: "ResentLocation")
        defaults.synchronize()        
    }
    
    static func  getResentLocations() -> [String] {
        let defaults = UserDefaults.standard
        
        return (defaults.object(forKey:"ResentLocation") as? [String])!
        
    }
    
    static func isUserAuthenticated() -> Bool {
        let defaults = UserDefaults.standard
        
        if defaults.object(forKey: UserSettings.isIdentityLoggedIn) == nil {
            return false
        }
        
        return (defaults.object(forKey: UserSettings.isIdentityLoggedIn) as? Bool)!
    }

}
