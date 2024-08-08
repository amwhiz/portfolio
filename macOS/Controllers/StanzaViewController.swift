//
//  StanzaViewController.swift
//  COPsync911
//
//  Created by aj on 13/07/16.
//  Copyright © 2016 copsync. All rights reserved.
//

import Cocoa

protocol LoaderDelegate {
    func xmppConnectionStatus(status: String)
}

class StanzaViewController: NSViewController, NSTableViewDataSource, NSTableViewDelegate {
    
    @IBOutlet weak var chatStatusTextField: NSTextField!
    @IBOutlet weak var stanzaTypeMessageView: NSView!
    @IBOutlet weak var chatView: NSView!
    @IBOutlet var stanzaTextView: StanzaTextView!
    @IBOutlet weak var stanzaTableView: NSTableView!
    @IBOutlet weak var inputTextBackgroundView: NSView!
    @IBOutlet weak var lineView: NSView!
   
    @IBOutlet weak var emergencyAlertView: NSView!
    
    @IBOutlet weak var emergencyAlertImageView: NSImageView!
    
    @IBOutlet weak var emergencyAlertTitleTextField: NSTextField!
    
     @IBOutlet weak var emergencyAlertMessageBox: NSTextField!
    
     @IBOutlet weak var emergencyAlertTimeStamp: NSTextField!
    
    @IBOutlet weak var emergencyAlertBackgroundTextField: NSTextField!
    
   
   
    
    
    
    
    var messageTypedBy: [String] = [String]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        
        self.emergencyAlertView.wantsLayer = true
        self.emergencyAlertView.layer?.backgroundColor = NSColor.clear.cgColor
      
    
        self.emergencyAlertBackgroundTextField.wantsLayer = true
        self.emergencyAlertBackgroundTextField.layer?.backgroundColor = ColorCode.yellowColor
        
        if self.isTestMode() {
           
            self.emergencyAlertBackgroundTextField.wantsLayer = true
            self.emergencyAlertBackgroundTextField.layer?.backgroundColor = ColorCode.redColor
            
            self.emergencyAlertImageView.image = NSImage(named:"NSCautionRed")
            
            self.emergencyAlertTitleTextField.textColor = ColorCode.redcolWithAlpha
        }

        stanzaTableView.dataSource = self
        stanzaTableView.delegate = self
        chatView.wantsLayer = true
        self.chatView.layer?.backgroundColor = NSColor.white.cgColor
        
        self.stanzaTypeMessageView.wantsLayer = true
        self.stanzaTypeMessageView.layer?.backgroundColor = NSColor.white.cgColor
        
        self.lineView.wantsLayer = true
        self.lineView.layer?.backgroundColor = NSColor(red: 235.0 / 255.0, green: 239.0 / 255.0, blue: 240.0 / 255.0, alpha: 1.0).cgColor
        
        self.inputTextBackgroundView.wantsLayer = true
        self.inputTextBackgroundView.layer?.backgroundColor = NSColor(red: 211.0 / 255.0, green: 224.0 / 255.0, blue: 229.0 / 255.0, alpha: 1.0).cgColor
        self.inputTextBackgroundView.layer?.cornerRadius = 5.0
        self.stanzaTextView.drawsBackground = true
        self.stanzaTextView.backgroundColor = NSColor(red: 211.0 / 255.0, green: 224.0 / 255.0, blue: 229.0 / 255.0, alpha: 1.0)
        
        NotificationCenter.default.addObserver(self, selector: #selector(StanzaViewController.onMessageCountChange(_:)), name: NSNotification.Name("onMessageCountChange"), object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(StanzaViewController.stateChange(aNotification:)), name: NSNotification.Name("onStateChange"), object: nil)
        
        NotificationCenter.default.addObserver(self, selector: #selector(StanzaViewController.onAlertReceive(aNotification:)), name: NSNotification.Name("onAlertReceive"), object: nil)
        
        
        if Messenger.sharedInstance.messages.count > 0 {
            DispatchQueue.main.async(execute: {
                self.scrollToTableBottom()
            })
        }
        
        self.showAlertTitle()
    }
    
    //MARK: * * *NSTableViewDataSorce * * *
    func numberOfRows(in tableView: NSTableView) -> Int {
        return Messenger.sharedInstance.messages.count
    }

    func tableView(_ tableView: NSTableView, shouldSelectRow row: Int) -> Bool {
        return false
    }
    
    func tableView(_ tableView: NSTableView, heightOfRow row: Int) -> CGFloat {
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
        debugPrint("row height", row, "- -", height, "width- -", tv.frame.size.width)
        return height
    }
    
    
    func tableView(_ tableView: NSTableView, viewFor tableColumn: NSTableColumn?, row: Int) -> NSView? {
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
    
    func findWidthAndheightBasedOnText(string :String) -> CGSize {
        let someWidth: CGFloat = (self.stanzaTableView.frame.size.width - 100.0)
        let stringAttributes = [NSFontAttributeName: NSFont.systemFont(ofSize: 16)]
        let attrString: NSAttributedString = NSAttributedString(string: string, attributes: stringAttributes)
        let frame: NSRect = NSMakeRect(0, 0, someWidth, CGFloat.greatestFiniteMagnitude)
        let tv: NSTextView = NSTextView(frame: frame)
        tv.textStorage?.setAttributedString(attrString)
        tv.isHorizontallyResizable = false
        tv.sizeToFit()
        let size: CGSize = CGSize(width:tv.frame.size.width, height:(tv.frame.size.height + 30))
        return size
    }
    
    func scrollToTableBottom() {
        self.stanzaTableView.scrollRowToVisible(Messenger.sharedInstance.messages.count - 1)
    }
    
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
        self.emergencyAlertMessageBox.stringValue = notification["message"] as! String
        self.emergencyAlertTimeStamp.stringValue = notification["time"] as! String
    }
    
    func sendStanza() {
        let trimmedText = self.stanzaTextView.string?.trimmingCharacters(in: NSCharacterSet.whitespacesAndNewlines)
        
        if (trimmedText == nil || (trimmedText?.characters.count)! < 1) {
            return
        }
        
        _ = Messenger.sharedInstance.append(textToBeSent: trimmedText!)
        
        self.stanzaTextView.string = ""
        
        Messenger.sharedInstance.isDirty = true
    }
    
    func showAlertTitle() {
        let title = User.sharedInstance.currentUser.organizationName! as String
        self.emergencyAlertTitleTextField.stringValue = "\(title) has an emergency and needs assistance."
    }
    
    func isTestMode() -> Bool {
        let deviceResponse: NSData? = UserDefaults.standard.object(forKey: UserSettings.chatCredentials) as? NSData
        var response: NSDictionary?
        if deviceResponse != nil {
            response = NSKeyedUnarchiver.unarchiveObject(with: deviceResponse as! Data) as? NSDictionary
        }
        
        if response != nil {
            let currentLocation = response?.object(forKey: "CurrentLocation") as? NSDictionary
            if currentLocation != nil {
                let location = currentLocation?.object(forKey: "Location") as? NSDictionary
                
                if location != nil {
                    let mode = location?.object(forKey: "TestMode") as? Bool
                    
                    if mode != nil {
                        return mode!
                    }
                }
            }
        }
        
        return false
    }
}
