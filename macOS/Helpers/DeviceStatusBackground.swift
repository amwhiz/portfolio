//
//  DeviceStatusBackground.swift
//  COPsync911
//
//  Created by Shaul Hameed on 04/11/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation
import Alamofire


@objc protocol DeviceServiceBackgroundDelegate{
    
    @objc optional func onDeviceDeactivated()
    
    @objc optional func onDeviceActivated()
    
}

enum DeviceState {
    case Active
    case Deactive
}

class DeviceStatusBackground: NSObject {
    
    static let sharedInstance = DeviceStatusBackground()
    
    
    var currentDeviceState:DeviceState = .Deactive
    
    var delegates: MulticastDelegate = MulticastDelegate<DeviceServiceBackgroundDelegate>()
    
    private var defaultInterval:Int = 600;

    override init(){
        
        super.init()
        
    }
    
    
    func setDefaultInterval(interval: Int){
        
        self.defaultInterval = interval
    }
    
    private func getUri(endPoint: String) -> URL? {
        var urlComponents = URLComponents()
        
        urlComponents.scheme = Dataonix.Core.scheme
        urlComponents.host = getDataonixHost()
        urlComponents.path = "\(Dataonix.Core.version)\(endPoint)"
        
        return urlComponents.url
    }
    
    private func getCurrentDeviceActiveUri() -> URL {
        return self.getUri(endPoint: Dataonix.Endpoints.isCurrentDeviceActive)!
    }
    
    
    private func deviceStatusCheckAPI(uri: URL, parameters: [String:Any], headers: [String:String], callback: @escaping ()->Void){
        
        DDLogInfo("COPSYNC:: Checking current device status.")
        
        Alamofire
            .request(uri,
                     method: .get,
                     parameters: parameters,
                     headers: headers)
            .responseString { (responseHeaders) in
                if let DAuthCode = responseHeaders
                    .response?.allHeaderFields["DAuth-Code"]{
                    
                    let DAuthCodeInt = (DAuthCode as! NSString).intValue
                    _ = DataonixErrorMessage(errorCode: Int(DAuthCodeInt), withSecondOption: true)
                    
                    if(Int(DAuthCodeInt) == 412){
                        
                       self.currentDeviceState = .Deactive
                    
                    }
                    
                    
                }
                
            }
            .responseJSON { (response) in
                switch response.result {
                case .success(let data):
                    let json = data as! NSDictionary
                    
                    if json["IsActive"] as! Int == 1{
                        self.currentDeviceState = .Active
                    }
                case .failure(let error):
                    DDLogError("\(error)")
                    
                }
                callback()
                
            }
        
}
    
    
    private func isDeviceActive(){
        
        
        DispatchLevel.userInteractive.dispatchQueue.async{
            
            
            let deviceStatusCheckAPICallback = {
               
                if(self.currentDeviceState == .Deactive){
                    
                    self.delegates |> {
                        delegate in
                        if let onDeviceDeactivated  = delegate.onDeviceDeactivated {
                             DDLogInfo("Device inactive")
                            onDeviceDeactivated ()
                        }
                    }

                }
                else if (self.currentDeviceState == .Active){
                    self.delegates |> {
                        delegate in
                        if let onDeviceActivated  = delegate.onDeviceActivated {
                            DDLogInfo("Device active")
                            onDeviceActivated ()
                        }
                    }
                }
            }
            
            self.deviceStatusCheckAPI(
                uri: self.getCurrentDeviceActiveUri(),
                parameters: [:],
                headers: AuthHelper.getAuthHeadersByAuthType(type: AuthType.deviceAuthentication, username: "", password: ""), callback: deviceStatusCheckAPICallback)
        
        }
        
    }
    
    
    func start(){
        if UserDefaultsHelper.isDeviceRegistered() {
            DDLogInfo("COPSYNC:: Checking Device active state")
            self.isDeviceActive()
        }
        
        
        let date = Date().addingTimeInterval(TimeInterval(self.defaultInterval))
        let timer = Timer(fireAt: date, interval: 0, target: self, selector: #selector(self.start), userInfo: nil, repeats: false)
        
        RunLoop.main.add(timer, forMode: RunLoopMode.commonModes)

        
    }
    
    
}
