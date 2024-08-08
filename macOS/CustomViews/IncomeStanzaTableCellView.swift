//
//  IncomeStanzaTableCellView.swift
//  COPsync911
//
//  Created by aj on 13/07/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class IncomeStanzaTableCellView: NSTableCellView {

    @IBOutlet weak var displayNameTextField: NSTextField!
    @IBOutlet weak var userProfileImageView: NSImageView!
    @IBOutlet weak var messageBubleView: NSView!
    @IBOutlet weak var timeTextField: NSTextField!
    @IBOutlet weak var messageTextField: NSTextField!
    
    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)
    }
    
    func backgroundColorForSubView() {
        self.userProfileImageView.wantsLayer = true
        self.userProfileImageView.layer?.cornerRadius = self.userProfileImageView.frame.width / 2.0
        self.userProfileImageView.layer?.borderColor = NSColor.init(red: 0 / 255.0, green: 61.0 / 255.0, blue: 111.0 / 255.0, alpha: 1.0).cgColor
        self.userProfileImageView.layer?.borderWidth = 0.5
        
        self.messageBubleView.wantsLayer = true
        self.messageBubleView.layer?.backgroundColor = NSColor.init(red: 246.0 / 255.0, green: 247.0 / 255.0, blue: 249.0 / 255.0, alpha: 1.0).cgColor
        self.messageBubleView.layer?.cornerRadius = 5.0
    }
    
    func alignTableCellSubViews(size : CGSize, row : Int) {        
        self.wantsLayer = true
        let result: Double = Double(row) / Double(2)
        
        if (result > 0) {
            self.layer?.backgroundColor = NSColor.purple.cgColor
        } else {
            self.layer?.backgroundColor = NSColor.white.cgColor
        }
        
        self.userProfileImageView.frame = CGRect(x: 25, y: 5, width: 35, height: 35)
        self.messageBubleView.frame = CGRect(x: 75 , y: 5, width : (self.frame.size.width - 200), height: self.frame.size.height - 10)
        self.messageTextField.frame = CGRect(x: 5, y: 5, width: (self.messageBubleView.frame.size.width - 10), height: self.messageBubleView.frame.size.height - 10)
    }
}
