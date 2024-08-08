//
//  IdentityApiClient.swift
//  COPsync911
//
//  Created by aj on 03/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation
import PromiseKit
import Alamofire

struct IdentityOrganizationRoles {
    var OrganizationId: String
    var RoleCode: String
    
    init(id: String, role: String) {
        self.OrganizationId = id
        self.RoleCode = role
    }
}

class IdentityApiClient: DataonixApiClientCore {
    
    override init() {
        super.init()
    }
    
    private func getCurrentIdentityUri() -> URL {
        return self.getUri(endPoint: Dataonix.Endpoints.getCurrentIdentity)!
    }
    
    private func getCurrentIdentityHeaders(username: String, password: String) -> [String:String] {
        return AuthHelper.getAuthHeadersByAuthType(
            type: AuthType.userAuthentication,
            username: username,
            password: password)
    }
    
    private func decorateIdentityResponse(response: NSDictionary) {
        UserDefaults.standard.set(NSKeyedArchiver.archivedData(withRootObject: response), forKey: UserSettings.identityResponse)
    }
    
    func getCurrentIdentity(username: String, password: String) -> Promise<Bool> {
        let headers = self.getCurrentIdentityHeaders(username: username, password: password)
        
        return Promise { fulfill, reject in
            if !reachability.isReachable {
                reject(NetworkError.unreachable)
                return
            }
            
            let uri = self.getCurrentIdentityUri()
            DDLogInfo("\(uri)")
            
            var responseString: String?
            Alamofire
                .request(uri,
                         method: .get,
                         parameters: [:],
                         headers: headers)
                .responseString { response in
                    responseString = response.result.value
                }
                .responseJSON { response in
                    switch response.result {
                    case .success(let data):
                        let body = data as! NSDictionary
                        let roles = self.getRolesFromResponse(response: body)
                        self.decorateIdentityResponse(response: body)
                        
                        if UserDefaultsHelper.isDeviceRegistered() {
                            if self.isDataonixIdenity(roles: roles) {
                                fulfill(true)
                            } else if self.isOrgAdmin(roles: roles) {
                                if UserDefaultsHelper.isDeviceRegistered() &&
                                    self.validateOrganization(response: body) {
                                    fulfill(true)
                                } else {
                                    reject(AuthorizationError.invalidOrg)
                                }
                            } else if self.isOrgUser(roles: roles) {
                                if UserDefaultsHelper.isDeviceRegistered() &&
                                    self.validateOrganization(response: body) {
                                    fulfill(true)
                                } else {
                                    reject(AuthorizationError.invalidOrg)
                                }
                            } else {
                                reject(AuthorizationError.invalidOrg)
                            }
                        } else {
                            fulfill(true)
                        }
                    case .failure(let error):
                        DataonixError.sharedInstance.handleError(error: responseString, response: response)
                        reject(error)
                    }
            }
        }
    }
    
    func getRolesFromResponse(response: NSDictionary) -> [String] {
        if let roles = response.object(forKey: "UserRoleCodes") {
            let userRoles = roles as? NSDictionary
            let roleValues: [String] = userRoles?.object(forKey: "$values") as! [String]
            
            return roleValues
        }
        
        return [String]()
    }
    
    func isOrgUser(roles: [String]) -> Bool {
        if roles.contains("ORGUSR") {
            return true
        }
        
        return false
    }
    
    func isOrgAdmin(roles: [String]) -> Bool {
        if roles.contains("ORGADM") {
            return true
        }
        
        return false
    }
    
    func validateOrganization(response: NSDictionary) -> Bool {
        let responseOrgId = response.object(forKey: "OrganizationId") as? String
        if responseOrgId != nil {
            if let deviceResponse = UserDefaults.standard.object(forKey: DeviceSettings.deviceOrganizationId) {
                return responseOrgId! == deviceResponse as! String
            } else {
                return true
            }
        }
        
        return false
    }
    
    func checkIdentityIsAllowModifySettings(username: String, password: String) -> Promise<Bool> {
        let headers = self.getCurrentIdentityHeaders(username: username, password: password)
        
        return Promise { fulfill, reject in
            if !reachability.isReachable {
                reject(NetworkError.network)
                return
            }
            
            let uri = self.getCurrentIdentityUri()
            DDLogInfo("\(uri)")
            
            var responseString: String?
            Alamofire
                .request(uri,
                         method: .get,
                         parameters: [:],
                         headers: headers)
                .responseString { response in
                    responseString = response.result.value
                }
                .responseJSON { response in
                    switch response.result {
                    case .success(let data):
                        let body = data as! NSDictionary
                        let roles = self.getRolesFromResponse(response: body)
                        if self.isDataonixIdenity(roles: roles) {
                            fulfill(true)
                        } else if self.validateOrganization(response: body) {
                            fulfill(true)
                        } else {
                            reject(AuthorizationError.invalidOrg)
                        }
                    case .failure(let error):
                        DataonixError.sharedInstance.handleError(error: responseString, response: response)
                        reject(error)
                    }
            }
        }
    }
    
    func checkValidUser(response: NSDictionary) -> Bool {
        let orgId = response.object(forKey: "OrganizationId") as! String
        let userId = response.object(forKey: "UserId") as! String
        let currentUserOrgId = User.sharedInstance.currentUser.organizationID!
        
        if orgId == currentUserOrgId &&
            userId == User.sharedInstance.currentUser.userID! {
            return true
        }
        
        return false
    }
    
    func isDataonixIdenity(roles: [String]) -> Bool {
        if roles.contains("DTXADM") || roles.contains("DTXSUP") {
            return true
        }
        
        return false
    }
    
    
    func checkIdentiryIsAllowToQuit(username: String, password: String) -> Promise<Bool> {
        let headers = self.getCurrentIdentityHeaders(username: username, password: password)
        
        return Promise { fulfill, reject in
            if !reachability.isReachable {
                reject(NetworkError.network)
                return
            }
            
            let uri = self.getCurrentIdentityUri()
            DDLogInfo("\(uri)")
            
            var responseString: String?
            Alamofire
                .request(uri,
                         method: .get,
                         parameters: [:],
                         headers: headers)
                .responseString { response in
                    responseString = response.result.value
                }
                .responseJSON { response in
                    switch response.result {
                    case .success(let data):
                        let body = data as! NSDictionary
                        let roles = self.getRolesFromResponse(response: body)
                        if self.isDataonixIdenity(roles: roles) {
                            fulfill(true)
                        } else if self.validateOrganization(response: body) && self.isOrgAdmin(roles: roles) {
                            fulfill(true)
                        } else {
                            reject(AuthorizationError.orgAdmin)
                        }
                    case .failure(let error):
                        DataonixError.sharedInstance.handleError(error: responseString, response: response)
                        reject(error)
                    }
            }
        }
    }
}
