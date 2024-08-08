//
//  ManagedUser.swift
//  COPsync911
//
//  Created by Shaul Hameed on 10/14/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation

class ManagedUser: NSObject {
    
    static let sharedInstance = ManagedUser()
    
    override init() {
        super.init()
    }
    
    func getCurrentUser() -> DataonixUser {
        return DataonixUser()
    }
}
