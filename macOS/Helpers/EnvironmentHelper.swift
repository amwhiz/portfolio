//
//  EnvironmentHelper.swift
//  COPsync911
//
//  Created by Shaul Hameed on 29/10/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class EnvironmentHelper {

    static let sharedInstance = EnvironmentHelper()
    
    private let environment =  Bundle.main.infoDictionary
    
    init() {}
    
    func get(key: String) -> String? {
        return environment?[key] as! String?
    }
}
