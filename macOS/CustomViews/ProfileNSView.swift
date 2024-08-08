//
//  ProfileNSView.swift
//  COPsync911
//
//  Created by aj on 25/07/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class ProfileNSView: NSView {
    
    override func mouseDown(with theEvent : NSEvent) {
        self.showProfileMenu(theEvent: theEvent)
    }
    
    func showProfileMenu(theEvent: NSEvent) {
        let menu: NSMenu = NSMenu()
        NSMenu.popUpContextMenu(menu, with: theEvent, for: self)
    }
}
