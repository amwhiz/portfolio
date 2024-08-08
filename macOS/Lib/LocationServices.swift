//
//  LocationServices.swift
//  COPsync911
//
//  Created by Shaul Hameed on 10/19/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation
import CoreLocation

@objc protocol LocationServiceDelegate{
 
    @objc func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation])
    
}

class LocationServices: NSObject, CLLocationManagerDelegate {
    
    let delegates:MulticastDelegate = MulticastDelegate<LocationServiceDelegate>()
    
    var locationManager:CLLocationManager = CLLocationManager()
    
    static let sharedInstance = LocationServices()
    
    override init() {
        super.init()
        self.locationManager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
        self.locationManager.delegate = self
    }
    
    func startUpdatingLocation() {
        self.locationManager.startUpdatingLocation()
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        self.delegates |> {
            delegate in
            
            delegate.locationManager(manager, didUpdateLocations: locations)
        }
        
        self.locationManager.stopUpdatingLocation()
    }
}
