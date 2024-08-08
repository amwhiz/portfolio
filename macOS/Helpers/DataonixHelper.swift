//
//  DataonixHelper.swift
//  COPsync911
//
//  Created by aj on 17/11/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation

class DataonixHelper: NSObject {
    
    static func getDeviceDetails() -> NSDictionary? {
        let deviceResponse: NSData? = UserDefaults.standard.object(forKey: UserSettings.chatCredentials) as? NSData
        var response: NSDictionary?
        
        if deviceResponse != nil {
            response = NSKeyedUnarchiver.unarchiveObject(with: deviceResponse as! Data) as? NSDictionary
        }
        
        return response
    }
    
    static func getOrganizationName() -> String {
        let response: NSDictionary? = DataonixHelper.getDeviceDetails()
        var organizationName: String = ""
        
        if response != nil {
            
            let organizations = response?.object(forKey: "Organizations") as? NSDictionary
            if organizations != nil {
                let values = organizations?.object(forKey: "$values") as? [NSDictionary]
                
                if values != nil && (values?.count)! > 0 {
                    organizationName = values?[0].object(forKey: "Name") as! String
                }
            }
        }
        
        return organizationName
    }
    
    static func getOrganizationLocationName() -> String {
        let response: NSDictionary? = DataonixHelper.getDeviceDetails()
        if response != nil {
            let currentLocation = response?.object(forKey: "CurrentLocation") as? NSDictionary
            
            if currentLocation != nil {
                let location = currentLocation?.object(forKey: "Location") as? NSDictionary
                
                if location != nil {
                    return location?.object(forKey: "Name") as! String
                }
            }
        }
        
        return ""
    }
    
    static func getOrganizationLocationAddress() -> String {
        let response: NSDictionary? = DataonixHelper.getDeviceDetails()
        var addressString: String = ""
        
        if response != nil {
            let currentLocation = response?.object(forKey: "CurrentLocation") as? NSDictionary
            if currentLocation != nil {
                let location = currentLocation?.object(forKey: "Location") as? NSDictionary
                if location != nil {
                    let address = location?.object(forKey: "Address") as? String
                    let address2 = location?.object(forKey: "AddressTwo") as? String
                    let city = location?.object(forKey: "CityName") as? String
                    let state = location?.object(forKey: "StateName") as? String
                    let postalcode = location?.object(forKey: "PostalCode") as? String
                    
                    let locationName = location?.object(forKey: "Name") as? String
                    
                    addressString = "[" + DataonixHelper.getOrganizationName() + "]"
                    
                    if locationName != nil {
                        addressString = addressString + ", [" + locationName! + "]"
                    }
                    
                    if address != nil {
                        addressString = addressString + ", [" + address! + "]"
                    }
                    
                    if address2 != nil {
                        addressString = addressString + ", [" + address2! + "]"
                    }
                    
                    if city != nil {
                        addressString = addressString + ", [" + city! + "]"
                    }
                    
                    if state != nil {
                        addressString = addressString + ", [" + state! + "]"
                    }
                    
                    if postalcode != nil {
                        addressString = addressString + ", [" + postalcode! + "]"
                    }
                    
                    let deviceLocationName = currentLocation?.object(forKey: "Name") as? String
                    
                    if deviceLocationName != nil {
                        addressString = addressString + ", Location: [" + deviceLocationName! + "]"
                    }
                }
            }
        }
        
        return addressString
    }
    
    static func getLocationAddress() -> String {
        let response: NSDictionary? = DataonixHelper.getDeviceDetails()
        var addressString: String = ""
        
        if response != nil {
            let currentLocation = response?.object(forKey: "CurrentLocation") as? NSDictionary
            if currentLocation != nil {
                
                let location = currentLocation?.object(forKey: "Location") as? NSDictionary
                
                if location != nil {
                    let address = location?.object(forKey: "Address") as? String
                    let address2 = location?.object(forKey: "AddressTwo") as? String
                    let city = location?.object(forKey: "CityName") as? String
                    let state = location?.object(forKey: "StateName") as? String
                    let postalcode = location?.object(forKey: "PostalCode") as? String
                    
//                    addressString = DataonixHelper.getOrganizationName()
                    
                    if address != nil {
                        addressString = address!
                    }
                    
                    if address2 != nil {
                        addressString = addressString + ", " + address2!
                    }
                    
                    if city != nil {
                        addressString = addressString + ", " + city!
                    }
                    
                    if state != nil {
                        addressString = addressString + ", " + state!
                    }
                    
                    if postalcode != nil {
                        addressString = addressString + ", " + postalcode!
                    }
                    
                    return addressString
                }
                
            }
        }
        
        return addressString
    }
    
    static func removeFileAtPath(path: String) {
        do {
            let fileManager = FileManager.default
            try fileManager.removeItem(atPath: path)
        } catch let error {
            DDLogError(error.localizedDescription)
        }
    }
}
