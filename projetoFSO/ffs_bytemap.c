#include <stdio.h>
#include <string.h>
#include <math.h>

#ifndef DISK_DRIVER_H
#include "disk_driver.h"
extern struct disk_operations disk_ops;
#endif

#ifndef FFS_SUPER_H
#include "ffs_super.h"
extern struct super_operations super_ops;
#endif

#ifndef FFS_INODE_H
#include "ffs_inode.h"
#endif

#ifndef FFS_BYTEMAP_H
#include "ffs_bytemap.h"
#endif

/* Global variables */

static struct bmapMData bmapMD[NBR_OF_BMAPS];


/* Helper functions */

int bytemap_print_table(unsigned int bmapIDX) {
  int ercode;
  unsigned char bmap[DISK_BLOCK_SIZE];
  char msg[16];

  int entriesLeft, scan;

  // read in the bytemap
  ercode= disk_ops.read(bmapMD[bmapIDX].diskBlock, bmap);
  if (ercode < 0) return ercode;

  // Scan the bytemap
  switch (bmapIDX) {

    case LRG_INODE_BMAP:
      scan=    bmapMD[bmapIDX].BMstart    /*** TODO ***/;
      entriesLeft=bmapMD[bmapIDX].BMend - scan/*** TODO ***/;
      sprintf(msg, "%s", "large inodes");
      break;

    case SML_INODE_BMAP:
      scan=  bmapMD[bmapIDX].BMstart      /*** TODO ***/;
      entriesLeft=  bmapMD[bmapIDX].BMend - scan/*** TODO ***/;
      sprintf(msg, "%s", "small inodes");
      break;

    case DATA_BMAP:
      scan=    bmapMD[bmapIDX].BMstart    /*** TODO ***/;
      entriesLeft= bmapMD[bmapIDX].BMend -  scan/*** TODO ***/;
      sprintf(msg, "%s", "data blocks");
      break;
  }

 printf("Printing the %s bytemap ----------\n", msg);
  // prints 16 entries per line
  while (entriesLeft) {
    if ( (scan+1)%16 ) printf("%u ", bmap[scan]);
    else printf("%u\n", bmap[scan]);
    entriesLeft--; scan++;
  }
  if ( scan%16 ) printf("\n"); // last NL for general case

  return 0;
}


/* bytemap operations */


/***
   init: initializes in-memory structure that holds bmap addresses
     disk address, in-memory start/end indexes
   CAVEAT: assumes a bmap is 1 disk block				***/

static void bytemap_init() {
  
  bmapMD[LRG_INODE_BMAP].diskBlock=  1   /*** TODO ***/;
  bmapMD[LRG_INODE_BMAP].BMstart=  0     /*** TODO ***/;
  bmapMD[LRG_INODE_BMAP].BMend= ((super_ops.getNinodeblocks() / 2) * LRG_INOS_PER_BLK)        /*** TODO ***/;

  bmapMD[SML_INODE_BMAP].diskBlock= 1    /*** TODO ***/;
  bmapMD[SML_INODE_BMAP].BMstart=  ((super_ops.getNinodeblocks() / 2) * LRG_INOS_PER_BLK)     /*** TODO ***/;
  bmapMD[SML_INODE_BMAP].BMend=    ((super_ops.getNinodeblocks() / 2) * LRG_INOS_PER_BLK) + ((super_ops.getNinodeblocks() / 2) * SML_INOS_PER_BLK)     /*** TODO ***/;

  bmapMD[DATA_BMAP].diskBlock = super_ops.getStartDtBmap()  /*** TODO ***/;
  bmapMD[DATA_BMAP].BMstart=  0  /*** TODO ***/;
  bmapMD[DATA_BMAP].BMend=    super_ops.getNdatablocks()  /*** TODO ***/;

}


/***
   set: set an entry to some value (0/1), UPDATES disk image
     parameters:
       @in: bmapIDX (which bmap to access), entry, value
     errors:
       -EFBIG access outside bmap range
       -EINVAL accessed entry already holds that value
       those resulting from disk operations				***/

static int bytemap_set(unsigned int bmapIDX, unsigned int entry, \
			unsigned int howMany, unsigned char set) {
  int ercode;
  unsigned char bmap[DISK_BLOCK_SIZE];
  unsigned int max, min;

  switch (bmapIDX) {

    case LRG_INODE_BMAP:
      min=  bmapMD[bmapIDX].BMstart;
      max= bmapMD[bmapIDX].BMend/*** TODO ***/;
      break;

    case SML_INODE_BMAP:
      min=  bmapMD[bmapIDX].BMstart;
      max= bmapMD[bmapIDX].BMend;
      break;

    case DATA_BMAP:
      min= bmapMD[bmapIDX].BMstart;
      max= bmapMD[bmapIDX].BMend;
      break;
  }

  if (entry >= max) return -EFBIG;
  if (entry < min) return -EFBIG; // Bug elsewhere and unsigned !!!

  // read in the bytemap
  ercode= disk_ops.read(bmapMD[bmapIDX].diskBlock, bmap);
  if (ercode < 0) return ercode;

/* ---- AULA1, only handles 1 byte allocated*/
//  if (bmap[entry] == set) return -EINVAL;
//  else bmap[entry]= set;
/* ---- We now need to handle howMany bytes contiguously allocated */

  
  /*** TODO: allocate howMany entries ***/
	for(int i = entry; i< entry + howMany; i++){
    if (bmap[i] == set) return -EINVAL;
    else if(i >= max) return -EFBIG;
    else bmap[i]= set;
	}

  // update the bytemap
  ercode= disk_ops.write(bmapMD[bmapIDX].diskBlock, bmap);
  if (ercode < 0) return ercode;
  
  return entry;
}


/***
   getfree: first-fit get "howMany" contiguous free entries
     parameters:
       @in: bmapIDX (which bmap to access), "howMany" contiguous
     returns:
       position of the 1st free in the range
     errors:
       -ENOSPC there are no free entries
       those resulting from disk operations
   TBD: "howMany" ignored, only works for 1 entry			***/

static int bytemap_getfree(unsigned int bmapIDX, unsigned int howMany) {
  int ercode;
  unsigned char bmap[DISK_BLOCK_SIZE];

  int entriesLeft, scan;

  // read in the bytemap
  ercode= disk_ops.read(bmapMD[bmapIDX].diskBlock, bmap);
  if (ercode < 0) return ercode;
  
  // Scan the bytemap

  switch (bmapIDX) {

    case LRG_INODE_BMAP:
      scan= bmapMD[bmapIDX].BMstart;
      entriesLeft= bmapMD[bmapIDX].BMend - scan;
      break;

    case SML_INODE_BMAP:
      scan= bmapMD[bmapIDX].BMstart;
      entriesLeft=bmapMD[bmapIDX].BMend - scan;
      break;

    case DATA_BMAP:
      scan= bmapMD[bmapIDX].BMstart;
      entriesLeft=bmapMD[bmapIDX].BMend - scan;
      break;
  }

  /*** TODO ***
    Again, find howMany contiguous free entries, and return the
    address of the 1st entry in the group
   *** TODO ***/
   int idx = scan;
   int freeEntries = 0;
   int found= 0;
   int address=0;
  
    while (entriesLeft) {
      
    if ( !bmap[idx] ){
      if(!found){
        found=1;
        address=idx;
      }
    	freeEntries++;

      if(freeEntries==howMany)
      return address;

    }else{
      found=0;
      freeEntries=0;
    }
   idx++; 
   entriesLeft--;
   
   }
   return -ENOSPC;
   
}


struct bytemap_operations bmap_ops= {
	.init= bytemap_init,
	.getfree= bytemap_getfree,
	.set= bytemap_set
};
