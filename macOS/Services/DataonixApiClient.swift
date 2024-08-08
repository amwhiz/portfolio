//
//  DataonixApiClient.swift
//  COPsync911
//
//  Created by aj on 18/09/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation
import PromiseKit
import Alamofire
import ReachabilitySwift

extension String {
    func insert(string:String, ind:Int) -> String {
        return  String(self.characters.prefix(ind)) + string + String(self.characters.suffix(self.characters.count - ind))
    }
}

// MARK: - Dataonix api client
class DataonixApiClient: DataonixApiClientCore {
    
    override init() {
        super.init()
    }
}

// MARK: - Send system info
extension DataonixApiClient {
    
    private func getSystemInfoUri() -> URL {
        return self.getUri(endPoint: Dataonix.Endpoints.sendSystemInfo)!
    }
    
    private func roundValue(number: Double, toNearest: Double) -> Double {
        return round(number / toNearest) * toNearest
    }
    
    private func getSystemVolume() -> String {
        let volume = Double(HMAC_SHA1_128.getVolume())
        let roundVolume = self.roundValue(number: volume, toNearest: 0.01) * 100
        
        return String(Int(roundVolume))
    }
    
    private func getNetworkType() -> String {
        switch reachability.currentReachabilityStatus {
        case .reachableViaWiFi:
            return "Wi-Fi"
        case .reachableViaWWAN:
            return "WWAN"
        default:
            return "Unknown"
        }
    }
    
    private func getMinorVersion() -> Int {
        return ProcessInfo().operatingSystemVersion.minorVersion
    }
    
    private func getOsName() -> String {
        switch self.getMinorVersion() {
        case 10:
            return "Yosemite"
        case 11:
            return "El Capitan"
        case 12:
            return "Sierra"
        default:
            return ""
        }
    }
    
    private func getModel() -> String {
        var size = 0
        sysctlbyname("hw.model", nil, &size, nil, 0)
        var model = [CChar](repeating: 0,  count: Int(size))
        sysctlbyname("hw.model", &model, &size, nil, 0)
        return String(cString: model)
    }
    
    private func getMachineArchitecture() -> String {
        var size = 0
        sysctlbyname("hw.machine", nil, &size, nil, 0)
        var machine = [CChar](repeating: 0,  count: Int(size))
        sysctlbyname("hw.machine", &machine, &size, nil, 0)
        let arch = String(cString: machine)
        
        if arch == "x86_64" {
            return "64-bit"
        }
        
        return "32-bit"
    }
    
    private func getProcessor() -> String {
        var size = 0
        sysctlbyname("machdep.cpu.brand_string", nil, &size, nil, 0)
        var processor = [CChar](repeating: 0,  count: Int(size))
        sysctlbyname("machdep.cpu.brand_string", &processor, &size, nil, 0)
        return String(cString: processor)
    }
    
    private func getPowerSource() -> [String] {
        let blob = IOPSCopyPowerSourcesInfo()
        let list = IOPSCopyPowerSourcesList(blob?.takeRetainedValue())
        let data = list?.takeRetainedValue()
        
        let power = data as? [NSDictionary]
        
        if power != nil {
            let powerData = power?[0]
            if powerData != nil {
                let capacity = powerData?.object(forKey: "Current Capacity") as! Int
                let isCharging = (powerData?.object(forKey: "Is Charging") as! Int) == 0 ? "false" : "true"
                
                return ["\(capacity)/100", isCharging]
            }
        }
        
        return ["", ""]
    }
    
    private func getFreeSpace() -> CGFloat {
        do {
            let fileAttributes = try FileManager.default.attributesOfFileSystem(forPath: "/")
            if let size = fileAttributes[FileAttributeKey.systemFreeSize] as? CGFloat {
                return size
            }
        } catch { }
        
        return 0
    }
    
    func sendSystemInfo() {
        let macAddress = "Network_MACAddress|-|" + HMAC_SHA1_128.macAddress()
        let address = Array<String>.getIFAddresses().joined(separator: ",")
        let ipAddress = "Network_IPAddress|-|" + address
        let networkType = "Network_Type|-|\(self.getNetworkType())"
        let username = "UserName|-|\(NSUserName())"
        let machineName = "Name|-|\(AuthHelper.getMachineName())"
        let serialNumber = "SerialNumber|-|\(String.macSerialNumber())"
        let currentVolume = "CurrentVolume|-|\(self.getSystemVolume())/100"
        let freeSpace = "FreeSpace|-|\(Int(round(self.getFreeSpace() / (1000 * 1000 * 1000))))Gb"
        
        let osName = "OperatingSystem_Caption|-|\(self.getOsName())"
        let osVersion = "OperatingSystem_Version|-|\(ProcessInfo().operatingSystemVersionString)"
        let archType = "OperatingSystem_Architecture|-|\(self.getMachineArchitecture())"
        let systemDirectory = "OperatingSystem_SystemDirectory|-|/System"
        let systemDrive = "OperatingSystem_SystemDrive|-|/"
        let memory = "TotalPhysicalMemory|-|\(ProcessInfo().physicalMemory)"
        let manufacturer = "Manufacturer|-|Apple Inc."
        let modelStr = self.getModel()
        let model = "Model|-|\(modelStr)"
        
        var batteryLevel: String?
        var isPluggedIn: String?
        
        if modelStr.lowercased().contains("macbook") {
            let power = self.getPowerSource()
            batteryLevel = "BatteryLevel|-|\(power[0])"
            isPluggedIn = "IsPluggedIn|-|\(power[1])"
        }
        
        let currentDate = Date()
        
        let formatter = DateFormatter()
        formatter.timeZone = TimeZone.current
        formatter.dateFormat = "yyyy-MM-dd hh:mm:ss Z"
        let dateStr = formatter.string(from: currentDate)
        let dateArr = dateStr.components(separatedBy: " ")
        let offset = dateArr[2]
        let offsetStr = offset.insert(string: ":", ind: 3)
        
        let zone = TimeZone.current
        let timeZoneLocalName = zone.localizedName(for: .standard, locale: Locale.current)!
        let timeZoneName = "TimeZone|-|(UTC\(offsetStr)) \(timeZoneLocalName)"
        let processor = "ProcessorName|-|\(self.getProcessor())"
        
        let graphics = HMAC_SHA1_128.getGraphicsInfo()!.replacingOccurrences(of: "\0", with: "")
        let graphicsCaption = "VideoController_Caption|-|\(graphics)"
        let screen = NSScreen.main()?.frame
        let width = String(describing: (screen!.width) as CGFloat)
        let height = String(describing: (screen!.height) as CGFloat)
        let screenWidth = "VideoController_CurrentHorizontalResolution|-|\(width)"
        let screenHeight = "VideoController_CurrentHorizontalResolution|-|\(height)"
        let landscape = "VideoController_ScreenOrientation|-|Landscape"

        var payload = [ipAddress,
                       macAddress,
                       networkType,
                       osName,
                       osVersion,
                       archType,
                       systemDirectory,
                       systemDrive,
                       username,
                       memory,
                       manufacturer,
                       model,
                       machineName,
                       serialNumber,
                       currentVolume,
                       freeSpace,
                       timeZoneName,
                       processor,
                       graphicsCaption,
                       screenWidth,
                       screenHeight,
                       landscape
                       ]
        
        if batteryLevel != nil {
            payload.append(batteryLevel!)
            payload.append(isPluggedIn!)
        }
        
        DDLogInfo("\(payload)")
        
        var request = URLRequest(url: self.getSystemInfoUri())
        request.httpMethod = "POST"
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: payload)
        } catch {
            DDLogError("JSON serialization failed")
        }
        
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let headers = AuthHelper.getAuthHeadersByAuthType(type: AuthType.deviceAuthentication, username: "", password: "")
        
        for (key, value) in headers {
            request.setValue(value, forHTTPHeaderField: key)
        }
        
        DispatchLevel.background.dispatchQueue.async {
            Alamofire.request(request)
                .responseJSON { response in
                    DDLogInfo("[SYSINFO] sent successfully")
            }
        }
    }
}
