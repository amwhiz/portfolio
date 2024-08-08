//
//  LocationTypes.swift
//  COPsync911
//
//  Created by aj on 10/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation

struct LocationTypes {
    let Id: String
    let Name: String
    let OrganizationTypeId: String
    
    init(id: String, name: String, organizationTypeId: String) {
        self.Id = id
        self.Name = name
        self.OrganizationTypeId = organizationTypeId
    }
}
