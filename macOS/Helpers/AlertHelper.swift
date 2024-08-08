//
//  AlertHelper.swift
//  copsync
//
//  Created by Arul Jothi on 6/26/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation
import Cocoa

class AlertHelper {
    
    static func showAlert(question: String, text: String) -> Void {
        DispatchLevel.main.dispatchQueue.async {
            sendAlertInProgress = false
            (NSApplication.shared().delegate as! AppDelegate).window?.level = Int(CGWindowLevelForKey(.floatingWindow))
            let myPopup: NSAlert = NSAlert()
            myPopup.messageText = question
            myPopup.informativeText = text
            myPopup.alertStyle = NSAlertStyle.warning
            myPopup.addButton(withTitle: "OK")
            myPopup.runModal()
        }
    }
}
