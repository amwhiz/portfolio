//
//  DeviceRegistrationWindowController.swift
//  COPsync911
//
//  Created by aj on 23/10/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class DeviceRegistrationWindowController: NSWindowController,NSWindowDelegate, NSTextFieldDelegate {
    
    // MARK: - Properties
    @IBOutlet weak var progressIndicator: NSProgressIndicator!
    @IBOutlet weak var navBarView: NavbarView!
    @IBOutlet weak var organizationLocationPopUpButton: NSPopUpButton!
    @IBOutlet weak var locationNameTextField: NSTextField!
    @IBOutlet weak var locationTypePopUpButton: NSPopUpButton!
    @IBOutlet weak var descriptionTextField: NSTextField!
    @IBOutlet weak var deviceRegistrationButton: NSButton!
    @IBOutlet weak var resendButton: NSButton!
    @IBOutlet weak var organizationNamePopUpButton: NSPopUpButton!
    @IBOutlet weak var smsVerificationTextField: NSTextField!
    
    @IBOutlet weak var organizationNameTextField: NSTextField!
    
    
    var locationTextFieldPlaceHolder: NSAttributedString = NSAttributedString(string: "enter location", attributes: [NSForegroundColorAttributeName : NSColor.init(red: 95.0 / 255.0, green: 105.0 / 255.0, blue: 113.0 / 255.0, alpha: 1.0)])
    var descriptionTextFieldPlaceHolder: NSAttributedString = NSAttributedString(string: "enter description", attributes: [NSForegroundColorAttributeName : NSColor.init(red: 95.0 / 255.0, green: 105.0 / 255.0, blue: 113.0 / 255.0, alpha: 1.0)])
    var organizationNameTextFieldPlaceHolder: NSAttributedString = NSAttributedString(string: "organization name", attributes: [NSForegroundColorAttributeName : NSColor.init(red: 95.0 / 255.0, green: 105.0 / 255.0, blue: 113.0 / 255.0, alpha: 1.0)])
    
    var locationTypesArr: [LocationTypes] = [LocationTypes]()
    var organizationNameAndLocationArr: [Organizations] = [Organizations]()
    var currentOrganizationLocations: [LocationTypes] = [LocationTypes]()
    var isAuthenticationNeed: Bool = false
    var authUsername: String = ""
    var authPassword: String = ""
    var isCloseFromSubmit:Bool =  false
    
    override func windowDidLoad() {
        super.windowDidLoad()
        
        NotificationCenter.default.addObserver(self, selector: #selector(self.controlTextDidChange),name:NSNotification.Name.NSControlTextDidChange,object: nil)
        
        self.window?.backgroundColor = NSColor.white
        
        self.smsVerificationTextField.isHidden = !self.smsVerificationTextField.isHidden
        self.resendButton.isHidden = !self.resendButton.isHidden
        self.disableIndicator()
        self.setupPlaceholders()
        
        if self.isOrgUserOrAdmin() {
            self.organizationNamePopUpButton.isHidden = true
        } else {
            self.organizationNameTextField.isHidden = true
        }
        
        DispatchLevel.background.dispatchQueue.async {
            self.getDeviceRegistrationInfo()
            self.triggerSms(flag: false)
        }
        // Implement this method to handle any initialization after your window controller's window has been loaded from its nib file.
    }
    
    func windowWillClose(_ notification: Notification) {
         NotificationCenter.default.removeObserver(self)
        if(!isCloseFromSubmit) {
            NSApplication.shared().terminate(nil)
        }
    }
    
    override func awakeFromNib() {
        self.navBarView.showAndHideViews(isHidden: true)
    }
    
    //MARK: Enter to Submit
    override func keyDown(with event: NSEvent) {
        if event.keyCode == 0x24 {
            self.registerDevice()
        }
    }
    @IBAction func enterToSubmitAction(_ sender: AnyObject) {
        self.registerDevice()
    }
    
    override func controlTextDidChange(_ obj: Notification) {
        let textField = obj.object as! NSTextField
        
        if textField.stringValue.characters.count >= textField.tag {
            let stringVal = textField.stringValue as NSString
            textField.stringValue = stringVal.substring(with: NSRange(location: 0, length:textField.tag))
        }
    }
    
    func setupPlaceholders() {
        self.locationNameTextField.placeholderAttributedString = self.locationTextFieldPlaceHolder
        self.descriptionTextField.placeholderAttributedString = self.descriptionTextFieldPlaceHolder
        self.organizationNameTextField.placeholderAttributedString = self.organizationNameTextFieldPlaceHolder
        self.locationTypePopUpButton.removeAllItems()
        self.organizationLocationPopUpButton.removeAllItems()
        self.locationTypePopUpButton.addItem(withTitle: "select your location type")
        self.organizationLocationPopUpButton.addItem(withTitle: "select your location")
        self.organizationNamePopUpButton.addItem(withTitle: "select your organization")
        self.organizationNameTextField.stringValue = User.sharedInstance.currentUser.organizationName!
    }
    
    @IBAction func organizationNameSelectAction(_ sender: AnyObject) {
        self.selectOrganizationNameEvent()
    }
    
    func selectOrganizationNameEvent() {
        let index = organizationNamePopUpButton.indexOfSelectedItem
        
        if index != 0 {
            let row = index - 1
            if organizationNameAndLocationArr.indices.contains(row) {
                let selectedOrganization = organizationNameAndLocationArr[row]
                
                if self.organizationNameAndLocationArr.count > 0 {
                    organizationLocationPopUpButton.removeAllItems()
                    let menu: NSMenu = NSMenu()
                    menu.addItem(withTitle: "select your location", action: nil, keyEquivalent: "")
                    
                    for orgLocation in selectedOrganization.Locations.enumerated() {
                        menu.addItem(withTitle: orgLocation.element.Name, action: nil, keyEquivalent: "")
                    }
                    
                    organizationLocationPopUpButton.menu = menu
                }
                
                if (self.locationTypesArr.count) > 0 {
                    let ascendedArray = self.locationTypesArr.sorted { $0.Name < $1.Name };
                    self.locationTypesArr = ascendedArray
                    locationTypePopUpButton.removeAllItems()
                    let menu: NSMenu = NSMenu()
                    menu.addItem(withTitle: "select your location type", action: nil, keyEquivalent: "")
                    currentOrganizationLocations.removeAll()
                    for location in self.locationTypesArr.enumerated() {
                        if selectedOrganization.OrganizationTypeId == location.element.OrganizationTypeId {
                            currentOrganizationLocations.append(location.element)
                            menu.addItem(withTitle: location.element.Name, action: nil, keyEquivalent: "")
                        }
                    }
                    
                    DispatchLevel.main.dispatchQueue.async {
                        self.locationTypePopUpButton.menu = menu
                    }
                }
            }
        } else {
            organizationLocationPopUpButton.removeAllItems()
            locationTypePopUpButton.removeAllItems()
            let menu: NSMenu = NSMenu()
            menu.addItem(withTitle: "select your location", action: nil, keyEquivalent: "")
            organizationLocationPopUpButton.menu = menu
            
            let locationMenu: NSMenu = NSMenu()
            locationMenu.addItem(withTitle: "select your location type", action: nil, keyEquivalent: "")
            locationTypePopUpButton.menu = locationMenu
        }
    }
    
    @IBAction func organizationLocationPopUpButtonAction(_ sender: AnyObject) {
        if organizationLocationPopUpButton.indexOfSelectedItem == 0 &&
            organizationNamePopUpButton.indexOfSelectedItem == 0 && !self.isOrgUserOrAdmin() {
            AlertHelper.showAlert(question: "Organization", text: "Please select your organization name")
        }
    }
    
    @IBAction func locationTypePopUpButtonAction(_ sender: AnyObject) {
        if locationTypePopUpButton.indexOfSelectedItem == 0 &&
            organizationNamePopUpButton.indexOfSelectedItem == 0 && !self.isOrgUserOrAdmin() {
            AlertHelper.showAlert(question: "Organization", text: "Please select your organization name")
        }
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
        DispatchLevel.userInteractive.dispatchQueue.async {
            DeviceApiClient()
                .getDeviceRegistrationInfo()
                .then { response -> Void in
                    self.parseResponse(data: response)
                }
                .catch { error in
                    DDLogInfo("getting device registration info failed")
            }
        }
    }
    
    func parseResponse(data: Any) {
        let registerInfo: NSDictionary? = data as? NSDictionary
        if registerInfo != nil {
            self.decorateLocationData(registerInfo: registerInfo)
            self.decorateOrganizationData(registerInfo: registerInfo)
        }
    }
    
    func decorateOrganizationData(registerInfo: NSDictionary?) {
        let organizations = registerInfo?.object(forKey: "Organizations") as? NSDictionary
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
                        
                        organizationNameAndLocationArr.append(Organizations(id: organizationDetail.object(forKey: "Id") as! String,
                                                                            name: organizationDetail.object(forKey: "Name") as! String,
                                                                            organizationTypeId: organizationDetail.object(forKey: "OrganizationTypeId") as! String,
                                                                            locations: organizationLocationDataArr))
                    }
                }
            }
        }
        
        if self.organizationNameAndLocationArr.count > 0 && !self.isOrgUserOrAdmin() {
            
            let ascendedArray = self.organizationNameAndLocationArr.sorted { $0.Name < $1.Name };
            self.organizationNameAndLocationArr = ascendedArray
            organizationNamePopUpButton.removeAllItems()
            let menu: NSMenu = NSMenu()
            menu.addItem(withTitle: "select your organization", action: nil, keyEquivalent: "")
            
            for organization in self.organizationNameAndLocationArr.enumerated() {
                let menuItem = NSMenuItem.init(title: organization.element.Name, action: nil, keyEquivalent: "")
                
                if self.getUserOrganizationPartyRoleCount() > 1 && self.checkUserIsOrgUserOrAdmin() {
                    menuItem.state = (organization.element.Id == User.sharedInstance.currentUser.organizationID!) ? NSOnState : NSOffState
                }
                
                menu.addItem(menuItem)
            }
            
            DispatchLevel.main.dispatchQueue.async {
                self.organizationNamePopUpButton.menu = menu
                if self.getUserOrganizationPartyRoleCount() > 1 && self.checkUserIsOrgUserOrAdmin() {
                    self.selectOrganizationNameEvent()
                }
            }
        } else if self.isOrgUserOrAdmin() {
            var selectedOrganization: Organizations?
            
            if self.organizationNameAndLocationArr.count > 0 {
                organizationLocationPopUpButton.removeAllItems()
                let menu: NSMenu = NSMenu()
                menu.addItem(withTitle: "select your location", action: nil, keyEquivalent: "")
                
                
                for (_, v) in self.organizationNameAndLocationArr.enumerated() {
                    if v.Id == User.sharedInstance.currentUser.organizationID! {
                        selectedOrganization = v
                    }
                }
                
                if selectedOrganization != nil {
                    for orgLocation in (selectedOrganization?.Locations.enumerated())! {
                        menu.addItem(withTitle: orgLocation.element.Name, action: nil, keyEquivalent: "")
                    }
                }
                
                organizationLocationPopUpButton.menu = menu
            }
            
            if (self.locationTypesArr.count) > 0 {
                let ascendedArray = self.locationTypesArr.sorted { $0.Name < $1.Name };
                self.locationTypesArr = ascendedArray
                locationTypePopUpButton.removeAllItems()
                let menu: NSMenu = NSMenu()
                menu.addItem(withTitle: "select your location type", action: nil, keyEquivalent: "")
                currentOrganizationLocations.removeAll()
                if selectedOrganization != nil {
                    for location in self.locationTypesArr.enumerated() {
                        if selectedOrganization?.OrganizationTypeId == location.element.OrganizationTypeId {
                            self.currentOrganizationLocations.append(location.element)
                            menu.addItem(withTitle: location.element.Name, action: nil, keyEquivalent: "")
                        }
                    }
                }
                
                DispatchLevel.main.dispatchQueue.async {
                    self.locationTypePopUpButton.menu = menu
                }
            }
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
            }
        }
    }
    
    func validateDeviceRegistration() throws {
        var flag = false
        
        if locationNameTextField.stringValue.trimmingCharacters(in: .whitespacesAndNewlines) == "" {
            flag = true
        }
        
        if descriptionTextField.stringValue.trimmingCharacters(in: .whitespacesAndNewlines) == "" {
            flag = true
        }
        
        let organizationLocation: Int =  organizationLocationPopUpButton.indexOfSelectedItem
        let locationType: Int = locationTypePopUpButton.indexOfSelectedItem
        let organizationName: Int = organizationNamePopUpButton.indexOfSelectedItem
        
        if organizationLocation == 0 ||
            locationType  == 0
        {
            flag = true
        }
        
        if !self.isOrgUserOrAdmin() && organizationName == 0 {
            flag = true
        }
        
        if flag {
            throw DeviceRegistrationError.validationFailed
        }
    }
    
    @IBAction func registerDeviceAction(_ sender: AnyObject) {
        self.registerDevice()
    }
    func registerDevice() {
        do {
            try self.validateDeviceRegistration()
        } catch DeviceRegistrationError.validationFailed {
            DDLogInfo("form validation failed")
            AlertHelper.showAlert(question: Alert.formValidationTitle, text: DeviceRegistrationError.validationFailed.rawValue)
            return
        } catch {
        }
        
        if self.isAuthenticationNeed {
            NotificationCenter.default.removeObserver(self)
            let verificationPopUp = NSAlert()
            verificationPopUp.addButton(withTitle: "Continue")      // 1st button
            verificationPopUp.addButton(withTitle: "Cancel")  // 2nd button
            verificationPopUp.messageText = "Verification Code"
            verificationPopUp.icon = NSImage()
            
            let verificationText = NSTextField(frame: NSRect(x: 0, y: 0, width: (self.window?.frame.size.width)!/4, height: 20))
            verificationText.placeholderString = "Enter the Verification Code"
            
            verificationPopUp.accessoryView = verificationText
            verificationPopUp.window.initialFirstResponder = verificationText

            let response: NSModalResponse = verificationPopUp.runModal()
            
            if (response == NSAlertFirstButtonReturn) {
                submitRegitrationDetails(authendicationCode: verificationText.stringValue)
            }
        } else {
            submitRegitrationDetails(authendicationCode: "")
        }

    }
    
    func submitRegitrationDetails(authendicationCode: String) {
        
        let locationId = self.currentOrganizationLocations[locationTypePopUpButton.indexOfSelectedItem - 1]
        var organizationData: Organizations?
        
        if !self.isOrgUserOrAdmin() {
            organizationData = self.organizationNameAndLocationArr[organizationNamePopUpButton.indexOfSelectedItem - 1]
        } else {
            for (_, v) in self.organizationNameAndLocationArr.enumerated() {
                if v.Id == User.sharedInstance.currentUser.organizationID! {
                    organizationData = v
                }
            }
        }
        
        if let selectedOrganizationData = organizationData {
            let organizationLocationId = selectedOrganizationData.Locations[organizationLocationPopUpButton.indexOfSelectedItem - 1].Id
            let organizationLocationName = selectedOrganizationData.Locations[organizationLocationPopUpButton.indexOfSelectedItem - 1].Name
            
            UserDefaults.standard.set(organizationLocationName, forKey: DeviceSettings.organizationLocationName)
            UserDefaults.standard.set(organizationLocationId, forKey: DeviceSettings.deviceLocationId)
            UserDefaults.standard.set(locationId.Id, forKey: DeviceSettings.locationTypeId)
            UserDefaults.standard.set(selectedOrganizationData.Name, forKey: DeviceSettings.organizationName)
            UserDefaults.standard.set(selectedOrganizationData.Id, forKey: DeviceSettings.deviceOrganizationId)
            UserDefaults.standard.set(selectedOrganizationData.OrganizationTypeId, forKey: DeviceSettings.deviceOrganizationTypeId)
            
            UserDefaultsHelper.addNewLocation(locationName:locationNameTextField.stringValue)
            var payload = [
                "Device": [
                    "Name": AuthHelper.getMachineName(),
                    "Identifier": String.macSerialNumber(),
                    "Description": descriptionTextField.stringValue.trimmingCharacters(in: CharacterSet.whitespaces),
                    "CreatedOnClient": Date().iso8601,
                    "CurrentLocation": [
                        "CurrentLocationTypeId": locationId.Id,
                        "Name": locationNameTextField.stringValue.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines),
                        "LocationId": organizationLocationId
                    ]
                ],
                "OrganizationId": selectedOrganizationData.Id
                ] as [String: Any]
            
            if isAuthenticationNeed {
                payload["ActivationVerificationCode"] = authendicationCode
            }
            
            self.registerDevice(payload: payload)
        }
    }
    
    @IBAction func sendSmsAction(_ sender: AnyObject) {
        self.triggerSms(flag: true)
    }
    
    enum SmsType: String {
        case success = "The SMS has been sent"
        case adminApprovalIsRequiredForDeviceActivation = "The organization does not allow automatic authentication for Organization Users"
        case nonExistentPhone = "The user has not registered a mobile phone to receive SMS"
        case codeVerificationNotRequired = "The user has an admin role and does not need a code for activating the device"
    }
    
    func triggerSms(flag: Bool) {
        resendButton.isEnabled = !resendButton.isEnabled
        DispatchLevel.userInitiated.dispatchQueue.async {
            DeviceApiClient()
                .startRegistration()
                .always {
                    DispatchLevel.main.dispatchQueue.async {
                        self.resendButton.isEnabled = true
                    }
                }
                .then { response -> Void in
                    let data = response as? NSDictionary
                    
                    if data != nil {
                        let result = data?["Result"] as! Int
                        switch result {
                        case 0:
                            self.smsVerificationTextField.isHidden = false
                            self.resendButton.isHidden = false
                            self.isAuthenticationNeed = true
                        case 1:
                            isAdminApprovalRequired = true
                            break
                        case 2:
                            self.showAlert()
                        case 4:
                            self.isAuthenticationNeed = false
                        default:
                            break
                        }
                    }
                }
                .catch { error in
                    DDLogInfo("start device registration failed, show alert")
                    
                    switch error {
                    case NetworkError.unreachable:
                        AlertHelper.showAlert(question: NetworkError.unreachable.rawValue, text: Dataonix.ErrorMessageText.unreachable)
                    default:
                        DDLogError("default error catch not found")
                    }
            }
        }
    }
    
    private func registerDevice(payload: [String: Any]) {
        DDLogInfo("register device request started")
        deviceRegistrationButton.isEnabled = !deviceRegistrationButton.isEnabled
        self.showIndicator()
        DispatchLevel.userInteractive.dispatchQueue.async {
            DeviceApiClient()
                .registerDevice(payload: payload)
                .always {
                    DispatchLevel.main.dispatchQueue.async {
                        self.deviceRegistrationButton.isEnabled = !self.deviceRegistrationButton.isEnabled
                        self.disableIndicator()
                    }
                }
                .then { response -> Void in
                    if response is NSDictionary {
                        DDLogInfo("device registered successfully")
                        authData = [String]()
                        UserDefaultsHelper.setDeviceRegistered(flag: true)
                        let deviceResponse = response as! NSDictionary
                        let deviceInfo: NSDictionary = [
                            "CurrentLocationId": deviceResponse["CurrentLocationId"] as! String,
                            "Id": deviceResponse["DeviceId"] as! String,
                            "IsActive": deviceResponse["IsActive"] as! Bool,
                            "IsAlreadyRegistered": deviceResponse["IsAlreadyRegistered"] as! Bool
                        ]
                        UserDefaults.standard.set(deviceInfo, forKey: UserSettings.deviceInfo)
                        DataonixApiClient().sendSystemInfo()
                        DDLogInfo("device registration success, show dashboard")
                        DeviceStatusHelper.isCurrentDeviceActive(silent: nil)
                        self.isCloseFromSubmit =  true
                        self.window?.performClose(self)
                    } else if response is Bool {
                        DDLogInfo("device registration failed, show alert")
                        AlertHelper.showAlert(question: Alert.title, text: Alert.wrong)
                    }
                }
                .catch { error in
                    DDLogInfo("device registration failed, show alert")
                    
                    switch error {
                    case NetworkError.unreachable:
                        AlertHelper.showAlert(question: NetworkError.network.rawValue, text: Dataonix.ErrorMessageText.networkunreachable)
                    default:
                        DDLogInfo("catch error not found")
                    }
            }
        }
    }
    
    func showAlert() {
        let textView = NSTextView(frame: NSMakeRect(0, 0, 300, 50))
        textView.backgroundColor = NSColor.clear
        let str = "You are unable to register your device since you don't have a mobile phone number with sms enabled in your profile. Please go to the Dataonix Portal to add a phone with sms enabled." as NSString
        let attrString = NSMutableAttributedString(string: str as String)
        
        let range = str.range(of: "Dataonix Portal")
        
        attrString.beginEditing()
        attrString.addAttribute(NSLinkAttributeName, value: getDataonixPortal(), range: range)
        attrString.addAttribute(NSForegroundColorAttributeName, value: NSColor.blue, range: range)
        attrString.endEditing()
        textView.insertText(attrString)
        
        let myPopup: NSAlert = NSAlert()
        myPopup.messageText = "Device Registration"
        myPopup.alertStyle = NSAlertStyle.informational
        myPopup.accessoryView = textView
        myPopup.addButton(withTitle: "Ok")
        let result = myPopup.runModal()
        
        if result == NSAlertFirstButtonReturn {
            NSApplication.shared().terminate(nil)
        }
    }
    
    func isOrgUserOrAdmin() -> Bool {
        let userRoles = User.sharedInstance.currentUser.userRoleCodes
        let roleValues: [String] = userRoles?.object(forKey: "$values") as! [String]
        let organizationPartyRoles = User.sharedInstance.currentUser.organizationPartyRoles
        
        let orgRoleValues = organizationPartyRoles?.object(forKey: "$values") as! [NSDictionary]
        
        return (roleValues.contains("ORGUSR") || roleValues.contains("ORGADM")) && (orgRoleValues.count == 1)
    }
    
    func checkUserIsOrgUserOrAdmin() -> Bool {
        let userRoles = User.sharedInstance.currentUser.userRoleCodes
        let roleValues: [String] = userRoles?.object(forKey: "$values") as! [String]
        
        return roleValues.contains("ORGUSR") || roleValues.contains("ORGADM")
    }
    
    func getUserOrganizationPartyRoleCount() -> Int {
        let organizationPartyRoles = User.sharedInstance.currentUser.organizationPartyRoles
        
        let orgRoleValues = organizationPartyRoles?.object(forKey: "$values") as! [NSDictionary]
        
        return orgRoleValues.count
    }
    
}
