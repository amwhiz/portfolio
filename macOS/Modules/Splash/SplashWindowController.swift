//
//  SplashWindowController.swift
//  COPsync911
//
//  Created by aj on 23/10/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class SplashWindowController: NSWindowController {
    
    lazy var loginWindowController = LoginWindowController(windowNibName: "LoginWindowController") as NSWindowController
    
    @IBOutlet weak var navbarView: NavbarView!
    
    override func windowDidLoad() {
        super.windowDidLoad()
        
        self.navbarView.showAndHideViews(isHidden: true)
        self.showLogin()
    }
    
    func showLogin() {
        delay(bySeconds: 1, closure: {
            self.window?.performClose(self)
            self.loginWindowController.window?.level = Int(CGWindowLevelForKey(.floatingWindow)) - 1
            let app:NSApplication = NSApplication.shared()
            app.activate(ignoringOtherApps: true)
            self.loginWindowController.window?.makeKeyAndOrderFront(self)
            self.loginWindowController.showWindow(self)
        })
    }
}
