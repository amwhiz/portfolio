//
//  Invitation.swift
//  COPsync911
//
//  Created by Shaul Hameed on 25/10/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation

struct InQueue {

    
    let message: XMPPMessage
    
    init(xmppMessage: XMPPMessage) {
        
        self.message = xmppMessage
    }
    
}

enum InvitationErrorMessage: String, Error{
    
    case QueueFull = "Invitation Queue is full"
    
}

enum EmailStatus:String {
    case Success = "Success"
    case Failed = "Failure"
}

class Invitation: NSObject {
    
    static let sharedInstance = Invitation()
    
    private var Queue:[InQueue] = [InQueue]()
    
    var crisisAlertMessage:[String:String] = [String:String]()
    
    var currentAlertMessage:InQueue?
    
    var currentAlertID: String?
    
    var wasFromPreviousCycle:Bool = false
    
    override init() {
        super.init()
    }
    
    func addToQueue(message: XMPPMessage) throws {
        
        if(!self.isTypeAlert(message: message)) {
            return
        }
        
        if (self.Queue.count == 0) {
            self.Queue.append(InQueue(xmppMessage: message))
        } else {
            self.wasFromPreviousCycle = true
        }
        
        self.processQueue()
    }
    
    
    func clearQueue() {
        // Removes the completed alert.
        self.Queue.removeAll()
        
        self.crisisAlertMessage = [String:String]()
        
        self.currentAlertMessage = nil
        
        self.currentAlertID = nil
        
        self.wasFromPreviousCycle = false
    }
    
   func isTypeAlert(message:XMPPMessage) -> Bool {
        if let alertChildren = message.children{
            
            let data = alertChildren[0] as! XMLElement
            
            let localName = data.localName
            
            return (localName != nil) && (localName == "jsonReason")
        }
        
        return false
    }
    
    private func didInvitationExpire(date: String?) -> Bool{
        if (date == nil) {
            return false
        }
        
        let incomingFormat = "yyyy-MM-dd hh:mm:ss a +ss:ss"
        
        let sourceDateFormatter = DateFormatter()
        
        sourceDateFormatter.dateFormat = incomingFormat
        
        let sourceDate = sourceDateFormatter.date(from: date!)
        
        if sourceDate == nil {
            
            return false
        }
        
        let sourceTimeZone = TimeZone.init(abbreviation: "GMT")
        
        let localTime = TimeZone.current
        
        let sourceGMTOffset = sourceTimeZone?.secondsFromGMT(for: sourceDate!)
    
        let destinationGMTOffset = localTime.secondsFromGMT(for: sourceDate!)
        
        let interval = destinationGMTOffset - sourceGMTOffset!
        
        let destinationDate = NSDate.init(timeInterval: TimeInterval(interval), since: sourceDate!).timeIntervalSince1970
        
        let timenow = NSDate().timeIntervalSince1970
        
        
        return (timenow - destinationDate) > 3600
    }
    
    private func processQueue() {
        let queueEnumerator = self.Queue.enumerated()
        for(_, item) in queueEnumerator {
            self.handleInvitation(invitation: item)
        }
    }
    
    private func handleInvitation(invitation: InQueue) {
        DDLogInfo("IsAlertInProgress: \(isAlertInProgress)")
        DDLogInfo("IsChatInProgress: \(isChatInProgress)")
        
        let alert = invitation.message
        
        DDLogInfo("\(alert)")
        DDLogInfo("------------------------------------")
        DDLogInfo(NSUserName())
        DDLogInfo("Alert Triggered By User: \(alertTriggeredByUser)")
        DDLogInfo("------------------------------------")
        
        if let alertChildren = alert.children{
            
            let data = alertChildren[0] as! XMLElement
            
            let localName = data.localName
            
            if(localName == nil || localName != "jsonReason"){ return }
            
            let value = self.convertStringToDictionary(text: data.stringValue!)
            
            DDLogInfo("\(value)")

            //Checks for the expiration and be done with the expired ones.
            if self.didInvitationExpire(date: value?["RoomCreationDate"] as! String?){
                // failed alert 
                DDLogInfo("[INVITATION] expired \(value?["RoomCreationDate"])")
                return
            }
            
            self.setCrisisPortal(displayString: value!)
            
            if self.isSelfTriggered(author: value?["Owner"] as? String) {
                DDLogInfo("[ALERT] self triggered by user")
                if (alertTriggeredByUser != "") && alertTriggeredByUser == NSUserName() {
                    DDLogInfo("[ALERT] self triggered by user and match username")
                    alertTriggeredByUser = ""
                    self.currentAlertID = value?["AlertId"]! as? String
                    self.currentAlertMessage = invitation
                    Messenger.sharedInstance.joinChatRoom(message: alert, alertDetails: value)
                } else {
                    DDLogInfo("[ALERT] triggered by another user, so skip alert")
                    return
                }
            }
            else if(self.isFromSameLocation(location: value?["OrganizationLocationName"] as? String) ||
                self.isFromSameOrganisation(organization: value?["OrganizationName"] as! String)) ||
                self.isReverseAlert(type: value?["Type"] as! String){
                DDLogInfo("[ALERT] received from same location")
                
                self.currentAlertID = value?["AlertId"]! as? String
                self.currentAlertMessage = invitation
                
                DDLogInfo("[ALERT] wasFromPreviousCycle: \(wasFromPreviousCycle)")
                
                if (!self.wasFromPreviousCycle) {
                    DDLogInfo("[ALERT] show join alert prompt")
                    GlobalAlertHelper.sharedInstance.show(onJoin: {
                         Messenger.sharedInstance.joinChatRoom(
                            message: alert,
                            alertDetails: value
                        )
                    }, alertDetails: value as NSDictionary?)
                } else{
                    DDLogInfo("[ALERT] join chat room")
                    if !isAlertReceived && (alertTriggeredByUser != "") && alertTriggeredByUser == NSUserName() {
                        DDLogInfo("[ALERT] join chat room with invitation received")
                        Messenger.sharedInstance.joinChatRoomWithInvitation(message: invitation.message, alertDetails: ["AlertId" : self.currentAlertID! as AnyObject])
                    } else {
                        DDLogInfo("[ALERT] prompt is still open or another user triggered alert, so skip")
                    }
                }
            }
        }

    }
    
    
    private func convertStringToDictionary(text: String) -> [String:AnyObject]? {
        if let data = text.data(using: String.Encoding.utf8) {
            do {
                return try JSONSerialization.jsonObject(with: data, options: []) as? [String:AnyObject]
            } catch let error {
                DDLogError(error.localizedDescription)
            }
        }
        return nil
    }
    
    
    private func isSelfTriggered(author: String?) -> Bool {
        
        let deviceId = AuthHelper.getDeviceId()
        return (author != nil) && (deviceId == author)
    
    }
    
    private func isReverseAlert(type: String) -> Bool{
     
        return type == "COPsyncReverseAlert"
    }
    
    
    private func setCrisisPortal(displayString: [String:AnyObject]){
        
        
        self.crisisAlertMessage["title"] = displayString["InitialMessageFormat"] as! String?
        self.crisisAlertMessage["mode"] = displayString["Mode"] as! String?
        self.crisisAlertMessage["reverseAlertSub"] = displayString["ReverseAlertSubject"] as! String?
        self.crisisAlertMessage["reverseAlertMessage"] = displayString["ReverseAlertMessage"] as! String?
        self.crisisAlertMessage["type"] = displayString["Type"] as! String?
        self.crisisAlertMessage["organizationName"] = displayString["OrganizationName"] as! String?
        self.crisisAlertMessage["AgencyName"] = displayString["AgencyName"] as! String?
        
        self.crisisAlertMessage["time"] = Misc.GetTimeStamp(timestamp: NSDate() as Date)
    }
    
    private func isFromSameLocation(location: String?) -> Bool{
        
        let locationName = self.getDeviceLocationName()
        
        return (location != nil) && (location! == locationName)
        
    }
    
    private func isFromSameOrganisation(organization: String) -> Bool{
        
        return DataonixUser().organizationName! == organization
    }
    
    private func getDeviceLocationName() -> String {
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
                    return location?.object(forKey: "Name") as? String ?? ""
                }
                
            }
        }
        
        return ""
    }
    
}
