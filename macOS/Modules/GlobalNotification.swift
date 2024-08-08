//
//  GlobalNotification.swift
//  COPsync911
//
//  Created by Shaul Hameed on 03/11/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class GlobalNotification: NSWindowController {

    @IBOutlet weak var notificationMessage: NSTextField!
    
    @IBOutlet weak var notificationTitle: NSTextField!
    
    override func windowDidLoad() {
        super.windowDidLoad()

        self.window?.contentView?.layer?.cornerRadius = 10
        
        self.window?.backgroundColor = NSColor.white
        
        self.notificationTitle.textColor = NSColor.init(red: 21.0/255.0, green: 164.0/255.0, blue: 250.0/255.0, alpha: 1.0)
        
        
    }
    
    @IBAction func onClose(_ sender: AnyObject) {
        
        self.close()
    }
    
}
