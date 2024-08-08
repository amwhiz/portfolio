//
//  ChangeSettingsWindowController.swift
//  COPsync911
//
//  Created by aj on 24/10/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class ChangeSettingsWindowController: NSWindowController, NSWindowDelegate {
    
    @IBOutlet weak var useAudibleAlert: NSButton!
    @IBOutlet var deviceDescriptionTextField: NSTextField!
    @IBOutlet weak var saveSettingsButton: NSButton!
    @IBOutlet weak var deviceNameTextField: NSTextField!
    
    @IBOutlet weak var showBalloonTips: NSButton!
    
    @IBOutlet weak var locationNameItem: NSComboBox!
    
    @IBOutlet var organizationNameTextView: NSTextView!
    @IBOutlet weak var progressIndicator: NSProgressIndicator!
    @IBOutlet weak var disclaimerScrollView: NSScrollView!
    @IBOutlet weak var organizationLocationItem: NSPopUpButton!
    var flag1 = false
    var flag2 = false
    @IBOutlet weak var locationTypeItem: NSPopUpButton!
    
    @IBOutlet weak var loaderView: NSView!
    @IBOutlet weak var windowloader: NSProgressIndicator!
    
    var locationTypesArr: [LocationTypes] = [LocationTypes]()
    var organizationNameAndLocationArr: [Organizations] = [Organizations]()
    var locationNamesArr:[String] = (UserDefaults.standard.object(forKey:"ResentLocation") as? [String])!
    
    override func windowDidLoad() {
        super.windowDidLoad()
        self.showLoader()
        NotificationCenter.default.addObserver(self, selector: #selector(self.controlTextDidChange),name:NSNotification.Name.NSControlTextDidChange,object: nil)
        self.disableIndicator()
        self.window?.backgroundColor =  NSColor.white
        self.window?.makeFirstResponder(organizationLocationItem)
        self.setupPlaceholders()
        self.getDeviceRegistrationInfo()
        self.getDeviceDetails()
        
    }
    
    func showLoader() {
        self.loaderView.isHidden = false
        self.windowloader.startAnimation(true)
        self.loaderView.wantsLayer = true
        self.loaderView.layer?.backgroundColor = NSColor(red: 1.0, green: 1.0, blue: 1.0, alpha: 0.8).cgColor
    }
    
    func hideLoader() {
        self.loaderView.isHidden = true
    }

    func windowWillClose(_ notification: Notification) {
        authData = [String]()
        NotificationCenter.default.removeObserver(self)
    }
    
    func displaySettingValues() {
        let deviceResponse: NSData? = UserDefaults.standard.object(forKey: UserSettings.chatCredentials) as? NSData
        var response: NSDictionary?
        if deviceResponse != nil {
            response = NSKeyedUnarchiver.unarchiveObject(with: deviceResponse as! Data) as? NSDictionary
        }
        
        let state = response?.object(forKey: "AudibleAlert") as? Bool
        
        if state != nil {
            let isAudible = state!
            useAudibleAlert.state = isAudible ? 1 : 0
        }
        
        if let organizationName = UserDefaults.standard.object(forKey: DeviceSettings.organizationName) {
            organizationNameTextView.string = organizationName as? String
        }
        
        deviceDescriptionTextField.stringValue = response?.object(forKey: "Description") as? String ?? ""
        deviceNameTextField.stringValue = response?.object(forKey: "Name") as? String ?? ""
        
        let organizationLocationName = UserDefaults.standard.object(forKey: DeviceSettings.organizationLocationName)
        
        if organizationLocationName != nil {
            organizationLocationItem.setTitle(organizationLocationName as! String)
        }
    }
    //MARK: Enter to Submit
    override func keyDown(with event: NSEvent) {
        if event.keyCode == 36 {
            self.saveSetting()
        }
    }
    @IBAction func enterToSubmit(_ sender: AnyObject) {
        self.saveSetting()
    }

    override func controlTextDidChange(_ obj: Notification) {
        let textField = obj.object as! NSTextField
        
        if  textField.stringValue.characters.count >= textField.tag {
            let stringVal = textField.stringValue as NSString
            textField.stringValue = stringVal.substring(with: NSRange(location: 0, length:textField.tag))
        }
    }
    
    func setupPlaceholders() {
        
        //organizationNameTextField.stringValue = ""
        organizationLocationItem.removeAllItems()
        locationTypeItem.removeAllItems()
        locationTypeItem.addItem(withTitle: "select your location type")
        
        locationNameItem.addItems(withObjectValues: UserDefaultsHelper.getResentLocations())
        locationNameItem.selectItem(at: 0)
        organizationLocationItem.addItem(withTitle: "select your organization location")
    }
    
    
    @IBAction func useAudibleAlertAction(_ sender: NSButton) {
    }
    
    @IBAction func saveSettingsAction(_ sender: NSButton)  {
        self.saveSetting()
    }
    func saveSetting() {
        if locationTypeItem.titleOfSelectedItem! == "select your location type" || organizationLocationItem.titleOfSelectedItem! == "select your organization location" || deviceDescriptionTextField.stringValue == ""{
            AlertHelper.showAlert(question: Alert.formValidationTitle, text: DeviceRegistrationError.validationFailed.rawValue)
        }else {
            
            do {
                try self.validateSettings()
            } catch DeviceRegistrationError.settingsValidation {
                DDLogInfo("form validation failed")
                AlertHelper.showAlert(question: Alert.formValidationTitle, text: DeviceRegistrationError.settingsValidation.rawValue)
                return
            } catch {
                DDLogInfo("catch not found")
            }
            
            let locationId = self.locationTypesArr[locationTypeItem.indexOfSelectedItem - 1]
            let organizationData = self.organizationNameAndLocationArr[0]
            let organizationLocationId = organizationData.Locations[organizationLocationItem.indexOfSelectedItem - 1].Id
            let organizationLocationName = organizationData.Locations[organizationLocationItem.indexOfSelectedItem - 1].Name
            let locationName = locationNameItem.stringValue
            
            UserDefaultsHelper.addNewLocation(locationName: locationName)
            
            UserDefaults.standard.set(organizationLocationName, forKey: DeviceSettings.organizationLocationName)
            UserDefaults.standard.set(organizationLocationId, forKey: DeviceSettings.deviceLocationId)
            UserDefaults.standard.set(locationId.Id, forKey: DeviceSettings.locationTypeId)
            
            let devicePayload = [
                "Name": AuthHelper.getMachineName(),
                "Description": deviceDescriptionTextField.stringValue.trimmingCharacters(in: CharacterSet.whitespaces),
                "CreatedOnClient": Date().iso8601,
                "AudibleAlert": useAudibleAlert.state == 1 ? true : false
                ] as [String: Any]
            
            var locationPayload: [String: Any] = [String: Any]()
            locationPayload["Name"] = locationName.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines)
            locationPayload["CurrentLocationTypeId"] = locationId.Id
            locationPayload["LocationId"] = organizationLocationId
            locationPayload["CreatedOnClient"] = Date().iso8601
            
            self.updateDevice(params: devicePayload)
            self.updateLocation(params: locationPayload)
        }
    }
    
    func validateSettings() throws {
        var flag = false
        
        if deviceDescriptionTextField.stringValue.trimmingCharacters(in: .whitespacesAndNewlines) == "" {
            flag = true
        }
        
        if flag {
            throw DeviceRegistrationError.settingsValidation
        }
    }
    
    
    @IBAction func cancelAction(_ sender: NSButton) {
        authData = [String]()
        self.window?.performClose(self)
    }
    
    func updateDevice(params: [String: Any]) {
        saveSettingsButton.isEnabled = !saveSettingsButton.isEnabled
        self.showIndicator()
        DispatchLevel.userInitiated.dispatchQueue.async {
            DeviceApiClient()
                .updateDevice(params: params)
                .always {
                    self.saveSettingsButton.isEnabled = !self.saveSettingsButton.isEnabled
                }
                .then { data -> Void in
                    DDLogInfo("update device settings")
                    DispatchLevel.main.dispatchQueue.async {
                        (NSApplication.shared().delegate as! AppDelegate).window?.level = Int(CGWindowLevelForKey(.floatingWindow))
                        self.flag1 = true
                        if self.flag1 && self.flag2 {
                            //shoe alert
                            self.disableIndicator()
                            self.showSaveSuccessAlert()
                        }
                        
                    }
                }
                .catch { error in
                    switch error {
                    case NetworkError.unreachable:
                        self.disableIndicator()
                        AlertHelper.showAlert(question: NetworkError.unreachable.rawValue, text: Dataonix.ErrorMessageText.unreachable)
                    default:
                        DDLogError("update device settings")
                    }
            }
        }
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
        let currentOrgId = UserDefaults.standard.object(forKey: DeviceSettings.deviceOrganizationId) as!  String
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
            organizationLocationItem.removeAllItems()
            let menu: NSMenu = NSMenu()
            menu.addItem(withTitle: "select your organization location", action: nil, keyEquivalent: "")
           let orgID =  UserDefaults.standard.object(forKey:DeviceSettings.deviceLocationId) as! String
            for orgLocation in selectedOrganization.Locations.enumerated() {
                let menuItem = NSMenuItem.init(title: orgLocation.element.Name, action: nil, keyEquivalent: "")
                
                menuItem.state = (orgLocation.element.Id == orgID) ? NSOnState : NSOffState
                menu.addItem(menuItem)
                
            }
            
            organizationLocationItem.menu = menu
        }
    }
    
    func decorateLocationData(registerInfo: NSDictionary?) {
        let locationTypes = registerInfo?.object(forKey: "LocationTypes") as? NSDictionary
        if locationTypes != nil {
            let locationValues = locationTypes?.object(forKey: "$values") as! NSArray
            if locationValues.count > 0 {
                for location in locationValues {
                    let obj = location as! NSDictionary
                    let orgId = obj.object(forKey: "OrganizationTypeId") as! String
                    let currentDeviceOrgTypeId = UserDefaults.standard.object(forKey: DeviceSettings.deviceOrganizationTypeId) as!  String
                    
                    if orgId == currentDeviceOrgTypeId {
                        self.locationTypesArr.append(LocationTypes(id: obj.value(forKey: "Id") as! String,
                                                                   name: obj.value(forKey: "Name") as! String,
                                                                   organizationTypeId: obj.value(forKey: "OrganizationTypeId") as! String))
                    }
                }
                
                if (self.locationTypesArr.count) > 0 {
                    let ascendedArray = self.locationTypesArr.sorted { $0.Name < $1.Name };
                    self.locationTypesArr = ascendedArray
                    locationTypeItem.removeAllItems()
                    let menu: NSMenu = NSMenu()
                    menu.addItem(withTitle: "select your location type", action: nil, keyEquivalent: "")
                    let locID =  UserDefaults.standard.object(forKey:DeviceSettings.locationTypeId) as! String
                    for location in self.locationTypesArr.enumerated() {
                        let menuItem = NSMenuItem.init(title: location.element.Name, action: nil, keyEquivalent: "")
                        
                        menuItem.state = (location.element.Id == locID) ? NSOnState : NSOffState
                        menu.addItem(menuItem)
                    }
                    
                    DispatchLevel.main.dispatchQueue.async {
                        self.locationTypeItem.menu = menu
                    }
                }
            }
        }
    }
    
    func showIndicator() {
        progressIndicator.isHidden = false
        progressIndicator.startAnimation(self)
    }
    
    func disableIndicator() {
        progressIndicator.isHidden = true
    }
    
    func resetFormFields() {
        self.setupPlaceholders()
    }
    
    func showSaveSuccessAlert(){
        DispatchLevel.main.dispatchQueue.async {
            let myPopup: NSAlert = NSAlert()
            myPopup.messageText = "Device Settings"
            myPopup.informativeText = "Settings updated successfully"
            myPopup.alertStyle = NSAlertStyle.informational
            myPopup.addButton(withTitle: "OK")
            if myPopup.runModal() == NSAlertFirstButtonReturn {
                authData = [String]()
                DeviceStatusHelper.getSilentDeviceDetails()
                self.resetFormFields()
                self.window?.orderOut(self)
                self.window?.performClose(self)
            }
        }
    }
    
    func updateLocation(params: [String: Any]) {
        saveSettingsButton.isEnabled = !saveSettingsButton.isEnabled
        self.showIndicator()
        UserDefaultsHelper.addNewLocation(locationName:params["Name"] as! String)
        
        DispatchLevel.userInitiated.dispatchQueue.async {
            DeviceApiClient()
                .updateDeviceLocation(params: params)
                .always {
                    self.disableIndicator()
                    self.saveSettingsButton.isEnabled = !self.saveSettingsButton.isEnabled
                }
                .then { data -> Void in
                    DispatchLevel.main.dispatchQueue.async {
                        (NSApplication.shared().delegate as! AppDelegate).window?.level = Int(CGWindowLevelForKey(.floatingWindow))
                        self.flag2 = true
                        if self.flag1 && self.flag2 {
                            //shoe alert
                            self.disableIndicator()
                            self.showSaveSuccessAlert()
                        }
                    }
                }
                .catch { error in
                    switch error {
                    case NetworkError.unreachable:
                        self.disableIndicator()
                        AlertHelper.showAlert(question: NetworkError.unreachable.rawValue, text: Dataonix.ErrorMessageText.unreachable)
                    default:
                        DDLogError("update location failed")
                    }
            }
        }
    }
    
    func getDeviceDetails() {
        DDLogInfo("get device details by device id")
        DispatchLevel.userInteractive.dispatchQueue.async {
            DeviceApiClient()
                .getDeviceDetails()
                .always {
                    self.hideLoader()
                }
                .then { data -> Void in
                    UserDefaults.standard.set(NSKeyedArchiver.archivedData(withRootObject: data), forKey: UserSettings.chatCredentials)
                    UserDefaults.standard.set(true, forKey: UserSettings.chatCredentialsExists)
                    self.displaySettingValues()
                }
                .catch { error in
                    UserDefaults.standard.set(false, forKey: UserSettings.chatCredentialsExists)
                    DDLogError("\(error)")
                    self.displaySettingValues()
            }
        }
    }
}
