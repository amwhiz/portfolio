//
//  LoginView.swift
//  COPsync911
//
//  Created by aj on 25/09/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class LoginView: NSView {
    // MARK: - Properties
    @IBOutlet weak var usernameTextField: NSTextField!
    @IBOutlet weak var passwordSecureTextField: NSSecureTextField!
    @IBOutlet weak var loginProgressIndicator: NSProgressIndicator!
    @IBOutlet weak var forgotPasswordTextField: ForgotPasswordCustomTextField!
    @IBOutlet weak var agreementView: NSView!
    @IBOutlet weak var loginView: NSView!
    @IBOutlet var agreementTextView: NSTextView!
    @IBOutlet weak var loginBackgroundImageView: NSImageView!
    @IBOutlet weak var loginButton: NSButton!
    
    
    
    // MARK: - Instance methods
    override func draw(_ dirtyRect: NSRect) {
        super.draw(dirtyRect)

        // Drawing code here.
    }
    
    override func awakeFromNib() {
        super.awakeFromNib()
        self.wantsLayer = true
        self.layer?.backgroundColor = Color.white
//        self.agreementStringValue()
        
//        self.forgotPasswordTextField.attributedStringValue = ForgotPassword.passwordText.link(url: ForgotPassword.url)
//        self.forgotPasswordTextField.addCursorRect(forgotPasswordTextField.bounds, cursor: NSCursor.openHand())
    }
    
    // MARK: - View methods
    func agreementStringValue() {
        // Agrement Attributed String
        
        let string: String = Config.Agree.agreeStringValue
        var mutableString = NSMutableAttributedString()
        
        
        mutableString = NSMutableAttributedString(string: string, attributes:[NSFontAttributeName:NSFont(name: "Avenir Book", size: 18.0)!])
        mutableString.addAttribute(NSFontAttributeName, value: NSFont(name: "Avenir Black",
                                                                      size: 16.0)!, range: NSRange(location: 0, length: 10))
        mutableString.addAttribute(NSForegroundColorAttributeName,
                                   value: NSColor.darkGray,range: NSRange(location:0,length:Config.Agree.agreeStringValue.characters.count))
        mutableString.addAttribute(NSForegroundColorAttributeName,
                                   value: NSColor.black,range: NSRange(location:0,length:12))
        self.agreementTextView.textStorage?.setAttributedString(mutableString)
    }
}
