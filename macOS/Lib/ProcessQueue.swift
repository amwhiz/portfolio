//
//  ProcessQueue.swift
//  COPsync911
//
//  Created by aj on 12/07/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

import Foundation

@objc protocol TaskListDelegate {
    
    func onTasksComplete()
}

class TaskList: NSObject {
    
    enum ProcessState {
        case InProgress
        case Done
        case Failed
    }
    
    enum ProcessType {
        case Foreground
        case Background
    }
    
    struct Process {
        internal let PID: String
        internal var Status: ProcessState
        internal let TaskProcessType: ProcessType
    }
    
    var delegate: TaskListDelegate?
    var foreGroundTask: [Process] = [Process]()
    var backGroundTask: [Process] = [Process]()
    var initializedProcess: Process?
    static var onCompleteOfTasks: () -> Void = {}
    
    override init() {
        super.init()
    }
    
    init?(processType: ProcessType) {
        super.init()
        self.initializedProcess = self.add(processType: processType)
    }
    
    private func foreGround() -> Process {
        let newForeGroundProcess = Process(PID: self.createPID(),
                                           Status: ProcessState.InProgress,
                                           TaskProcessType: ProcessType.Foreground)
        foreGroundTask.append(newForeGroundProcess)
        
        return newForeGroundProcess
    }
    
    private func backGround() -> Process {
        let newBackGroundProcess = Process(PID: self.createPID(),
                                           Status: ProcessState.InProgress,
                                           TaskProcessType: ProcessType.Background)
        backGroundTask.append(newBackGroundProcess)
        
        return newBackGroundProcess
    }
    
    private func createPID() -> String {
        return "PID-\(Int(arc4random_uniform(UInt32(4))))"
    }
    
    private func deleteElementInForeGroundList(process: Process) {
        foreGroundTask = foreGroundTask.filter({
            $0.PID != process.PID
        })
    }
    
    func isForeGroundProcessComplete() -> Bool {
        let doneList = self.foreGroundTask.filter({
            $0.Status == ProcessState.Done
        })
        
        return doneList.count == self.foreGroundTask.count
    }
    
    func markAsDone(process: Process?) {
        var process = process
        
        if let alreadyInitializedProcess = self.initializedProcess {
            process = alreadyInitializedProcess
        }
        
        if(process?.TaskProcessType == ProcessType.Foreground) {
            var selectedProcess = foreGroundTask.filter({
                $0.PID == process!.PID
            })
            
            if (selectedProcess.count > 0) {
                self.deleteElementInForeGroundList(process: selectedProcess.first!)
                selectedProcess[0].Status = ProcessState.Done
                foreGroundTask.append(selectedProcess[0])
            }
        } else {
            var selectedProcess = backGroundTask.filter({
                $0.PID == process!.PID
            })
            
            if selectedProcess.count > 0 {
                self.deleteElementInForeGroundList(process: selectedProcess.first!)
                selectedProcess[0].Status = ProcessState.Done
                foreGroundTask.append(selectedProcess[0])
            }
        }
        
        
        if (self.isForeGroundProcessComplete()) {
            self.delegate?.onTasksComplete()
        }
    }
    
    func add(processType: ProcessType) -> Process {
        switch(processType) {
            case .Foreground:
                return self.foreGround()
            case .Background:
                return self.backGround()
        }
    }
    
    class func registerOnCompleteCallback(callback: @escaping () -> Void) {
        onCompleteOfTasks = callback
    }
}
