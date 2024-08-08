//
//  DataonixApiClientCore.swift
//  COPsync911
//
//  Created by aj on 18/09/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation
import PromiseKit
import Alamofire

class DataonixApiClientCore {
    
    init() {}
    
    func get(uri: URL, parameters: [String:Any], headers: [String:String]) -> Promise<Any> {
        DDLogInfo("\(uri)")
        return Promise { fulfill, reject in
            var responseString: String?
            
            if !reachability.isReachable {
                reject(NetworkError.unreachable)
                return
            }
            
            Alamofire
            .request(uri,
                     method: .get,
                     parameters: parameters,
                     headers: headers)
            .responseString { response in
                responseString = response.result.value
            }
            .responseJSON { response in
                switch response.result {
                case .success(let data):
                    fulfill(data)
                case .failure(let error):
                    reject(error)
                    DataonixError.sharedInstance.handleError(error: responseString, response: response)
                }
            }
        }
    }
    
    func post(uri: URL, parameters: [String:Any], headers: [String:String]) -> Promise<Any> {
        DDLogInfo("\(uri)")
        return Promise { fulfill, reject in
            var responseString: String?
            
            if !reachability.isReachable {
                reject(NetworkError.unreachable)
                return
            }
            
            Alamofire
            .request(uri,
                     method: .post,
                     parameters: parameters,
                     encoding: JSONEncoding.default,
                     headers: headers)
            .responseString { response in
                responseString = response.result.value
            }
            .responseJSON { response in
                switch response.result {
                case .success(let data):
                    fulfill(data)
                case .failure(let error):
                    if response.response == nil {
                        if uri.absoluteString.contains(Dataonix.Endpoints.registerDevice) {
                            reject(NetworkError.unreachable)
                        } else {
                            reject(error)
                            DataonixError.sharedInstance.handleError(error: responseString, response: response)
                        }
                    } else {
                        reject(error)
                        DataonixError.sharedInstance.handleError(error: responseString, response: response)
                    }
                }
            }
            
        }
    }

    func getUri(endPoint: String) -> URL? {
        var urlComponents = URLComponents()
        
        urlComponents.scheme = Dataonix.Core.scheme
        urlComponents.host = getDataonixHost()
        urlComponents.path = "\(Dataonix.Core.version)\(endPoint)"
        
        return urlComponents.url
    }
    
    func getAuthHeaders() -> [String:String] {
        let username = authData[0] 
        let password = authData[1]
        
        return AuthHelper.getAuthHeadersByAuthType(
            type: AuthType.userAuthentication,
            username: username,
            password: password)
    }
}
