//
//  UpdateLocationViewController.swift
//  COPsync911
//
//  Created by aj on 10/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Cocoa
import MapKit
import CoreLocation

class UpdateLocationViewController: NSViewController, LocationServiceDelegate {

    var loader:LoaderUtil?
    // MARK: - Properties
    var updateLocationView: UpdateLocationView {
        return view as! UpdateLocationView
    }
    
    var selectYourLocationType: [LocationTypes] = [LocationTypes]()
    var selectYourOrganizationLocation: [OrganizationLocation] = [OrganizationLocation]()
    var organizationData: [NSDictionary] = []
    
    var locationCordinate:CLLocation?
    
    var didUpdateLocation:Bool = false
    
    var didUpdateAPI:Bool = false
    
    // MARK: - Delegate methods
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do view setup here.

        loader = LoaderUtil()
        
        loader?.startAnimate(view: self.view, sender: self)
        self.disableIndicator()

        if let coordinates = LocationServices.sharedInstance.locationManager.location{
            
            locationCordinate = coordinates
            
            self.didUpdateLocation = true
        }
        else{
            
            LocationServices.sharedInstance.delegates.addDelegate(self)
            
            LocationServices.sharedInstance.startUpdatingLocation()
            
            
        }
        
        self.getDeviceRegistrationInfo()
    }
    
    override func viewDidAppear() {
        super.viewDidAppear()
    }
}

// MARK: - Progress indicators
extension UpdateLocationViewController {
    
    func showIndicator() {
        self.updateLocationView.progressIndicator.isHidden = false
        self.updateLocationView.progressIndicator.startAnimation(self)
    }
    
    func disableIndicator() {
        self.updateLocationView.progressIndicator.isHidden = true
    }
}

// MARK: - Get update location details
extension UpdateLocationViewController {
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        
        locationCordinate = manager.location
     
        if(self.didUpdateLocation && self.didUpdateAPI){
            self.loader?.stopAnimate()
        }
        
    }
    
    
    func getDeviceRegistrationInfo() {
        log.info("getting device registration info")
        DeviceApiClient()
            .getDeviceRegistrationInfo()
            .then { response -> Void in
                log.debug(response)
                self.parseResponse(data: response)
            }
            .catch { error in
                self.loader?.stopAnimate()
                log.error(error)
        }
    }
    
    func parseResponse(data: Any) {
        let registerInfo: NSDictionary? = data as? NSDictionary
        var locationArr: [String] = ["select your location type"]
        var organizationLocationArr: [String] = ["select your location"]
        
        if registerInfo != nil {
            let locationTypes = registerInfo?.object(forKey: "LocationTypes") as? NSDictionary
            
            if locationTypes != nil {
                let locationValues = locationTypes?.object(forKey: "$values") as! NSArray
                
                if locationValues.count > 0 {
                    for location in locationValues {
                        let obj = location as! NSDictionary
                        self.selectYourLocationType.append(LocationTypes(id: obj.value(forKey: "Id") as! String,
                                                                         name: obj.value(forKey: "Name") as! String,
                                                                         organizationTypeId: obj.value(forKey: "OrganizationTypeId") as! String))
                        locationArr.append(obj.object(forKey: "Name") as! String)
                    }
                    
                    if (locationArr.count) > 0 {
                        self.updateLocationView.locationTypePopUpButton.removeAllItems()
                        for (key, value) in locationArr.enumerated() {
                            self.updateLocationView.locationTypePopUpButton.insertItem(withTitle: value, at: key);
                        }
                    }
                }
            }
            
            let organizations = registerInfo?.object(forKey: "Organizations") as? NSDictionary
            
            if organizations != nil {
                let organizationValues = organizations?.object(forKey: "$values") as! NSArray
                
                if organizationValues.count > 0 {
                    let organizationDetail = organizationValues[0] as? NSDictionary
                    organizationData.append(organizationDetail!)
                    
                    let organizationLocations = organizationDetail?.object(forKey: "Locations") as? NSDictionary
                    
                    if organizationLocations != nil {
                        let organizationLocationValues = organizationLocations?.object(forKey: "$values") as! NSArray
                        
                        for location in organizationLocationValues {
                            let obj = location as! NSDictionary
                            self.selectYourOrganizationLocation.append(OrganizationLocation(id: obj.value(forKey: "Id") as! String,
                                                                                            name: obj.value(forKey: "Name") as! String))
                            organizationLocationArr.append(obj.object(forKey: "Name") as! String)
                        }
                        
                        if (organizationLocationArr.count) > 0 {
                            self.updateLocationView.organizationLocationPopUpButton.removeAllItems()
                            for (key, value) in organizationLocationArr.enumerated() {
                                self.updateLocationView.organizationLocationPopUpButton.insertItem(withTitle: value, at: key);
                            }
                        }
                    }
                }
            }
        }
        self.didUpdateAPI = true
        if(self.didUpdateLocation && self.didUpdateAPI){
            self.loader?.stopAnimate()
        }
    }
}

// MARK: - Actions
extension UpdateLocationViewController {
    
    @IBAction func updateLocationAction(_ sender: AnyObject) {
        do {
            try self.validateUpdateLocation()
        } catch DeviceRegistrationError.validationFailed {
            log.info("form validation failed")
            AlertHelper.showAlert(question: Alert.formValidationTitle, text: DeviceRegistrationError.validationFailed.rawValue)
            return
        } catch {
            log.debug(error)
        }
        
        let organizationLocationTitle =  self.updateLocationView.organizationLocationPopUpButton.title
        let locationType = self.updateLocationView.locationTypePopUpButton.title
        let location = findLocationTypes(source: self.selectYourLocationType, toBeFound: locationType).first! as LocationTypes
        let organizationLocation = findOrganizationLocationTypes(source: self.selectYourOrganizationLocation, toBeFound: organizationLocationTitle).first! as OrganizationLocation
        
        let locationManager = LocationModel.sharedInstance.currentLocation
        
        
        if LocationModel.sharedInstance.currentLocation != nil {
            
            
            let payload = [
                "Name": self.updateLocationView.organizationNameTextField.stringValue,
                "CurrentLocationTypeId": location.Id,
                "LocationId": organizationLocation.Id,
                "Latitude": String(format: "%.15f", (locationCordinate!.coordinate.latitude)),
                "Longitude": String(format: "%.15f", (locationCordinate!.coordinate.longitude)),
                "CreatedOnClient": Date().iso8601
                ] as [String: Any]
            
            log.info("update location payload")
            log.debug(payload)
            self.updateLocation(params: payload)
        } else {
            AlertHelper.showAlert(question: "Location", text: "Unable to fetch location details")
            DispatchQueue.main.async(execute: {
                self.performSegue(withIdentifier: Identifiers.showDashboard, sender: nil)
            })
        }

    }
    
    func validateUpdateLocation() throws {
        var flag = false
        
        if self.updateLocationView.organizationNameTextField.stringValue.trimmingCharacters(in: .whitespacesAndNewlines) == "" {
            flag = true
        }
        
        let organizationLocation =  self.updateLocationView.organizationLocationPopUpButton.title
        let locationType = self.updateLocationView.locationTypePopUpButton.title
        
        if organizationLocation == "select your location" || locationType == "select your location type" {
            flag = true
        }
        
        if flag {
            throw DeviceRegistrationError.validationFailed
        }
    }
    
    func updateLocation(params: [String: Any]) {
        self.updateLocationView.updateLocationButton.isEnabled = !self.updateLocationView.updateLocationButton.isEnabled
        self.showIndicator()
        DeviceApiClient()
            .updateDeviceLocation(params: params)
            .always {
                self.disableIndicator()
                self.updateLocationView.updateLocationButton.isEnabled = !self.updateLocationView.updateLocationButton.isEnabled
            }
            .then { data -> Void in
                log.debug(data)
                DispatchQueue.main.async {
                    (NSApplication.shared().delegate as! AppDelegate).window?.level = Int(CGWindowLevelForKey(.floatingWindow))
                    let myPopup: NSAlert = NSAlert()
                    myPopup.messageText = "Update Location"
                    myPopup.informativeText = "Device location updated successfully"
                    myPopup.alertStyle = NSAlertStyle.informational
                    myPopup.addButton(withTitle: "OK")
                    if myPopup.runModal() == NSAlertFirstButtonReturn {
                        DispatchQueue.main.async(execute: {
                            self.performSegue(withIdentifier: Identifiers.showDashboard, sender: nil)
                        })
                    }
                }
            }
            .catch { error in
                switch error {
                case NetworkError.unreachable:
                    AlertHelper.showAlert(question: NetworkError.unreachable.rawValue, text: Dataonix.ErrorMessageText.unreachable)
                default:
                    log.error(error)
                }
        }
    }
}
