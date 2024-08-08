//
//  HelpViewController.swift
//  COPsync911
//
//  Created by Ulaganathan on 18/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Cocoa

class HelpViewController: NSViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do view setup here.
    }
    @IBAction func helpCloseAction(_ sender: AnyObject) {
        let application = NSApplication.shared()
        application.stopModal()
    }
    
}
