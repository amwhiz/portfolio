//
//  SettingsWindowController.swift
//  COPsync911
//
//  Created by aj on 24/10/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class SettingsWindowController: NSWindowController {
    
    
    @IBOutlet var organizationNameTextView: NSTextView!
    
    @IBOutlet weak var organizationLocationTextField: NSTextField!
    @IBOutlet weak var locationNameTextField: NSTextField!
    @IBOutlet weak var locationTypeTextField: NSTextField!
    @IBOutlet weak var deviceNameTextField: NSTextField!
    
    @IBOutlet weak var disclaimerScrollView: NSScrollView!
    @IBOutlet var deviceDescriptionTextView: NSTextView!
    @IBOutlet weak var changeSettingsButton: NSButton!
    
    lazy var settingsLoginWindowController: NSWindowController? = SettingsLoginWindowController(windowNibName: "SettingsLoginWindowController") as NSWindowController
    

    override func windowDidLoad() {
        super.windowDidLoad()
        self.window?.backgroundColor =  NSColor.white
        self.displayDeviceDetails()
        // Implement this method to handle any initialization after your window controller's window has been loaded from its nib file.
    }
    
    func displayDeviceDetails() {
        let deviceResponse: NSData? = UserDefaults.standard.object(forKey: UserSettings.chatCredentials) as? NSData
        var response: NSDictionary?
        if deviceResponse != nil {
            response = NSKeyedUnarchiver.unarchiveObject(with: deviceResponse as! Data) as? NSDictionary
        }
        
        if response != nil {
            deviceNameTextField.stringValue = response?.object(forKey: "Name") as? String ?? ""
            
            self.deviceDescriptionTextView.string = response?.object(forKey: "Description") as? String ?? ""
            
            let location = response?.object(forKey: "CurrentLocation") as? NSDictionary
            
            if location != nil {
                locationNameTextField.stringValue = location?.object(forKey: "Name") as? String ?? ""
                let locationType = location?.object(forKey: "CurrentLocationType") as? NSDictionary
                
                if locationType != nil {
                    locationTypeTextField.stringValue = locationType?.object(forKey: "Name") as? String ?? ""
                }
            }
        }
        
        if let organizationName = UserDefaults.standard.object(forKey: DeviceSettings.organizationName) {
            organizationNameTextView.string = organizationName as? String
        }
        
        let organizationLocationName = UserDefaults.standard.object(forKey: DeviceSettings.organizationLocationName)
        
        if organizationLocationName != nil {
            organizationLocationTextField.stringValue = organizationLocationName as! String
        }
        
    }
    
    @IBAction func changeSettingsAction(_ sender: AnyObject) {
        self.window?.performClose(self)
        
        settingsLoginWindowController = nil
        
        if settingsLoginWindowController == nil {
            settingsLoginWindowController = SettingsLoginWindowController(windowNibName: "SettingsLoginWindowController") as NSWindowController
        }
        UserDefaults.standard.set(locationNameTextField.stringValue, forKey: "locationField")
        DataPass.sharedInstance.identifierId = Config.App.Identifier.settingsString
        self.settingsLoginWindowController?.window?.level = Int(CGWindowLevelForKey(.floatingWindow)) - 1
        self.settingsLoginWindowController?.showWindow(self)
    }
    
    @IBAction func cancelAction(_ sender: AnyObject) {
        self.window?.performClose(self)
    }
}
