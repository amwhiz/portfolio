//
//  LogFormatter.swift
//  COPsync911
//
//  Created by Shaul Hameed on 11/4/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation

class LogFormatter: DDDispatchQueueLogFormatter {
    let threadUnsafeDateFormatter: DateFormatter
    
    override init() {
        threadUnsafeDateFormatter = DateFormatter()
        threadUnsafeDateFormatter.formatterBehavior = .behavior10_4
        threadUnsafeDateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss.SSS +00:00"
        
        super.init()
    }
    
    override func format(message logMessage: DDLogMessage!) -> String {
        let dateAndTime = threadUnsafeDateFormatter.string(from: logMessage.timestamp)
        
        var logLevel: String
        let logFlag = logMessage.flag
        if logFlag.contains(.error) {
            logLevel = "ERROR"
        } else if logFlag.contains(.warning){
            logLevel = "WARNING"
        } else if logFlag.contains(.info) {
            logLevel = "INFO"
        } else if logFlag.contains(.debug) {
            logLevel = "DEBUG"
        } else if logFlag.contains(.verbose) {
            logLevel = "VERBOSE"
        } else {
            logLevel = "?"
        }
        
        let computerName = AuthHelper.getMachineName()
        
        var version: String = ""
        if let bundleVer = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String {
            version = bundleVer
        }
        
        let formattedLog = "\(dateAndTime)|v\(version)|\(logLevel)|\(computerName)|[\(logMessage.fileName as String) \(logMessage.function as String) #\(logMessage.line as UInt)]|\(logMessage.message as String)"
        
        return formattedLog
    }
}
