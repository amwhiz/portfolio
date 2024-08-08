//
//  LoginWindowController.swift
//  COPsync911
//
//  Created by aj on 23/10/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class LoginWindowController: NSWindowController,NSWindowDelegate {
    
    lazy var deviceRegistrationWindowController = DeviceRegistrationWindowController(windowNibName: "DeviceRegistrationWindowController") as NSWindowController
    
    @IBOutlet weak var navbarView: NavbarView!
    @IBOutlet weak var usernameTextField: NSTextField!
    @IBOutlet weak var passwordSecureTextField: NSSecureTextField!
    @IBOutlet weak var loginProgressIndicator: NSProgressIndicator!
    @IBOutlet weak var forgotPasswordTextField: ForgotPasswordCustomTextField!
    @IBOutlet weak var agreementView: NSView!
    @IBOutlet weak var loginView: NSView!
    @IBOutlet var agreementTextView: NSTextView!
    @IBOutlet weak var loginButton: NSButton!
    var isCloseFromSubmit : Bool = false

    override func windowDidLoad() {
        super.windowDidLoad()
        // Implement this method to handle any initialization after your window controller's window has been loaded from its nib file.
    }
    
    func windowWillClose(_ notification: Notification) {
        if(!isCloseFromSubmit) {
            NSApplication.shared().terminate(nil)
        }
    }
    
    override func awakeFromNib() {
        super.awakeFromNib()
        self.navbarView.showAndHideViews(isHidden: true)
        self.showAndHideAgreeView()
        self.agreementStringValue()
        self.forgotPasswordTextField.attributedStringValue = ForgotPassword.passwordText.link(url: ForgotPassword.url)
        self.forgotPasswordTextField.addCursorRect(forgotPasswordTextField.bounds, cursor: NSCursor.openHand())
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
    
    func showIndicator() {
        loginProgressIndicator.isHidden = false
        loginProgressIndicator.startAnimation(self)
    }
    
    func disableIndicator() {
        loginProgressIndicator.isHidden = true
    }
    
    func showAndHideAgreeView() {
        if UserDefaultsHelper.isUserAcknowledged() {
            DDLogInfo("user already acknowledged, skip acknowledegement and show login")
            self.showAndHideLoginView(ishidden: false)
        } else if !UserDefaultsHelper.isUserAcknowledged() {
            DDLogInfo("user not acknowledged, skip login and show acknowledegement")
            self.window?.backgroundColor =  NSColor.white
            self.showAndHideAgreementView(ishidden: false)
        } else if !UserDefaultsHelper.isDeviceRegistered() {
            DDLogInfo("user device not registered, show login")
            self.showAndHideLoginView(ishidden: false)
        }
    }
    
    func showAndHideLoginView(ishidden: Bool) {
        loginView.isHidden = ishidden
        agreementView.isHidden = !ishidden
    }
    
    func showAndHideAgreementView(ishidden: Bool) {
        loginView.isHidden = !ishidden
        agreementView.isHidden = ishidden
    }
    @IBAction func textFieldAction(_ sender: NSSecureTextField) {
        loginButton.isEnabled = !loginButton.isEnabled
        self.performLogin()
        
    }
    
    @IBAction func loginButton(_ sender: AnyObject) {
        loginButton.isEnabled = !loginButton.isEnabled
        self.performLogin()
    }
    
    @IBAction func agreeAction(_ sender: AnyObject) {
        UserDefaultsHelper.setUserAcknowledged(flag: true)
        self.showAndHideLoginView(ishidden: false)
    }
    
    @IBAction func cancelAgreeAction(_ sender: AnyObject) {
        UserDefaultsHelper.setUserAcknowledged(flag: false)
        exit(0)
    }
    
    func validateLogin() -> Bool {
        var flag = false
        
        if usernameTextField.stringValue.trimmingCharacters(in: .whitespacesAndNewlines) == "" {
            flag = true
        }
        
        if passwordSecureTextField.stringValue.trimmingCharacters(in: .whitespacesAndNewlines) == "" {
            flag = true
        }
        
        return flag
    }
    
    func performLogin() {
        if self.validateLogin() {
            loginButton.isEnabled = !loginButton.isEnabled
            DDLogInfo("form validation failed")
            AlertHelper.showAlert(question: Alert.formValidationTitle, text: DeviceRegistrationError.validationFailed.rawValue)
            
            return
        }
        
        self.showIndicator()
        
        let username = self.usernameTextField.stringValue
        let password = self.passwordSecureTextField.stringValue
        
        DispatchLevel.userInitiated.dispatchQueue.async {
            IdentityApiClient()
                .getCurrentIdentity(username: username,
                                    password: password)
                .then { data -> Void in
                    authData = [username, password]
                    self.processData(data: data)
                }
                .catch { error in
                    DispatchLevel.main.dispatchQueue.async {
                        self.loginButton.isEnabled = true
                        self.disableIndicator()
                    }
                    switch error {
                    case NetworkError.unreachable:
                        AlertHelper.showAlert(question: NetworkError.unreachable.rawValue, text: Dataonix.ErrorMessageText.unreachable)
                    case AuthorizationError.invalidOrg:
                        AlertHelper.showAlert(question: "Unauthorized", text: AuthorizationError.invalidOrg.rawValue)
                    case AuthorizationError.registerDevice:
                        AlertHelper.showAlert(question: "Forbidden", text: AuthorizationError.registerDevice.rawValue)
                    default:
                        DDLogInfo("catch error not found")
                    }
            }
        }
    }
    
    private func processData(data: Bool) {
        DDLogInfo("process login data")
        if data {
            DDLogInfo("login data exists")
            if UserDefaultsHelper.isDeviceRegistered() {
                DispatchLevel.main.dispatchQueue.async {
                    self.loginButton.isEnabled = true
                    self.disableIndicator()
                }
                DDLogInfo("device already registered, show dashboard")
                DataonixApiClient().sendSystemInfo()
                UserDefaults.standard.set(true, forKey: UserSettings.isIdentityLoggedIn)
                self.closeWindow()
            } else {
                self.getDeviceDetailsBySerialNumber()
            }
        } else {
            AlertHelper.showAlert(question: Alert.title, text: Alert.wrong)
        }
    }
    
    private func getDeviceDetailsBySerialNumber() {
        DeviceApiClient()
            .getDeviceDetailByFingerPrint()
            .always {
                DispatchLevel.main.dispatchQueue.async {
                    self.loginButton.isEnabled = true
                    self.disableIndicator()
                }
            }
            .then { data -> Void in
                if data {
                    DataonixApiClient().sendSystemInfo()
                    UserDefaults.standard.set(true, forKey: UserSettings.isIdentityLoggedIn)
                    self.closeWindow()
                } else {
                    UserDefaults.standard.set(true, forKey: UserSettings.isIdentityLoggedIn)
                    DDLogInfo("deivce not yet registered, show device registration")
    
                    self.showDeviceRegistration()
                }
            }
            .catch { error in
                switch error {
                case NetworkError.unreachable:
                    AlertHelper.showAlert(question: NetworkError.unreachable.rawValue, text: Dataonix.ErrorMessageText.unreachable)
                case AuthorizationError.invalidOrg:
                    AlertHelper.showAlert(question: "Unauthorized", text: AuthorizationError.invalidOrg.rawValue)
                case AuthorizationError.registerDevice:
                    AlertHelper.showAlert(question: "Forbidden", text: AuthorizationError.registerDevice.rawValue)
                default:
                    DDLogInfo("catch error not found")
                }
        }
    }
    
    func showDeviceRegistration() {
        self.closeWindow()
        self.deviceRegistrationWindowController.window?.level = Int(CGWindowLevelForKey(.floatingWindow)) - 1
        let app:NSApplication = NSApplication.shared()
        app.activate(ignoringOtherApps: true)
        self.deviceRegistrationWindowController.window?.makeKeyAndOrderFront(self)
        self.deviceRegistrationWindowController.showWindow(self)
    }
    
    func closeWindow() {
        isCloseFromSubmit = true
        self.window?.performClose(self)
    }
    
}
