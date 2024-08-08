//
//  ChatController.swift
//  copsync
//
//  Created by Arul Jothi on 6/26/16.
//  Copyright © 2016 copsync. All rights reserved.
//

import Cocoa

class ChatController: NSViewController, LoaderDelegate, MessengerDelegate {
    
    @IBOutlet weak var loaderTextField: NSTextField!
    @IBOutlet weak var loaderView: NSView!
    @IBOutlet weak var progressIndicator: NSProgressIndicator!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        Messenger.sharedInstance.messengerDelegate?.addDelegate(self)
        DispatchQueue.main.async(execute: {
            self.showAndHideLoaderView(isHidden:false)
        })
    }
    
    override func viewDidDisappear() {
    }
    
    override func viewWillAppear() {
        super.viewWillAppear()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1, execute: {
            NSApp.dockTile.badgeLabel = nil
            self.animateView()
        })
    }
    
    func showAndHideLoaderView(isHidden: Bool) {
        self.progressIndicator.startAnimation(true)
        self.loaderTextField.stringValue = "Chat in progress..."
        self.loaderView.isHidden = isHidden
        self.loaderView.wantsLayer = true
        self.loaderView.layer?.backgroundColor = NSColor.white.cgColor
    }
    
    func xmppConnectionStatus(status: String) {
        self.loaderTextField.stringValue = status
    }

    func animateView() {
        NSAnimationContext.runAnimationGroup({ (context: NSAnimationContext) in
            context.duration = 1
            self.loaderView.animator().alphaValue = 0
        }) {
            self.loaderView.isHidden = true
            self.loaderView.alphaValue = 1
        }
    }
    
    func onStateChange(user: AnyObject, state: AnyObject) {
        NotificationCenter.default.post(name: NSNotification.Name("onStateChange"), object: ["user": user, "state": state])
    }
    
    func onMemberListModified() {
        NotificationCenter.default.post(name: NSNotification.Name("onMemberListModified"), object: nil)
    }
    
    func onMessageCountChange() {
        NotificationCenter.default.post(name: NSNotification.Name("onMessageCountChange"), object: nil)
    }
    
    func onRoomStateUpdate() {
        debugPrint("onRoomStateUpdate")
    }
    
    //MARK: * * * XMPPDelegate * * *
    
    func onBuddyDone() {
        debugPrint("onBuddyDone")
    }
    
    func onBuddyOnline() {
        debugPrint("onBuddyOnline")
    }
    
    func onBuddyPaused() {
        debugPrint("onBuddyPaused")
    }
    
    func onBuddyTyping() {
        debugPrint("onBuddyTyping")
    }
    
    func onBuddyWentOffline() {
        debugPrint("onBuddyWentOffline")
    }
    
    func onMessengerConnected() {
        debugPrint("onMessengerConnected")
    }
    
    func onMessengerConnecting() {
        debugPrint("onMessengerConnecting")
    }
    
    func onConnectionStateChange() {
        debugPrint("onConnectionStateChange")
    }
    
    func onMessengerDisconnected() {
        debugPrint("onMessengerDisconnected")
    }
    
    func onConnectionLost(_ aNotification: Notification) {
        debugPrint("called connection lost")
        if UserDefaultsHelper.isUserAuthenticated() {
            if (Messenger.sharedInstance.currentConnectionState == ConnectionState.Connected && Messenger.sharedInstance.currentRoomState != RoomState.Joining) {
                if (!Messenger.sharedInstance.hasJoinedRoom()) {
                    Messenger.sharedInstance.messages.removeAll()
                    Messenger.sharedInstance.joinRoom(history: true)
                }
                
                debugPrint("Reconnected")
            } else if (
                Messenger.sharedInstance.currentConnectionState == .Disconnected && Messenger.sharedInstance.appState == .Active
                ) {
                
                if (!Messenger.sharedInstance.isStreamConnected()) {
                    Messenger.sharedInstance.connect {
                        if(!Messenger.sharedInstance.hasJoinedRoom()  && Messenger.sharedInstance.currentRoomState != .Joining) {
                            Messenger.sharedInstance.messages.removeAll()
                            Messenger.sharedInstance.joinRoom(history: true)
                        }
                    }
                }
            }
        }
    }
}
