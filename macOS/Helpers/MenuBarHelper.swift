//
//  MenuBarHelper.swift
//  COPsync911
//
//  Created by Shaul Hameed on 01/11/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class MenuBarHelper:NSObject, NSMenuDelegate{
    
    private var statusBar = NSStatusBar.system()
    
    private var statusBarItem : NSStatusItem = NSStatusItem()
    
    static var lazyInstance: MenuBarHelper?
    
    private var isMenuOpen: Bool = false
    
    var statusMenu: NSMenu?
    
    var isOnlineOrOffline = false
    
    override init(){
        super.init()
    }
    
    init(menu: NSMenu) {
        super.init()
        self.statusMenu = menu
        self.statusMenu?.delegate = self
    }
    
    func goOffline() {
        if !isOnlineOrOffline {
            return
        }
        
        self.statusBarItem = self.statusBar.statusItem(withLength: -1)
        self.statusBarItem.image = NSImage(named: "copsynctrayiconoffline")
        self.statusBarItem.menu = self.statusMenu
        
        if let statusMenuItems = self.statusMenu {
            
            for(_, menu) in statusMenuItems.items.enumerated() {
                menu.isEnabled = false
            }
        }
        
        isOnlineOrOffline = false
    }
    
    private func isDarkMode() -> Bool {
        let globalDomain = UserDefaults.standard.persistentDomain(forName: "NSGlobalDomain")
        if let interfaceStyle = globalDomain?["AppleInterfaceStyle"] {
            if interfaceStyle as! String == "Dark" {
                return true
            }
        }
        
        return false
    }
    
    func goOnline() {
        if isOnlineOrOffline {
            return
        }
        
        self.statusBarItem = self.statusBar.statusItem(withLength: -1)
        self.updateTrayIcon()
    }
    
    func updateTrayIcon() {
        
        if (self.isMenuOpen) {
            return
        }
        
        var statusIcon = NSImage(named: "copsync_taskbar_blue_light")
        if self.isDarkMode() {
            statusIcon = NSImage(named: "copsync_taskbar_blue_dark")
        }

        self.statusBarItem.image = statusIcon
        
        self.statusBarItem.menu = self.statusMenu
        
        if let statusMenuItems = self.statusMenu {
            
            for (_, menu) in statusMenuItems.items.enumerated() {
                menu.isEnabled = true
            }
        }
        
        isOnlineOrOffline = true
    }
    
    func menuDidClose(_ menu: NSMenu) {
        isMenuOpen = false
    }
    
    func menuWillOpen(_ menu: NSMenu) {
        isMenuOpen = true
    }
}
