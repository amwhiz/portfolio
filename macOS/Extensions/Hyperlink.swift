//
//  Hyperlink.swift
//  COPsync911
//
//  Created by aj on 02/10/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation

extension String {
    
    func link(url: NSURL) -> NSMutableAttributedString {
        let attrString = NSMutableAttributedString(string: self)
        let range = NSRange(location: 0, length: attrString.length)
        attrString.beginEditing()
        attrString.addAttribute(NSLinkAttributeName,
                                value: url.absoluteString!,
                                range: range)
        attrString.addAttribute(NSForegroundColorAttributeName,
                                value: Color.forgotPasswordAnchorLink,
                                range: range)
        attrString.addAttribute(NSUnderlineStyleAttributeName,
                                value: NSUnderlineStyle.styleSingle.rawValue,
                                range: range)
        attrString.endEditing()
        return attrString
    }
}
