//
//  CustomTextField.swift
//  COPsync911
//
//  Created by aj on 11/07/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class CustomTextField: NSTextField {

    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)
        self.drawBorder(rect: dirtyRect)
    }
    
    func drawBorder(rect : NSRect){
        let blackColor = NSColor(red: 0.0, green: 0.0, blue: 0.0, alpha: 1.0)
        blackColor.set()
        
        let bPath: NSBezierPath = NSBezierPath(rect:rect)
        bPath.move(to: NSMakePoint(20, 20))
        bPath.line(to: NSMakePoint(rect.size.width - 20, 20))
        bPath.lineWidth = 10.0
        bPath.stroke()
    }
}
