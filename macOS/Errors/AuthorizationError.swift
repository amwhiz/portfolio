//
//  AuthorizationError.swift
//  COPsync911
//
//  Created by aj on 02/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation

enum AuthorizationError: String, Error {
    case unauthorized = "Unauthorized"
    case invalidOrg = "The user's organization is incorrect"
    case orgAdmin = "You are not allowed to quit the COPsync911 Crisis Portal, Please contact organization admin."
    case registerDevice = "You are not allowed to register device, Please contact organization admin."
}
