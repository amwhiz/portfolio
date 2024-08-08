//
//  Extension.swift
//  COPsync911
//
//  Created by aj on 18/09/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation

extension String {
    
    func replace(pattern: String, replaceWith: String) throws -> String {
        let internalExpression = try NSRegularExpression(pattern: pattern,
                                                         options: NSRegularExpression.Options.caseInsensitive)
        var modString: String = ""
        
        if self.characters.count > 0 {
            modString = internalExpression.stringByReplacingMatches(in: self,
                                                                    options: NSRegularExpression.MatchingOptions.anchored,
                                                                    range: NSMakeRange(0, self.characters.count),
                                                                    withTemplate: replaceWith)
        }
        
        return modString
    }
    
    func test(pattern: String) throws -> Bool {
        let internalExpression = try NSRegularExpression(pattern: pattern,
                                                         options: NSRegularExpression.Options.caseInsensitive)
        
        var modString: [NSTextCheckingResult]?
        if self.characters.count > 0 {
            modString = internalExpression.matches(in: self,
                                                   options: .anchored,
                                                   range: NSMakeRange(0, self.characters.count))
        }
        
        return modString!.count > 0
    }
    
    func match(pattern: String) throws -> [String] {
        let internalExpression = try NSRegularExpression(pattern: pattern,
                                                         options:[NSRegularExpression.Options.caseInsensitive,
                                                                  NSRegularExpression.Options.anchorsMatchLines])
        let nsString = self as NSString
        
        if nsString.length < 1 {
            return []
        }
        
        let modString = internalExpression.matches(in: self, options: [], range: NSMakeRange(0, nsString.length))
        let result = modString.map {nsString.substring(with: $0.range)}
        
        return result.filter{ $0.characters.count > 0 }
    }
}

extension Array where Element: Equatable {
    var orderedSetValue: [Element] {
        return reduce([]) { $0.0.contains($0.1) ? $0.0 : $0.0 + [$0.1] }
    }
}
