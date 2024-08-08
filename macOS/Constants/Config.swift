//
//  Config.swift
//  copsync
//
//  Created by Arul Jothi on 6/15/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

struct Config {
    
    struct App {
        static let Title = "COPsync911"
        
        struct Identifier {
            static let LocationString = "updateLocation"
            static let settingsString = "changeSettings"
        }
        
        struct Version {
            static let Scheme = "https"
            static let Hostname = "itunes.apple.com"
            static let Path = "/lookup"
            static let BundleIdKey = "bundleId"
            static let MacAppStoreUri = "macappstore://itunes.apple.com/in/app/color-picker/id641027709?mt=12"
        }
        
        struct Push {
            static let Scheme = "http"
            static let Hostname = "ec2-52-33-95-202.us-west-2.compute.amazonaws.com"
            static let DevicePath = "/device"
            static let PushPath = "/push"
        }
        
        struct UserAuth {
            static let UserAuthInfo = "UserAuthInfo"
            static let UserIsAuthenticated = "UserIsAuthenticated"
            static let UserCredentials = "UserCredentials"
        }
        
        struct Device {
            static let DeviceIsRegistered = "DeviceIsRegistered"
        }
    }
    
    struct User {
        static let UsernameKey = "Username"
        static let Authenticated = "isAuthenticated"
    }
    
    struct Rest {
        static let Scheme = "https"
        static let Hostname = "internal-dev.dataonix.com"
        static let Path = "/idserver"
        static let Version = "/v1_0"
    }
    
    struct Authorization {
        static let AuthScheme = "dtx-basic"
        static let AuthHeader = "Authorization"
        static let OriginScopeKey = "X-OriginScope"
        static let OriginScope = "b169f151-3f07-4ab6-af46-add70457e151"
        static let TwoFactoryKey = "X-2FA_SelectedMethod"
        static let TwoFactor = "MagneticCard"
        static let TwoFactorResponseKey = "X-2FA_Response"
        static let TwoFactorResponse = "123456"
        static let AuthScopeKey = "applicationScope"
        static let AuthScope = "8bffd715-2b1f-4790-936b-54264f32dce9"
        static let TokenAuthScheme = "dtx-jtoken"
    }
    
    struct Dataonix {
        
        struct Core {
            static let Scheme = "https"
            static let Hostname = "internal-dev.dataonix.com"
            static let Version = "/V2_0_0"
            static let PasswordEncryptKey = "Dataonix Public Hash Key: 20120901."
        }
        
        struct Endpoints {
            static let GetCurrentIdentity = "/identities/current"
            static let RegisterDevice = "/devices/register"
            static let GetDeviceRegistration = "/organizations/getForDeviceRegistration"
        }
        
        struct AuthHeaders {
            static let DAuthType = "DAuth-Type"
            static let DAuthVersion = "DAuth-Version"
            static let DAuthNonce = "DAuth-Nonce"
            static let DAuthCreatedOnClient = "DAuth-CreatedOnClient"
            static let DAuthOrigin = "DAuth-Origin"
            static let DAuthHost = "DAuth-Host"
            static let DAuthClientIP = "DAuth-ClientIP"
            static let DAuthMAC = "DAuth-MAC"
            static let DAuthId = "DAuth-Id"
            static let DAuthDid = "DAuth-Did"
            static let DAuthHash = "DAuth-Hash"
            static let DAuthSign = "DAuth-Sign"
            static let DAuthFactors = "DAuth-Factors"
        }
        
        struct DefaultHeaders {
            static let DAuthType = "1"
            static let DAuthVersion = "V1_2"
            static let DAuthHash = "SHA512"
            static let DAuthOrigin = "d3e09c3f-7e3a-46ed-9c40-8c76de334cf6"
        }
    }
    
    struct AuthResponse {
        static let TokensKey = "DtxJTokens"
        static let TokenKey = "DtxJToken"
        static let ScopeKey = "ScopeId"
    }
    
    struct Error {
        static let Wrong = "Something went wrong"
        static let ErrorCode = "ErrorCode"
        static let ErrorDescription = "ErrorDescription"
    }
    
    struct Alert {
        static let Title = "Alert"
        static let locationAlert = "Please enable Location service in System Preferences"
        static let testTrigger = "COPsync911 Reverse Alert Triggered"
        static let normalTrigger = "COPsync911 Alert Triggered"
        static let detailTitle = "A member of your organization is triggered an alert."
        static let testTriggerString = "test"
        static let reverseAlert = "COPsyncReverseAlert"
    }
    
    struct Endpoints {
        static let Tokens = "tokens"
        static let VerifyToken = "default"
    }
    
    struct Identifiers {
        static let ShowLogin = "showLogin"
        static let ShowDashboard = "showDashboard"
        static let ShowEmergency = "showEmergency"
        static let ShowChat = "showChat"
    }
    
    struct Chat {
        
        struct Connection {
            static let Hostname = "im-nonprod.dataonix.com"
            static let Port = 5233
        }
        
        struct Core {
            static let ChatType = "groupchat"
            static let History = "history"
        }
        
        struct Room {
            static let RoomName = "qualesce@conference.qaim.dataonix.com"
        }
        
        struct Presence {
            static let Available = "available"
            static let Unavailable = "unavailable"
        }
        
        struct Images {
            static let Cop = "cop_officer"
            static let General = "cop_general"
            static let CopWhite = "cop_officer_white"
            static let GeneralWhite = "cop_general_white"
        }
    }
    
    struct Agree {
        static let agreeUserDefault = "Agree"
        static let agreeStringValue  = "Disclaimer: \n\nYOU ARE RESPONSIBLE FOR ACTIVATING THE COPSYNC911 ALERT FEATURE. TO ACTIVATE, YOU MUST REGISTER THE ADDRESS WHERE YOU WILL USE THE COPSYNC911 ALERT SERVICE. TO REGISTER, YOU MUST LOG INTO THE DATAONIX PORTAL AND PROVIDE A VALID PHYSICAL ADDRESS. IF YOU FAIL TO REGISTER, THE COPSYNC911 ALERT FEATURE WILL NOT FUNCTION PROPERLY AND POTENTIALLY NO EMERGENCY SERVICE WILL BE SENT TO YOUR LOCATION. \n \nIF YOU MOVE THE LOCATION OF WHERE YOU USE THE COPSYNC911 ALERT SERVICE, YOU ARE RESPONSIBLE FOR RE-ACTIVATING THE COPSYNC911 ALERT FEATURE AT THE NEW LOCATION. TO RE-ACTIVATE, YOU MUST REGISTER THE NEW ADDRESS WHERE YOU WILL USE THE COPSYNC911 ALERT SERVICE. TO REGISTER THE NEW ADDRESS, YOU MUST LOG INTO THE DATAONIX PORTAL AND PROVIDE A VALID PHYSICAL ADDRESS. IF YOU FAIL TO REGISTER YOUR NEW ADDRESS, THE COPSYNC911 ALERT FEATURE WILL NOT FUNCTION PROPERLY AND POTENTIALLY NO EMERGENCY SERVICE WILL BE SENT TO YOUR LOCATION."
    }
}
