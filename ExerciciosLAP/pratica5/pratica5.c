#include <stdio.h>

#define BLOCK_SIZE 32

typedef unsigned char Byte;
typedef Byte Block[BLOCK_SIZE]; 

void blockZero(Block b) {
    int i;
    for( i = 0 ; i < BLOCK_SIZE ; i++ )
        b[i] = 0;
}

void blockPrint(Block b) {
    int i;
    for( i = 0 ; i < BLOCK_SIZE ; i++ )
        printf("%02x ", b[i] & 0xFF);
    printf("\n");
}

void blockFill_char_uint_double(Block b, char c, unsigned int i, double d) {
    Byte *pt = b;
    // fazer
    *pt = c;
    pt += 1;
    *(unsigned int*) pt = i;
    pt += sizeof (unsigned int);
    *(double *) pt = d;
}

void blockPrint_char_uint_double(Block b) {
    Byte *pt = b;
    // fazer
    printf("%c\n", *(char *) pt);
    pt = pt + 1;
    printf("%u\n", *(unsigned int*) pt);
    pt = pt + sizeof(unsigned int);
    printf("%e\n", *(double *) pt);
    printf("\n");
}

int main()
{
  Block b;
  blockZero(b); blockPrint(b);
  blockFill_char_uint_double(b, 'a', ~0, 667.6e-22); blockPrint(b);
  blockPrint_char_uint_double(b);
  return 0;
}
