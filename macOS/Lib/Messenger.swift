//
//  Messenger.swift
//  COPsync911
//
//  Created by aj on 12/07/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation

@objc protocol MessengerDelegate {
    
    @objc optional func onMessengerDisconnected()
    
    @objc optional func onMessengerConnected()
    
    @objc optional func onMessengerConnecting()
    
    @objc optional func onBuddyOnline()
    
    @objc optional func onBuddyWentOffline()
    
    @objc optional func onBuddyTyping()
    
    @objc optional func onBuddyPaused()
    
    @objc optional func onBuddyDone()
    
    @objc optional func onRoomStateUpdate()
    
    @objc optional func didRecieveMessage(message: AnyObject)
    
    @objc optional func onConnectionStateChange()
    
    @objc optional func onMessageCountChange()
    
    @objc optional func onStateChange(user: AnyObject, state: AnyObject)
    
    @objc optional func onMemberListModified()
    
    @objc optional func onRoomJoin()
    
    @objc optional func onStreamAuthenticated()
    
    @objc optional func onWentOnline()
    
}





enum AuthError: Error {
    case CouldnotFetchLoggedInUser
}

enum ApplicationState {
    case Active
    case Inactive
}

enum UserState {
    case Online
    case Offline
}

enum ConnectionState: String {
    case Connected
    case Connecting
    case AuthenticationFailed
    case Disconnected
    case Offline
    case Reconnected
}

enum RoomState: String {
    case Joined = "Joined the room"
    case Joining = "Joining the room"
    case Left = "Left the room"
    case None = "No action"
    case Failed = "Failed to join room"
}

enum ChatState: String {
    case Composing
    case Paused
    case Gone
}

enum MessgeDeliveryState {
    case Sent
    case Failed
    case Sending
}

enum MessageType {
    case Incoming
    case Outgoing
}



struct Message {
    
    let ID: String
    let Text: String
    let From: XMPPJID
    let To: XMPPJID
    let Time: Double
    let State: MessgeDeliveryState = .Sending
    var DisplayName: String
    var ChatMessageType: MessageType
    
    let StanzaTime: String
    
    init(text: String,
         from: XMPPJID,
         to: XMPPJID,
         displayName: String,
         chatMessageType: MessageType
        ) {
        self.ID = NSUUID().uuidString
        self.Text = text
        self.From = from
        self.To = to
        self.Time = NSDate().timeIntervalSince1970 * 1000
        self.DisplayName = displayName
        self.ChatMessageType = chatMessageType
        
        self.StanzaTime = Misc.GetTimeStamp(timestamp: Date())
    }
    
    init?(text: String,
          from: XMPPJID,
          to: XMPPJID,
          displayName: String,
          chatMessageType: MessageType,
          
          time: Double,
          stanzaTime: String) {
        self.ID = NSUUID().uuidString
        self.Text = text
        self.From = from
        self.To = to
        self.Time = time
        self.DisplayName = displayName
        self.ChatMessageType = chatMessageType
        
        self.StanzaTime = stanzaTime
    }
    
    init(text: String,
         from: XMPPJID,
         to: XMPPJID,
         displayName: String,
         chatMessageType: MessageType,
         time: String) {
        
        self.ID = NSUUID().uuidString
        self.Text = text
        self.From = from
        self.To = to
        self.Time = NSDate().timeIntervalSince1970 * 1000
        self.DisplayName = displayName
        self.ChatMessageType = chatMessageType
        self.StanzaTime = time
    }
}


struct RoomUser {
    var displayName: String
    let role: DataonixUserRole
    let status: UserState
    let chatID: XMPPJID
}

typealias OnRoomCreationCompletionHandler = (_ sender: XMPPRoom) -> Void



class Messenger: NSObject, XMPPStreamDelegate, XMPPRoomDelegate, XMPPReconnectDelegate, XMPPAutoPingDelegate {
    
    static let sharedInstance = Messenger()
    
    let messengerDelegate:MulticastDelegate? = MulticastDelegate<MessengerDelegate>()
    
    var messages: [Message] = [Message]()
    
    var currentRoomUser: RoomUser?
    
    var roomUsers: [String: [RoomUser]] = [String: [RoomUser]]()
    
    var currentMessageUser: DataonixUser = DataonixUser()
    
    var currentConnectionState: ConnectionState = ConnectionState.Disconnected
    
    var currentRoomState: RoomState = RoomState.None
    
    var onStreamConnectionComplete: OnCompletionHandler?
    
    var onGetMembersList: OnCompletionHandler?
    
    var didToldToDisconnect: Bool = false
    
    var appState: ApplicationState = ApplicationState.Active
    
    var isDirty: Bool = false
    
    var membersList: [RoomUser] = [RoomUser]()
    
    var groupMemberList: [Any] = [Any]()
    
    var groupMemberListFromRoom: [String] = [String]()
    
    var hasGoneOnline: Bool = false
    
    var autoPing: XMPPAutoPing?
    
    internal var messageQueue: Queue<Message> = Queue<Message>()
    internal var stream:XMPPStream?
    internal var xmppRoster: XMPPRoster?
    internal var room: XMPPRoom?
    internal let xmppRosterStorage = XMPPRosterCoreDataStorage()
    internal var roomID: XMPPJID?
    internal var alertId: String?
    internal var myJID: XMPPJID?
    internal var locationName: String?
    
    internal var reconnect: XMPPReconnect?
    
    override init() {
        DDLogInfo("[MESSENGER] Initialized")
        super.init()
        self.stream = XMPPStream()
        self.stream?.addDelegate(self, delegateQueue: DispatchQueue.main)
        self.xmppRoster?.addDelegate(self, delegateQueue: DispatchQueue.main)
        self.reconnect = XMPPReconnect()
        self.reconnect?.addDelegate(self, delegateQueue: DispatchQueue.main)
        self.reconnect?.activate(self.stream)
        self.reconnect?.autoReconnect = true
        self.stream?.keepAliveInterval = 0xA
        
        self.autoPing = XMPPAutoPing()
        self.autoPing?.pingInterval = 5
        self.autoPing?.activate(self.stream)
    }
    
    func getOnlineMemberList(onComplete: OnCompletionHandler?) {
        DDLogInfo("[MESSENGER] getOnlineMemberList")
        if ((self.stream?.isConnected()) != nil) {
            let fetchMembersIQ =  XMLElement.element(withName: "iq") as! XMLElement
            fetchMembersIQ.addAttribute(withName: "to", stringValue: self.getRawXMPPJid())
            fetchMembersIQ.addAttribute(withName: "type", stringValue: "get")
            
            let query = XMLElement.element(withName: "query") as! XMLElement
            query.addAttribute(withName: "xmlns", stringValue: "http://jabber.org/protocol/disco#items")
            fetchMembersIQ.addChild(query)
            DDLogInfo("\(fetchMembersIQ)")
            self.stream?.send(fetchMembersIQ)
            self.onGetMembersList = onComplete
        }
    }
    
    
    func triggerOnMemberListModified() {
        DDLogInfo("[MESSENGER] triggerOnMemberListModified")
        self.groupMemberList.removeAll()
        let groups = ["DISPATCH", "OFFICERS", "LOCATIONS"]
        if(self.roomUsers.count < 1){
            
            self.groupMemberList = groups;
            self.messengerDelegate! |> {
                delegate in
                
                if let onMemberListModified = delegate.onMemberListModified{
                    onMemberListModified()
                }
            }
            return
        }
        
        for value in groups {
            
            self.groupMemberList.append(value)
            
            var searchResults:[Any] = [Any]()
            if let valueForUsers = self.roomUsers[value]{
                searchResults = valueForUsers.filter({ (rUser) -> Bool in
                    return rUser.status == .Online
                })
            }

            self.groupMemberList += searchResults
            
        }
        
        self.messengerDelegate! |> {
            delegate in
            
            if let onMemberListModified = delegate.onMemberListModified{
                DDLogInfo("[MEMBERS] onMemberListModified")
                onMemberListModified()
            }
            
        }
        
    }
    
    
    func append(textToBeSent: String) -> Messenger {
        if self.hasJoinedRoom() {
            let outgoingMessage = Message(
                text: textToBeSent,
                from:self.currentMessageUser.chatID!,
                to: self.roomID!,
                displayName: (self.currentRoomUser?.displayName)!,
                chatMessageType: MessageType.Outgoing
                
            )
            
            self.messageQueue.enqueue(element: outgoingMessage)
            
            if (self.stream!.isConnected()) {
                self.processQueue()
            }
            
            self.messages.append(outgoingMessage)
            self.messengerDelegate! |> {
                delegate in
                if let onMessageCountChange = delegate.onMessageCountChange{
                    onMessageCountChange()
                }
               
            }
            
        }
        
        return self
    }
    
    
    func hasJoinedRoom() -> Bool {
        DDLogInfo("[XMPP] hasJoinedRoom \((self.room != nil) && (self.room?.isJoined)!)")
        return (self.room != nil) && (self.room?.isJoined)!
    }
    

    
    func connect(onCompletion: OnCompletionHandler?) {
        DDLogInfo("[MESSENGER] connect to stream")
        if UserDefaultsHelper.isDeviceRegistered() {
            MenuBarHelper.lazyInstance?.goOffline()
        }
        
        self.connectToStream()
        
        if onCompletion != nil{
            self.onStreamConnectionComplete = onCompletion
        }
    }
    
    func leaveRoom() {
        DDLogInfo("[MESSENGER] leaveRoom")
        self.room?.leave()
        self.room?.deactivate()
        self.currentRoomState = .None
        self.messages.removeAll()
        Invitation.sharedInstance.clearQueue()
        self.roomUsers.removeAll()
        self.groupMemberListFromRoom.removeAll()
        self.groupMemberList.removeAll()
        self.room?.removeDelegate(self)
    }
    
    func disconnect() {
        DDLogInfo("[MESSENGER] disconnect")
        self.changeSessionState(state: .Offline)
        self.stream?.disconnectAfterSending()
        self.currentConnectionState = .Disconnected
        self.currentRoomState = .None
        self.messages.removeAll()

        Invitation.sharedInstance.clearQueue()
    }
    
    func isStreamConnected() -> Bool {
        DDLogInfo("[XMPP] isStreamConnected: \(self.stream!.isConnected())")
        return self.stream!.isConnected()
    }
    
    //@description - Used to switch between offline and online.
    //@usage - Messenger.sharedInstance.changeSessionState(.Online)
    
    func changeSessionState(state: UserState){
        DDLogInfo("[MESSENGER] changeSessionState")
        let presence:XMPPPresence
        
        switch state {
        case .Offline:
            presence = XMPPPresence(type: Config.Chat.Presence.Unavailable)
            self.hasGoneOnline = false
        case .Online:
            presence = XMPPPresence()
        }
        
        DDLogInfo("\(presence)")
        
        self.stream?.send(presence)
        
    }
    
    func joinRoom(history: Bool) {
        DDLogInfo("[MESSENGER] joinRoom")
        if(!(self.stream?.isConnected())!){
            DDLogInfo("[JOIN ROOM] with history")
            self.joinRoom(history: history)
            return
        }
        
        DDLogInfo("[JID] \(self.roomID)")
        if self.roomID == nil {
            self.currentRoomState = .Failed
            
            self.messengerDelegate! |> {
                delagate in
                
                if let onRoomStateUpdate = delagate.onRoomStateUpdate{
                    DDLogInfo("onRoomStateUpdate")
                    onRoomStateUpdate()
                }
                
            }
            return
        }
        
        self.messages.removeAll()
        self.isDirty = false
        let roomMemoryStorage = XMPPRoomMemoryStorage()
        let historyElement = XMPPElement.element(withName: Config.Chat.Core.History) as! XMLElement
        
        historyElement.addAttribute(withName: "maxstanzas", intValue: 20)
        
        self.room = XMPPRoom(roomStorage: roomMemoryStorage,
                             jid: self.roomID,
                             dispatchQueue: DispatchQueue.main)
        self.room?.activate(self.stream)
        
        self.room?.removeDelegate(self, delegateQueue: DispatchQueue.main)
        
        self.room?.addDelegate(self, delegateQueue: DispatchQueue.main)
        
        
        
        // This has to be self.stream?.myJID.user
        // TODO: - Talk about updating the NICK name if the system doesn't provide one.
        
        let deviceResponse: NSData? = UserDefaults.standard.object(forKey: UserSettings.chatCredentials) as? NSData
        var response: NSDictionary?
        if deviceResponse != nil {
            response = NSKeyedUnarchiver.unarchiveObject(with: deviceResponse as! Data) as? NSDictionary
        }
        
        if response != nil {
            let location = response?.object(forKey: "CurrentLocation") as? NSDictionary
            
            if location != nil {
                self.locationName = location?.object(forKey: "Name") as? String
                DDLogInfo("\(historyElement)")
                DDLogInfo("LOCATION NAME: \(self.locationName)")
                self.room?.join(usingNickname: self.locationName,
                                history: historyElement,
                                password: nil)
                self.room?.fetchConfigurationForm()
                self.currentRoomState = .Joining
                
                self.messengerDelegate! |> {
                    delagate in
                    
                    
                    if let onRoomStateUpdate = delagate.onRoomStateUpdate{
                        onRoomStateUpdate()
                    }
                    
                }
            }
        }
    }
    
    //MARK: Internal Private functions
    internal func processQueue(){
        
        while (!self.messageQueue.isEmpty() && self.stream!.isConnected()) {
            let currentMessage: Message = self.messageQueue.dequeue()!
            let formedMessage = XMPPMessage(type: Config.Chat.Core.ChatType, to: currentMessage.To)
            
            formedMessage?.addBody(currentMessage.Text)
            
            let timeElement = XMPPElement.element(withName: "time") as! XMLElement
            
            timeElement.addAttribute(withName: "xmlns", stringValue: "urn:xmpp:time")
            
            let time = XMPPElement.element(withName: "time", stringValue: String(Int(round(NSDate().timeIntervalSince1970 * 1000)))) as! XMLElement
            timeElement.addChild(time)
            
            formedMessage?.addChild(timeElement)
            
            DDLogInfo("\(formedMessage)")
            
            self.stream!.send(formedMessage)
        }
    }
    
    internal func loginWithPassword() {
        do {
            DDLogInfo("[XMPP] Authenticating XMPP Server with Password.")
            try	self.stream?.authenticate(withPassword: self.currentMessageUser.chatPassword)
        } catch {
            DDLogInfo("[XMPP] Could not authenticate")
            self.currentConnectionState = .AuthenticationFailed
        }
    }
    
    internal func connectToStream() {
        if (!self.stream!.isConnected()) {
            let imDetails = self.getXMPPStreamConnectiondetails()
            DDLogInfo("[XMPP] connection details")
            DDLogInfo("[XMPP] host: \(imDetails.host)")
            DDLogInfo("[XMPP] port: \(imDetails.port)")
            
            self.currentMessageUser.setChatPassword(password: imDetails.password)
            
            
            let id = imDetails.jid.components(separatedBy: "/")
            
            if !id.indices.contains(0) {
                return
            }
            
            let chatID =  XMPPJID.sharedJid(with: id[0].trimmingCharacters(in: CharacterSet.whitespaces))
            
            if chatID == nil {
                return
            }
            
            self.myJID = chatID
            
            self.currentMessageUser.setChatID(id: chatID!)
            self.stream?.myJID = chatID
            self.stream?.hostName = imDetails.host
            self.stream?.hostPort = UInt16(imDetails.port)
            
            do{
                try self.stream?.oldSchoolSecureConnect(withTimeout: XMPPStreamTimeoutNone)
                
                
                self.currentConnectionState = .Connecting
                
                self.messengerDelegate! |> {
                    delegate in
                    if let onMessengerConnecting = delegate.onMessengerConnecting{
                        DDLogInfo("onMessengerConnecting")
                        onMessengerConnecting()
                    }
                    if let onConnectionStateChange = delegate.onConnectionStateChange{
                        DDLogInfo("onConnectionStateChange")
                        onConnectionStateChange()
                    }
                 
                }
                DDLogInfo("[XMPP] Trying to connect to stream")
            } catch let error {
                DDLogInfo("[XMPP] Trying to connect to stream failed")
                DDLogError(error.localizedDescription)
                self.currentConnectionState = .Disconnected
            }
        }
    }
    
    internal func getXMPPStreamConnectiondetails() -> (jid: String, host: String, domain: String, port: Int, username: String, password: String, role: DataonixUserRole, nickname: String) {
        let deviceResponse: NSData? = UserDefaults.standard.object(forKey: UserSettings.chatCredentials) as? NSData
        var response: NSDictionary?
        if deviceResponse != nil {
            response = NSKeyedUnarchiver.unarchiveObject(with: deviceResponse as! Data) as? NSDictionary
        }
        
        var jid: String? = ""
        var host: String? = ""
        var password: String? = ""
        var username: String? = ""
        var port: Int? = 5233
        var domain: String? = ""
        let role: DataonixUserRole? = .LOCATION
        var nickname: String? = ""
        
        if response != nil {
            let imDetails = response?.object(forKey: "IM") as? NSDictionary
            if imDetails != nil {
                jid = imDetails?.object(forKey: "FullJid") as? String
                host = imDetails?.object(forKey: "Host") as? String
                password = imDetails?.object(forKey: "Password") as? String
                username = imDetails?.object(forKey: "UserName") as? String
                port = imDetails?.object(forKey: "Port") as? Int
                domain = imDetails?.object(forKey: "ServerDomain") as? String
                nickname = imDetails?.object(forKey: "NickName") as? String
                
                if nickname == nil {
                    nickname = ""
                }
            }
            
        }
        
        return (jid!, host!, domain!, port!, username!, password!, role!, nickname!)
    }
    
    internal func getUserRole(userRole: String) -> DataonixUserRole {
        let role: DataonixUserRole.RawValue = userRole;
        return DataonixUserRole(rawValue: role)!
    }
    
    internal func getRawXMPPJid() -> String {
        let streamUser = self.roomID?.user
        let streamDomain = self.roomID?.domain
        
        var rawStr = streamDomain
        
        if streamUser != nil {
            rawStr = String(format: "%@@%@", streamUser!, streamDomain!)
        }
        
        return rawStr!
    }
    
    internal func isOnline() -> Bool {
        return String(describing: self.stream!.myPresence) != Config.Chat.Presence.Unavailable
    }
    
    internal func isOffline() -> Bool {
        return String(describing: self.stream?.myPresence) == Config.Chat.Presence.Unavailable
    }
    
    internal func processMessage(message: XMPPMessage, userStr: String, defineMessageType: MessageType) {
        let formatter = DateFormatter()
        formatter.dateFormat = "MM/dd/yyyy h:mm:ss a"
        
        if let delayedDeliverDate = message.delayedDeliveryDate() {
            self.messages.append(Message(text: message.body(),
                                         from: message.from(),
                                         to: self.currentMessageUser.chatID!,
                                         displayName: userStr,
                                         chatMessageType: defineMessageType,
                                         
                                         time: delayedDeliverDate.timeIntervalSince1970 * 1000,
                                         stanzaTime: formatter.string(from: delayedDeliverDate))!)
        } else {
            self.messages.append(Message(text:message.body(),
                                         from: message.from(),
                                         to: self.currentMessageUser.chatID!,
                                         displayName: userStr,
                                         chatMessageType: defineMessageType,
                                         time: NSDate().timeIntervalSince1970 * 1000,
                                         stanzaTime: Misc.GetTimeStamp(timestamp: Date())
                )!
            )
        }
    }
    
    internal func processRoomUsers(presence: XMPPPresence, state: UserState, occupantJID: XMPPJID) {
        var userRole: DataonixUserRole = .LOCATION
        
        if let childrens = presence.elements(forXmlns: "http://jabber.org/protocol/muc#user") {
            if childrens.count > 0 {
                let xmlnsNode = childrens[0] as! XMLElement
                if xmlnsNode.elements(forName: "item").count > 0 {
                    let item = xmlnsNode.elements(forName: "item")[0]
                    let jid = item.attribute(forName: "jid")?.stringValue
                    DDLogInfo("\(jid)")
                    
                    if jid != nil {
                        do {
                            let dispatcherExists = try jid?.test(pattern: ".*_dispatcher$")
                            let officerExists = try jid?.test(pattern: ".*_officer$")
                            if (dispatcherExists)! {
                                userRole = .DISPATCHER
                            } else if (officerExists)! {
                                userRole = .OFFICER
                            }
                        } catch let error {
                            DDLogInfo("ProcessRoomUsers Catch Block")
                            DDLogError("\(error)")
                        }
                    }
                }
            }
        }
        
        self.membersList = self.membersList.filter {(rUser) -> Bool in
            return rUser.chatID != occupantJID
        }
        
        self.roomUsers[userRole.rawValue] = self.roomUsers[userRole.rawValue]?.filter({ (rUser) -> Bool in
            return rUser.chatID != occupantJID
        })
        
        var joinedUser = RoomUser(displayName: occupantJID.resource, role: userRole, status: state, chatID: occupantJID)
        
        if userRole == .LOCATION {
            joinedUser.displayName = occupantJID.resource.components(separatedBy: "_")[0]
        }
        
        if (self.roomUsers[userRole.rawValue] == nil) {
            self.roomUsers[userRole.rawValue] = []
            self.roomUsers[userRole.rawValue]?.append(joinedUser)
        } else {
            self.roomUsers[userRole.rawValue]!.append(joinedUser)
        }
        
        self.membersList.append(joinedUser)
    }
    
    func convertStringToDictionary(text: String) -> [String:AnyObject]? {
        if let data = text.data(using: String.Encoding.utf8) {
            do {
                return try JSONSerialization.jsonObject(with: data, options: []) as? [String:AnyObject]
            } catch let error {
                DDLogError("\(error)")
            }
        }
        
        return nil
    }
    
      
    // MARK: - Join alert flow validations
    func validateInvitation(message: XMPPMessage) {
        
        if self.hasJoinedRoom() {
            DDLogInfo("IM:: already joinded room")
            return
        }
        
        do {
            try Invitation.sharedInstance.addToQueue(message: message)
        } catch InvitationErrorMessage.QueueFull {
            DDLogInfo("QUEUE FULL")
            //Handle case with Queue full
        } catch {
            // Other errors
            DDLogInfo("Something went wrong")
        }
    }
    
    func joinChatRoom(message: XMPPMessage, alertDetails: [String: AnyObject]?) {
        if !self.hasJoinedRoom() {
            self.alertId = alertDetails?["AlertId"] as? String
            let roomIdFromXmppStanza = message.from().full()
            DDLogInfo("\(roomIdFromXmppStanza)")
            self.roomID = XMPPJID.sharedJid(with: roomIdFromXmppStanza?.trimmingCharacters(in: CharacterSet.whitespaces))
            self.joinRoom(history: true)
        }
    }
    
    func joinChatRoomWithInvitation(message: XMPPMessage, alertDetails: [String: AnyObject]?) {
        if !self.hasJoinedRoom() {
            self.alertId = alertDetails?["AlertId"] as? String
            let roomIdFromXmppStanza = message.from().full()
            DDLogInfo("\(roomIdFromXmppStanza)")
            self.roomID = XMPPJID.sharedJid(with: roomIdFromXmppStanza?.trimmingCharacters(in: CharacterSet.whitespaces))
            self.joinRoom(history: true)
        }
    }
    
    func xmppStreamDidConnect(_ sender: XMPPStream!) {
        DDLogInfo("[XMPP] Successfully connected to the stream")
        self.currentConnectionState = (self.stream!.numberOfBytesSent > 150) ? .Reconnected : .Connected
        self.loginWithPassword()
        
        if(self.messengerDelegate != nil) {
            DDLogInfo("xmppStreamDidConnect delegate")
            self.messengerDelegate! |> {
                delegate in
                if let onConnectionStateChange = delegate.onConnectionStateChange {
                    DDLogInfo("onConnectionStateChange")
                    onConnectionStateChange()
                }
            }
        }
    }
    
    func xmppStreamDidAuthenticate(_ sender: XMPPStream!) {
        DDLogInfo("[XMPP] Successfully authenticated")
        MenuBarHelper.lazyInstance?.goOnline()
        self.changeSessionState(state: .Online)
        if let invite = Invitation.sharedInstance.currentAlertMessage {
            DDLogInfo("\(invite)")
            self.roomUsers = [String: [RoomUser]]()
            self.groupMemberList = [Any]()
            self.messages = [Message]()
            self.validateInvitation(message: invite.message)
        }
        if let delegates = self.messengerDelegate {
            delegates |> {
               delegate in
                DDLogInfo("xmppStreamDidAuthenticate delegate")
                if let onStreamAuthenticated = delegate.onStreamAuthenticated {
                    DDLogInfo("onStreamAuthenticated")
                    onStreamAuthenticated()
                }
            }
        }
    }
    
    func xmppStream(_ sender: XMPPStream!, didNotAuthenticate error: XMLElement!) {
        DDLogInfo("[XMPP] Failed to athunticate")
        DDLogError("\(error)")
    }
    
    
    func xmppStream(_ sender: XMPPStream!, didSend presence: XMPPPresence!) {
        DDLogInfo("[XMPP] Successfully gone online")
        DDLogInfo("\(presence)")
        if (self.onStreamConnectionComplete != nil) {
            DDLogInfo("[XMPP STREAM] onStreamConnectionComplete")
            self.onStreamConnectionComplete!()
        }
        
        self.hasGoneOnline = true
    }
    
    func xmppStream(_ sender: XMPPStream!, didReceive iq: XMPPIQ!) -> Bool {
        DDLogInfo("didReceive iq")
        DDLogInfo("\(iq)")
        return true
    }
    
    func xmppStream(_ sender: XMPPStream!, didFailToSend iq: XMPPIQ!, error: Error!) {
        DDLogInfo("didFailToSend iq")
        DDLogInfo("\(iq)")
        DDLogInfo("\(error)")
    }
    
    func xmppStream(_ sender: XMPPStream!, didSend iq: XMPPIQ!) {
        DDLogInfo("didSendIQ")
        DDLogInfo("\(iq)")
    }
    
    func xmppStream(_ sender: XMPPStream!, didReceive presence: XMPPPresence!) {
        DDLogInfo("didReceivePresence")
        DDLogInfo("\(presence)")
    }
    
    func xmppStream(_ sender: XMPPStream!, didSend message: XMPPMessage!) {
        DDLogInfo("\(message)")
    }
    
    func xmppStream(_ sender: XMPPStream!, didFailToSend message: XMPPMessage!, error: Error!) {
        DDLogInfo("[XMPP] Message sending failed")
        DDLogInfo("\(message)")
        DDLogInfo("\(error)")
    }
    
    func xmppStreamDidDisconnect(_ sender: XMPPStream!, withError error: Error!) {
        self.currentConnectionState = .Disconnected
        self.messengerDelegate! |> {
            delegate in
            if let onConnectionStateChange = delegate.onConnectionStateChange {
                onConnectionStateChange()
            }
        }
        
        self.changeSessionState(state: .Offline)
        
        DDLogInfo("[XMPP] Stream Disconnect");
        Messenger.sharedInstance.connect(onCompletion: {
            DDLogInfo("[XMPP] Connected to Stream")
        })
    }
    
    func xmppStreamWasTold(toDisconnect sender: XMPPStream!) {
        self.didToldToDisconnect = true
        self.changeSessionState(state: .Offline)
    }
    
    func xmppStream(_ sender: XMPPStream!, didReceive message: XMPPMessage!) {
        DDLogInfo("[XMPP STREAM] did receive message")
        DDLogInfo("\(message)")
        if let messageSubject = message.subject() {
            
            if(messageSubject == "room_destroyed") {
                Invitation.sharedInstance.clearQueue()
                GlobalAlertHelper.sharedInstance.hide(onComplete: { 
                    DDLogInfo("room closed");
                })
            }
        }
        self.validateInvitation(message: message)
    }
    
    func xmppStreamConnectDidTimeout(_ sender: XMPPStream!) {
        DDLogInfo("[XMPP STREAM] did connect timeout")
    }
    
    //MARK: XMPPRoom Delegate
    func xmppRoom(_ sender: XMPPRoom!, didFetchConfigurationForm configForm: XMLElement!) {
        DDLogInfo("didFetchConfigurationForm")
    }
    
    func xmppRoomDidCreate(_ sender: XMPPRoom!) {
        DDLogInfo("xmppRoomDidCreate")
    }
    
    func xmppRoomDidDestroy(_ sender: XMPPRoom!) {
        DDLogInfo("xmppRoomDidDestroy")
        self.currentRoomState = .Joined
        
        self.messengerDelegate! |> {
            delegate in
            if let onRoomStateUpdate = delegate.onRoomStateUpdate {
                onRoomStateUpdate()
            }
        }
    }
    
    func xmppRoomDidJoin(_ sender: XMPPRoom!) {
        DDLogInfo("xmppRoomDidJoin")
        self.currentRoomState = .Joined
        self.messengerDelegate! |> {
            delegate in
            DDLogInfo("\(delegate)")
            DDLogInfo("TRIGGER DELEGATE")
            if let onRoomStateUpdate = delegate.onRoomStateUpdate {
                DDLogInfo("onRoomStateUpdate")
                onRoomStateUpdate()
            }
            
            if let onRoomDidJoin = delegate.onRoomJoin {
                DDLogInfo("onRoomDidJoin")
                onRoomDidJoin()
            }
        }
        
        self.currentMessageUser.updateUserObject()
        if let userFirstName = self.currentMessageUser.userFirstName,
            let chatID = self.currentMessageUser.chatID{
            DDLogInfo("userFirstName: \(userFirstName), chatID: \(chatID)")
            self.currentRoomUser = RoomUser(displayName: userFirstName, role:.OFFICER, status: .Online, chatID: chatID)
        }
      
        self.getOnlineMemberList(onComplete: nil)
        DDLogInfo("ALERT ID: \(self.alertId)")
        if self.alertId != nil {
            AlertsApiClient().sendJoiningInfo(alertId: self.alertId!)

        }
        self.triggerOnMemberListModified()
    }
    
    func xmppRoomDidLeave(_ sender: XMPPRoom!) {
        DDLogInfo("xmppRoomDidLeave")
        self.currentRoomState = .Left
        self.alertId = nil
        self.messengerDelegate! |> {
            delegate in
            if let onRoomStateUpdate = delegate.onRoomStateUpdate {
                DDLogInfo("onRoomStateUpdate")
                onRoomStateUpdate()
            }
        }

        self.room?.destroy()
        self.room?.removeDelegate(self, delegateQueue: DispatchQueue.main)
    }
    
    func xmppRoomDidDestroy(sender: XMPPRoom!) {
        DDLogInfo("xmppRoomDidDestroy")
    }
    
    func xmppRoom(_ sender: XMPPRoom!, occupantDidJoin occupantJID: XMPPJID!, with presence: XMPPPresence!) {
        DDLogInfo("\(occupantJID)")
        DDLogInfo("\(presence)")
        
        self.membersList = self.membersList.filter {
            return $0.chatID.user != occupantJID.resource
        }
        
        self.processRoomUsers(presence: presence, state: .Online, occupantJID: occupantJID)
        
        self.triggerOnMemberListModified()
        
    }
    
    func xmppRoom(_ sender: XMPPRoom!, occupantDidLeave occupantJID: XMPPJID!, with presence: XMPPPresence!) {
        DDLogInfo("\(occupantJID)")
        DDLogInfo("\(presence)")
        
        self.membersList = self.membersList.filter {
            return $0.chatID.user != occupantJID.resource
        }
        
        self.processRoomUsers(presence: presence, state: .Offline, occupantJID: occupantJID)
        
        self.triggerOnMemberListModified()
    }
    
    func xmppRoom(_ sender: XMPPRoom!, didFetchMembersList items: [Any]!) {
        DDLogInfo("\(items)")
    }
    
    func xmppRoom(_ sender: XMPPRoom!, didNotFetchMembersList iqError: XMPPIQ!) {
        DDLogInfo("\(iqError)")
    }
    
    func xmppRoom(_ sender: XMPPRoom!, willSendConfiguration roomConfigForm: XMPPIQ!) {
        DDLogInfo("[XMPP] config received from xmpproom")
    }
    
    func xmppRoom(_ sender: XMPPRoom!, didConfigure iqResult: XMPPIQ!) {
        DDLogInfo("[XMPP] xmpproom didConfigure")
        DDLogInfo("\(iqResult)")
    }
    
    func xmppRoom(_ sender: XMPPRoom!, occupantDidUpdate occupantJID: XMPPJID!, with presence: XMPPPresence!) {
        DDLogInfo("[XMPP] xmpproom occupantDidUpdate")
        DDLogInfo("\(occupantJID)")
        DDLogInfo("\(presence)")
    }
    
    func xmppRoom(_ sender: XMPPRoom!, didNotConfigure iqResult: XMPPIQ!) {
        DDLogInfo("[XMPP] xmpproom didnotconfigure")
        DDLogInfo("\(iqResult)")
    }
    
    func xmppRoom(_ sender: XMPPRoom!, didReceive message: XMPPMessage!, fromOccupant occupantJID: XMPPJID!) {
        DDLogInfo("xmppRoom")
        var formedID = self.getRawXMPPJid() + "/"
        
        formedID += self.locationName!
        
        if (message.from().full() == formedID && self.isDirty) {
            return
        }
        
        var fromUser: [String] = []
        
        var userStr: String = ""
        
        do {
            fromUser = try message.from().full().match(pattern: "/.*")
        } catch {
            DDLogError(error.localizedDescription)
        }
        
        if fromUser.count > 0 {
            do {
                userStr = try fromUser.first!.replace(pattern: "/",replaceWith: "")
            } catch {
                DDLogError(error.localizedDescription)
            }
        }
        
        var defineMessageType: MessageType = MessageType.Incoming
        
        if (message.from().full() == formedID) {
            defineMessageType = MessageType.Outgoing
        }
        
        if (message.children?.count)! > 0 {
            if (message.children?.indices.contains(1))! {
                let alertDetails = message.children?[1]
                if alertDetails?.localName! == "AlertDetails" {
                    return
                } else {
                    DDLogInfo("AlertDetails failure")
                    self.processMessage(message: message, userStr: userStr, defineMessageType: defineMessageType )
                }
            } else {
                self.processMessage(message: message, userStr: userStr, defineMessageType: defineMessageType)
            }
        }
        
        self.messengerDelegate! |> {
            delegate in
            if let onMessageCountChange = delegate.onMessageCountChange {
                onMessageCountChange()
            }
        }
    }

    func xmppReconnect(_ sender: XMPPReconnect!, didDetectAccidentalDisconnect connectionFlags: SCNetworkReachabilityFlags) {
        DDLogInfo("didDetectAccidentalDisconnect: \(connectionFlags)")
    }
    
    func xmppReconnect(_ sender: XMPPReconnect!, shouldAttemptAutoReconnect reachabilityFlags: SCNetworkReachabilityFlags) -> Bool {
        
        return true
    }
    
    func xmppStream(_ sender: XMPPStream!, socketDidConnect socket: GCDAsyncSocket!) {
        DDLogInfo("socketDidConnect")
        DDLogInfo("\(socket)")
    }
}
