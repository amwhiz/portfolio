//
//  SettingsLoginWindowController.swift
//  COPsync911
//
//  Created by aj on 24/10/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class SettingsLoginWindowController: NSWindowController {
    
    @IBOutlet weak var usernameTextField: NSTextField!
    @IBOutlet weak var passwordTextField: NSTextField!
    @IBOutlet weak var okButton: NSButton!
    @IBOutlet weak var forgotPasswordTextField: ForgotPasswordCustomTextField!
    
    lazy var changeSettingsWindowController: NSWindowController? = ChangeSettingsWindowController(windowNibName: "ChangeSettingsWindowController") as NSWindowController

    override func windowDidLoad() {
        super.windowDidLoad()
        
        // Implement this method to handle any initialization after your window controller's window has been loaded from its nib file.
        forgotPasswordTextField.attributedStringValue = ForgotPassword.passwordText.link(url: ForgotPassword.url)
        forgotPasswordTextField.addCursorRect(forgotPasswordTextField.bounds, cursor: NSCursor.openHand())
        
    }
    @IBAction func textFieldAction(_ sender: NSSecureTextField) {
        self.performLogin()
        
    }
    @IBAction func okAction(_ sender: AnyObject) {
        self.performLogin()
    }
    
    func validateLogin() -> Bool {
        var flag = false
        
        if usernameTextField.stringValue.trimmingCharacters(in: .whitespacesAndNewlines) == "" {
            flag = true
        }
        
        if passwordTextField.stringValue.trimmingCharacters(in: .whitespacesAndNewlines) == "" {
            flag = true
        }
        
        return flag
    }
    
    
    func performLogin() {
        okButton.isEnabled = !okButton.isEnabled
        
        if self.validateLogin() {
            okButton.isEnabled = !okButton.isEnabled
            DDLogInfo("form validation failed")
            AlertHelper.showAlert(question: Alert.formValidationTitle, text: DeviceRegistrationError.validationFailed.rawValue)
            
            return
        }
        
        DispatchLevel.userInitiated.dispatchQueue.async {
            IdentityApiClient()
                .checkIdentityIsAllowModifySettings(username: self.usernameTextField.stringValue, password: self.passwordTextField.stringValue)
                .always {
                    DispatchLevel.main.dispatchQueue.async {
                        self.okButton.isEnabled = !self.okButton.isEnabled
                    }
                }
                .then { status -> Void in
                    if status {
                        authData = [self.usernameTextField.stringValue, self.passwordTextField.stringValue]
                        self.showSettings()
                    }
                }
                .catch { error in
                    switch error {
                    case NetworkError.unreachable:
                        AlertHelper.showAlert(question: NetworkError.unreachable.rawValue, text: Dataonix.ErrorMessageText.unreachable)
                    case AuthorizationError.invalidOrg:
                        AlertHelper.showAlert(question: "Unauthorized", text: AuthorizationError.invalidOrg.rawValue)
                    case AuthorizationError.orgAdmin:
                        AlertHelper.showAlert(question: "Unauthorized", text: AuthorizationError.orgAdmin.rawValue)
                    default:
                        DDLogInfo("catch not found")
                    }
            }
        }
    }
    
    func showSettings() {
        self.window?.performClose(self)
        
        changeSettingsWindowController = nil
        
        if changeSettingsWindowController == nil {
            changeSettingsWindowController = ChangeSettingsWindowController(windowNibName: "ChangeSettingsWindowController") as NSWindowController
        }
        
        self.changeSettingsWindowController?.window?.level = Int(CGWindowLevelForKey(.floatingWindow)) - 1
        self.changeSettingsWindowController?.showWindow(self)
    }
    
    @IBAction func cancelAction(_ sender: AnyObject) {
        self.window?.performClose(self)
    }
}
