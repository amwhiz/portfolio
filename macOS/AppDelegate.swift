//
//  AppDelegate.swift
//  COPsync911
//
//  Created by aj on 22/10/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Cocoa
import ReachabilitySwift
import Sparkle
import Fabric
import Crashlytics

var reachability:Reachability = Reachability.init(hostname: Dataonix.Core.hostname)!

var applicationEnvironment: String = Bundle.main.infoDictionary?["APP_ENVIRONMENT"] as! String

typealias OnCompletionHandler = () -> Void

// MARK: - App Global Properties
var triggerMethod: TriggerMethod = TriggerMethod.launchIcon

var terminateFromDockMenu = false

var terminateFromTaskBar = false

var isChatInProgress = false

var isAlertInProgress = false

var isAdminApprovalRequired = false

var authData: [String] = [String]()

var isAlertReceived = false

var alertTriggeredByUser = ""

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate,NSUserNotificationCenterDelegate, MessengerDelegate, SUUpdaterDelegate,DeviceServiceBackgroundDelegate, DeviceStatusDelegate {
    
    @IBOutlet weak var locationMenu: NSMenu!
    @IBOutlet weak var statusMenu: NSMenu!
    
    weak var window: NSWindow?
    
    var suUpdater: SUUpdater?
    
    var isOnline: Bool = true
    
    var isDeviceActive = false
    
    var didTriggerRestart = false
    
    var isDuplicateRunning = false
    
    var isQuitTriggeredFromSparkle = false
    
    lazy var splashWindowController: NSWindowController? = SplashWindowController(windowNibName: "SplashWindowController") as NSWindowController
    
    var loaderWindowController:  NSWindowController? = LoaderWindowController(windowNibName: "LoaderWindowController") as NSWindowController
    
    lazy var quitWindowController: NSWindowController? = QuitWindowController(windowNibName: "QuitWindowController") as NSWindowController
    
    lazy var settingsWindowController: NSWindowController? = SettingsWindowController(windowNibName: "SettingsWindowController") as NSWindowController
    
    lazy var settingsLoginWindowController: NSWindowController? = SettingsLoginWindowController(windowNibName: "settingsLoginWindowController") as NSWindowController
    
    var chatWindowController: NSWindowController? = ChatWindowController(windowNibName: "ChatWindowController") as NSWindowController
    
    var sendAlertWindowController: NSWindowController? = SendAlertWindowController(windowNibName: "SendAlertWindowController") as NSWindowController
    
    
    var statusBar = NSStatusBar.system()
    
    var statusBarItem : NSStatusItem = NSStatusItem()
    
    var menuItemTagList = [0x65, 0x66, 0x67, 0x68, 0x69]
    
    override func awakeFromNib() {
        var runningApps: [NSRunningApplication] = [NSRunningApplication]()
        
        let apps = NSWorkspace.shared().runningApplications
        
        for (_, app) in apps.enumerated() {
            if let cApp = app.bundleIdentifier {
                if cApp == Bundle.main.bundleIdentifier! {
                    runningApps.append(app)
                }
            }
        }
        
        if runningApps.count > 1 {
            runningApps.remove(at: 0)
            for (_, app) in runningApps.enumerated() {
                isDuplicateRunning = true
                app.terminate()
            }
        }
        
        // Add statusBarItem
        self.addLocationMenuItem()
        MenuBarHelper.lazyInstance = MenuBarHelper(menu: statusMenu)
        MenuBarHelper.lazyInstance?.goOnline()
    }
    
    func applicationWillFinishLaunching(_ notification: Notification) {
        // Sparkle updater rss feed uri
        UserDefaults.standard.set(SparkleUpdateFeed[applicationEnvironment.lowercased()]!, forKey: "SUFeedURL")
        self.suUpdater = SUUpdater.shared()
        self.suUpdater?.automaticallyChecksForUpdates = true
        self.suUpdater?.automaticallyDownloadsUpdates = true
        self.suUpdater?.installUpdatesIfAvailable()
        self.suUpdater?.delegate = self
    }

    func applicationDidFinishLaunching(_ aNotification: Notification) {
        // Initialize Logger
        self.initLogger()
        
        // Initialize Launch Agent
        self.initializeLaunchAgent()
        
        // Dataonix system service check
        ServiceCheckHelper.sharedInstance.delegate.addDelegate(self)
        ServiceCheckHelper.sharedInstance.start()
        
        // Dataonix device status check
        DeviceStatusBackground.sharedInstance.delegates.addDelegate(self)
        DeviceStatusBackground.sharedInstance.start()
        
        // Application environment setup
        applicationEnvironment = Bundle.main.infoDictionary?["APP_ENVIRONMENT"] as! String

        // Initialize Fabric
        UserDefaults.standard.set("YES", forKey: "NSApplicationCrashOnExceptions")
        Fabric.with([Crashlytics.self])
        
        // Init network rechability check UP/DOWN
        self.initReachability()
        
        // Check is device registered, if registered connect DATAONIX IM Stream
        if UserDefaultsHelper.isDeviceRegistered() {
            Messenger.sharedInstance.connect(onCompletion: {
                DDLogInfo("DATA:: Connected to Stream")
            })
        }
        
        if !UserDefaultsHelper.isDeviceRegistered() ||
            !UserDefaultsHelper.isUserAuthenticated() {
            // Show splash window
            splashWindowController?.window?.level = Int(CGWindowLevelForKey(.floatingWindow)) - 1
            splashWindowController?.showWindow(self)
        }
        
        Messenger.sharedInstance.messengerDelegate?.addDelegate(self)
        
        let hasLaunchedKey = "HasChatLaunched"
        let defaults = UserDefaults.standard
        
        defaults.set(false, forKey: hasLaunchedKey)
        
        NSUserNotificationCenter.default.delegate = self
        
        DistributedNotificationCenter.default().addObserver(self, selector: #selector(self.darkModeChanged), name: NSNotification.Name(rawValue: "AppleInterfaceThemeChangedNotification"), object: nil)
        
        // Observe system power off event (shutdown, restart, logoff)
        NSWorkspace.shared()
            .notificationCenter
            .addObserver(self,
                         selector: #selector(self.systemWillPowerOff),
                         name: .NSWorkspaceWillPowerOff,
                         object: nil
            )
        
        if !Messenger.sharedInstance.hasJoinedRoom() &&
            Messenger.sharedInstance.isStreamConnected() &&
            UserDefaultsHelper.isDeviceRegistered() &&
            Messenger.sharedInstance.isOnline() &&
            Bool.isDeviceActive() {
            DDLogInfo("[ALERT] alert triggered from launchpad icon")
            triggerMethod = TriggerMethod.launchIcon
            self.showAlert()
        }
    }
    
    func darkModeChanged(_ notification: NSNotification) {
        DDLogInfo("[THEME] changed to Dark mode.")
        MenuBarHelper.lazyInstance?.updateTrayIcon()
    }

    func applicationWillTerminate(_ aNotification: Notification) {
        // Insert code here to tear down your application
        DDLogInfo("[APPLICATION] will terminate")
        self.destroyMessenger()
    }

    
    func applicationDidResignActive(_ notification: Notification) {
        DDLogInfo("[APPLICATION] did resign active")
    }
   
    // MARK: - Reachability
    func initReachability() {
        DDLogInfo("[REACHABILITY] Initialized")
        NotificationCenter.default.addObserver(self, selector: #selector(self.reachabilityChanged),name: ReachabilityChangedNotification,object: reachability)
        
        do{
            try reachability.startNotifier()
        } catch {
            DDLogInfo("[REACHABILITY] could not start reachability notifier")
        }
    }
    
    // MARK: - Reachability Selector
    func reachabilityChanged(note: NSNotification) {
        DDLogInfo("[REACHABILITY] status changed")
        let reachabilityObject = note.object as! Reachability
        
        if reachabilityObject.isReachable {
            self.isOnline = true
            MenuBarHelper.lazyInstance?.goOnline()
            ErrorNotification.sharedInstance.netWorkOnline()
            DDLogInfo("[REACHABILITY] status [UP]")
        } else {
            DDLogInfo("[REACHABILITY] status [DOWN]")
            self.isOnline = false
            MenuBarHelper.lazyInstance?.goOffline()
            
            ErrorNotification.sharedInstance.netWorkOffline()
        }
    }
    
    func showAlert() {
        if isAlertReceived {
            return
        }
        
        if !Messenger.sharedInstance.hasJoinedRoom() &&
            Messenger.sharedInstance.isStreamConnected() &&
            UserDefaultsHelper.isDeviceRegistered() &&
            Messenger.sharedInstance.isOnline() &&
            (Messenger.sharedInstance.stream?.isConnected())! &&
            (Messenger.sharedInstance.stream?.isAuthenticated())! &&
            Bool.isDeviceActive() {
            
            if !isChatInProgress && !isAlertInProgress {
                
                loaderWindowController = nil
                
                if loaderWindowController == nil {
                    loaderWindowController = LoaderWindowController(windowNibName: "LoaderWindowController") as NSWindowController
                }
                
                self.loaderWindowController?.window?.level = Int(CGWindowLevelForKey(.floatingWindow)) - 1
                
                let app:NSApplication = NSApplication.shared()
                app.activate(ignoringOtherApps: true)
                self.loaderWindowController?.window?.makeKeyAndOrderFront(self)
                
                self.loaderWindowController?.showWindow(self)
                isAlertInProgress = true
            }
        }
        else{
            AlertHelper.showAlert(question: "Please call 9-1-1", text: DataonixNotificationMessage.DSPIMOffline.rawValue)
        }
    }
    
    private func destroyMessenger() {
        DDLogInfo("[MESSENGER] destroy")
        Messenger.sharedInstance.disconnect()
        Messenger.sharedInstance.isDirty = false
    }
    
    @IBAction func sendAlertAction(_ sender: AnyObject) {
        
        if ((ServiceCheckHelper.sharedInstance.state?.isDSPOnline())! && (ServiceCheckHelper.sharedInstance.state?.isIMOnline())!){
            DDLogInfo("[ALERT] alert triggered from system tray")
            triggerMethod = TriggerMethod.systemTray
            self.showAlert()
        }
        else{
            AlertHelper.showAlert(question: "Please call 9-1-1", text: DataonixNotificationMessage.DSPIMOffline.rawValue)

        }
        
    }
    
    @IBAction func quitCopsyncAction(_ sender: AnyObject) {
        DDLogInfo("[QUIT] triggered from system tray")
        if !UserDefaultsHelper.isDeviceRegistered() {
            NSApplication.shared().terminate(nil)
        }
        
        quitWindowController = nil
        
        if quitWindowController == nil {
            quitWindowController = QuitWindowController(windowNibName: "QuitWindowController") as NSWindowController
        }
        
        self.quitWindowController?.window?.level = Int(CGWindowLevelForKey(.floatingWindow)) - 1
        let app:NSApplication = NSApplication.shared()
        app.activate(ignoringOtherApps: true)
        self.quitWindowController?.window?.makeKeyAndOrderFront(self)
        self.quitWindowController?.showWindow(self)
    }
    
    @IBAction func updateLocationAction(_ sender: AnyObject) {
        settingsLoginWindowController = nil
        
        if settingsLoginWindowController == nil {
            settingsLoginWindowController = SettingsLoginWindowController(windowNibName: "SettingsLoginWindowController") as NSWindowController
            DataPass.sharedInstance.identifierId = Config.App.Identifier.LocationString

        }
        
        self.settingsLoginWindowController?.window?.level = Int(CGWindowLevelForKey(.floatingWindow)) - 1
        self.settingsLoginWindowController?.showWindow(self)
    }
    
    
    @IBAction func settingsAction(_ sender: AnyObject) {
        settingsWindowController = nil
        
        if settingsWindowController == nil {
            settingsWindowController = SettingsWindowController(windowNibName: "SettingsWindowController") as NSWindowController
        }
        
        self.settingsWindowController?.window?.level = Int(CGWindowLevelForKey(.floatingWindow)) - 1
        let app:NSApplication = NSApplication.shared()
        app.activate(ignoringOtherApps: true)
        self.settingsWindowController?.window?.makeKeyAndOrderFront(self)

        self.settingsWindowController?.showWindow(self)
    }
    
    
    
    //MARK: - Validate Menu
    override func validateMenuItem(_ menuItem: NSMenuItem) -> Bool {
        
        if isAlertReceived && menuItem.tag == 0x65 {
            return false
        }
        
        if (isAlertInProgress || isChatInProgress) && menuItem.tag == 0x65 {
            return false
        }
        
        let state = ServiceCheckHelper.sharedInstance.state
        
        if state == nil {
            return false
        }
        
        if (!(state?.isDSPOnline())!){
            return false
        }
        
        if(!(self.isOnline)){
            
            return false
            
        }
        
        if (Messenger.sharedInstance.hasJoinedRoom() ||
            !(state?.isIMOnline())! ||
            !(Messenger.sharedInstance.isStreamConnected()) ||
            !(Messenger.sharedInstance.stream?.isConnected())! ||
            !(Messenger.sharedInstance.stream?.isAuthenticated())!) {
            if menuItem.tag == 0x65 {
                return false
            }
        }
        
        if menuItem.tag == 0x67 {
            addLocationMenuItem()
        }
        
        if menuItemTagList.contains(menuItem.tag) {
            return (Bool.isDeviceActive() || self.isDeviceActive) && UserDefaultsHelper.isUserAuthenticated()
        }
        
        return true
    }
    
    //Mark - Device notification center
    func userNotificationCenter(_ center: NSUserNotificationCenter, shouldPresent notification: NSUserNotification) -> Bool {
        if let descriptionText = notification.informativeText {
            
            if (descriptionText == DataonixNotificationMessage.DeviceActivationSucess.rawValue) {
                
                Messenger.sharedInstance.connect(onCompletion: { 
                    DDLogInfo("[STREAM] DTX stream connected")
                })
            }
        }
        
        return true
    }
    
    func userNotificationCenter(_ center: NSUserNotificationCenter, didActivate notification: NSUserNotification) {
        DDLogInfo("userNotificationCenter")
        DDLogInfo("\(notification)")
        if let userInfo = notification.userInfo{
            if let type = userInfo["type"]{
                if(type as? String == "alert"){
                    
                    self.chatWindowController = nil
                    
                    if(self.chatWindowController == nil){
                    
                        self.chatWindowController = ChatWindowController(windowNibName: "ChatWindowController") as NSWindowController
                    }
                    
                    let currentAlertMessage = Invitation.sharedInstance.currentAlertMessage
                    
                    let currentAlertID = Invitation.sharedInstance.currentAlertID
                    
                    Messenger.sharedInstance.joinChatRoomWithInvitation(message: currentAlertMessage!.message, alertDetails: ["AlertId" : currentAlertID! as AnyObject])
                    self.chatWindowController?.window?.level = Int(CGWindowLevelForKey(.floatingWindow)) - 1
                    self.chatWindowController?.showWindow(self)
                    
                }
            }
        }
    }
    
    func onRoomJoin() {
        DDLogInfo("[ROOM] joined")
        self.chatWindowController = nil
        
        if (self.chatWindowController == nil) {
            self.chatWindowController = ChatWindowController(windowNibName: "ChatWindowController") as NSWindowController
        }
        
        let hasLaunchedKey = "HasChatLaunched"
        let defaults = UserDefaults.standard
        let hasLaunched = defaults.bool(forKey: hasLaunchedKey)
        
        DDLogInfo("IsChatAlreadyLaunched: \(hasLaunched)")
        
        if !hasLaunched {
            self.chatWindowController?.window?.level = Int(CGWindowLevelForKey(.floatingWindow)) - 1
            self.chatWindowController?.showWindow(self)
            defaults.set(true, forKey: hasLaunchedKey)
        }
    }
    
    func addLocationMenuItem() {
        locationMenu.removeAllItems()
        let defaults = UserDefaults.standard
        if let resendLocation:[String] = defaults.object(forKey:"ResentLocation") as? [String] {
            
            for (index, location) in resendLocation.enumerated() {
                
                let locationMenuItem  =  NSMenuItem.init(title: location, action: #selector(self.locationAction(location:)), keyEquivalent: "")
                locationMenuItem.state =  index == 0 ? NSOnState : NSOffState
                locationMenu.addItem(locationMenuItem)
                
            }
        }
        
    }
    
    func locationAction(location: NSMenuItem) {
        location.state = NSOnState
        self.updateLocat(locationName: location.title)
        UserDefaultsHelper.addNewLocation(locationName: location.title)
        addLocationMenuItem()
    
    }
    
    func updateLocat(locationName: String) {
        
        let locationId = UserDefaults.standard.object(forKey: DeviceSettings.locationTypeId)
        
        let organizationLocationId = UserDefaults.standard.object(forKey: DeviceSettings.deviceLocationId)
        
        var payload: [String: Any] = [String: Any]()
        
        payload["Name"] = locationName
        payload["CurrentLocationTypeId"] = locationId
        payload["LocationId"] = organizationLocationId
        payload["CreatedOnClient"] = Date().iso8601
        
        self.updateLocation(params: payload)
        
    }
    
    func updateLocation(params: [String: Any]) {
        
        UserDefaultsHelper.addNewLocation(locationName:params["Name"] as! String)
        
        DispatchLevel.userInitiated.dispatchQueue.async {
            DeviceApiClient()
                .updateDeviceLocation(params: params)
                .always {
                   
                }
                .then { data -> Void in
                    DispatchLevel.main.dispatchQueue.async {
                        DDLogInfo("Location Updated Sucessfully")
                        DeviceStatusHelper.getSilentDeviceDetails()
                    }
                }
                .catch { error in
                    switch error {
                    case NetworkError.unreachable:
                        AlertHelper.showAlert(question: NetworkError.unreachable.rawValue, text: Dataonix.ErrorMessageText.unreachable)
                    default:
                        DDLogError("\(error)")
                    }
            }
        }
    }
    
    func initSparkleUpdater() {
        /// Sparkle updater rss feed uri
        UserDefaults.standard.set(SparkleUpdateFeed[applicationEnvironment.lowercased()]!, forKey: "SUFeedURL")
        self.suUpdater = SUUpdater.shared()
        self.suUpdater?.delegate = self        
        self.suUpdater?.automaticallyChecksForUpdates = true
        self.suUpdater?.automaticallyDownloadsUpdates = true
        self.suUpdater?.updateCheckInterval = 0xE10 // 1 hour
        self.suUpdater?.checkForUpdatesInBackground()
        self.suUpdater?.installUpdatesIfAvailable()
    }
    
    // MARK: - Sparkle updater delegates
    func updaterDidNotFindUpdate(_ updater: SUUpdater!) {
        DDLogInfo("[AUTO UPDATE] Auto Update check complete. No updates found.")
    }
    
    func updaterDidShowModalAlert(_ updater: SUUpdater!) {
        DDLogInfo("\(updater)")
    }
    
    func updaterWillShowModalAlert(_ updater: SUUpdater!) {
        DDLogInfo("\(updater)")
    }
    
    func updaterWillRelaunchApplication(_ updater: SUUpdater!) {
        isQuitTriggeredFromSparkle = true
        DDLogInfo("\(updater)")
    }
    
    func updaterMayCheck(forUpdates updater: SUUpdater!) -> Bool {
        return true
    }
    
    func updater(_ updater: SUUpdater!, didAbortWithError error: Error!) {
        DDLogError("\(error)")
        DDLogInfo("\(updater)")
    }
    
    func updaterShouldRelaunchApplication(_ updater: SUUpdater!) -> Bool {
        isQuitTriggeredFromSparkle = true
        return true
    }
    
    func updater(_ updater: SUUpdater!, didFinishLoading appcast: SUAppcast!) {
        DDLogInfo("\(appcast)")
        DDLogInfo("\(updater)")
    }
    
    func updater(_ updater: SUUpdater!, willInstallUpdate item: SUAppcastItem!) {
        DDLogInfo("\(item)")
        DDLogInfo("\(updater)")
    }
    
    func updater(_ updater: SUUpdater!, didFindValidUpdate item: SUAppcastItem!) {
        DDLogInfo("\(item)")
        DDLogInfo("\(updater)")
    }
    
    func updaterShouldPromptForPermissionToCheck(forUpdates updater: SUUpdater!) -> Bool {
        return true
    }
    
    func updater(_ updater: SUUpdater!, didCancelInstallUpdateOnQuit item: SUAppcastItem!) {
        DDLogInfo("\(item)")
        DDLogInfo("\(updater)")
    }
    
    func updater(_ updater: SUUpdater!, failedToDownloadUpdate item: SUAppcastItem!, error: Error!) {
        DDLogError("\(error)")
        DDLogInfo("\(updater)")
    }
    
    func updater(_ updater: SUUpdater!, willDownloadUpdate item: SUAppcastItem!, with request: NSMutableURLRequest!) {
        DDLogInfo("\(request)")
        DDLogInfo("\(updater)")
    }
    
    // MARK:- App Delegates
    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        DDLogInfo("[LAUNCHPAD] icon clicked")
        DDLogInfo("hasVisibleWindows: \(flag)")
        if !flag {
            
            if !UserDefaultsHelper.isUserAuthenticated() {
                DDLogInfo("show splash screen")
                splashWindowController = nil
                if (self.splashWindowController == nil) {
                    self.splashWindowController = SplashWindowController(windowNibName: "SplashWindowController") as NSWindowController
                }
                
                splashWindowController?.window?.level = Int(CGWindowLevelForKey(.floatingWindow)) - 1
                splashWindowController?.showWindow(self)
                
                return true
            }
            
            if !UserDefaultsHelper.isDeviceRegistered() ||
                !Bool.isDeviceActive() ||
                !UserDefaultsHelper.isUserAuthenticated() {
                DDLogInfo("Either device not registered or device is inactive")
                AlertHelper.showAlert(question: "Please call 9-1-1", text: DataonixNotificationMessage.DSPIMOffline.rawValue)
                return true
            }
        }
        
        DDLogInfo("[ALERT] alert triggered from launchpad icon")
        
        triggerMethod = TriggerMethod.launchIcon
        
        self.showAlert()
        
        return true
    }
    
    func logoutIdentity() {
        DDLogInfo("[EXIT] app triggered")
    }
    
    func applicationShouldTerminate(_ sender: NSApplication) -> NSApplicationTerminateReply {
        if isQuitTriggeredFromSparkle {
            return .terminateNow
        }
        
        if isDuplicateRunning {
            return .terminateNow
        }
        
        if terminateFromTaskBar {
            DDLogInfo("[QUIT] app from system tray")
            self.logoutIdentity()
            return .terminateNow
        }
        
        if !UserDefaultsHelper.isDeviceRegistered() {
            self.logoutIdentity()
            return .terminateNow
        }
        
        if didTriggerRestart {
            self.logoutIdentity()
            return .terminateNow
        }
        
        quitWindowController = nil
        
        if quitWindowController == nil {
            quitWindowController = QuitWindowController(windowNibName: "QuitWindowController") as NSWindowController
        }
        
        terminateFromDockMenu = true
        
        self.quitWindowController?.window?.level = Int(CGWindowLevelForKey(.floatingWindow)) - 1
        self.quitWindowController?.showWindow(self)
        

        return .terminateLater
    }
    
    func systemWillPowerOff() {
        DDLogInfo("[SYSTEM] will power off triggered")
        self.didTriggerRestart = true
    }
    
    func initLogger() {
        let fileLogger: DDFileLogger = DDFileLogger() // File Logger
        fileLogger.rollingFrequency = 0x15180  // 1 day
        fileLogger.logFileManager.maximumNumberOfLogFiles = 0xA
        fileLogger.logFormatter = LogFormatter()
        let environment = Bundle.main.infoDictionary?["APP_ENVIRONMENT"] as! String
        
        if environment.lowercased() != "prod" {
            DDLog.add(fileLogger, with: .all)
        } else {
            DDLog.add(fileLogger)
        }
    }
    
    //MARK: Device status delegate
    func onDeviceActivated() {
        DDLogInfo("[DEVICE] status [ACTIVE]")
        if(!self.isDeviceActive){
            
            DeviceStatusBackground.sharedInstance.setDefaultInterval(interval: 0x258)
        }
        
        if !UserDefaults.standard.bool(forKey: DeviceSettings.isDeviceActive){
            DeviceStatusHelper.getDeviceDetails(isSlient: false)
        }

        UserDefaults.standard.set(true, forKey: DeviceSettings.isDeviceActive)
        
        self.isDeviceActive = true
    }
    
    func onDeviceDeactivated() {
        DDLogInfo("[DEVICE] status [INACTIVE]")
        if (self.isDeviceActive) {
            DeviceStatusBackground.sharedInstance.setDefaultInterval(interval: 0x12C)
        }

        self.isDeviceActive = false
        
        UserDefaults.standard.set(false, forKey: DeviceSettings.isDeviceActive)
    }
    
    func onIMWentOffline() {
        DDLogInfo("[IM] status [DOWN]")
        MenuBarHelper.lazyInstance?.goOffline()
    }
    
    func onIMOnline() {
        DDLogInfo("[IM] status [UP]")
        if(ServiceCheckHelper.sharedInstance.state?.isDSPOnline())! &&
            Messenger.sharedInstance.isStreamConnected() {
            MenuBarHelper.lazyInstance?.goOnline()
        } else {
            MenuBarHelper.lazyInstance?.goOffline()
        }
    }
    
    func onDSPWentOffline() {
        DDLogInfo("[DSP] status [DOWN]")
        MenuBarHelper.lazyInstance?.goOffline()
    }
    
    func onDSPOnline() {
        DDLogInfo("[DSP] status [UP]")
        if(ServiceCheckHelper.sharedInstance.state?.isIMOnline())! &&
            Messenger.sharedInstance.isStreamConnected() {
            MenuBarHelper.lazyInstance?.goOnline()
        } else {
            MenuBarHelper.lazyInstance?.goOffline()
        }
    }
    
    func initializeLaunchAgent() {
        DDLogInfo("Initialize launch agent")
        // get launch file path bundle resource
        if let filePath = Bundle.main.path(forResource: Bundle.main.bundleIdentifier!, ofType: "plist") {
            do {
                // get data from filepath
                let data = try Data(contentsOf: URL(fileURLWithPath: filePath), options: .alwaysMapped)
                // get the user domain library folder url
                let libraryDirectoryURL = try FileManager.default.url(for: .libraryDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
                
                let dirPath = try FileManager.default.url(for: .libraryDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
                let dataPath = dirPath.appendingPathComponent("LaunchAgents")
                var directory: ObjCBool = false
                
                if !FileManager.default.fileExists(atPath: dataPath.path, isDirectory: &directory) {
                    do {
                        try FileManager.default.createDirectory(atPath: dataPath.path, withIntermediateDirectories: false, attributes: nil)
                    } catch let error {
                        DDLogError(error.localizedDescription)
                    }
                } else {
                    DDLogInfo("not creted or exist")
                }
                
                let filePathStr = "LaunchAgents/\(Bundle.main.bundleIdentifier!).plist"
                let fileDestinationUrl = libraryDirectoryURL.appendingPathComponent(filePathStr)
                DDLogInfo("\(fileDestinationUrl)")
                do {
                    try data.write(to: fileDestinationUrl, options: .atomicWrite)
                    DDLogInfo("LaunchAgent Successfully Registered")
                } catch let error {
                    DDLogError(error.localizedDescription)
                }
            } catch let error {
                DDLogError(error.localizedDescription)
            }
        }
    }
}
