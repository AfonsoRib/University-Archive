import sys
from socket import *
from ft22 import *

INITIAL_STATE = 0
TRANSFER_STATE = 1
FINWAIT_STATE = 2
END_STATE = 4

sender_port = int(sys.argv[1])
recv_hostname = sys.argv[2]
recv_port = int(sys.argv[3])
fname_in_sender = sys.argv[4]
fname_in_recv = sys.argv[5]

TIMEOUT = 2

BLOCK_SIZE = 2048

def main():
    # execute actions in the edge conducting to the initial state
    sock = socket(AF_INET, SOCK_DGRAM)
    address = ("localhost", sender_port)
    sock.bind(address)
    seq = 0
    print("socket created on: ", address)
    f = open(fname_in_sender ,"rb")
    state = INITIAL_STATE
    while state != END_STATE:
        if state == INITIAL_STATE:
            seq = 0
            sendUploadDatagram(sock, recv_hostname, recv_port, fname_in_recv)
            res, msg, senderHost, senderPort = recvDatagram(sock, TIMEOUT)
            if res == 0:
                dg_type = int.from_bytes(msg[0:3], 'little')
                dg_seq = int.from_bytes(msg[4:7], 'little')
                if dg_type == ACK and dg_seq == 0:
                    state = TRANSFER_STATE
        if state == TRANSFER_STATE:
            data = f.read(BLOCK_SIZE-8)
            dg_seq = -1
            dg_type = -1
            seq += 1
            while dg_type != ACK and dg_seq != seq:
                sendDataDatagram(sock, recv_hostname,recv_port,seq, data)
                res, msg, senderHost, senderPort = recvDatagram(sock, TIMEOUT)
                if res == 0:
                    dg_type = int.from_bytes(msg[0:3], 'little')
                    dg_seq = int.from_bytes(msg[4:7], 'little')
            if len(data) < BLOCK_SIZE-8 and dg_type == ACK and dg_seq == seq:
                state = FINWAIT_STATE
                seq += 1
        if state == FINWAIT_STATE:
            sendFinDatagram(sock, recv_hostname,recv_port, seq)
            res, msg, senderHost, senderPort = recvDatagram(sock, TIMEOUT)
            if res == 0:
                dg_type = int.from_bytes(msg[0:3], 'little')
                dg_seq = int.from_bytes(msg[4:7], 'little')
                if dg_type == ACK and dg_seq == seq:
                    state = END_STATE


if __name__ == '__main__':
    sys.exit(main())
