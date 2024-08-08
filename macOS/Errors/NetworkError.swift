//
//  AppError.swift
//  COPsync911
//
//  Created by aj on 02/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation

enum NetworkError: String, Error {
    case unreachable = "Please call 9-1-1"
    case network = "Network Unreachable"
}

enum SendAlertError : String, Error {
    case officerOffline = "There was an issue sending the alert. Please call 9-1-1."
}
