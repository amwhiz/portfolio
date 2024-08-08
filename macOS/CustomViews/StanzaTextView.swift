//
//  StanzaTextView.swift
//  COPsync911
//
//  Created by aj on 15/07/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class StanzaTextView: NSTextView, NSTextViewDelegate {
    
    var placeHolderTitleString: NSAttributedString = NSAttributedString(string: "Type a message here", attributes: [NSForegroundColorAttributeName : NSColor.gray])

    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)
        self.delegate = self
        // Drawing code here.
        
        if (self.string == "") {
            placeHolderTitleString.draw(at: NSMakePoint(5, 0))
        }
    }
    
    override func becomeFirstResponder() -> Bool {
        self.needsDisplay = true
        return super.becomeFirstResponder()
    }
    
    func textDidChange(_ notification: Notification) {
        
    }
    
    func textDidEndEditing(_ notification: Notification) {
 
    }
    
    func textView(_ textView: NSTextView, doCommandBy commandSelector: Selector) -> Bool {
        let flag = ((NSApplication.shared().currentEvent?.modifierFlags.rawValue)! & NSShiftKeyMask.rawValue)
        if commandSelector == #selector(NSResponder.insertNewline(_:)) && flag == 0 {
            self.sendStanza()
            
            return true
        } else {
            return false
        }
    }
    
    func sendStanza() {
        let trimmedText = self.string?.trimmingCharacters(in: NSCharacterSet.whitespacesAndNewlines)
        
        if (trimmedText == nil || (trimmedText?.characters.count)! < 1) {
            return
        }
        
        _ = Messenger.sharedInstance.append(textToBeSent: trimmedText!)
        
        self.string = ""
        
        Messenger.sharedInstance.isDirty = true
        
        
    }
}
