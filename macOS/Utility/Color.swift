//
//  Color.swift
//  COPsync911
//
//  Created by aj on 18/09/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation

struct Color {
    static let white = NSColor.white.cgColor
    
    /// Forgot password anchor link
    static let forgotPasswordAnchorLink = NSColor.init(red: 98.0 / 255.0,
                                                       green: 110.0 / 255.0,
                                                       blue: 119.0 / 255.0,
                                                       alpha: 1.0)
}


struct ColorCode {
    
    static let PlaceHolder: CGColor = NSColor(red: 0.875 / 255.0,
                                              green: 0.878 / 255.0,
                                              blue: 0.886 / 255.0,
                                              alpha: 1.00).cgColor
    static let TextColor: CGColor = NSColor.black.cgColor
    static let IncomingTextColor: CGColor = NSColor(red: 0.467 / 255.0,
                                                    green: 0.467 / 255.0,
                                                    blue: 0.467 / 255.0,
                                                    alpha: 1.00).cgColor
    
    static let redcolWithAlpha: NSColor = NSColor(red: 192.0 / 255.0,
                                                    green: 31.0 / 255.0,
                                                    blue: 0 / 255.0,
                                                    alpha: 0.85)
    
    static let yellowWithAlpha: NSColor = NSColor(red: 191.0 / 255.0,
                                                  green: 147.0 / 255.0,
                                                  blue: 0 / 255.0,
                                                  alpha: 0.85)
    static let yellowColor: NSColor = NSColor(red: 255.0 / 255.0,
                                              green: 244.0 / 255.0,
                                              blue: 209.0 / 255.0,
                                              alpha: 1.0)
    
    static let redColor : NSColor = NSColor(red: 246.0 / 255.0,
                                            green: 219.0 / 255.0,
                                            blue: 216.0 / 255.0,
                                            alpha:1.0)
    
    static let lightBlueColor : CGColor = NSColor(red: 240.0 / 255.0,
                                            green: 245.0 / 255.0,
                                            blue: 248.0 / 255.0,
                                            alpha:1.0).cgColor
    
    static let lightBluelineColor : CGColor = NSColor(red: 235.0 / 255.0,
                                                  green: 239.0 / 255.0,
                                                  blue: 240.0 / 255.0,
                                                  alpha:1.0).cgColor
   
    static let messageTextFieldBackroundColor : CGColor = NSColor(red: 211.0 / 255.0,
                                                      green: 224.0 / 255.0,
                                                      blue: 229.0 / 255.0,
                                                      alpha:1.0).cgColor
    
    static let messageTextFieldColor : NSColor = NSColor(red: 211.0 / 255.0,
                                                         green: 224.0 / 255.0,
                                                         blue: 229.0 / 255.0,
                                                         alpha:1.0)
    
   
    
    
}
