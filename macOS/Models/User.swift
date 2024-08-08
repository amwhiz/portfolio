//
//  User.swift
//  COPsync911
//
//  Created by aj on 18/09/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation

enum DataonixUserRole: String {
    case LOCATION = "LOCATIONS"
    case OFFICER = "OFFICERS"
    case DISPATCHER = "DISPATCH"
}


struct DataonixUser {
    
    var userID: String?
    var deviceID: String?
    var deviceName: String?
    var deviceRoleCodes: NSDictionary?
    var userName: String?
    var userFirstName: String?
    var userLastName: String?
    var userEmailAddress: String?
    var userPasswordRemainingDays: Int?
    var legacyAgencyID: Int?
    var userRoleCodes: NSDictionary?
    var organizationID: String?
    var organizationName: String?
    var mobilePhoneNumber: String?
    var isActive: Bool?
    var isAccountLocked: Bool?
    var userRole: DataonixUserRole?
    var chatID: XMPPJID?
    var chatPassword: String?
    var organizationPartyRoles: NSDictionary?
    
    
    init(){
        
        let identityResponse: NSData? = UserDefaults.standard.object(forKey: UserSettings.identityResponse) as? NSData
        var response: NSDictionary?
        if identityResponse != nil {
            response = NSKeyedUnarchiver.unarchiveObject(with: identityResponse as! Data) as? NSDictionary
        }
        
        self.userID = response?.object(forKey: "UserId") as? String
        
        self.deviceID = response?.object(forKey: "DeviceId") as? String
        
        self.deviceName = response?.object(forKey: "DeviceName") as? String
        
        self.deviceRoleCodes = response?.object(forKey: "DeviceRoleCodes") as? NSDictionary
        
        self.userName = response?.object(forKey: "UserName") as? String
        
        self.userFirstName = response?.object(forKey: "UserFirstName") as? String
        
        self.userLastName = response?.object(forKey: "UserLastName") as? String
        
        self.userEmailAddress = response?.object(forKey: "UserEmailAddress") as? String
        
        self.userPasswordRemainingDays = response?.object(forKey: "UserPasswordRemainingDays") as? Int
        
        self.legacyAgencyID = response?.object(forKey: "LegacyAgencyId") as? Int
        
        self.userRoleCodes = response?.object(forKey: "UserRoleCodes") as? NSDictionary
        
        self.organizationID = response?.object(forKey: "OrganizationId") as? String
        
        self.organizationName = response?.object(forKey: "OrganizationName") as? String
        
        self.mobilePhoneNumber = response?.object(forKey: "MobilePhoneNumber") as? String
        
        self.isActive = response?.object(forKey: "IsActive") as? Bool
        
        self.isAccountLocked = response?.object(forKey: "IsAccountLocked") as? Bool
        
        self.organizationPartyRoles = response?.object(forKey: "OrganizationPartyRoles") as? NSDictionary
    }
    
    init(
        userID:String,
        deviceID: String,
        deviceName: String,
        deviceRoleCodes: NSDictionary,
        userName: String,
        userFirstName: String,
        userLastName: String,
        userEmailAddress:String,
        userPasswordRemainingDays:Int,
        legacyAgencyID: Int,
        userRoleCodes: NSDictionary,
        organizationID: String,
        organizationName: String,
        mobilePhoneNumber: String,
        isActive: Bool,
        isAccountLocked: Bool,
        organizationPartyRoles: NSDictionary){
        
        self.userID = userID
        self.deviceID = deviceID
        self.deviceName = deviceName
        self.deviceRoleCodes = deviceRoleCodes
        self.userName = userName
        self.userFirstName = userFirstName
        self.userLastName = userLastName
        self.userEmailAddress = userEmailAddress
        self.userPasswordRemainingDays = userPasswordRemainingDays
        self.legacyAgencyID = legacyAgencyID
        self.userRoleCodes = userRoleCodes
        self.organizationID = organizationID
        self.organizationName = organizationName
        self.mobilePhoneNumber = mobilePhoneNumber
        self.isActive = isActive
        self.isAccountLocked = isAccountLocked
        self.organizationPartyRoles = organizationPartyRoles
    }
    
    
    mutating func setUserRole(role: DataonixUserRole){
        
        self.userRole = role
        
    }
    
    mutating func setChatID(id: XMPPJID){
        
        self.chatID = id
    }
    
    mutating func setChatPassword(password: String){
        
        self.chatPassword = password
        
    }
    
    mutating func updateUserObject(){
        let identityResponse: NSData? = UserDefaults.standard.object(forKey: UserSettings.identityResponse) as? NSData
        var response: NSDictionary?
        if identityResponse != nil {
            response = NSKeyedUnarchiver.unarchiveObject(with: identityResponse as! Data) as? NSDictionary
        }
        
        self.userID = response?.object(forKey: "UserId") as? String
        
        self.deviceID = response?.object(forKey: "DeviceId") as? String
        
        self.deviceName = response?.object(forKey: "DeviceName") as? String
        
        self.deviceRoleCodes = response?.object(forKey: "DeviceRoleCodes") as? NSDictionary
        
        self.userName = response?.object(forKey: "UserName") as? String
        
        self.userFirstName = response?.object(forKey: "UserFirstName") as? String
        
        self.userLastName = response?.object(forKey: "UserLastName") as? String
        
        self.userEmailAddress = response?.object(forKey: "UserEmailAddress") as? String
        
        self.userPasswordRemainingDays = response?.object(forKey: "UserPasswordRemainingDays") as? Int
        
        self.legacyAgencyID = response?.object(forKey: "LegacyAgencyId") as? Int
        
        self.userRoleCodes = response?.object(forKey: "UserRoleCodes") as? NSDictionary
        
        self.organizationID = response?.object(forKey: "OrganizationId") as? String
        
        self.organizationName = response?.object(forKey: "OrganizationName") as? String
        
        self.mobilePhoneNumber = response?.object(forKey: "MobilePhoneNumber") as? String
        
        self.isActive = response?.object(forKey: "IsActive") as? Bool
        
        self.isAccountLocked = response?.object(forKey: "IsAccountLocked") as? Bool
        
        self.organizationPartyRoles = response?.object(forKey: "OrganizationPartyRoles") as? NSDictionary
    }
    
}



class User: NSObject{
    // MARK: - Properties
    
    /// User shared instance
    static let sharedInstance = User()
    
    var currentUser: DataonixUser {
        
        return DataonixUser()
    }
    
    override init(){
        
        super.init()
    }
    

    
    deinit {}
}
