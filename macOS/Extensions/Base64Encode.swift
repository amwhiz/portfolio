//
//  Base64Encode.swift
//  COPsync911
//
//  Created by aj on 02/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation

extension String {
    
    func base64Encoded() -> String {
        let data = self.data(using: String.Encoding.utf8)
        let resultData = data!.base64EncodedData(options: NSData.Base64EncodingOptions.endLineWithLineFeed)
        
        let resultNSString = NSString(data: resultData, encoding: String.Encoding.utf8.rawValue)!
        let resultString = resultNSString as String
        return resultString
    }
}
