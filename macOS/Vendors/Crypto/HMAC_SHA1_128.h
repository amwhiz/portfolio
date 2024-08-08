//
//  HMAC_SHA1_128.h
//  COPsync911
//
//  Created by aj on 18/08/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface HMAC_SHA1_128 : NSObject

+ (NSString*) getSha1_128:(NSString*)key withData:(NSString*)data;
+ (NSString*) macAddress;
+ (float) getVolume;
+ (NSString*) getGraphicsInfo;
@end
