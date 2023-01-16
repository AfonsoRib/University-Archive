#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Nov 10 22:26:38 2022

@author: a.rijo
"""

import fcntl
import struct
import socket

ETH_P_ALL = int("0x3419", 16)   #Indicates the type of ethernet frames for the socket to handle
MAX_FRAME_SIZE = 1514

#Returns the ethernet address (MAC) of ethernet_name interface
def get_self_addr(sck, ethernet_name):
    info = fcntl.ioctl(     #request to the OS to get info on a file
        sck.fileno(),       #ID of the "file" representing the socket
        0x8927,             #command to get ethernet address
        struct.pack('256s', bytes(ethernet_name, 'utf-8')[:15]) #properly packs the name of the ethernet interface
    )
    addr_bytes = info[18:24]    #bytes containing the address. Rest of data is 0s.
    return addr_bytes

#Returns the IP address of ethernet_name interface
def get_self_ip_addr(sck, ethernet_name):
    info = fcntl.ioctl(             #request to the OS to get info on a file
        sck.fileno(),               #ID of the "file" representing the socket
        0x8915,                     #command to get IP address
        struct.pack('256s', bytes(ethernet_name, 'utf-8')[:15]) #properly packs the IP address
    )
    addr_bytes = info[20:24]        #bytes containing the address. Rest of data is 0s.
    return addr_bytes

#Converts an ethernet address in a hexadecimal string to bytes
#Example of an address: aa:bb:cc:dd:ee:ff
def ether_addr_to_bytes(addr):
    #converts ':' to whitespace for usage in the next function
    addr_spaced = addr.replace(":", " ")
    #converts hexadecimal string to bytes, ignoring spaces
    return bytes.fromhex(addr_spaced)

#From an ethernet address in bytes form, converts it to a hexadecimal string in the form aa:bb:cc:dd:ee:ff
def bytes_ether_addr_to_string(addr):
    #%02x is to ensure the leftmost 0 is included if byte <= 0x0F
    return ':'.join('%02x' % b for b in addr)

#Given a string with an IP adress in numerical form, returns the respective bytes
#Example: 172.0.0.1
def ip_addr_to_bytes(ip):
    #returns bytes representing the IP address
    return socket.inet_aton(ip)

#From an IP address in bytes form, converts it a string in numerical form
def bytes_ip_addr_to_string(ip):
    #returns string representing the IP address in numerical form
    return socket.inet_ntoa(ip)

#An ethernet frame is made of, by this order:
#target ethernet address (6 bytes)
#source ethernet address (6 bytes)
#type of ethernet frame  (2 bytes)
#payload
#error detection (4 bytes, handled automatically by the network adapter hardware)    
def build_frame(target_addr, my_addr, msg):
    #any value over 0x0600 represents an Ethernet Type II Frame
    return target_addr + my_addr + b'\x34\x19' + msg.encode()

#Returns, by this order:
#my (the target of this packet)'s ethernet address (6 bytes)
#source ethernet address (6 bytes)
#type of ethernet frame (2 bytes)
#payload of the packet
#Note: same order as it appears in the frame :)
def extract_frame(frame):
    my_addr_in_frame = frame[0:6]
    sender_addr = frame[6:12]
    ether_type = frame[12:14]
    data = frame[14:len(frame)].decode()
    return my_addr_in_frame, sender_addr, ether_type, data
