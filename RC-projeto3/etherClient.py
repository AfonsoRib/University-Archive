#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Nov 12 00:29:17 2022

@author: a.rijo
"""

import socket
import sys
import ethernetTools as et

#sys.argv[1]: ethernet address to send message
if len(sys.argv) < 2:
    print("[ERROR]Unexpected number of arguments")
    print("Usage: python3 simpleClient.py targetEthernetAddress (example: aa:bb:cc:dd:ee:ff)")
    exit(0)


if __name__ == "__main__":
    #creates RAW ethernet socket
    sck = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.htons(et.ETH_P_ALL))
    #Binding ethernet interface to the socket
    sck.bind(("eth0", 0))
    broadcast="ff:ff:ff:ff:ff:ff"
    #eth0 - default name of the ethernet interface in UNIX
    my_addr = et.get_self_addr(sck, 'eth0')
    #prints ethernet address in human-readable format
    print('Ethernet address:', et.bytes_ether_addr_to_string(my_addr))
    #argv[1]: ethernet address of target device
    target_addr = et.ether_addr_to_bytes(broadcast)
    print('Target ethernet address:', sys.argv[1].lower())
    msg = sys.argv[1]
    #responseAddress= sys.argv[1]
    
    #builds frame to send
    frame = et.build_frame(target_addr, my_addr, msg)
    sck.send(frame)
    print("Ethernet frame with msg '", msg, "' sent to ethernet address", broadcast )


    while True:
        recv_frame = sck.recv(et.MAX_FRAME_SIZE)
        expected_message = "Hi, I am the server you are looking for"
        my_addr_in_frame, sender_addr, _, msg = et.extract_frame(recv_frame)
        if(msg == expected_message):
            print("--------------- Response Message Section ---------------")
            print("Ethernet Response frame received!")
            print("My addr in frame:", et.bytes_ether_addr_to_string(my_addr_in_frame))
            print("Sender addr:", et.bytes_ether_addr_to_string(sender_addr))
            print("Message:", msg)
            print("--------------- END  ---------------")
            break

    
    sck.close()
