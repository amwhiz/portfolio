//
//  Organizations.swift
//  COPsync911
//
//  Created by aj on 15/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation

struct Organizations {
    let Id: String
    let Name: String
    let OrganizationTypeId: String
    let Locations: [OrganizationLocation]
    
    init(id: String, name: String, organizationTypeId: String, locations: [OrganizationLocation]) {
        self.Id = id
        self.Name = name
        self.OrganizationTypeId = organizationTypeId
        self.Locations = locations
    }
}
