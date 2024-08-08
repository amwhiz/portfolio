//
//  LoaderUtil.swift
//  COPsync911
//
//  Created by Shaul Hameed on 10/18/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Cocoa

class LoaderUtil: NSObject {
    
    var progressIndicator: NSProgressIndicator?
    
    var superView: NSView?
    
    var shadowView: NSView?

    override init() {
        super.init()
    }

    
    func startAnimate(view: NSView, sender: Any?) {
        
        self.superView = view
        
        self.shadowView = NSView(frame: CGRect(x: 0, y: 0, width: view.frame.size.width, height: view.frame.size.height - 45))
        
        
        self.progressIndicator = NSProgressIndicator(frame: CGRect(x: ((self.shadowView?
            .frame.size.width)! - 100)/2, y:((self.shadowView?.frame.size.height)! - 40)/2, width: 100, height: 40))
        
        self.shadowView?.wantsLayer = true
        
        self.shadowView?.layer?.backgroundColor = NSColor.clear.cgColor
        
        let shadowBackground:NSView = NSView(frame:  CGRect(x: 0, y: 0, width: view.frame.size.width, height: view.frame.size.height - 45))
       
        self.shadowView?.acceptsTouchEvents = false
        
        shadowBackground.wantsLayer =  true

        shadowBackground.layer?.backgroundColor = NSColor.white.withAlphaComponent(0.8).cgColor
        
        shadowBackground.acceptsTouchEvents = false
        
        shadowView?.addSubview(shadowBackground)
        self.progressIndicator?.isIndeterminate = false
        self.progressIndicator?.style = .spinningStyle
        
        self.progressIndicator?.isIndeterminate = true
        self.progressIndicator?.startAnimation(self)
        
        self.shadowView?.addSubview((progressIndicator)!)
        
        
        view.addSubview((self.shadowView)!)
        
        
        self.progressIndicator?.maxValue = 100
        
        self.progressIndicator?.minValue = 0
    }
    
    func stopAnimate() {
        self.shadowView?.removeFromSuperview()
    }
    
    func startAnimateSlim(view:NSView, sender: Any?) {
        self.progressIndicator = NSProgressIndicator(frame: CGRect(x: (view.frame.width - 100)/2, y: (view.frame.height - 40)/2, width: 100, height: 40))
        
        self.progressIndicator?.isIndeterminate = false
        self.progressIndicator?.style = .spinningStyle
        
        self.progressIndicator?.isIndeterminate = true
        self.progressIndicator?.startAnimation(self)
        
        view.addSubview((self.progressIndicator)!)
        
        self.progressIndicator?.maxValue = 100
        
        self.progressIndicator?.minValue = 0
    }
    
    func stopAnimateSlim() {
        self.progressIndicator?.removeFromSuperview()
    }
}
