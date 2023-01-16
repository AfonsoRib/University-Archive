#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Nov 12 00:31:47 2022

@author: a.rijo
"""

import socket
import ethernetTools as et

if __name__ == "__main__":
    sck = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.htons(et.ETH_P_ALL))  #creates RAW ethernet socket
    sck.bind(("eth0", 0))     #Binding ethernet interface to the socket

    #Eth0 - default name of the ethernet interface in UNIX
    my_addr = et.get_self_addr(sck, 'eth0')
    my_IP= et.get_self_ip_addr(sck,'eth0')
    #prints ethernet address in human-readable format
    print('Ethernet address:', et.bytes_ether_addr_to_string(my_addr))
    print('IP address:', et.bytes_ip_addr_to_string(my_IP))
    
   
    while True:         #Keeps waiting for ethernet frames and prints them.
        print("Waiting for an ethernet frame...")
        #receives an ethenet frame
        recv_frame = sck.recv(et.MAX_FRAME_SIZE)
    
        print("Ethernet frame received!")
        #extracts content of the frame
        my_addr_in_frame, sender_addr, _, msg = et.extract_frame(recv_frame)
        print("My addr in frame:", et.bytes_ether_addr_to_string(my_addr_in_frame))
        print("Sender addr:", et.bytes_ether_addr_to_string(sender_addr))
        print("Message:", msg)
        if(msg == et.bytes_ip_addr_to_string(my_IP)):
            target_addr = sender_addr
            msg = "Hi, I am the server you are looking for"
            frame = et.build_frame(target_addr, my_addr, msg)
            sck.send(frame)
            print("--------------- Response Message Section ---------------")
            print("Ethernet frame with msg '", msg, "' sent to ethernet address ", et.bytes_ether_addr_to_string(target_addr).lower())
            print("--------------- END  ---------------")
        print()
    
    sck.close()
