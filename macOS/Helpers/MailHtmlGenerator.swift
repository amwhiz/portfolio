//
//  MailHtmlGenerator.swift
//  COPsync911
//
//  Created by Ulaganathan on 09/11/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class MailHtmlGenerator: NSObject {
    
    func getStackTrcae() -> String {
        var stackTrace = ""
        
        for symbol: String in Thread.callStackSymbols {
            stackTrace = stackTrace + symbol + "\n"
        }
        
        return stackTrace
    }
    
    func getlogfile() -> [String: String] {
        let logArchivePath = URL.zipArchive()
        
        if logArchivePath != nil {
            do {
                let data = try Data(contentsOf: logArchivePath!, options: .alwaysMapped)
                let fileBase64 = data.base64EncodedString(options: NSData.Base64EncodingOptions.endLineWithLineFeed)
                let filename = logArchivePath?.lastPathComponent
                return ["FileName" : filename!, "File": fileBase64, "FilePath": (logArchivePath?.path)!]
            } catch let error {
                DDLogError(error.localizedDescription)
            }
        }
        
        return  ["FileName": "", "File": "", "FilePath": ""]
    }
    
    func getAddress(value: [String: Any]?) -> String {
        let address1 = value?["Address1"] as! String
        let address2 = value?["Address2"] as? String
        
        let city = value?["CityName"] as! String
        let country = value?["CountryName"] as! String
        let postalcode = value?["PostalCode"] as! String
        
        var addressString = ""
        
        addressString = address1
        
        if (address2 != nil) {
            addressString = addressString + ", " + address2!
        }
        
        addressString = addressString + ", " + city + ", " + country + ", " + postalcode
        
        return addressString
    }
    
    func getCurrentYear() -> String {
        let calendar = NSCalendar.init(calendarIdentifier: NSCalendar.Identifier.gregorian)
        let year = (calendar?.component(NSCalendar.Unit.year, from: NSDate() as Date))!
        
        return String(year)
    }
    
    func getErrorDate() -> String {
        let dateFormat = DateFormatter()
        dateFormat.dateFormat = "MM/dd/yyyy hh:mm:ss a Z"
        return dateFormat.string(from: Date()).replacingOccurrences(of: "+", with: "-")
    }
    
    func getMailContent() -> String {
        // Alert details
        let alertTitle = AlertsApiClient().getSubject(status: "ALERT SENT SUCCESSFULLY")
        let alertHeader = "LIVE ALERT SENT"
        let alertSourceLatitude = "Not Available"
        let alertSourceLongitude = "Not Available"
        
        // User details
        let userName = "Not Available"
        let userFullName = "Not Available"
        
        // Organization details
        let organizationLocation = DataonixHelper.getOrganizationLocationName()
        let organizationName = DataonixHelper.getOrganizationName()
        let organizationLocationAddress = DataonixHelper.getLocationAddress()
        
        // Device details
        let deviceId = AuthHelper.getDeviceId()
        let machineName = AuthHelper.getMachineName()
        let networkIP = Array<String>.getIFAddresses().joined(separator: ",")
        let networkMAC = HMAC_SHA1_128.macAddress() as String
        let copyrightYear = self.getCurrentYear()
        
        // Exception details
        let errorDate = self.getErrorDate()
        let stackTrace =  "No exception was set"
        
        // Alert status
        let alertStatus = "Success"
        
        // Application status
        var currentAppStatus = ""
        if Messenger.sharedInstance.isStreamConnected() {
            currentAppStatus = "Active"
        } else {
            currentAppStatus = "Initializing"
        }
        
        let appStatus = currentAppStatus
        
        let body = "<style type= \"text/css \"> .ReadMsgBody { width: 100%;} .ExternalClass { width: 100%; } .ExternalClass * { line-height: 0%; } </style> <table width= \"100% \" cellpadding= \"0 \" cellspacing= \"0 \" border= \"0 \"> <tr> <td width= \"100% \" align= \"center \" valign= \"top \" bgcolor= \"#FFFFFF \"><table width= \"650 \" cellpadding= \"0 \" cellspacing= \"0 \" border= \"0 \"> <tr> <td width= \"650 \" align= \"center \" valign= \"top \"><table cellpadding= \"0 \" cellspacing= \"0 \" border= \"0 \" width= \"680 \" align= \"center \"> <tr> <td align= \"left \" valign= \"top \" style= \"line-height:0px; padding-top:30px; padding-bottom:25px; \"><img src= \"http://blobstorage.dataonix.com/images/v2/logoCOPsync911.png \" /></td></tr><tr><td align= \"left \" valign= \"top \" style= \"padding-top:25px; border-top:1px solid #E0E0E0 \"><span style= \"color:#444; padding:0px; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; font-size:30px; \"> \(alertTitle) </span></td> </tr> <tr> <td height= \"20 \"></td> </tr> <tr> <td align= \"center \" width= \"100% \" valign= \"middle \" bgcolor= \"#00AD00 \" height= \"36 \" style= \"text-align:center\"><span style= \"font-family:Arial, Helvetica, sans-serif; color:#FFF; font-size:14px; font-weight:bold; \"> \(alertHeader) </span></td> </tr> <tr> <td style= \"padding-top:30px; border-bottom:1px solid #CCC; padding-bottom:10px; \" align= \"left \" valign= \"top \"><span style= \"color:#666; font-family:Arial, Helvetica, sans-serif; font-weight:bold; font-size:16px; line-height:17px; padding:0px; margin-bottom:0px; margin-top:0px; \">ALERT DETAILS</span></td> </tr> <tr> <td align= \"left \" valign= \"top \" style= \"padding-top:15px; \"><table cellpadding= \"0 \" cellspacing= \"0 \" width= \"680 \" align= \"center \" border= \"0 \"><tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Alert Date</span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Organization</span></td> </tr> <tr> <td height= \"5 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(errorDate) </span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(organizationName) </span></td> </tr> <tr> <td height= \"25 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Organization Location</span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Organization Location Address</span></td> </tr> <tr> <td height= \"5 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(organizationLocation) </span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(organizationLocationAddress) </span></td> </tr> <tr> <td height= \"25 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Device ID</span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Device Name</span></td> </tr> <tr> <td height= \"5 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(deviceId) </span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(machineName) </span></td> </tr> <tr> <td height= \"25 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">User Name</span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">User Full Name</span></td> </tr> <tr> <td height= \"5 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(userName) </span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(userFullName) </span></td> </tr> <tr> <td height= \"25 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Alert Source Latitude</span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Alert Source Longitude</span></td> </tr> <tr> <td height= \"5 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(alertSourceLatitude) </span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(alertSourceLongitude) </span></td> </tr> <tr> <td height= \"25 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Request IP Address</span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Request MAC Address</span></td> </tr> <tr> <td height= \"5 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(networkIP) </span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(networkMAC) </span></td> </tr> <tr> <td height= \"25 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Status</span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Error Message</span></td> </tr> <tr> <td height= \"5 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(alertStatus) </span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(stackTrace) </span></td></tr> <tr> <td height= \"25 \" colspan= \"2 \"></td> </tr> <tr> <td align= \"left \" colspan= \"2 \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Application Status</span></td> </tr> <tr> <td height= \"5 \" colspan= \"2 \"></td> </tr> <tr> <td align= \"left \" valign= \"top \" colspan= \"2 \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \">\(appStatus)</span></td> </tr> <tr> <td height= \"25 \" colspan= \"2 \"></td> </tr> </table></td> </tr> <tr> <td align= \"left \" valign= \"top \" style= \"padding-top:15px; border-bottom:1px solid #E0E0E0; padding-bottom:15px; \"><span style= \"color:#666666; font-size:12px; padding:0px; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif \">The Dataonix Team</span></td> </tr> <tr> <td align= \"left \" valign= \"top \" style= \"padding-top:20px; padding-bottom:20px; \"><span style= \"color:#444; font-size:12px; padding:0px; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif \">Copyright © \(copyrightYear) COPsync. All rights reserved.</span></td></tr> </table></td> </tr> </table></td> </tr> </table>"
        
        return body
    }
    
    func getFailedMailContent(errorMessage : String) -> String {
        // Alert details
        let alertTitle = AlertsApiClient().getSubject(status: "ALERT FAILED TO SEND")
        let alertHeader = "LIVE ALERT FAILED TO SEND"
        let alertSourceLatitude = "Not Available"
        let alertSourceLongitude = "Not Available"
        
        // User details
        let userName = "Not Available"
        let userFullName = "Not Available"
        
        // Organization details
        let organizationLocation = DataonixHelper.getOrganizationLocationName()
        let organizationName = DataonixHelper.getOrganizationName()
        let organizationLocationAddress = DataonixHelper.getLocationAddress()
        
        // Device details
        let deviceId = AuthHelper.getDeviceId()
        let machineName = AuthHelper.getMachineName()
        let networkIP = Array<String>.getIFAddresses().joined(separator: ",")
        let networkMAC = HMAC_SHA1_128.macAddress() as String
        let copyrightYear = self.getCurrentYear()
        
        // Exception details
        let errorDate = self.getErrorDate()
        
        // Alert status
        let alertStatus = "Failure"
        
        // Application status
        var currentAppStatus = ""
        if Messenger.sharedInstance.isStreamConnected() {
            currentAppStatus = "Active"
        } else {
            currentAppStatus = "Initializing"
        }
        
        let appStatus = currentAppStatus
        
        let body = "<style type= \"text/css \"> .ReadMsgBody { width: 100%;} .ExternalClass { width: 100%; } .ExternalClass * { line-height: 0%; } </style> <table width= \"100% \" cellpadding= \"0 \" cellspacing= \"0 \" border= \"0 \"> <tr> <td width= \"100% \" align= \"center \" valign= \"top \" bgcolor= \"#FFFFFF \"><table width= \"650 \" cellpadding= \"0 \" cellspacing= \"0 \" border= \"0 \"> <tr> <td width= \"650 \" align= \"center \" valign= \"top \"><table cellpadding= \"0 \" cellspacing= \"0 \" border= \"0 \" width= \"680 \" align= \"center \"> <tr> <td align= \"left \" valign= \"top \" style= \"line-height:0px; padding-top:30px; padding-bottom:25px; \"><img src= \"http://blobstorage.dataonix.com/images/v2/logoCOPsync911.png \" /></td></tr><tr><td align= \"left \" valign= \"top \" style= \"padding-top:25px; border-top:1px solid #E0E0E0 \"><span style= \"color:#444; padding:0px; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; font-size:30px; \"> \(alertTitle) </span></td> </tr> <tr> <td height= \"20 \"></td> </tr> <tr> <td align= \"center \" width= \"100% \" valign= \"middle \" bgcolor= \"#D02D2B \" height= \"36 \" style= \"text-align:center\"><span style= \"font-family:Arial, Helvetica, sans-serif; color:#FFF; font-size:14px; font-weight:bold; \"> \(alertHeader) </span></td> </tr> <tr> <td style= \"padding-top:30px; border-bottom:1px solid #CCC; padding-bottom:10px; \" align= \"left \" valign= \"top \"><span style= \"color:#666; font-family:Arial, Helvetica, sans-serif; font-weight:bold; font-size:16px; line-height:17px; padding:0px; margin-bottom:0px; margin-top:0px; \">ALERT DETAILS</span></td> </tr> <tr> <td align= \"left \" valign= \"top \" style= \"padding-top:15px; \"><table cellpadding= \"0 \" cellspacing= \"0 \" width= \"680 \" align= \"center \" border= \"0 \"><tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Alert Date</span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Organization</span></td> </tr> <tr> <td height= \"5 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(errorDate) </span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(organizationName) </span></td> </tr> <tr> <td height= \"25 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Organization Location</span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Organization Location Address</span></td> </tr> <tr> <td height= \"5 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(organizationLocation) </span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(organizationLocationAddress) </span></td> </tr> <tr> <td height= \"25 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Device ID</span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Device Name</span></td> </tr> <tr> <td height= \"5 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(deviceId) </span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(machineName) </span></td> </tr> <tr> <td height= \"25 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">User Name</span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">User Full Name</span></td> </tr> <tr> <td height= \"5 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(userName) </span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(userFullName) </span></td> </tr> <tr> <td height= \"25 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Alert Source Latitude</span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Alert Source Longitude</span></td> </tr> <tr> <td height= \"5 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(alertSourceLatitude) </span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(alertSourceLongitude) </span></td> </tr> <tr> <td height= \"25 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Request IP Address</span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Request MAC Address</span></td> </tr> <tr> <td height= \"5 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(networkIP) </span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(networkMAC) </span></td> </tr> <tr> <td height= \"25 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Status</span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Error Message</span></td> </tr> <tr> <td height= \"5 \" colspan= \"2 \"></td> </tr> <tr> <td width= \"380 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(alertStatus) </span></td> <td width= \"300 \" align= \"left \" valign= \"top \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \"> \(errorMessage) </span></td></tr> <tr> <td height= \"25 \" colspan= \"2 \"></td> </tr> <tr> <td align= \"left \" colspan= \"2 \" valign= \"top \"><span style= \"padding:0; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#858585; font-size:12px; \">Application Status</span></td> </tr> <tr> <td height= \"5 \" colspan= \"2 \"></td> </tr> <tr> <td align= \"left \" valign= \"top \" colspan= \"2 \"><span style= \"padding:0; font-weight:bold; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif; color:#78ACD8; font-size:14px; \">\(appStatus)</span></td> </tr> <tr> <td height= \"25 \" colspan= \"2 \"></td> </tr> </table></td> </tr> <tr> <td align= \"left \" valign= \"top \" style= \"padding-top:15px; border-bottom:1px solid #E0E0E0; padding-bottom:15px; \"><span style= \"color:#666666; font-size:12px; padding:0px; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif \">The Dataonix Team</span></td> </tr> <tr> <td align= \"left \" valign= \"top \" style= \"padding-top:20px; padding-bottom:20px; \"><span style= \"color:#444; font-size:12px; padding:0px; margin-bottom:0px; margin-top:0px; font-family:Arial, Helvetica, sans-serif \">Copyright © \(copyrightYear) COPsync. All rights reserved.</span></td></tr> </table></td> </tr> </table></td> </tr> </table>"
        
        return body
    }
}
