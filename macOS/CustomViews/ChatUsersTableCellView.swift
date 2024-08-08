//
//  ChatUsersTableCellView.swift
//  COPsync911
//
//  Created by aj on 12/07/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class ChatUsersTableCellView: NSTableCellView {

    @IBOutlet weak var userProfileStatusImageView: NSImageView!
    @IBOutlet weak var userProfileNameTextField: NSTextField!
    @IBOutlet weak var userProfileOnlineStatucTextField: NSTextField!
    
    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)

        // Drawing code here.
    }
    
}
