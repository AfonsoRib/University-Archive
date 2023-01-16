from socket import *
import select
import random
import sys


if __name__ == "__main__":
    if len(sys.argv)<6:
        print("Usage: python3 drop.py port1 port2 port3 port4 probability")
        sys.exit(1)
    
    port1 = int(sys.argv[1])
    port2 = int(sys.argv[2])
    port3 = int(sys.argv[3])
    port4 = int(sys.argv[4])
    prob = float(sys.argv[5]) 
    
    in1 = socket( AF_INET, SOCK_DGRAM)
    out1 = socket( AF_INET, SOCK_DGRAM)
    in2 = socket( AF_INET, SOCK_DGRAM)
    out2 = socket( AF_INET, SOCK_DGRAM)
    in1.bind(("",port3))
    in2.bind(("",port4))
    
    while True:
        res = select.select([in1,in2],[],[], None)
        x = len(res[0])

        for i in range(x):
            pkt_recv_raw, addr = res[0][i].recvfrom( 2048 )
            # print("revcfrom: ", addr)
            x = random.random()
            if x >= prob:
                if addr[1]==port1:
                    out1.sendto(pkt_recv_raw, ("", port2))
                    print("sender(P1) -> drop(P3) -> receiver(P2)")
                elif addr[1]==port2:
                    out2.sendto(pkt_recv_raw, ("", port1))
                    print("receiver(P2) -> drop(P4) -> sender(P1)")

#print("Main: all done")
