//
//  NavbarView.swift
//  COPsync911
//
//  Created by aj on 10/07/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class NavbarView: NSView {

    @IBOutlet var toolbarView: NSView!
    @IBOutlet weak var profileCustomView: NSView!
    @IBOutlet weak var profileNameTextField: NSTextField!
    @IBOutlet weak var appTitleTextField: NSTextField!
    
    @IBOutlet weak var profileNameHeight: NSLayoutConstraint!
    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        
        Bundle.main.loadNibNamed("NavbarView", owner: self, topLevelObjects: nil)
        
        let contentFrame = NSMakeRect(0, 0, self.frame.size.width, self.frame.size.height)
        self.toolbarView.frame = contentFrame
        self.addSubview(self.toolbarView)
    }
    
    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)
        
        self.wantsLayer = true
        self.layer?.backgroundColor = NSColor.init(red: 95.0/255.0, green: 105.0/255.0, blue: 113.0/255.0, alpha: 1.0).cgColor
        
        self.profileCustomView.wantsLayer = true
        self.profileCustomView.layer?.backgroundColor = NSColor.init(red: 21.0/255.0, green: 164.0/255.0, blue: 250.0/255.0, alpha: 1.0).cgColor
        
        self.showProfile()
    }
    
    func showAndHideViews(isHidden: Bool)  {
        self.profileCustomView.isHidden = isHidden
    }
    
    func showProfile() {
        let deviceResponse: NSData? = UserDefaults.standard.object(forKey: UserSettings.chatCredentials) as? NSData
        var response: NSDictionary?
        if deviceResponse != nil {
            response = NSKeyedUnarchiver.unarchiveObject(with: deviceResponse as! Data) as? NSDictionary
        }
        
        if response != nil {
            let location = response?.object(forKey: "CurrentLocation") as? NSDictionary
            
            if location != nil {
                
                profileNameHeight.constant = findHeight(text:location?.object(forKey: "Name") as? String ?? "")
                self.profileNameTextField.stringValue = location?.object(forKey: "Name") as? String ?? ""
            }
        }
        
        
        self.appTitleTextField.stringValue = self.getAppname()
    }
    
    //MARK: Custome Function
    func findHeight(text:String) -> CGFloat {
        let string : String = text
        let someWidth: CGFloat = self.profileNameTextField.frame.size.width
        let font:NSFont = NSFont.systemFont(ofSize: 13.0)
        let stringAttributes = [NSFontAttributeName: font]
        let attrString: NSAttributedString = NSAttributedString(string: string, attributes: stringAttributes)
        let frame: NSRect = NSMakeRect(0, 0, someWidth, CGFloat.greatestFiniteMagnitude)
        let tv: NSTextView = NSTextView(frame: frame)
        tv.textStorage?.setAttributedString(attrString)
        tv.isHorizontallyResizable = false
        tv.sizeToFit()
        let height: CGFloat  = tv.frame.size.height + 5.0
        return height
    }
    
    func getAppname() -> String {
        let info = Bundle.main.infoDictionary
        var title = "COPsync911"
        if info != nil {
            let bundleTitle = info?["CFBundleName"] as! String
            let shortVersion = info?["CFBundleShortVersionString"] as! String
            title = "\(bundleTitle) (v\(shortVersion))"
        }
        
        return title
    }
}
