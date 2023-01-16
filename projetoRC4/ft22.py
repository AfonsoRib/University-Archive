from socket import *
import select


UPLOAD = 0
DATA = 1
FIN = 2
ACK = 3

BLOCK_SIZE = 2048


def sendUploadDatagram(sock, destinationHostname, destinationPort, filename):
    b = filename.encode()
    bytesToSend = UPLOAD.to_bytes(4, 'little') + b
    sock.sendto(bytesToSend, (destinationHostname, destinationPort))
    print("sending UPLOAD<0> to:", destinationHostname, ",", destinationPort)
    return 0


def sendDataDatagram(sock, destinationHostname, destinationPort, seqNum, data):
    dg_type = DATA
    seq = seqNum
    seq_bytes = seq.to_bytes(4, 'little')
    dg_type_bytes = dg_type.to_bytes(4, 'little')
    bytesToSend = dg_type_bytes+seq_bytes+data
    print("sending DATA<", seqNum, "> to:", destinationHostname, ",", destinationPort)
    sock.sendto(bytesToSend, (destinationHostname, destinationPort))
    return 0


def sendAckDatagram(sock, destinationHostname, destinationPort, seqNum):
    print("sending ACK<", seqNum, "> to:", destinationHostname, ",", destinationPort)
    seq = seqNum
    dg_type = ACK
    dg_type_bytes = dg_type.to_bytes(4, 'little')
    seq_bytes = seq.to_bytes(4, 'little')
    bytesToSend = dg_type_bytes+seq_bytes
    sock.sendto(bytesToSend, (destinationHostname, destinationPort))
    return 0


def sendFinDatagram(sock, destinationHostname, destinationPort, seqNum):
    print("sending FIN<", seqNum, "> to:", destinationHostname, ",", destinationPort)
    seq = seqNum
    dg_type = FIN
    dg_type_bytes = dg_type.to_bytes(4, 'little')
    seq_bytes = seq.to_bytes(4, 'little')
    bytesToSend = dg_type_bytes+seq_bytes
    sock.sendto(bytesToSend, (destinationHostname, destinationPort))
    return 0


def recvDatagram(sock, timeOutInSeconds):
    ready = select.select([sock], [], [], timeOutInSeconds)  # waits for data or timeout
    if ready[0] == []:
       print("TIMEOUT")
       return (-1, '', '', -1)
    else:
        dg, address = sock.recvfrom(BLOCK_SIZE)
        dg_type = int.from_bytes(dg[0:3], 'little')
        dg_seq = int.from_bytes(dg[4:7], 'little')
        print("DATAGRAM ", dg_type,"<",dg_seq,"> received!")
        return (0, dg, address[0], address[1])
