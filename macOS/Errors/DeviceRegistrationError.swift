//
//  DeviceRegistrationError.swift
//  COPsync911
//
//  Created by aj on 02/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation

enum DeviceRegistrationError: String, Error {
    case validationFailed = "Please populate all fields"
    case invalidDevice = "Invalid Device"
    case deviceInactive = "Device Inactive"
    case settingsValidation = "Please fill device description"
    case serviceInactive = "Services are down"
}
