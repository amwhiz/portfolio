//
//  ChatUsersController.swift
//  COPsync911
//
//  Created by aj on 12/07/16.
//  Copyright © 2016 copsync. All rights reserved.
//

import Cocoa

class ChatUsersController: NSViewController, NSTableViewDataSource, NSTableViewDelegate {

    @IBOutlet weak var userTableView: NSTableView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.view.wantsLayer = true
        self.view.layer?.backgroundColor = NSColor(red: 240.0 / 255.0, green: 245.0 / 255.0, blue: 248.0 / 255.0, alpha: 1.0).cgColor
        // Do view setup here.
        self.userTableView.dataSource = self
        self.userTableView.delegate = self
        
        NotificationCenter.default.addObserver(self, selector: #selector(ChatUsersController.onMemberListModified(_:)), name: NSNotification.Name("onMemberListModified"), object: nil)
    }
    
    //MARK : NSTableViewDataSorce
    func numberOfRows(in tableView: NSTableView) -> Int {
        
        return  Messenger.sharedInstance.groupMemberList.count
    }
    
    func tableView(_ tableView: NSTableView, heightOfRow row: Int) -> CGFloat {
        
        let onlineUser = Messenger.sharedInstance.groupMemberList[row]
        
        if onlineUser is String {
            return 20
        } else {
            return 63
        }
    }
    
    func onMemberListModified(_ aNotification: Notification) {
        DispatchQueue.main.async(execute: {
            self.userTableView.reloadData()
        })
    }

    func tableView(_ tableView: NSTableView, viewFor tableColumn: NSTableColumn?, row: Int) -> NSView? {
        let groupCell = tableView.make(withIdentifier: "titleCell", owner: self) as! NSTableCellView
        let cell = tableView.make(withIdentifier: "userCell", owner: self) as! ChatUsersTableCellView
        
        let indexExists = Messenger.sharedInstance.groupMemberList.indices.contains(row)
        
        if !indexExists {
            return nil
        }
        
        let onlineUser = Messenger.sharedInstance.groupMemberList[row]
        
        
        
        if onlineUser is String {
            groupCell.textField?.stringValue = onlineUser as! String
            
            return groupCell
        } else {
            
            
            cell.userProfileNameTextField.stringValue = ((onlineUser as? RoomUser)?.displayName)!
            
            return cell
        }
    }
}
