//
//  LocationModel.swift
//  COPsync911
//
//  Created by Shaul Hameed on 10/18/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation
import CoreLocation



class LocationModel: NSObject {
    
    static let sharedInstance = LocationModel()
    
    var currentLocation:CLLocationManager?
    override init(){
        
        super.init()
        
    }

    
}

