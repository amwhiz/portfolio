//
//  DashboardView.swift
//  COPsync911
//
//  Created by aj on 03/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Cocoa
import MapKit

class DashboardView: NSView {

    @IBOutlet weak var navBarView: NavbarView!
    @IBOutlet weak var locationNameTextField: NSTextField!
    @IBOutlet weak var mapView: MKMapView!
    @IBOutlet weak var stateAndCountryTextField: NSTextField!
    @IBOutlet weak var sendButtonLeadSpaceLayoutConstraint: NSLayoutConstraint!
    
    @IBOutlet weak var joinChatButton: NSButton!
    @IBOutlet weak var sendAlertButton: NSButton!
    @IBOutlet weak var emergencyTextField: NSTextField!
    
    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)

        // Drawing code here.
    }
    
    override func awakeFromNib() {
        super.awakeFromNib()
    }
}
