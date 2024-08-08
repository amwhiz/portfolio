//
//  EmergencyController.swift
//  copsync
//
//  Created by Arul Jothi on 6/26/16.
//  Copyright © 2016 copsync. All rights reserved.
//

import Cocoa

class EmergencyViewController: NSViewController {
    
    var emergencyView: EmergencyView {
        return view as! EmergencyView
    }
    
    var count = 15
    var clock: Timer = Timer()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        clock = Timer.scheduledTimer(timeInterval: 1.0, target: self, selector: #selector(EmergencyViewController.updateTimer(timer:)), userInfo: nil, repeats: true)
    }
    
    @IBAction func dismissAlert(_ sender: AnyObject) {
        clock.invalidate()
        DispatchQueue.main.async(execute: {
            self.performSegue(withIdentifier: Identifiers.showDashboard, sender: nil)
        })
    }
    
    @IBAction func sendAlert(_ sender: AnyObject) {
        clock.invalidate()
        self.sendEmergencyAlert()
    }
    
    override func viewWillLayout() {
    }
    
    override var representedObject: Any? {
        didSet {}
    }
    
    override func viewDidAppear() {
        super.viewDidAppear()
    }
    
    func updateTimer(timer: Timer) {
        if(count >= 1) {
            count -= 1
            if count < 6 {
                let sec = String(count)
                self.emergencyView.timerTextField.stringValue = sec.characters.count == 1 ? "0" + sec : sec
                self.emergencyView.timerTextField.textColor = NSColor.init(red: 255.0 / 255.0,
                                                                           green: 0 / 255.0,
                                                                           blue: 0 / 255.0,
                                                                           alpha: 1.0)
            } else {
                let sec = String(count)
                self.emergencyView.timerTextField.stringValue = sec.characters.count == 1 ? "0" + sec : sec
            }
        } else {
            timer.invalidate()
            self.sendEmergencyAlert()
        }
    }
    
    func performSegueWithIdentifier() {}
}

// MARK:- Send Alert
extension EmergencyViewController {
    
    func sendEmergencyAlert() {
        log.info("send emergency alert")
        self.emergencyView.sendAlertButton.isEnabled = !self.emergencyView.sendAlertButton.isEnabled
        AlertsApiClient()
            .sendAlert()
            .always {
                self.emergencyView.sendAlertButton.isEnabled = !self.emergencyView.sendAlertButton.isEnabled
            }
            .then { data in
                DispatchQueue.main.async(execute: {
                    self.performSegue(withIdentifier: Identifiers.showChat, sender: nil)
                })
            }
            .catch { error in
                switch error {
                case NetworkError.unreachable:
                    AlertHelper.showAlert(question: NetworkError.unreachable.rawValue, text: Dataonix.ErrorMessageText.unreachable)
                default:
                    log.error(error)
                }
        }
        
    }
}
