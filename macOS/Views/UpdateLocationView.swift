//
//  UpdateLocationView.swift
//  COPsync911
//
//  Created by aj on 10/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Cocoa

class UpdateLocationView: NSView {

    // MARK: - Properties
    @IBOutlet weak var progressIndicator: NSProgressIndicator!
    @IBOutlet weak var navBarView: NavbarView!
    @IBOutlet weak var organizationNameTextField: NSTextField!
    @IBOutlet weak var organizationLocationPopUpButton: NSPopUpButton!
    @IBOutlet weak var locationTypePopUpButton: NSPopUpButton!
    @IBOutlet weak var updateLocationButton: NSButton!
    
    var organizationNameTextFieldPlaceHolder: NSAttributedString = NSAttributedString(string: "enter name", attributes: [NSForegroundColorAttributeName : NSColor.init(red: 95.0 / 255.0, green: 105.0 / 255.0, blue: 113.0 / 255.0, alpha: 1.0)])
    
    // MARK: - Instance methods
    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)
        
        // Drawing code here.
    }
    
    override func awakeFromNib() {
        self.navBarView.showAndHideViews(isHidden: false)
        self.wantsLayer = true
        self.layer?.backgroundColor = Color.white
        
        self.setupPlaceholders()
    }
    
    func setupPlaceholders() {
        self.organizationNameTextField.placeholderAttributedString = self.organizationNameTextFieldPlaceHolder
        self.locationTypePopUpButton.removeAllItems()
        self.organizationLocationPopUpButton.removeAllItems()
        self.locationTypePopUpButton.addItem(withTitle: "select your location type")
        self.organizationLocationPopUpButton.addItem(withTitle: "select your location")
    }
    
}
