//
//  HMAC_SHA1_128.m
//  COPsync911
//
//  Created by aj on 18/08/16.
//  Copyright © 2016 COPsync, Inc. All rights reserved.
//

#import "HMAC_SHA1_128.h"
#include <stdio.h>
#include "hmac.h"

#include "memxor.h"
#include "sha1.h"

#include <string.h>

#define IPAD 0x36
#define OPAD 0x5c

#include <CoreFoundation/CoreFoundation.h>

#include <IOKit/IOKitLib.h>
#include <IOKit/network/IOEthernetInterface.h>
#include <IOKit/network/IONetworkInterface.h>
#include <IOKit/network/IOEthernetController.h>
#include <CoreAudio/AudioHardware.h>
#import <CoreAudio/CoreAudio.h>

static kern_return_t FindEthernetInterfaces(io_iterator_t *matchingServices);
static kern_return_t GetMACAddress(io_iterator_t intfIterator, UInt8 *MACAddress, UInt8 bufferSize);

// Returns an iterator containing the primary (built-in) Ethernet interface. The caller is responsible for
// releasing the iterator after the caller is done with it.
static kern_return_t FindEthernetInterfaces(io_iterator_t *matchingServices)
{
    kern_return_t           kernResult;
    CFMutableDictionaryRef	matchingDict;
    CFMutableDictionaryRef	propertyMatchDict;
    
    // Ethernet interfaces are instances of class kIOEthernetInterfaceClass.
    // IOServiceMatching is a convenience function to create a dictionary with the key kIOProviderClassKey and
    // the specified value.
    matchingDict = IOServiceMatching(kIOEthernetInterfaceClass);
    
    // Note that another option here would be:
    // matchingDict = IOBSDMatching("en0");
    // but en0: isn't necessarily the primary interface, especially on systems with multiple Ethernet ports.
    
    if (NULL == matchingDict) {
        printf("IOServiceMatching returned a NULL dictionary.\n");
    }
    else {
        // Each IONetworkInterface object has a Boolean property with the key kIOPrimaryInterface. Only the
        // primary (built-in) interface has this property set to TRUE.
        
        // IOServiceGetMatchingServices uses the default matching criteria defined by IOService. This considers
        // only the following properties plus any family-specific matching in this order of precedence
        // (see IOService::passiveMatch):
        //
        // kIOProviderClassKey (IOServiceMatching)
        // kIONameMatchKey (IOServiceNameMatching)
        // kIOPropertyMatchKey
        // kIOPathMatchKey
        // kIOMatchedServiceCountKey
        // family-specific matching
        // kIOBSDNameKey (IOBSDNameMatching)
        // kIOLocationMatchKey
        
        // The IONetworkingFamily does not define any family-specific matching. This means that in
        // order to have IOServiceGetMatchingServices consider the kIOPrimaryInterface property, we must
        // add that property to a separate dictionary and then add that to our matching dictionary
        // specifying kIOPropertyMatchKey.
        
        propertyMatchDict = CFDictionaryCreateMutable(kCFAllocatorDefault, 0,
                                                      &kCFTypeDictionaryKeyCallBacks,
                                                      &kCFTypeDictionaryValueCallBacks);
        
        if (NULL == propertyMatchDict) {
            printf("CFDictionaryCreateMutable returned a NULL dictionary.\n");
        }
        else {
            // Set the value in the dictionary of the property with the given key, or add the key
            // to the dictionary if it doesn't exist. This call retains the value object passed in.
            CFDictionarySetValue(propertyMatchDict, CFSTR(kIOPrimaryInterface), kCFBooleanTrue);
            
            // Now add the dictionary containing the matching value for kIOPrimaryInterface to our main
            // matching dictionary. This call will retain propertyMatchDict, so we can release our reference
            // on propertyMatchDict after adding it to matchingDict.
            CFDictionarySetValue(matchingDict, CFSTR(kIOPropertyMatchKey), propertyMatchDict);
            CFRelease(propertyMatchDict);
        }
    }
    
    // IOServiceGetMatchingServices retains the returned iterator, so release the iterator when we're done with it.
    // IOServiceGetMatchingServices also consumes a reference on the matching dictionary so we don't need to release
    // the dictionary explicitly.
    kernResult = IOServiceGetMatchingServices(kIOMasterPortDefault, matchingDict, matchingServices);
    if (KERN_SUCCESS != kernResult) {
        printf("IOServiceGetMatchingServices returned 0x%08x\n", kernResult);
    }
    
    return kernResult;
}

// Given an iterator across a set of Ethernet interfaces, return the MAC address of the last one.
// If no interfaces are found the MAC address is set to an empty string.
// In this sample the iterator should contain just the primary interface.
static kern_return_t GetMACAddress(io_iterator_t intfIterator, UInt8 *MACAddress, UInt8 bufferSize)
{
    io_object_t		intfService;
    io_object_t		controllerService;
    kern_return_t	kernResult = KERN_FAILURE;
    
    // Make sure the caller provided enough buffer space. Protect against buffer overflow problems.
    if (bufferSize < kIOEthernetAddressSize) {
        return kernResult;
    }
    
    // Initialize the returned address
    bzero(MACAddress, bufferSize);
    
    // IOIteratorNext retains the returned object, so release it when we're done with it.
    while ((intfService = IOIteratorNext(intfIterator)))
    {
        CFTypeRef	MACAddressAsCFData;
        
        // IONetworkControllers can't be found directly by the IOServiceGetMatchingServices call,
        // since they are hardware nubs and do not participate in driver matching. In other words,
        // registerService() is never called on them. So we've found the IONetworkInterface and will
        // get its parent controller by asking for it specifically.
        
        // IORegistryEntryGetParentEntry retains the returned object, so release it when we're done with it.
        kernResult = IORegistryEntryGetParentEntry(intfService,
                                                   kIOServicePlane,
                                                   &controllerService);
        
        if (KERN_SUCCESS != kernResult) {
            printf("IORegistryEntryGetParentEntry returned 0x%08x\n", kernResult);
        }
        else {
            // Retrieve the MAC address property from the I/O Registry in the form of a CFData
            MACAddressAsCFData = IORegistryEntryCreateCFProperty(controllerService,
                                                                 CFSTR(kIOMACAddress),
                                                                 kCFAllocatorDefault,
                                                                 0);
            if (MACAddressAsCFData) {
                CFShow(MACAddressAsCFData); // for display purposes only; output goes to stderr
                
                // Get the raw bytes of the MAC address from the CFData
                CFDataGetBytes(MACAddressAsCFData, CFRangeMake(0, kIOEthernetAddressSize), MACAddress);
                CFRelease(MACAddressAsCFData);
            }
            
            // Done with the parent Ethernet controller object so we release it.
            (void) IOObjectRelease(controllerService);
        }
        
        // Done with the Ethernet interface object so we release it.
        (void) IOObjectRelease(intfService);
    }
    
    return kernResult;
}


int
hmac_sha2 (const void *key, size_t keylen,
           const void *in, size_t inlen, void *resbuf)
{
    struct sha1_ctx inner;
    struct sha1_ctx outer;
    char optkeybuf[20];
    char block[128];
    char innerhash[20];
    
    /* Reduce the key's size, so that it becomes <= 64 bytes large.  */
    
    if (keylen > 128)
    {
        struct sha1_ctx keyhash;
        
        sha1_init_ctx (&keyhash);
        sha1_process_bytes (key, keylen, &keyhash);
        sha1_finish_ctx (&keyhash, optkeybuf);
        
        key = optkeybuf;
        keylen = 20;
    }
    
    /* Compute INNERHASH from KEY and IN.  */
    
    sha1_init_ctx (&inner);
    
    memset (block, IPAD, sizeof (block));
    memxor (block, key, keylen);
    
    sha1_process_block (block, 128, &inner);
    sha1_process_bytes (in, inlen, &inner);
    
    sha1_finish_ctx (&inner, innerhash);
    
    /* Compute result from KEY and INNERHASH.  */
    
    sha1_init_ctx (&outer);
    
    memset (block, OPAD, sizeof (block));
    memxor (block, key, keylen);
    
    sha1_process_block (block, 128, &outer);
    sha1_process_bytes (innerhash, 20, &outer);
    
    sha1_finish_ctx (&outer, resbuf);
    
    return 0;
}

@implementation HMAC_SHA1_128

+ (NSString*) getSha1_128:(NSString*)key withData:(NSString*)data {
    char key_string[100];
    char signature_base_string[100];
    char sha1_result[20];
    
    strcpy(key_string, [key cStringUsingEncoding:NSUTF8StringEncoding]);
    strcpy(signature_base_string, [data cStringUsingEncoding:NSUTF8StringEncoding]);
    
    hmac_sha2(key_string, strlen(key_string), signature_base_string, strlen(signature_base_string), sha1_result);
    
    NSData *hash = [[NSData alloc] initWithBytes:&sha1_result length:sizeof(sha1_result)];
    NSString *result = [hash base64EncodedStringWithOptions:0];
    
    return result;
}

+ (NSString*) macAddress {
    kern_return_t	kernResult = KERN_SUCCESS;
    io_iterator_t	intfIterator;
    UInt8			MACAddress[kIOEthernetAddressSize];
    
    kernResult = FindEthernetInterfaces(&intfIterator);
    NSString *result = nil;
    
    if (KERN_SUCCESS != kernResult) {
        result = @"";
    }
    else {
        kernResult = GetMACAddress(intfIterator, MACAddress, sizeof(MACAddress));
        
        if (KERN_SUCCESS != kernResult) {
            result = @"";
        }
        else {
            result = [NSString stringWithFormat:@"%02x-%02x-%02x-%02x-%02x-%02x", MACAddress[0], MACAddress[1], MACAddress[2], MACAddress[3], MACAddress[4], MACAddress[5]];
        }
    }
    
    (void) IOObjectRelease(intfIterator);	// Release the iterator.
    return result;
}

+ (float) getVolume
{
    float            b_vol;
    OSStatus        err;
    AudioDeviceID        device;
    UInt32            size;
    UInt32            channels[2];
    float            volume[2];
    
    // get device
    size = sizeof device;
    err =
    AudioHardwareGetProperty(kAudioHardwarePropertyDefaultOutputDevice, &size,
                             &device);
    if(err!=noErr)
    {
        NSLog(@"audio-volume error get device");
        return 0.0;
    }
    
    // try set master volume (channel 0)
    size = sizeof b_vol;
    err = AudioDeviceGetProperty(device, 0, 0,
                                 kAudioDevicePropertyVolumeScalar, &size, &b_vol);
    //kAudioDevicePropertyVolumeScalarToDecibels
    if(noErr==err) return b_vol;
    
    // otherwise, try seperate channels
    // get channel numbers
    size = sizeof(channels);
    err = AudioDeviceGetProperty(device, 0,
                                 0,kAudioDevicePropertyPreferredChannelsForStereo, &size,&channels);
    if(err!=noErr) NSLog(@"error getting channel-numbers");
    
    size = sizeof(float);
    err = AudioDeviceGetProperty(device, channels[0], 0,
                                 kAudioDevicePropertyVolumeScalar, &size, &volume[0]);
    if(noErr!=err) NSLog(@"error getting volume of channel %d",channels[0]);
    err = AudioDeviceGetProperty(device, channels[1], 0,
                                 kAudioDevicePropertyVolumeScalar, &size, &volume[1]);
    if(noErr!=err) NSLog(@"error getting volume of channel %d",channels[1]);
    
    b_vol = (volume[0]+volume[1])/2.00;
    
    return  b_vol;
}

+ (NSString*) getGraphicsInfo {
    // Get dictionary of all the PCI Devicces
    CFMutableDictionaryRef matchDict = IOServiceMatching("IOPCIDevice");
    
    // Create an iterator
    io_iterator_t iterator;
    
    if (IOServiceGetMatchingServices(kIOMasterPortDefault,matchDict,
                                     &iterator) == kIOReturnSuccess)
    {
        // Iterator for devices found
        io_registry_entry_t regEntry;
        
        while ((regEntry = IOIteratorNext(iterator))) {
            // Put this services object into a dictionary object.
            CFMutableDictionaryRef serviceDictionary;
            if (IORegistryEntryCreateCFProperties(regEntry,
                                                  &serviceDictionary,
                                                  kCFAllocatorDefault,
                                                  kNilOptions) != kIOReturnSuccess)
            {
                // Service dictionary creation failed.
                IOObjectRelease(regEntry);
                continue;
            }
            const void *GPUModel = CFDictionaryGetValue(serviceDictionary, @"model");
            
            if (GPUModel != nil) {
                if (CFGetTypeID(GPUModel) == CFDataGetTypeID()) {
                    // Create a string from the CFDataRef.
                    NSString *modelName = [[NSString alloc] initWithData:
                                           (__bridge NSData *)GPUModel encoding:NSASCIIStringEncoding];
                    
                    return modelName;
                }
            }
            // Release the dictionary
            CFRelease(serviceDictionary);
            // Release the serviceObject
            IOObjectRelease(regEntry);
        }
        // Release the iterator
        IOObjectRelease(iterator);
    }
    
    return @"Unknown";
}

@end
