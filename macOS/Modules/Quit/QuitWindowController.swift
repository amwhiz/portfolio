//
//  QuitWindowController.swift
//  COPsync911
//
//  Created by aj on 24/10/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class QuitWindowController: NSWindowController, NSWindowDelegate {
    
    @IBOutlet weak var usernameTextField: NSTextField!
    @IBOutlet weak var passwordTextField: NSTextField!
    @IBOutlet weak var okButton: NSButton!
    @IBOutlet weak var forgotPasswordTextField: ForgotPasswordCustomTextField!
    
    var isCancel = false

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
        
        terminateFromTaskBar = true
        
        DispatchLevel.userInitiated.dispatchQueue.async {
            IdentityApiClient()
                .checkIdentiryIsAllowToQuit(username: self.usernameTextField.stringValue, password: self.passwordTextField.stringValue)
                .always {
                    DispatchLevel.main.dispatchQueue.async {
                        self.okButton.isEnabled = !self.okButton.isEnabled
                    }
                }
                .then { status -> Void in
                    if status {
                        self.terminateAppByOrgAdmin()
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
    
    func terminateAppByOrgAdmin() {
        Messenger.sharedInstance.disconnect()
        Messenger.sharedInstance.isDirty = false
        if terminateFromDockMenu {
            NSApplication.shared().reply(toApplicationShouldTerminate: true)
        } else {
            NSApplication.shared().terminate(nil)
        }
    }
    
    @IBAction func cancelAction(_ sender: AnyObject) {
        isCancel = true
        if terminateFromDockMenu {
            NSApplication.shared().reply(toApplicationShouldTerminate: false)
        }
        
        self.window?.performClose(self)
    }
    
    // MARK: * * * Window delegates * * *
    func windowShouldClose(_ sender: Any) -> Bool {
        terminateFromTaskBar = false
        if terminateFromDockMenu && !isCancel {
            NSApplication.shared().reply(toApplicationShouldTerminate: true)
        } else {
            NSApplication.shared().reply(toApplicationShouldTerminate: false)
        }
        
        return true
    }
}
