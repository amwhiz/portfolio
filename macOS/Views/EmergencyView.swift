//
//  EmergencyView.swift
//  COPsync911
//
//  Created by aj on 06/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Cocoa

class EmergencyView: NSView {
    
    @IBOutlet weak var navBarView: NavbarView!
    @IBOutlet weak var timerTextField: NSTextField!
    @IBOutlet weak var sendAlertButton: NSButton!
    
    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)

        // Drawing code here.
    }
    
    override func awakeFromNib() {
        super.awakeFromNib()
        self.wantsLayer = true
        self.layer?.backgroundColor = NSColor.white.cgColor
    }
    
}
