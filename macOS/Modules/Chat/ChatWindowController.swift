//
//  ChatWindowController.swift
//  COPsync911
//
//  Created by Ulaganathan on 24/10/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa
import ReachabilitySwift

class ChatWindowController: NSWindowController, MessengerDelegate, NSTableViewDelegate, NSTableViewDataSource, NSWindowDelegate {
    
    @IBOutlet weak var navBarView: NavbarView!
    
    // Stanza View
    @IBOutlet weak var stanzaView: NSView!
    
    @IBOutlet weak var chatView: NSView!
    @IBOutlet weak var lineView: NSView!
    
    @IBOutlet weak var networkStatusView: NSView!
    //Alert View
    @IBOutlet weak var emergencyAlertView: NSView!
    @IBOutlet weak var emergencyAlertBackgroundTextField: NSTextField!
    @IBOutlet weak var emergencyAlertImageView: NSImageView!
    @IBOutlet weak var emergencyAlertTitleTextField: NSTextField!
    
    @IBOutlet weak var emergencyAlertMessageView: NSView!
    @IBOutlet weak var emergencyAlertMessageTextField: NSTextField!
    
    @IBOutlet weak var alertHeight: NSLayoutConstraint!
    @IBOutlet weak var emergencyAlertTimeStamp: NSTextField!
    
    @IBOutlet weak var stanzaTableView: NSTableView!
    
    // message input box
    @IBOutlet weak var stanzaTypeMessageView: NSView!
    @IBOutlet weak var inputTextBackgroundView: NSView!
    @IBOutlet weak var chatStatusTextField: NSTextField!
    @IBOutlet var stanzaTextView: StanzaTextView!
    
    
    // Chat Users
    @IBOutlet weak var chatUserView: NSView!
    @IBOutlet weak var userTableView: NSTableView!
    
    // Loader View
    @IBOutlet weak var loaderTextField: NSTextField!
    @IBOutlet weak var loaderView: NSView!
    @IBOutlet weak var progressIndicator: NSProgressIndicator!
    
    
    var messageTypedBy: [String] = [String]()
    
    override func windowDidLoad() {
        super.windowDidLoad()
        
        self.initializeView()
        isChatInProgress = true
        networkStatusView.layer?.backgroundColor = NSColor.black.cgColor
        self.networkStatusView.isHidden =  true
        NotificationCenter.default.addObserver(self, selector: #selector(self.reachabilityChanged),name: ReachabilityChangedNotification,object: reachability)
        
        
    }
    func windowWillClose(_ notification: Notification) {
        NotificationCenter.default.removeObserver(self)
        
    }
    func windowDidResize(_ notification: Notification) {
        self.alertHeight.constant = findHeight(text: self.emergencyAlertMessageTextField.stringValue)
    }
    
    func reachabilityChanged(note: NSNotification) {
        
        let reachabilityObject = note.object as! Reachability
        
        if reachabilityObject.isReachable {
            self.networkStatusView.isHidden =  true
        } else {
            self.networkStatusView.isHidden =  false
        }
    }

    override func windowWillLoad() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 1, execute: {
            NSApp.dockTile.badgeLabel = nil
            self.animateView()
        })

    }
    
    //MARK: * * *NSTableViewDataSorce * * *
    func numberOfRows(in tableView: NSTableView) -> Int {
        if tableView == userTableView {
            return  Messenger.sharedInstance.groupMemberList.count
        } else {
            return Messenger.sharedInstance.messages.count
        }
    }
    
    func tableView(_ tableView: NSTableView, shouldSelectRow row: Int) -> Bool {
        return false
    }
    
    func tableView(_ tableView: NSTableView, heightOfRow row: Int) -> CGFloat {
        
        if tableView == userTableView {
            let onlineUser = Messenger.sharedInstance.groupMemberList[row]
            
            if onlineUser is String {
                return 20
            } else {
                return 50
            }
        } else {
            
            let string : String = Messenger.sharedInstance.messages[row].Text
            let someWidth: CGFloat = self.stanzaTableView.frame.size.width - 355.0
            
            let font:NSFont = NSFont(name: "Avenir-Book", size: 16.0)!
            let stringAttributes = [NSFontAttributeName: font]
            let attrString: NSAttributedString = NSAttributedString(string: string, attributes: stringAttributes)
            let frame: NSRect = NSMakeRect(0, 0, someWidth, CGFloat.greatestFiniteMagnitude)
            let tv: NSTextView = NSTextView(frame: frame)
            tv.textStorage?.setAttributedString(attrString)
            tv.isHorizontallyResizable = false
            tv.sizeToFit()
            let height: CGFloat  = tv.frame.size.height + 30
            return height
        }

    }
    
    func tableView(_ tableView: NSTableView, viewFor tableColumn: NSTableColumn?, row: Int) -> NSView? {
        if tableView == userTableView {
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

        } else {
            let indexExists = Messenger.sharedInstance.messages.indices.contains(row)
            
            if !indexExists {
                return nil;
            }
            
            let currentText = Messenger.sharedInstance.messages[row].Text
            
            if (Messenger.sharedInstance.messages[row].ChatMessageType == MessageType.Incoming) {
                let cell = tableView.make(withIdentifier: "IncomeStanzaCell", owner: self) as! IncomeStanzaTableCellView
                cell.messageTextField.usesSingleLineMode = false
                cell.messageTextField.cell?.wraps = true
                cell.messageTextField.cell?.isScrollable = false
                let displayName = Messenger.sharedInstance.messages[row].DisplayName
                cell.displayNameTextField.stringValue = ""
                cell.userProfileImageView.isHidden = true
                
                if row != 0 {
                    if displayName != Messenger.sharedInstance.messages[row - 1].DisplayName{
                        cell.displayNameTextField.stringValue = displayName
                        cell.userProfileImageView.isHidden = false
                    }
                } else {
                    cell.displayNameTextField.stringValue = displayName
                    cell.userProfileImageView.isHidden = false
                }
                
                cell.userProfileImageView.image = NSImage(named: Config.Chat.Images.General)
                cell.messageTextField.stringValue = currentText
                cell.timeTextField.stringValue = Messenger.sharedInstance.messages[row].StanzaTime
                
                cell.backgroundColorForSubView()
                
                return cell
            } else {
                let cell = tableView.make(withIdentifier: "OutgoingStanzaCell", owner: self) as! OutgoingStanzaTableCellView
                cell.messageTextField.usesSingleLineMode = false
                cell.messageTextField.cell?.wraps = true
                cell.messageTextField.cell?.isScrollable = false
                cell.messageTextField.stringValue = currentText
                cell.messageBubleView.wantsLayer = true
                cell.messageBubleView.layer?.backgroundColor = NSColor.init(red: 0 / 255.0, green: 159.0 / 255.0, blue: 232.0 / 255.0, alpha: 1.0).cgColor
                cell.messageBubleView.layer?.cornerRadius = 5.0
                cell.messageTextField.textColor = NSColor.white
                
                cell.timeTextField.stringValue = Messenger.sharedInstance.messages[row].StanzaTime
                
                return cell
            }

        }
    }

    func showAndHideLoaderView(isHidden: Bool) {
        self.progressIndicator.startAnimation(true)
        self.loaderTextField.stringValue = "Chat in progress..."
        self.loaderView.isHidden = isHidden
        self.loaderView.wantsLayer = true
        self.loaderView.layer?.backgroundColor = NSColor.white.cgColor
    }
    
    func animateView() {
        NSAnimationContext.runAnimationGroup({ (context: NSAnimationContext) in
            context.duration = 1
            self.loaderView.animator().alphaValue = 0
        }) {
            self.loaderView.isHidden = true
            self.loaderView.alphaValue = 1
        }
    }
    
    
    func scrollToTableBottom() {
        self.stanzaTableView.scrollRowToVisible(Messenger.sharedInstance.messages.count - 1)
    }
    
    func showAlertTitle(title: String) {
        self.emergencyAlertTitleTextField.stringValue = "\(title) has an emergency and needs assistance."
    }
    
    func showReverseAlertTitle(title: String){
        self.emergencyAlertTitleTextField.stringValue = "\(title) - IM has sent a reverse alert."
    }
    
    func initializeView() {
        // stanza view
        chatView.wantsLayer = true
        self.chatView.layer?.backgroundColor = NSColor.white.cgColor
        self.stanzaTypeMessageView.layer?.backgroundColor = NSColor.white.cgColor
        
        self.emergencyAlertView.wantsLayer = true
        self.emergencyAlertView.layer?.backgroundColor = NSColor.clear.cgColor
        self.stanzaTypeMessageView.layer?.backgroundColor = NSColor.white.cgColor
        
        
        self.emergencyAlertBackgroundTextField.wantsLayer = true
        self.emergencyAlertBackgroundTextField.layer?.backgroundColor = ColorCode.yellowColor.cgColor
        
        
        
        if Invitation.sharedInstance.crisisAlertMessage["type"] == Config.Alert.reverseAlert {
            
            if let emTitle = Invitation.sharedInstance.crisisAlertMessage["title"]{
                
                self.emergencyAlertMessageTextField.stringValue = emTitle
                self.alertHeight.constant = self.findHeight(text: emTitle)
            }
            
            if let title = Invitation.sharedInstance.crisisAlertMessage["AgencyName"]{
                self.showReverseAlertTitle(title: title)
            }
            
        }else{
            if let emTitle = Invitation.sharedInstance.crisisAlertMessage["title"]{
                
                 self.emergencyAlertMessageTextField.stringValue = emTitle
                 self.alertHeight.constant = self.findHeight(text: emTitle)
            }
            
            if let title = Invitation.sharedInstance.crisisAlertMessage["organizationName"] {
                self.showAlertTitle(title: title)
            }
        }
        
        
        
        if let emTime = Invitation.sharedInstance.crisisAlertMessage["time"]{
            self.emergencyAlertTimeStamp.stringValue = emTime
        }
        
        if Invitation.sharedInstance.crisisAlertMessage["mode"]?.lowercased() != Config.Alert.testTriggerString {

            self.emergencyAlertBackgroundTextField.wantsLayer = true
            self.emergencyAlertBackgroundTextField.layer?.backgroundColor = ColorCode.redColor.cgColor
            
            self.emergencyAlertImageView.image = NSImage(named:"NSCautionRed")
            
            self.emergencyAlertTitleTextField.textColor = ColorCode.redcolWithAlpha
        }
        
        self.lineView.wantsLayer = true
        self.lineView.layer?.backgroundColor = ColorCode.lightBluelineColor
        
        self.inputTextBackgroundView.wantsLayer = true
        self.inputTextBackgroundView.layer?.backgroundColor = ColorCode.messageTextFieldBackroundColor
        self.inputTextBackgroundView.layer?.cornerRadius = 5.0
        self.stanzaTextView.drawsBackground = true
        self.stanzaTextView.backgroundColor = ColorCode.messageTextFieldColor
        
        
        stanzaTableView.dataSource = self
        stanzaTableView.delegate = self
        chatView.wantsLayer = true
        
        
        NotificationCenter.default.addObserver(self, selector: #selector(ChatWindowController.onMessageCountChange(_:)), name: NSNotification.Name("onMessageCountChange"), object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(ChatWindowController.stateChange(aNotification:)), name: NSNotification.Name("onStateChange"), object: nil)
        
        NotificationCenter.default.addObserver(self, selector: #selector(ChatWindowController.onAlertReceive(aNotification:)), name: NSNotification.Name("onAlertReceive"), object: nil)
        
        
        if Messenger.sharedInstance.messages.count > 0 {
            DispatchQueue.main.async(execute: {
                self.scrollToTableBottom()
            })
        }
        
        
        // - - -  End  - - -
        
        // Chat User View
        self.chatUserView.layer?.backgroundColor = ColorCode.lightBlueColor
        self.userTableView.dataSource = self
        self.userTableView.delegate = self
        
         Messenger.sharedInstance.messengerDelegate?.addDelegate(self)
        self.showAndHideLoaderView(isHidden:false)
        
        

    }

    //MARK: * * * XMPP Delegate * * *
    
    func onMessageCountChange(_ aNotification: Notification) {
        DispatchQueue.main.async(execute: {
            self.stanzaTableView.reloadData()
            self.scrollToTableBottom()
        })
    }
    
    func stateChange(aNotification: Notification) {
        let notification = aNotification.object as! NSDictionary
        let state = notification["state"]
        let user = notification["user"]
        let stateStr = (state as! String).lowercased()
        
        if (stateStr == "composing") {
            let user = user as! String
            if self.messageTypedBy.contains(user) {
                return
            }
            
            self.messageTypedBy.append(user)
        } else if (stateStr == "paused") {
            self.messageTypedBy = self.messageTypedBy.filter {
                return $0 != user as! String
            }
        }
        
        if !self.messageTypedBy.isEmpty {
            let currentBuddyTypingCount = self.messageTypedBy.count
            let indicatorMessage: String?
            
            if currentBuddyTypingCount > 1 {
                let other = currentBuddyTypingCount - 1 == 1 ? "other" : "others"
                indicatorMessage = "\(self.messageTypedBy[currentBuddyTypingCount - 1]) and \(currentBuddyTypingCount - 1) \(other) are typing..."
            } else {
                indicatorMessage = "\(self.messageTypedBy[currentBuddyTypingCount-1]) is typing..."
            }
            
            self.chatStatusTextField.stringValue = indicatorMessage!
        } else {
            self.chatStatusTextField.stringValue = ""
        }
    }
    
    func onAlertReceive(aNotification : Notification) {
        self.emergencyAlertView.isHidden = false
        let notification = aNotification.object as! NSDictionary
         self.emergencyAlertMessageTextField.stringValue = (notification["message"] as? String)!
        self.alertHeight.constant = self.findHeight(text: (notification["message"] as? String)!)
        self.emergencyAlertTimeStamp.stringValue = notification["time"] as! String
    }

    
    //MARK: * * * Messenger Delegates * * *
    
    func onRoomStateUpdate() {
        
        
    }
    
    func onMemberListModified() {
        DispatchQueue.main.async(execute: {
            self.userTableView.reloadData()
        })
    }
    
    func onStateChange(user: AnyObject, state: AnyObject) {
        NotificationCenter.default.post(name: NSNotification.Name("onStateChange"), object: ["user": user, "state": state])
    }
    
    func onMessageCountChange() {
        NotificationCenter.default.post(name: NSNotification.Name("onMessageCountChange"), object: nil)
    }
    
    func onBuddyDone() {
        DDLogInfo("onBuddyDone")
    }
    
    func onBuddyOnline() {
        DDLogInfo("onBuddyOnline")
    }
    
    func onBuddyPaused() {
        DDLogInfo("onBuddyPaused")
    }
    
    func onBuddyTyping() {
        DDLogInfo("onBuddyTyping")
    }
    
    func onBuddyWentOffline() {
        DDLogInfo("onBuddyWentOffline")
    }
    
    func onMessengerConnected() {
        DDLogInfo("onMessengerConnected")
    }
    
    func onMessengerConnecting() {
        DDLogInfo("onMessengerConnecting")
    }
    
    func onConnectionStateChange() {
        DDLogInfo("onConnectionStateChange")
    }
    
    func onMessengerDisconnected() {
        DDLogInfo("onMessengerDisconnected")
    }
    
    // MARK: * * * Window delegates * * *
    func windowShouldClose(_ sender: Any) -> Bool {
        self.window?.level = Int(CGWindowLevelForKey(.floatingWindow))
        let myPopup: NSAlert = NSAlert()
        myPopup.messageText = Portal.alertTitle
        myPopup.informativeText = Portal.alertDescription
        myPopup.alertStyle = NSAlertStyle.informational
        myPopup.addButton(withTitle: "Yes")
        myPopup.addButton(withTitle: "No")
        let result = myPopup.runModal()
        
        if result == NSAlertFirstButtonReturn {
            self.destroyMessenger()
            isChatInProgress = false
            return true
        } else {
            return false
        }
    }
    
    private func destroyMessenger() {
        let hasLaunchedKey = "HasChatLaunched"
        let defaults = UserDefaults.standard
        defaults.set(false, forKey: hasLaunchedKey)

        Messenger.sharedInstance.leaveRoom()
        Messenger.sharedInstance.isDirty = false
        
    }
    
    //MARK: Custome Function 
    func findHeight(text:String) -> CGFloat {
        let string : String = text
        let someWidth: CGFloat = self.emergencyAlertView.frame.size.width - 260.0
        let font:NSFont = NSFont(name: "Avenir-Book", size: 13.0)!
        let stringAttributes = [NSFontAttributeName: font]
        let attrString: NSAttributedString = NSAttributedString(string: string, attributes: stringAttributes)
        let frame: NSRect = NSMakeRect(0, 0, someWidth, CGFloat.greatestFiniteMagnitude)
        let tv: NSTextView = NSTextView(frame: frame)
        tv.textStorage?.setAttributedString(attrString)
        tv.isHorizontallyResizable = false
        tv.sizeToFit()
        let height: CGFloat  = tv.frame.size.height + 50.0
        return height
    }

}
