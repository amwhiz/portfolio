//
//  NewDirectory.swift
//  COPsync911
//
//  Created by aj on 09/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation

extension FileManager.SearchPathDirectory {
    func createSubFolder(named: String, withIntermediateDirectories: Bool = false) -> Bool {
        guard let url = FileManager.default.urls(for: self, in: .userDomainMask).first else { return false }
        do {
            try FileManager.default.createDirectory(at: url.appendingPathComponent(named), withIntermediateDirectories: withIntermediateDirectories, attributes: nil)
            return true
        } catch {
            return false
        }
    }
}
