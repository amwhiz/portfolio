//
//  Addon.swift
//  COPsync911
//
//  Created by Shaul Hameed on 10/16/16.
//  Copyright © 2016 COPsync911. All rights reserved.
//

import Foundation


struct Queue<T> {
    
    private var internalQueue: [T] = [T]()
    
    mutating func enqueue(element: T) {
        internalQueue.append(element)
    }
    
    mutating func dequeue() -> T? {
        guard !internalQueue.isEmpty else{
            return nil
        }
        
        return internalQueue.remove(at: 0)
    }
    
    func isEmpty() -> Bool {
        return internalQueue.isEmpty
    }
    
    func head() -> T? {
        guard !internalQueue.isEmpty else {
            return nil
        }
        
        return internalQueue.first
    }
    
    func tail() -> T? {
        guard !internalQueue.isEmpty else {
            return nil
        }
        
        return internalQueue.last
    }
    
    func expose() -> [T] {
        return internalQueue
    }
}
