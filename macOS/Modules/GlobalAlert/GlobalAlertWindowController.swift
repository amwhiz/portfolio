//
//  GlobalAlert.swift
//  COPsync911
//
//  Created by Shaul Hameed on 10/30/16.
//  Copyright © 2016 COPsync911, Inc. All rights reserved.
//
import Cocoa
import AVFoundation

@objc protocol GlobalAlertDelegate{
    
    @objc func alertAccepted()
    @objc func alertClosed()
}



class GlobalAlertWindowController: NSWindowController, NSWindowDelegate {
    
    var delegate: GlobalAlertDelegate?
    
    @IBOutlet weak var titleViewLabel: NSTextField!
    @IBOutlet weak var cautionImage: NSImageView!
    @IBOutlet weak var detailsViewLabel: NSTextField!
    
    var alertDetail: NSDictionary?
    var crisisAlertSound: AVAudioPlayer!
    
    override func windowDidLoad() {
        super.windowDidLoad()
        self.window?.backgroundColor = NSColor.white
        alertDetail = GlobalAlertHelper.sharedInstance.alertDetail
        
        if NotificationHelper.isAudibleAlertEnabled() {
            let path = Bundle.main.path(forResource: "notify.wav", ofType:nil)!
            let url = URL(fileURLWithPath: path)
            
            do {
                let sound = try AVAudioPlayer(contentsOf: url)
                crisisAlertSound = sound
                sound.play()
            } catch {
                // couldn't load file :(
            }
        }
        
        isAlertReceived = true
        self.showAlertdetails()
    }
    
    @IBAction func joinButtonTapped(_ sender: AnyObject) {
        
        let alertType = alertDetail?["Type"] as! String
        
        if alertType == Config.Alert.reverseAlert {
            DDLogInfo("[ALERT] User accepted reverse alert")
        }else {
            DDLogInfo("[ALERT] User accepted join alert")
        }
        
        isAlertReceived = false
        self.stop()
        self.delegate?.alertAccepted()
        self.window?.performClose(self)
    }
    
    
    @IBAction func cancelButtonTapped(_ sender: AnyObject) {
        isAlertReceived = false
        let alertType = alertDetail?["Type"] as! String
        if alertType == Config.Alert.reverseAlert {
            DDLogInfo("[ALERT] User declined reverse alert")
        }else {
            DDLogInfo("[ALERT] User declined alert")
        }
        self.stop()
        self.window?.performClose(self)
        self.delegate?.alertClosed()
    }
    
    func stop() {
        if crisisAlertSound != nil {
            crisisAlertSound.stop()
        }
    }
    
    func showAlertdetails() {
        let alertType = alertDetail?["Type"] as! String
        let titleMode = alertDetail?["Mode"] as! String
        
        if alertType == Config.Alert.reverseAlert {
            
            self.window?.title = Config.Alert.testTrigger
            self.titleViewLabel.stringValue = "Officer " + (alertDetail?["AlertSourceLocation"] as! String) + " has sent an alert"
            self.detailsViewLabel.stringValue = alertDetail?["AlertMessageFormat"] as! String
            
        }else {
            
            self.window?.title = Config.Alert.normalTrigger
            if let emTitle = Invitation.sharedInstance.crisisAlertMessage["title"]{
                self.detailsViewLabel.stringValue = emTitle
            }
            self.titleViewLabel.stringValue = Config.Alert.detailTitle
        }
           
        if titleMode.lowercased() == Config.Alert.testTriggerString {
            self.cautionImage.image = NSImage(named:"NSCaution")
        } else {
            self.cautionImage.image = NSImage(named:"NSCautionRed")
        }
    }
    
    func windowShouldClose(_ sender: Any) -> Bool {
        isAlertReceived = false
        return true
    }
}
