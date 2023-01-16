import sys
from socket import *
from ft22 import *

INITIAL_STATE = 0
TRANSFER_STATE = 1
FINWAIT_STATE = 2
END_STATE = 4

UPLOAD = 0
DATA = 1
FIN = 2
ACK = 3


TIMEOUT = 10


recv_port = int(sys.argv[1])
sender_port = int(sys.argv[2])

def main():
    # execute actions in the edge conducting to the initial state
    sock = socket(AF_INET, SOCK_DGRAM)
    address = ("localhost", recv_port)
    sock.bind(address)

    print("socket created on: ", address)
    f =  None
    state = INITIAL_STATE
    #fileDescriptor = open(fname_in_sender)
    while state != END_STATE:
        if state == INITIAL_STATE:
            seq = 0
            res, msg, senderHost, senderPort = recvDatagram(sock, TIMEOUT)
            if res == 0:
                dg_type = int.from_bytes(msg[0:3], 'little')
                dg_seq = int.from_bytes(msg[4:7], 'little')
                if dg_type == UPLOAD and seq == 0:
                    sendAckDatagram(sock, senderHost, sender_port, seq)# pode perder este
                    seq +=1
                    filename = msg[4:]
                    f = open(filename, "wb")
                    state = TRANSFER_STATE
        if state == TRANSFER_STATE:
            res, msg, _, _ = recvDatagram(sock, TIMEOUT)
            print("My seq is:" , seq)
            if res == 0:
                dg_type = int.from_bytes(msg[0:3], 'little')
                dg_seq = int.from_bytes(msg[4:7], 'little')
                if dg_type == UPLOAD:
                    sendAckDatagram(sock, senderHost, sender_port, 0)
                elif seq - 1 == dg_seq and dg_type == DATA:
                    sendAckDatagram(sock, senderHost, sender_port, seq-1)
                elif dg_type == DATA and dg_seq == seq:
                    sendAckDatagram(sock, senderHost, sender_port, seq)
                    file_bytes = msg[8:]
                    f.write(file_bytes)
                    seq += 1
                elif dg_type == FIN:
                    state = FINWAIT_STATE
                    sendAckDatagram(sock, senderHost, sender_port, seq)
                    f.close()

        if state == FINWAIT_STATE:
            res, msg, _, _ = recvDatagram(sock, TIMEOUT)
            if res == 0:
                dg_type = int.from_bytes(msg[0:3], 'little')
                dg_seq = int.from_bytes(msg[4:7], 'little')
                if dg_type == DATA and dg_seq == seq:
                    sendAckDatagram(sock, senderHost, sender_port, seq)
            else:
                state = END_STATE


if __name__ == '__main__':
    sys.exit(main())
