//
//  OutgoingStanzaTableCellView.swift
//  COPsync911
//
//  Created by aj on 13/07/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class OutgoingStanzaTableCellView: NSTableCellView {
    
    @IBOutlet weak var messageBubleView: NSView!
    @IBOutlet weak var timeTextField: NSTextField!
    @IBOutlet weak var messageTextField: NSTextField!
    
    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)

        // Drawing code here.
    }
    
}
