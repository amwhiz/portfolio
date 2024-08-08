//
//  ForgotPasswordCustomTextField.swift
//  COPsync911
//
//  Created by aj on 15/07/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class ForgotPasswordCustomTextField: NSTextField {

    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)
    }
    
    override func mouseDown(with event: NSEvent) {
        NSWorkspace.shared().open(NSURL(string: getForgotPasswordUrl())! as URL)
    }
}
