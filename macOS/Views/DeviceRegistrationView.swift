//
//  DeviceRegistrationView.swift
//  COPsync911
//
//  Created by aj on 25/09/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class DeviceRegistrationView: NSView {
    // MARK: - Properties
    @IBOutlet weak var progressIndicator: NSProgressIndicator!
    @IBOutlet weak var navBarView: NavbarView!
    @IBOutlet weak var organizationLocationPopUpButton: NSPopUpButton!
    @IBOutlet weak var locationNameTextField: NSTextField!
    @IBOutlet weak var locationTypePopUpButton: NSPopUpButton!
    @IBOutlet weak var descriptionTextField: NSTextField!
    @IBOutlet weak var verificationCodeTextField: NSTextField!
    @IBOutlet weak var deviceRegistrationButton: NSButton!
    @IBOutlet weak var resendButton: NSButton!
    @IBOutlet weak var organizationNamePopUpButton: NSPopUpButton!
    
    var locationTextFieldPlaceHolder: NSAttributedString = NSAttributedString(string: "enter location", attributes: [NSForegroundColorAttributeName : NSColor.init(red: 95.0 / 255.0, green: 105.0 / 255.0, blue: 113.0 / 255.0, alpha: 1.0)])
    var descriptionTextFieldPlaceHolder: NSAttributedString = NSAttributedString(string: "enter description", attributes: [NSForegroundColorAttributeName : NSColor.init(red: 95.0 / 255.0, green: 105.0 / 255.0, blue: 113.0 / 255.0, alpha: 1.0)])
    var verificationCodeTextFieldPlaceHolder: NSAttributedString = NSAttributedString(string: "enter verification code", attributes: [NSForegroundColorAttributeName : NSColor.init(red: 95.0 / 255.0, green: 105.0 / 255.0, blue: 113.0 / 255.0, alpha: 1.0)])
    
    // MARK: - Instance methods
    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)

        // Drawing code here.
    }
    
    override func awakeFromNib() {
//        self.navBarView.showAndHideViews(isHidden: false)
        self.wantsLayer = true
        self.layer?.backgroundColor = Color.white
        
        self.setupPlaceholders()
    }
    
    func setupPlaceholders() {
        self.locationNameTextField.placeholderAttributedString = self.locationTextFieldPlaceHolder
        self.descriptionTextField.placeholderAttributedString = self.descriptionTextFieldPlaceHolder
        self.verificationCodeTextField.placeholderAttributedString = self.verificationCodeTextFieldPlaceHolder
        self.locationTypePopUpButton.removeAllItems()
        self.organizationLocationPopUpButton.removeAllItems()
        self.locationTypePopUpButton.addItem(withTitle: "select your location type")
        self.organizationLocationPopUpButton.addItem(withTitle: "select your location")
        self.organizationNamePopUpButton.addItem(withTitle: "select your organization")
    }
    
}
