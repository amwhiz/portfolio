//
//  AuthHelper.swift
//  copsync
//
//  Created by Arul Jothi on 6/15/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation

enum AuthType {
    case userAuthentication, deviceAuthentication, deviceRegistration, userDeviceAuthentication
    
    func get() -> Int {
        switch self {
            case .userAuthentication:
                return 1
            case .deviceAuthentication:
                return 2
            case .deviceRegistration:
                return 3
            case .userDeviceAuthentication:
                return 4
        }
    }
}

enum HMACAlgorithm {
    case MD5, SHA1, SHA224, SHA256, SHA384, SHA512
    
    func toCCHmacAlgorithm() -> CCHmacAlgorithm {
        var result: Int = 0
        
        switch self {
            case .MD5:
                result = kCCHmacAlgMD5
            case .SHA1:
                result = kCCHmacAlgSHA1
            case .SHA224:
                result = kCCHmacAlgSHA224
            case .SHA256:
                result = kCCHmacAlgSHA256
            case .SHA384:
                result = kCCHmacAlgSHA384
            case .SHA512:
                result = kCCHmacAlgSHA512
        }
        
        return CCHmacAlgorithm(result)
    }
    
    func digestLength() -> Int {
        var result: CInt = 0
        switch self {
            case .MD5:
                result = CC_MD5_DIGEST_LENGTH
            case .SHA1:
                result = CC_SHA1_DIGEST_LENGTH
            case .SHA224:
                result = CC_SHA224_DIGEST_LENGTH
            case .SHA256:
                result = CC_SHA256_DIGEST_LENGTH
            case .SHA384:
                result = CC_SHA384_DIGEST_LENGTH
            case .SHA512:
                result = CC_SHA512_DIGEST_LENGTH
        }
        
        return Int(result)
    }
}

extension String {
    func hmac(algorithm: HMACAlgorithm, key: String) -> String {
        let cKey = key.cString(using: String.Encoding.utf8)
        let cData = self.cString(using: String.Encoding.utf8)
        var result = [CUnsignedChar](repeating: 0, count: Int(algorithm.digestLength()))

        CCHmac(algorithm.toCCHmacAlgorithm(), cKey!, Int(strlen(cKey!)), cData!, Int(strlen(cData!)), &result)
        let hmacData:NSData = NSData(bytes: result, length: (Int(algorithm.digestLength())))
        let hmacBase64 = hmacData.base64EncodedString(options: NSData.Base64EncodingOptions.endLineWithLineFeed)
        return String(hmacBase64)
    }
}

class AuthHelper {
    
    static func base64(str: String) -> String {
        let data = str.data(using: String.Encoding.utf8)
        let resultData = data!.base64EncodedData(options: NSData.Base64EncodingOptions.endLineWithLineFeed)
        
        let resultNSString = NSString(data: resultData, encoding: String.Encoding.utf8.rawValue)!
        let resultString = resultNSString as String
        return resultString
    }
    
    static func sha512(string: String) -> NSData {
        let digest = NSMutableData(length: Int(CC_SHA512_DIGEST_LENGTH))!
        
        return digest
    }
    
    static func hash(v: String) -> String {
        var str = v
        
        for _ in 0...9 {
            let data = str.data(using: String.Encoding.utf8)
            let nsStr = NSString(data: data!, encoding: String.Encoding.utf8.rawValue) as! String
            let sha = sha512(string: nsStr)
            let d = sha.base64EncodedData(options: NSData.Base64EncodingOptions.endLineWithLineFeed)
            let resultNSString = NSString(data: d, encoding: String.Encoding.utf8.rawValue)!
            str = resultNSString as String
        }
        
        return str
    }
    
    static func base64EncodeUri(uri: String) -> String {
        let str = uri.replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "\\=+$", with: "", options: .regularExpression)
        
        return str
    }
    
    static func s4() -> String {
        let max: Int = 0x10000
        let ran: Int = Int(1 + arc4random())
        let mul = Double(ran * max)
        let id = String(Int(mul), radix: 16, uppercase: false)
        let substrIndex = id.index(id.startIndex, offsetBy: 4)
        
        return id.substring(to: substrIndex)
    }
    
    static func getGuid() -> String {
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4()
    }
    
    static func pad(num: Int, size: Int) -> String {
        var s = String(num) + ""
        while s.characters.count < size {
            s = "0" + s
        }
        
        return s;
    }
    
    static func offset(date: Date) -> String {
        let currentOffset = (TimeZone.current.secondsFromGMT(for: date as Date) / 60)
        
        let str = (currentOffset < 0 ? "-" : "+") + pad(num: abs(currentOffset / 60), size: 2) + ":" + pad(num: abs(currentOffset % 60), size: 2)
        
        return str
    }
    
    static func toDateString() -> String {
        let dateNow = Date()
        let calendar = Calendar.current
        let year = calendar.component(Calendar.Component.year, from: dateNow)
        let month = calendar.component(Calendar.Component.month, from: dateNow)
        let day = calendar.component(Calendar.Component.day, from: dateNow)
        let hour = calendar.component(Calendar.Component.hour, from: dateNow)
        let minute = calendar.component(Calendar.Component.minute, from: dateNow)
        let second = calendar.component(Calendar.Component.second, from: dateNow)
        let monthStr = pad(num: month, size: 2)
        let dayStr = pad(num: day, size: 2) + " "
        let dateStr = String(year) + "-" + monthStr + "-" + dayStr
        let timeStr = pad(num: hour, size: 2) + ":" + pad(num: minute, size: 2) + ":" + pad(num: second, size: 2)
        let timeZoneStr = " " + offset(date: dateNow)
        
        return  dateStr + timeStr + timeZoneStr
    }
    
    static func getAuthHeadersByAuthType(type: AuthType, username: String?, password: String?) -> [String: String] {
        let dAuthNonce = getGuid()
        let dAuthOrigin = Dataonix.DefaultHeaders.dAuthOrigin
        let dAuthType = String(type.get())
        let dAuthCreatedOnClient = toDateString()
        
        let dAuthId = username
        let userHashedPassword = HMAC_SHA1_128.getSha1_128(Dataonix.Core.passwordEncryptKey, withData: password)
        
        var hashingKey: String?
        var dataToSign: String?
        var headers: [String: String] = [:]
        
        if type == AuthType.deviceAuthentication {
            let dAuthDid = self.getDeviceId()
            let dAuthFinger = String.macSerialNumber()
            headers[Dataonix.AuthHeaders.dAuthDid] = dAuthDid
            hashingKey = dAuthDid.uppercased() + dAuthFinger.uppercased() + "".uppercased()
            dataToSign = dAuthDid.uppercased() + dAuthCreatedOnClient.uppercased() + dAuthNonce.uppercased() + dAuthOrigin.uppercased() + dAuthType.uppercased() + "".uppercased()
            
        } else if type == AuthType.userAuthentication {
            hashingKey = (dAuthId?.uppercased())! + (userHashedPassword?.uppercased())! + "".uppercased()
            dataToSign = (dAuthId?.uppercased())! + dAuthCreatedOnClient.uppercased() + dAuthNonce.uppercased() + dAuthOrigin.uppercased() + dAuthType.uppercased() + "".uppercased()
        }
        
        
        let signature = dataToSign?.hmac(algorithm: .SHA512, key: hashingKey!)
        
        headers[Dataonix.AuthHeaders.dAuthType] = dAuthType
        headers[Dataonix.AuthHeaders.dAuthVersion] = Dataonix.DefaultHeaders.dAuthVersion
        headers[Dataonix.AuthHeaders.dAuthNonce] = dAuthNonce
        headers[Dataonix.AuthHeaders.dAuthCreatedOnClient] = dAuthCreatedOnClient
        headers[Dataonix.AuthHeaders.dAuthOrigin] = dAuthOrigin
        headers[Dataonix.AuthHeaders.dAuthMAC] =  HMAC_SHA1_128.macAddress()
        headers[Dataonix.AuthHeaders.dAuthId] = dAuthId
        headers[Dataonix.AuthHeaders.dAuthHash] = Dataonix.DefaultHeaders.dAuthHash
        headers[Dataonix.AuthHeaders.dAuthSign] = signature!
        
        headers[Dataonix.AuthHeaders.dAuthHost] = self.getMachineName()
        
        if let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String {
            headers[Dataonix.AuthHeaders.dAuthOriginVersion] = version
        }

        return headers
    }
    
    static func getDeviceId() -> String {
        let defaults = UserDefaults.standard
        let data = defaults.object(forKey: UserSettings.deviceInfo) as? NSDictionary
        
        DDLogInfo("DeviceInfoLog")
        
        if data != nil && data?["Id"] != nil {
            return data!["Id"] as! String
        }
        
        let identityResponse: NSData? = UserDefaults.standard.object(forKey: UserSettings.chatCredentials) as? NSData
        var response: NSDictionary?
        if identityResponse != nil {
            response = NSKeyedUnarchiver.unarchiveObject(with: identityResponse as! Data) as? NSDictionary
        }
        
        DDLogInfo("DeviceDetailsLog")
        
        let deviceId = response?.object(forKey: "Id") as? String
        
        if let id = deviceId {
            return id
        }
        
        DDLogInfo("Empty device id")
        
        return ""
    }
    
    static func getMachineName()-> String {
        
        if let currentHost = Host.current().localizedName {
            return currentHost.replacingOccurrences(of: "’", with: "\'")
        } else {
            return  "Unknown"
        }
        
    }
}
