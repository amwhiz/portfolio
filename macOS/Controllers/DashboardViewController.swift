//
//  DashboardViewController.swift
//  copsync
//
//  Created by Arul Jothi on 6/26/16.
//  Copyright © 2016 copsync. All rights reserved.
//

import Foundation
import Cocoa
import MapKit
import CoreLocation

class DashboardViewController: NSViewController, LocationServiceDelegate, MessengerDelegate {
    // MARK: - Properties
    @IBOutlet weak var locationIcon: NSImageView!
    
    @IBOutlet weak var updateAlertMessage: NSTextField!
    @IBOutlet weak var updateLocation: NSButton!
    /// instance of login view
    var dashboardView: DashboardView {
        return view as! DashboardView
    }
    
    @IBOutlet weak var locationNameView: NSView!
    @IBOutlet weak var ogranizationNameView: NSView!
    var deviceStatus = false
    
    var isLocationSelected = Bool()
    
    let locationManager = CLLocationManager()
    
    var timer = Timer()
    
    var isLocationAvailable: Bool = false
    
    var isDeviceActive:Bool = false
    
    var loader:LoaderUtil?
    
    var orgnizationNameLoader: LoaderUtil?
    
    var locationNameLoader: LoaderUtil?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        locationNameLoader = LoaderUtil()
        locationNameLoader?.startAnimateSlim(view: locationNameView, sender: self)
        
        self.locationIcon.isHidden = true
        
        self.dashboardView.emergencyTextField.isHidden = true

        
        if let organizationName = DataonixUser().organizationName{
            
            self.dashboardView.locationNameTextField.stringValue = organizationName
        }
        else{
            
            self.dashboardView.locationNameTextField.stringValue = " - - - - "
        }
        
        LocationServices.sharedInstance.delegates.addDelegate(self)
        
        NotificationCenter.default.addObserver(self, selector: #selector(DashboardViewController.onConnectionLost(_:)), name: NSNotification.Name("onConnectionLost"), object: nil)
        
        
        self.updateLocation.isHidden = false
        
        self.dashboardView.sendAlertButton.isHidden = true
        
        self.updateAlertMessage.isHidden = false
        
        self.dashboardView.joinChatButton.isHidden = true
        
        self.dashboardView.sendButtonLeadSpaceLayoutConstraint.constant = 117
        
        self.dashboardView.emergencyTextField.stringValue = "Device Inactive"
        
//        NotificationCenter.default.addObserver(self, selector: #selector(DashboardViewController.onMemberListModified(_:)), name: NSNotification.Name("dashboardStatusUpdate"), object: nil)
        
        NotificationCenter.default.addObserver(self, selector: #selector(DashboardViewController.deviceStatusUpdate(_:)), name: NSNotification.Name("deviceStatusUpdate"), object: nil)
        
        self.view.wantsLayer = true
        NotificationCenter.default.addObserver(self, selector: #selector(DashboardViewController.joinEmergencyAlert(_:)), name: NSNotification.Name("joinEmergencyAlert"), object: nil)
        
        self.view.layer?.backgroundColor = NSColor.white.cgColor
        
        self.setcornerradiusForMap(height: self.dashboardView.mapView.frame.height)
        
        self.dashboardView.mapView.showsUserLocation = true
        
        if CLLocationManager.locationServicesEnabled() {
           
            LocationServices.sharedInstance.startUpdatingLocation()
            
        } else {
            
            self.updateLocation.isHidden = false
            AlertHelper.showAlert(question: Alert.locationTitle, text: Alert.locationAlert)
        }
        
        self.isCurrentDeviceActive(isTimer: true)
        self.scheduledTimerWithTimeInterval()
    }
    
    override func viewWillLayout() {
    }
    
    override var representedObject: Any? {
        didSet {}
    }
    
    override func viewDidAppear() {
        super.viewDidAppear()
    }
    
    func performSegueWithIdentifier() {}
    
    override func viewWillDisappear() {
        super.viewWillDisappear()
        timer.invalidate()
        
    }
    
    override func viewDidDisappear() {
        super.viewDidDisappear()
        timer.invalidate()
    }
}

// MARK:- Actions
extension DashboardViewController {
    
    @IBAction func joinAlertAction(_ sender: AnyObject) {
        DispatchQueue.main.async(execute: {
            self.performSegue(withIdentifier: Identifiers.showChat, sender: nil)
        })
    }
    
    @IBAction func sendAlertAction(_ sender: AnyObject) {
        self.isCurrentDeviceActive(isTimer: false)
    }
    
    @IBAction func updateLocationAction(_ sender: AnyObject) {
        if !CLLocationManager.locationServicesEnabled() {
            AlertHelper.showAlert(question: Alert.locationTitle, text: Alert.locationAlert)
            return
        }
        if Bool.isDeviceActive() && UserDefaultsHelper.isUserAuthenticated() {
            DispatchQueue.main.async(execute: {
                self.performSegue(withIdentifier: Identifiers.showUpdateLocation, sender: nil)
            })
        } else {
            AlertHelper.showAlert(question: "403 - InvalidDevice", text: "Invalid Device, " + Dataonix.ErrorMessageText.deviceMessage)
        }
    }
    
    func joinEmergencyAlert(_ aNotification: Notification) {
        DispatchQueue.main.async(execute: {
            self.performSegue(withIdentifier: Identifiers.showChat, sender: nil)
        })
    }
}

// MARK:- Notification
extension DashboardViewController {
    
    func onMemberListModified(_ aNotification: Notification) {
        if Messenger.sharedInstance.membersList.count > 0 {
            self.dashboardView.joinChatButton.isHidden = false
            self.dashboardView.sendButtonLeadSpaceLayoutConstraint.constant = 15
        } else {
            self.dashboardView.joinChatButton.isHidden = true
            self.dashboardView.sendButtonLeadSpaceLayoutConstraint.constant = 117
        }
    }
    
    func deviceStatusUpdate(_ aNotification: Notification) {
//        self.dashboardView.sendAlertButton.isHidden = true
        self.dashboardView.emergencyTextField.isHidden = false
        self.dashboardView.emergencyTextField.stringValue = "Invalid Device, " + Dataonix.ErrorMessageText.deviceMessage
        self.timer.invalidate()
    }
}

//MARK:- MapViewDelegate
extension DashboardViewController {
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        
        let location = locations.last! as CLLocation
        
        let center = CLLocationCoordinate2D(latitude: location.coordinate.latitude, longitude: location.coordinate.longitude)
        let region = MKCoordinateRegion(center: center, span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01))
        
        self.dashboardView.mapView.setRegion(region, animated: true)
        self.isLocationAvailable = true;
        LocationModel.sharedInstance.currentLocation = manager
        
        self.updateLocation.isHidden = false
       
        if(!isLocationSelected) {
            
            self.addressFromLocation(location: location)
           
        }
    }
    
    func setcornerradiusForMap(height: CGFloat) {
        self.dashboardView.mapView.wantsLayer = true
        self.dashboardView.mapView.layer?.borderWidth = 2
        self.dashboardView.mapView.layer?.borderColor = NSColor(red: 219.0/255.0, green: 219.0/255.0, blue: 219.0/255.0, alpha: 1.0).cgColor
        self.dashboardView.mapView.layer?.cornerRadius =  height/2.0
    }
    
    func addressFromLocation(location: CLLocation) {
        let geoCoder = CLGeocoder()
        geoCoder.reverseGeocodeLocation(location, completionHandler: { (object, error) -> Void in
            
            if let placemarks = object {
                
                let placemark = placemarks[0] as CLPlacemark
                
                var selectedCityAndCountry = ""

                if let city = placemark.locality {
                    selectedCityAndCountry = city + ", "
                }
                if let country =  placemark.country {
                    selectedCityAndCountry = selectedCityAndCountry + country
                }
                self.locationIcon.isHidden = false
                
                self.dashboardView.stateAndCountryTextField.stringValue = selectedCityAndCountry
                
                self.locationNameLoader?.stopAnimateSlim()
            }
            self.isLocationSelected = true
        })
    }
}

extension DashboardViewController {
    
    func isCurrentDeviceActive(isTimer: Bool) {
        log.info("check current device is active")
        
        if self.deviceStatus {
            self.sendAlert()
        } else {
            if !isTimer {
                self.dashboardView.sendAlertButton.isEnabled = false
            }
            DataonixService.showNotification = isTimer
            DeviceApiClient()
                .isCurrentDeviceActive()
                .always {
                    self.dashboardView.sendAlertButton.isEnabled = true
                    DataonixService.showNotification = false
                }
                .then { data -> Void in
                    log.debug(data)
                    let device = data as? NSDictionary
                    
                    if device != nil {
                        if device?["IsActive"] as! Int == 1 {
                            UserDefaults.standard.set(true, forKey: DeviceSettings.isDeviceActive)
                            self.isDeviceActive = true
                            
                            self.dashboardView.sendAlertButton.isHidden = false
                            
                            self.updateAlertMessage.isHidden = true

                                
                            log.info("device is active")
                            self.getDeviceDetails()
                        } else {
                            UserDefaults.standard.set(false, forKey: DeviceSettings.isDeviceActive)
                            if UserDefaultsHelper.isUserAuthenticated() {
                                AlertHelper.showAlert(question: DeviceRegistrationError.invalidDevice.rawValue, text: Dataonix.ErrorMessageText.deviceMessage)
                            }
                        }
                    } else {
                        UserDefaults.standard.set(false, forKey: DeviceSettings.isDeviceActive)
                        log.info("device is inactive or invalid")
                        self.dashboardView.sendAlertButton.isHidden = false
                        
                        self.updateAlertMessage.isHidden = true
                        self.dashboardView.sendAlertButton.image = NSImage(named: "recheck")
                        if UserDefaultsHelper.isUserAuthenticated() {
                            AlertHelper.showAlert(question: DeviceRegistrationError.invalidDevice.rawValue, text: Dataonix.ErrorMessageText.deviceMessage)
                        }
                    }
                }
                .catch { error in
                    UserDefaults.standard.set(false, forKey: DeviceSettings.isDeviceActive)
                    log.info("device is inactive or invalid")
                    self.dashboardView.sendAlertButton.isHidden = false
                    
                    self.updateAlertMessage.isHidden = true
                    self.dashboardView.sendAlertButton.image = NSImage(named: "recheck")
                    switch error {
                    case NetworkError.unreachable:
                        AlertHelper.showAlert(question: NetworkError.unreachable.rawValue, text: Dataonix.ErrorMessageText.unreachable)
                    default:
                        log.error(error)
                    }
            }
        }
    }
    
    func updateView() {
        DispatchQueue.main.async {
            self.dashboardView.sendAlertButton.isHidden = false
            self.dashboardView.emergencyTextField.isHidden = false
            self.updateAlertMessage.isHidden = true
            self.dashboardView.sendAlertButton.image = NSImage(named: "sendalert")
            self.dashboardView.emergencyTextField.stringValue = "In case of emergency tap below to send alert."
        }
    }
    
    func scheduledTimerWithTimeInterval() {
        timer = Timer.scheduledTimer(timeInterval: 15, target: self, selector: #selector(self.checkDeviceStatus), userInfo: nil, repeats: true)
    }
    
    func checkDeviceStatus() {
        if reachability.isReachable {
            self.isCurrentDeviceActive(isTimer: true)
        }
    }
    
    func getDeviceDetails() {
        log.info("get device details by device id")
        DeviceApiClient()
            .getDeviceDetails()
            .then { data -> Void in
                
                UserDefaults.standard.set(NSKeyedArchiver.archivedData(withRootObject: data), forKey: UserSettings.chatCredentials)
                
                UserDefaults.standard.set(true, forKey: UserSettings.chatCredentialsExists)
                
                self.deviceStatus = true
                
                self.timer.invalidate()
                
                self.updateView()
                
                Messenger.sharedInstance.messengerDelegate?.addDelegate(self)
                Messenger.sharedInstance.connect(onCompletion: nil)
                Messenger.sharedInstance.isDirty = false
            }
            .catch { error in
                UserDefaults.standard.set(false, forKey: UserSettings.chatCredentialsExists)
                log.error(error)
        }
    }
    
    func sendAlert() {
        DataonixService.showNotification = false
        self.recheckCurrentDeviceActive()
    }
    
    func recheckCurrentDeviceActive() {
        log.info("recheck current device is active")
        DeviceApiClient()
            .isCurrentDeviceActive()
            .always {
                self.dashboardView.sendAlertButton.isEnabled = true
            }
            .then { data -> Void in
                log.debug(data)
                let device = data as? NSDictionary
                
                if device != nil {
                    if device?["IsActive"] as! Int == 1 {
                        UserDefaults.standard.set(true, forKey: DeviceSettings.isDeviceActive)
                        DispatchQueue.main.async(execute: {
                            self.performSegue(withIdentifier: Identifiers.showEmergency, sender: nil)
                        })
                    } else {
                        UserDefaults.standard.set(false, forKey: DeviceSettings.isDeviceActive)
                        AlertHelper.showAlert(question: DeviceRegistrationError.invalidDevice.rawValue, text: Dataonix.ErrorMessageText.deviceMessage)
                    }
                } else {
                    UserDefaults.standard.set(false, forKey: DeviceSettings.isDeviceActive)
                    log.info("device is inactive or invalid")
                    AlertHelper.showAlert(question: DeviceRegistrationError.invalidDevice.rawValue, text: Dataonix.ErrorMessageText.deviceMessage)
                }
            }
            .catch { error in
                UserDefaults.standard.set(false, forKey: DeviceSettings.isDeviceActive)
                log.info("device is inactive or invalid")
                switch error {
                case NetworkError.unreachable:
                    AlertHelper.showAlert(question: NetworkError.unreachable.rawValue, text: Dataonix.ErrorMessageText.unreachable)
                default:
                    log.error(error)
                }
        }
    }
}

// MARK: - XMPP chat service
extension DashboardViewController {
    
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
    
    func onRoomStateUpdate() {
        debugPrint("onRoomStateUpdate")
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
