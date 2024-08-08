//
//  ZipExtension.swift
//  COPsync911
//
//  Created by Ulaganathan on 11/11/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation
import Zip

extension URL {
    
    static func zipArchive() -> URL? {
        var zipFilePath: URL?
        do {
            let dirPath = try FileManager.default.url(for: .libraryDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
            let dataPath = dirPath.appendingPathComponent("Logs/\(Bundle.main.infoDictionary?["CFBundleName"] as! String)")
            let fileName = "\(Bundle.main.infoDictionary?["CFBundleName"] as! String)-\(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as! String)-\(NSUUID().uuidString)-\(Date().iso8601)"
            zipFilePath = try Zip.quickZipFiles([dataPath], fileName: fileName)
            
            return zipFilePath
        } catch let error {
            DDLogError(error.localizedDescription)
        }
        
        return zipFilePath
    }
}
