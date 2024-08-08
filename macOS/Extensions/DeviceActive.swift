//
//  DeviceActive.swift
//  COPsync911
//
//  Created by aj on 10/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation

extension Bool {
    
    static func isDeviceActive() -> Bool {
    
        let defaults = UserDefaults.standard
        
        guard let device = defaults.object(forKey: DeviceSettings.isDeviceActive) else {
            return false
        }
        
        return device as! Bool
    }
}
