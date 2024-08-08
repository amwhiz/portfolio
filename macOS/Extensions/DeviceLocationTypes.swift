//
//  DeviceLocationTypes.swift
//  COPsync911
//
//  Created by aj on 10/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation

func findLocationTypes<T>(source: Array<T>, toBeFound: String) -> Array<T> {
    return source.filter {
        let row = $0 as! LocationTypes
        
        return row.Name == toBeFound
    }
}

func findOrganizationLocationTypes<T>(source: Array<T>, toBeFound: String) -> Array<T> {
    return source.filter {
        let row = $0 as! OrganizationLocation
        
        return row.Name == toBeFound
    }
}
