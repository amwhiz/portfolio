//
//  SendAlertWindowController.swift
//  COPsync911
//
//  Created by Ulaganathan on 24/10/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa
import MapKit
import CoreLocation

class SendAlertWindowController: NSWindowController, NSWindowDelegate {

    @IBOutlet weak var navbarView: NavbarView!
    @IBOutlet weak var timerTextField: NSTextField!
    @IBOutlet weak var sendAlertButton: NSButton!
    
    var count = 0xF
    var clock: Timer = Timer()
    var locationManager: CLLocationManager?
    
    override func windowDidLoad() {
        super.windowDidLoad()
        isAlertInProgress = true
        self.window?.backgroundColor =  NSColor.white
        clock = Timer.scheduledTimer(timeInterval: 1.0, target: self, selector: #selector(SendAlertWindowController.updateTimer(timer:)), userInfo: nil, repeats: true)
        
    }
    
    override func awakeFromNib() {
        self.navbarView.showAndHideViews(isHidden: true)
    }
    
    override func windowWillLoad() {
        if CLLocationManager.locationServicesEnabled() {
            locationManager = CLLocationManager()
            locationManager?.distanceFilter = kCLDistanceFilterNone
            locationManager?.desiredAccuracy = kCLLocationAccuracyHundredMeters
            locationManager?.startUpdatingLocation()
        }
    }
    
    func updateTimer(timer: Timer) {
        if(count >= 1) {
            count -= 1
            if count < 6 {
                let sec = String(count)
                self.timerTextField.stringValue = sec.characters.count == 1 ? "0" + sec : sec
                self.timerTextField.textColor = NSColor.init(red: 255.0 / 255.0,
                                                                           green: 0 / 255.0,
                                                                           blue: 0 / 255.0,
                                                                           alpha: 1.0)
            } else {
                let sec = String(count)
                self.timerTextField.stringValue = sec.characters.count == 1 ? "0" + sec : sec
            }
        } else {
            timer.invalidate()
            DDLogInfo("alert triggered automatically after the timer")
            if ((ServiceCheckHelper.sharedInstance.state?.isDSPOnline())! && (ServiceCheckHelper.sharedInstance.state?.isIMOnline())!){
                
                self.sendEmergencyAlert()
            }
            else{
                
                NotificationHelper.showDefault(title: "Please call 9-1-1", informativeText: .IssueSendingAlert)
                self.closeWindow()
            }

         
        }
    }
    
    @IBAction func dismissAlert(_ sender: AnyObject) {
        clock.invalidate()
        isAlertInProgress = false
        Invitation.sharedInstance.clearQueue()
        self.closeWindow()
    }
    @IBAction func sendAlert(_ sender: AnyObject) {
        clock.invalidate()
        DDLogInfo("user initiated the alert when the timer count was \(self.timerTextField.stringValue)")
        if ((ServiceCheckHelper.sharedInstance.state?.isDSPOnline())! && (ServiceCheckHelper.sharedInstance.state?.isIMOnline())!){
            
            self.sendEmergencyAlert()
        }
        else{
            
            NotificationHelper.showDefault(title: "Please call 9-1-1", informativeText: .IssueSendingAlert)
            isAlertInProgress = false
            self.closeWindow()
        }
        
    }
    
    // MARK: - Window delegates
    func windowShouldClose(_ sender: Any) -> Bool {
        locationManager?.stopUpdatingLocation()
        isAlertInProgress = false
        clock.invalidate()
        return true
    }
}

extension SendAlertWindowController {
    
    func sendEmergencyAlert() {
        DDLogInfo("send emergency alert")
        alertTriggeredByUser = NSUserName()
        var payload = [
            "Latitude": "",
            "Longitude": ""
        ] as [String: String]
        
        let servicesState = ServiceCheckHelper.sharedInstance.state?.status
        let isIMOnline = ServiceCheckHelper.sharedInstance.state?.isIMOnline()
        
        let isDSPOnline = ServiceCheckHelper.sharedInstance.state?.isDSPOnline()
        if(servicesState == .Offline || !isIMOnline! || !isDSPOnline!){
            
            let errorMessage = DataonixError.sharedInstance.userReadableErrorMessage(errorCode: 401)
            AlertHelper.showAlert(question: errorMessage["title"]!, text: errorMessage["message"]!)
            self.closeWindow()
            isAlertInProgress = false
            self.sendAlertButton.isEnabled = !self.sendAlertButton.isEnabled
            
            return
            
        }
        

        if ((locationManager?.location?.coordinate) != nil) {
            payload = [
                "Latitude": String(format: "%.15f", (locationManager?.location?.coordinate.latitude)!),
                "Longitude": String(format: "%.15f", (locationManager?.location?.coordinate.longitude)!)
            ]
        }
        
        locationManager?.stopUpdatingLocation()
        self.sendAlertButton.isEnabled = !self.sendAlertButton.isEnabled
        
        DispatchLevel.userInitiated.dispatchQueue.async {
            AlertsApiClient()
                .sendAlert(payload: payload)
                .always {
                    self.sendAlertButton.isEnabled = !self.sendAlertButton.isEnabled
                }
                .then { data in
                    self.closeWindow()
                }
                .catch { error in
                    switch error {
                    case SendAlertError.officerOffline:
                        let errorMessage = DataonixError.sharedInstance.userReadableErrorMessage(errorCode: 400)
                        AlertHelper.showAlert(question: errorMessage["title"]!, text: errorMessage["message"]!)
                        self.sendAlertButton.isEnabled = !self.sendAlertButton.isEnabled
                        isAlertInProgress = false
                        self.closeWindow()
                    case NetworkError.unreachable:
                        let errorMessage = DataonixError.sharedInstance.userReadableErrorMessage(errorCode: 401)
                        AlertHelper.showAlert(question: errorMessage["title"]!, text: errorMessage["message"]!)
                        self.sendAlertButton.isEnabled = !self.sendAlertButton.isEnabled
                        isAlertInProgress = false
                        self.closeWindow()
                    default:
                        DDLogInfo("[ALERT] case not found")
                        DDLogError("\(error)")
                    }
            }
        }
    }
    
    func closeWindow() {
        self.window?.performClose(self)
    }
    
}

