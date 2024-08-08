//
//  ReplaceSegueHelper.swift
//  COPsync911
//
//  Created by aj on 12/07/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa

class ReplaceSegueHelper: NSStoryboardSegue {
    
    override func perform() {
        if let src = self.sourceController as? NSViewController,
            let dest = self.destinationController as? NSViewController,
            let window = src.view.window {
            // calculate new frame:
            var rect = window.frameRect(forContentRect: dest.view.frame)
            rect.origin.x += (src.view.frame.width - dest.view.frame.width) / 2
            rect.origin.y += src.view.frame.height - dest.view.frame.height
            // don’t shrink visible content, prevent minsize from intervening:
            window.contentViewController = nil
            // animate resizing (TODO: crossover blending):
            window.setFrame(window.convertToScreen(rect), display: true, animate: true)
            // set new controller
            window.contentViewController = dest
        }
    }
}
