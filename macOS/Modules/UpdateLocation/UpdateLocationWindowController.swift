//
//  UpdateLocationWindowController.swift
//  COPsync911
//
//  Created by aj on 24/10/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa
import MapKit
import CoreLocation

class UpdateLocationWindowController: NSWindowController, NSWindowDelegate {
    
    // MARK: - Properties
    @IBOutlet weak var progressIndicator: NSProgressIndicator!
    @IBOutlet weak var navbarView: NavbarView!
    @IBOutlet weak var organizationNameTextField: NSTextField!
    @IBOutlet weak var organizationLocationPopUpButton: NSPopUpButton!
    @IBOutlet weak var locationTypePopUpButton: NSPopUpButton!
    @IBOutlet weak var updateLocationButton: NSButton!
    
    var organizationNameTextFieldPlaceHolder: NSAttributedString = NSAttributedString(string: "enter name", attributes: [NSForegroundColorAttributeName : NSColor.init(red: 95.0 / 255.0, green: 105.0 / 255.0, blue: 113.0 / 255.0, alpha: 1.0)])
    
    var selectYourLocationType: [LocationTypes] = [LocationTypes]()
    var selectYourOrganizationLocation: [OrganizationLocation] = [OrganizationLocation]()
    var organizationData: [NSDictionary] = []
    var locationManager: CLLocationManager?
    var locationTypesArr: [LocationTypes] = [LocationTypes]()
    var organizationNameAndLocationArr: [Organizations] = [Organizations]()

    override func windowDidLoad() {
        super.windowDidLoad()
        self.window?.backgroundColor = NSColor.white
        self.setupPlaceholders()
        self.disableIndicator()
        // Implement this method to handle any initialization after your window controller's window has been loaded from its nib file.
    }
    
    override func awakeFromNib() {
        self.navbarView.showAndHideViews(isHidden: true)
    }
    
    override func windowWillLoad() {
        if CLLocationManager.locationServicesEnabled() {
            locationManager = CLLocationManager()
            locationManager?.distanceFilter = kCLDistanceFilterNone
            locationManager?.desiredAccuracy = kCLLocationAccuracyHundredMeters
            locationManager?.startUpdatingLocation()
        }
        
        self.getDeviceRegistrationInfo()
    }
    
    func setupPlaceholders() {
        organizationNameTextField.placeholderAttributedString = self.organizationNameTextFieldPlaceHolder
        organizationNameTextField.stringValue = ""
        locationTypePopUpButton.removeAllItems()
        organizationLocationPopUpButton.removeAllItems()
        locationTypePopUpButton.addItem(withTitle: "select your location type")
        organizationLocationPopUpButton.addItem(withTitle: "select your location")
    }
    
    func showIndicator() {
        progressIndicator.isHidden = false
        progressIndicator.startAnimation(self)
    }
    
    func disableIndicator() {
        progressIndicator.isHidden = true
    }
    
    func getDeviceRegistrationInfo() {
        DDLogInfo("getting device registration info")
        DispatchLevel.userInitiated.dispatchQueue.async {
            DeviceApiClient()
                .getDeviceRegistrationInfo()
                .then { response -> Void in
                    self.parseResponse(data: response)
                }
                .catch { error in
                    DDLogError("getting device registration failed")
            }
        }
    }
    
    func parseResponse(data: Any) {
        let registerInfo: NSDictionary? = data as? NSDictionary
        if registerInfo != nil {
            self.decorateOrganizationData(registerInfo: registerInfo)
            self.decorateLocationData(registerInfo: registerInfo)
        }
    }
    
    func decorateOrganizationData(registerInfo: NSDictionary?) {
        let organizations = registerInfo?.object(forKey: "Organizations") as? NSDictionary
        let currentOrgId = User.sharedInstance.currentUser.organizationID!
        if organizations != nil {
            let organizationValues = organizations?.object(forKey: "$values") as! NSArray
            if organizationValues.count > 0 {
                for org in organizationValues {
                    let organizationDetail = org as! NSDictionary
                    let orgLocationsArr = organizationDetail.object(forKey: "Locations") as? NSDictionary
                    if orgLocationsArr != nil {
                        let locations = orgLocationsArr?.object(forKey: "$values") as! NSArray
                        var organizationLocationDataArr: [OrganizationLocation] = [OrganizationLocation]()
                        if locations.count > 0 {
                            for loc in locations {
                                let row = loc as! NSDictionary
                                organizationLocationDataArr.append(OrganizationLocation(id: row.value(forKey: "Id") as! String,
                                                                                        name: row.value(forKey: "Name") as! String))
                            }
                            let ascendingArray = organizationLocationDataArr.sorted { $0.Name < $1.Name };
                            organizationLocationDataArr = ascendingArray
                            
                        }
                        
                        if organizationDetail.object(forKey: "Id") as! String == currentOrgId {
                            organizationNameAndLocationArr.append(Organizations(id: organizationDetail.object(forKey: "Id") as! String,
                                                                                name: organizationDetail.object(forKey: "Name") as! String,
                                                                                organizationTypeId: organizationDetail.object(forKey: "OrganizationTypeId") as! String,
                                                                                locations: organizationLocationDataArr))
                        }
                    }
                }
            }
        }
        
        let selectedOrganization = organizationNameAndLocationArr[0]
        
        if self.organizationNameAndLocationArr.count > 0 {
            organizationLocationPopUpButton.removeAllItems()
            let menu: NSMenu = NSMenu()
            menu.addItem(withTitle: "select your location", action: nil, keyEquivalent: "")
            
            for orgLocation in selectedOrganization.Locations.enumerated() {
                menu.addItem(withTitle: orgLocation.element.Name, action: nil, keyEquivalent: "")
            }
            
            organizationLocationPopUpButton.menu = menu
        }
    }
    
    func decorateLocationData(registerInfo: NSDictionary?) {
        let locationTypes = registerInfo?.object(forKey: "LocationTypes") as? NSDictionary
        if locationTypes != nil {
            let locationValues = locationTypes?.object(forKey: "$values") as! NSArray
            if locationValues.count > 0 {
                for location in locationValues {
                    let obj = location as! NSDictionary
                    self.locationTypesArr.append(LocationTypes(id: obj.value(forKey: "Id") as! String,
                                                               name: obj.value(forKey: "Name") as! String,
                                                               organizationTypeId: obj.value(forKey: "OrganizationTypeId") as! String))
                }
                
                if (self.locationTypesArr.count) > 0 {
                    let ascendedArray = self.locationTypesArr.sorted { $0.Name < $1.Name };
                    self.locationTypesArr = ascendedArray
                    locationTypePopUpButton.removeAllItems()
                    let menu: NSMenu = NSMenu()
                    menu.addItem(withTitle: "select your location type", action: nil, keyEquivalent: "")
                    
                    for location in self.locationTypesArr.enumerated() {
                        menu.addItem(withTitle: location.element.Name, action: nil, keyEquivalent: "")
                    }
                    
                    DispatchLevel.main.dispatchQueue.async {
                        self.locationTypePopUpButton.menu = menu
                    }
                }
            }
        }
    }
    
    @IBAction func updateLocationAction(_ sender: AnyObject) {
        do {
            try self.validateUpdateLocation()
        } catch DeviceRegistrationError.validationFailed {
            DDLogInfo("form validation failed")
            AlertHelper.showAlert(question: Alert.formValidationTitle, text: DeviceRegistrationError.validationFailed.rawValue)
            return
        } catch {
        }
        
        let locationId = self.locationTypesArr[locationTypePopUpButton.indexOfSelectedItem - 1]
        let organizationData = self.organizationNameAndLocationArr[0]
        let organizationLocationId = organizationData.Locations[organizationLocationPopUpButton.indexOfSelectedItem - 1].Id
        
        let organizationLocationName = organizationData.Locations[organizationLocationPopUpButton.indexOfSelectedItem - 1].Name
        UserDefaults.standard.set(organizationLocationName, forKey: DeviceSettings.organizationLocationName)
        UserDefaults.standard.set(organizationLocationId, forKey: DeviceSettings.deviceLocationId)
        UserDefaults.standard.set(locationId.Id, forKey: DeviceSettings.locationTypeId)
        
        var payload: [String: Any] = [String: Any]()
        
        payload["Name"] = organizationNameTextField.stringValue
        payload["CurrentLocationTypeId"] = locationId.Id
        payload["LocationId"] = organizationLocationId
        payload["CreatedOnClient"] = Date().iso8601
        
        if ((locationManager?.location?.coordinate) != nil) {
            payload["Latitude"] = String(format: "%.15f", (locationManager?.location?.coordinate.latitude)!)
            payload["Longitude"] = String(format: "%.15f", (locationManager?.location?.coordinate.longitude)!)
        } else {
            payload["Latitude"] = ""
            payload["Longitude"] = ""
        }
        
        self.updateLocation(params: payload)
        
    }
       
    func validateUpdateLocation() throws {
        var flag = false
        
        if organizationNameTextField.stringValue.trimmingCharacters(in: .whitespacesAndNewlines) == "" {
            flag = true
        }
        
        let organizationLocation =  organizationLocationPopUpButton.title
        let locationType = locationTypePopUpButton.title
        
        if organizationLocation == "select your location" || locationType == "select your location type" {
            flag = true
        }
        
        if flag {
            throw DeviceRegistrationError.validationFailed
        }
    }
    
    func resetFormFields() {
        self.setupPlaceholders()
    }
    
    func updateLocation(params: [String: Any]) {
        updateLocationButton.isEnabled = !updateLocationButton.isEnabled
        self.showIndicator()
        locationManager?.stopUpdatingLocation()
        UserDefaultsHelper.addNewLocation(locationName:params["Name"] as! String)

        DispatchLevel.userInitiated.dispatchQueue.async {
            DeviceApiClient()
                .updateDeviceLocation(params: params)
                .always {
                    self.disableIndicator()
                    self.updateLocationButton.isEnabled = !self.updateLocationButton.isEnabled
                }
                .then { data -> Void in
                    DispatchLevel.main.dispatchQueue.async {
                        (NSApplication.shared().delegate as! AppDelegate).window?.level = Int(CGWindowLevelForKey(.floatingWindow))
                        let myPopup: NSAlert = NSAlert()
                        myPopup.messageText = "Update Location"
                        myPopup.informativeText = "Device location updated successfully"
                        myPopup.alertStyle = NSAlertStyle.informational
                        myPopup.addButton(withTitle: "OK")
                        if myPopup.runModal() == NSAlertFirstButtonReturn {
                            DeviceStatusHelper.getSilentDeviceDetails()
                            self.resetFormFields()
                            self.window?.orderOut(self)
                            self.window?.performClose(self)
                        }
                    }
                }
                .catch { error in
                    switch error {
                    case NetworkError.unreachable:
                        AlertHelper.showAlert(question: NetworkError.unreachable.rawValue, text: Dataonix.ErrorMessageText.unreachable)
                    default:
                        DDLogError("catch not found")
                    }
            }
        }
    }
}
