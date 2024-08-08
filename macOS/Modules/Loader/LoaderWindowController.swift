//
//  LoaderWindowController.swift
//  COPsync911
//
//  Created by Ulaganathan on 24/10/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa
import PromiseKit
import Alamofire

var sendAlertInProgress = false

class LoaderWindowController: NSWindowController, MessengerDelegate {
    
    lazy var sendAlertWindowController: NSWindowController? = SendAlertWindowController(windowNibName: "SendAlertWindowController") as NSWindowController
    
    @IBOutlet weak var processMessage: NSTextField!
    
    var isServiceActive: Bool? = nil

    override func windowDidLoad() {
        super.windowDidLoad()
        self.window?.backgroundColor =  NSColor.white
        self.isServicesOnline()
        
        Messenger.sharedInstance.messengerDelegate?.addDelegate(self)
    }
    
    func isServicesOnline() {
        sendAlertInProgress = true
        
        self.getServicesStatusAPI().then {
            deviceStatus -> Void in
            
            if (!(deviceStatus as! (Bool))){
                AlertHelper.showAlert(question: NetworkError.unreachable.rawValue, text: Dataonix.ErrorMessageText.alert)
                self.closeWindow()
            }
            else{
                DeviceApiClient()
                    .isCurrentDeviceActive().then{
                    device -> Void in
                    
                    let deviceDict: NSDictionary = device as! NSDictionary
                    let isDeviceActive:Bool = (deviceDict["IsActive"] as! Int == 1)
                    
                    if (!isDeviceActive){
                        AlertHelper.showAlert(question: NetworkError.unreachable.rawValue, text: Dataonix.ErrorMessageText.alert)
                        self.closeWindow()
                    }
                    else{
                        self.showSendAlert()
                    }
                    
                    }.catch {
                        error in
                        self.closeWindow()
                    DDLogError("\(error)")
                }

            }
        }.catch {
                error in
                AlertHelper.showAlert(question: NetworkError.unreachable.rawValue, text: Dataonix.ErrorMessageText.alert)
                self.closeWindow()
                DDLogError("\(error)")
        }

    }
    
    func showSendAlert() {
        self.closeWindow()
        self.sendAlertWindowController = nil
        
        if self.sendAlertWindowController == nil {
            self.sendAlertWindowController = SendAlertWindowController(windowNibName: "SendAlertWindowController") as NSWindowController
        }
        
        self.sendAlertWindowController?.window?.level = Int(CGWindowLevelForKey(.floatingWindow)) - 1
        self.sendAlertWindowController?.showWindow(self)
    }
    
    func closeWindow() {
        self.window?.performClose(self)
        isAlertInProgress = false
    }
    
    
    
    
    func getServicesStatusAPI() -> Promise<Any> {
        
        let reqUrl = EnvironmentHelper.sharedInstance.get(key: "STATUS_CHECK")
        
        return Promise { fulfill, reject in
            Alamofire.request(reqUrl!, method: .get, parameters: ["":""], encoding: URLEncoding.default, headers: nil).responseJSON { (response: DataResponse<Any>) in
                switch(response.result) {
                case .success(_):
                    if let data = response.result.value {
                        let dataAsDictionary = data as! NSDictionary
                        if let status = dataAsDictionary["status"] {
                            if((status as! String) == "Online") {
                                if let subsystem = dataAsDictionary["subsystems"] as? NSArray {
                                    var isDspOnline = false
                                    var isIMOnline = false
                                    
                                    for(_, system) in subsystem.enumerated(){
                                        
                                        let subSystemNode = system as! NSDictionary
                                        
                                        let name =  subSystemNode["name"]
                                        
                                        if let status = subSystemNode["status"]{
                                            if (status as! String) == "Online"{
                                                switch (name as! String){
                                                case "DSP":
                                                    isDspOnline = true
                                                    break
                                                case "IM-NONPROD01",
                                                    "IM-WUS-PROD01":
                                                    isIMOnline = true
                                                    break
                                                default:
                                                    break
                                                }
                                            }
                                        }
                                    }
                                    
                                    fulfill(isDspOnline && isIMOnline)
                                }
                                else{
                                    fulfill(false)
                                }
                            }else{
                                fulfill(false)
                            }
                            
                        }else{
                            
                            fulfill(false)
                            
                        }
                    }
                    
                    break
                case .failure(_):
                    fulfill(false)
                    break
                }
            }
        }
    }
}
