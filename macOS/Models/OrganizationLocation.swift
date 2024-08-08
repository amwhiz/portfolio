//
//  OrganizationLocation.swift
//  COPsync911
//
//  Created by aj on 10/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation

struct OrganizationLocation {
    let Id: String
    let Name: String
    
    init(id: String, name: String) {
        self.Id = id
        self.Name = name
    }
}
