//
//  Constant.swift
//  COPsync911
//
//  Created by aj on 18/09/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation

public let SparkleUpdateFeed = [
    "dev": "https://dataonixnonprod.blob.core.windows.net/downloads-dev/updates/COPsync911-MacOS/update-feed.xml",
    "qa": "https://dataonixnonprod.blob.core.windows.net/downloads-qa/updates/COPsync911-MacOS/update-feed.xml",
    "sales": "https://dataonix.blob.core.windows.net/downloads-sales/updates/COPsync911-MacOS/update-feed.xml",
    "training": "https://dataonix.blob.core.windows.net/downloads-training/updates/COPsync911-MacOS/update-feed.xml",
    "prod": "https://dataonix.blob.core.windows.net/downloads/updates/COPsync911-MacOS/update-feed.xml"
] as [String: String]

enum environment: String {
    case development = "dev", qa = "qa", training = "training", sales = "sales", production = "prod"
}

func initializeEnvironment() {
    let dict = Bundle.main.infoDictionary
    if dict?["APP_ENVIRONMENT"] != nil {
        applicationEnvironment = dict?["APP_ENVIRONMENT"]! as! String
    }
}

func getForgotPasswordUrl() -> String {
    switch applicationEnvironment {
    case environment.production.rawValue:
        return "https://portal.dataonix.com/Login/?ForgotUsername=True"
    case environment.sales.rawValue:
        return "https://portal-sales.dataonix.com/Login/?ForgotUsername=True"
    case environment.training.rawValue:
        return "https://portal-training.dataonix.com/Login/?ForgotUsername=True"
    case environment.qa.rawValue:
        return "https://portal-qa.dataonix.com/Login/?ForgotUsername=True"
    case environment.development.rawValue:
        return "https://portal-dev.dataonix.com/Login/?ForgotUsername=True"
    default:
        return ""
    }
}

func getDataonixPortal() -> String {
    switch applicationEnvironment {
    case environment.production.rawValue:
        return "https://portal.dataonix.com"
    case environment.sales.rawValue:
        return "https://portal-sales.dataonix.com"
    case environment.training.rawValue:
        return "https://portal-training.dataonix.com"
    case environment.qa.rawValue:
        return "https://portal-qa.dataonix.com"
    case environment.development.rawValue:
        return "https://portal-dev.dataonix.com"
    default:
        return ""
    }
}

func getDataonixHost() -> String {
    switch applicationEnvironment {
    case environment.production.rawValue:
        return "internal.dataonix.com"
    case environment.sales.rawValue:
        return "internal-sales.dataonix.com"
    case environment.training.rawValue:
        return "internal-training.dataonix.com"
    case environment.qa.rawValue:
        return "internal-qa.dataonix.com"
    case environment.development.rawValue:
        return "internal-dev.dataonix.com"
    default:
        return ""
    }
}

func getEmailAddress() -> String {
    switch applicationEnvironment {
    case environment.development.rawValue:
        return Dataonix.Email.dev
    case environment.qa.rawValue:
        return Dataonix.Email.qa
    case environment.sales.rawValue:
        return Dataonix.Email.sales
    case environment.training.rawValue:
        return Dataonix.Email.training
    case environment.production.rawValue:
        return Dataonix.Email.prod
    default:
        return ""
    }
}

struct SilentLog {
    static let identifier = "com.qualesce.copsync911"
    static let logDirectory = "Logs/COPsync911"
    static let logPath = "Logs/COPsync911/app.log"
    static let archiveFilePath = "~/Library/Logs/COPsync911/"
}

struct Identifiers {
    static let showLogin = "showLogin"
    static let showDashboard = "showDashboard"
    static let showEmergency = "showEmergency"
    static let showChat = "showChat"
    static let showDeviceRegistration = "showDeviceRegistration"
    static let showUpdateLocation = "showUpdateLocation"
}

struct UserSettings {
    static let isUserAcknowledged = "isUserAcknowledged"
    static let isDeviceRegistered = "isDeviceRegistered"
    static let identityResponse = "identityResponse"
    static let identityCredentials = "dtxuser"
    static let isIdentityLoggedIn = "isIdentityLoggedIn"
    static let deviceInfo = "deviceInfo"
    static let chatCredentials = "chatCredentials"
    static let chatCredentialsExists = "chatCredentialsExists"
}

struct DeviceSettings {
    static let currentLocation = "currentLocation"
    static let deviceLocationId = "deviceLocationId"
    static let locationTypeId = "locationTypeId"
    static let isDeviceActive = "isDeviceActive"
    static let organizationLocationName = "organizationLocationName"
    static let organizationName = "organizationName"
    static let deviceOrganizationId = "deviceOrganizationId"
    static let deviceOrganizationTypeId = "deviceOrganizationTypeId"
}

struct ForgotPassword {
    static let passwordText = "Can't access your account?"
    static let url: NSURL = NSURL(string: getForgotPasswordUrl())!
}

struct Alert {
    static let title = "Unknown"
    static let wrong = "Something went wrong"
    static let locationTitle = "Location Service"
    static let locationAlert = "Please enable Location service in System Preferences"
    static let verificationCodeTitle = "Device Verification Code"
    static let formValidationTitle = "Validation failed"
}

struct Portal {
    static let alertTitle = "Would you like to close the Crisis Portal?"
    static let alertDescription = "You can re-enter the Crisis Portal by clicking the COPsync911 icon"
}

struct Dataonix {
    
    struct Core {
        static let scheme = "https"
        static let hostname = getDataonixHost()
        static let version = "/V2_0_0"
        static let passwordEncryptKey = "Dataonix Public Hash Key: 20120901."
        static let dtxUserKey = "ll857q424ywLTfF3C8sNlj0rI96Z9L1T"
    }
    
    struct Endpoints {
        static let getCurrentIdentity = "/identities/current"
        static let registerDevice = "/devices/register"
        static let getDeviceRegistration = "/organizations/getForDeviceRegistration"
        static let sendSystemInfo = "/systemInfo"
        static let startRegistration = "/devices/startRegistration"
        static let isCurrentDeviceActive = "/devices/isCurrentDeviceActive"
        static let getDeviceDetails = "/devices"
        static let sendAlert = "/alerts"
        static let updateLocation = "/devices/{DEVICE_ID}/currentLocation/update"
        static let alertJoin = "/alerts/{ALERT_ID}/SendJoiningInfo"
        static let email = "/emails"
        static let updateDevice = "/devices/{DEVICE_ID}/update"
        static let deviceBySerialNumber = "/devices/{FINGER_PRINT}"
    }
    
    struct AuthHeaders {
        static let dAuthType = "DAuth-Type"
        static let dAuthVersion = "DAuth-Version"
        static let dAuthNonce = "DAuth-Nonce"
        static let dAuthCreatedOnClient = "DAuth-CreatedOnClient"
        static let dAuthOrigin = "DAuth-Origin"
        static let dAuthHost = "DAuth-Host"
        static let dAuthClientIP = "DAuth-ClientIP"
        static let dAuthMAC = "DAuth-MAC"
        static let dAuthId = "DAuth-Id"
        static let dAuthDid = "DAuth-Did"
        static let dAuthHash = "DAuth-Hash"
        static let dAuthSign = "DAuth-Sign"
        static let dAuthFactors = "DAuth-Factors"
        static let dAuthOriginVersion = "DAuth-OriginVersion"
    }
    
    struct DefaultHeaders {
        static let dAuthType = "1"
        static let dAuthVersion = "V1_2"
        static let dAuthHash = "SHA512"
        static let dAuthOrigin = "a6c8f067-19e2-4b44-ae4d-3defeccb82ff"
    }
    
    struct ErrorMessageText {
        static let unreachable = "COPSync911 is unable to connect to the server. You will not be able to send an alert during this time. Please call 9-1-1."
        static let deviceMessage = "Please contact organization admin, In case of emergency, please call 911"
        static let unauthorized = "Invalid username or password"
        static let networkunreachable = "Registering a device requires an active network connection."
        static let alert = "There was an issue sending the alert. Please call 9-1-1."
        
        static let loginFail = "Invalid Username or Password"
    }
    
    struct Email {
        static let dev = "copsync911alerts-nonprod@copsync.com"
        static let qa = "copsync911alerts-nonprod@copsync.com"
        static let sales = "copsync911alerts-nonprod@copsync.com"
        static let training = "copsync911alerts-nonprod@copsync.com"
        static let prod = "copsync911alerts-prod@copsync.com"
        static let noreply = "noreply@dataonix.com"
    }
    
    struct Error {
        struct TitleText {
            static let error400 = "Please call 9-1-1"
            static let error402 = "Your user name is invalid - COPsync911 Alerts are NOT active"
            static let error403 = "Your device is invalid - COPsync911 Alerts are NOT active"
            static let error406 = "Incorrect user credentials - COPsync911 Alerts are NOT active"
            static let error411 = "Your password has expired - COPsync911 Alerts are NOT active"
            static let error412 = "Your device has been deactivated - COPsync911 Alerts are NOT active"
            static let error416 = "Your user name has been deactivated - COPsync911 Alerts are NOT active"
            static let errorForCommon = "There is a problem with your connection - COPsync911 Alerts are NOT active"
            static let error407 = "Signature mismatch"
            static let errorAdminApprovel = "Your device activation request was submitted successfully"
            static let invalidActivationCode = "Invalid Device Activation Code"
        }
        struct MessageText {
            static let error400 = "There was an issue sending the alert. Please call 9-1-1."
            static let message = "You will need to dial 9-1-1 in an emergency situation until you resolve this issue. Should you require assistance with this issue please contact COPsync Support at 972-865-6192 Option 2."
            static let error407 = "A problem was found with the date/time on your computer. Please verify the date/time, daylight savings, and time zone are correct. if the problem continues, please contact your local IT administrator."
           static let errorAdminApprovel = "An administrator from your organization will receive an email with instructions on approving your device. Please, wait while your request is being Processed. This process may take a while."
            static let invalidActivationCode = "Invalid Verification Code. Please retype it or request a new one."
        }
        struct LogMessage {
            static let  log400 = "400 Invalid authentication type"
            static let  log401 = "401 Incomplete request headers"
            static let  log402 = "402 Invalid user"
            static let  log403 = "403 Invalid device"
            static let  log404 = "404 Request duplicated (Possible replay attack)"
            static let  log405 = "405 Invalid nonce"
            static let  log406 = "406 Signature mismatch (Incorrect user credentials, device hardware hash changed, or tampered request)"
            static let  log407 = "407 Request message is expired (Possible incorrect time on client computer)"
            static let  log408 = "408 Invalid time stamp"
            static let  log409 = "409 Request token is expired (User/Device needs to renew it)"
            static let  log410 = "410 Invalid request token"
            static let  log411 = "411 User password is expired"
            static let  log412 = "412 Inactive device"
            static let  log413 = "413 Invalid origin"
            static let  log414 = "414 Inactive device for request origin"
            static let  log415 = "415 Device is not associated with request origin"
            static let  log416 = "416 Inactive user"
            static let log46 = "46 InvalidDeviceActivationCode"
            
        }
    
    }
    
    
}
