/*
max width = 80 columns
tab = 4 spaces
01234567890123456789012345678901234567890123456789012345678901234567890123456789
*/

/*	Linguagens e Ambientes de Programação - Projeto de 2021/2022

	Eye Beast

	Program written in C/C ++ over the wxWidget platform.
	The wxWidget platform runs on Windows, MacOS and Linux.

	This file is only a starting point fo your work. The entire file can
	be changed, starting with this comment.


 AUTHORS IDENTIFICATION
    Student 1: 59895, Afonso Ribeiro
    Student 2: 60221, Leticia Silva

Comments:

The extra functionality consists on a candy constantly running away from the hero,
it can jump every two spaces through empty spaces, and over inner blocks and monsters.
If the hero manages to catch and eat the candy, then, as a reward, one of the unblocked  
monsters is eliminated.



 Place here the names and numbers of the authors, plus some comments, as
 asked in the listing of the project. Do not deliver an anonymous file with
 unknown authors.
*/

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

/* IDENTIFICATION */

#define APP_NAME	"Eye Beast"

#define AUTHOR1		"Afonso Ribeiro (59895)"
#define AUTHOR2		"Leticia Silva (60221)"

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

/* INCLUDES */

#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#include "wxTiny.h"


/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

/* STRINGS */

#define MAX_STRING	256
#define MAX_LINE	1024

typedef char String[MAX_STRING];
typedef char Line[MAX_LINE];


/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

/* IMAGES */

/******************************************************************************
 * The images are specified in the XPM format [http://en.wikipedia.org/wiki/X_PixMap]
 * After created, each image is represented by an integer in the wxTiny library.
 ******************************************************************************/

typedef int Image;

static Image emptyImg, heroImg, chaserImg, blockImg, boundaryImg, invalidImg, candyImg;

/* XPM */
static tyImage empty_xpm = {
"16 16 2 1",
"   c None",
".  c #FFFFFF",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................"};

/* XPM */
static tyImage hero_xpm = {
"16 16 3 1",
"   c None",
".  c #FFFFFF",
"+  c #000000",
"................",
"...+++...+++....",
"..+...+.+...+...",
".+.....+.....+..",
".+...+++++...+..",
".+...+++++...+..",
".+...+++++...+..",
".+.....+.....+..",
"..+...+.+...+...",
"...+++...+++....",
"................",
".....+++++......",
"....+.....+.....",
"................",
"................",
"................"};


/* XPM */
static tyImage chaser_xpm = {
"16 16 3 1",
"   c None",
".  c #FFFFFF",
"+  c #000000",
"................",
"...+++...+++....",
"..++.++.+.+++...",
".+..+++++++..+..",
".+...+++++...+..",
".+...+++++...+..",
".+...+++++...+..",
"..+...+.+...+...",
"...+++...+++....",
"................",
"................",
"....+++++++.....",
"................",
"................",
"................",
"................"};

/* XPM */
static tyImage block_xpm = {
"16 16 3 1",
"   c None",
".  c #000000",
"+  c #FFFFFF",
"................",
"................",
"..............+.",
"....+.+.+.+.+...",
"...+.+.+.+.+..+.",
"....+.+.+.+.+...",
"...+.+.+.+.+..+.",
"....+.+.+.+.+...",
"...+.+.+.+.+..+.",
"....+.+.+.+.+...",
"...+.+.+.+.+..+.",
"....+.+.+.+.+...",
"...+.+.+.+.+..+.",
"................",
"..+.+.+.+.+.+.+.",
"................"};

/* XPM */
static tyImage boundary_xpm = {
"16 16 3 1",
"   c None",
".  c #000000",
"+  c #FFFFFF",
"................",
"................",
"..............+.",
"....+.+.+.+.+...",
"...+.+.+.+.+..+.",
"....+.+.+.+.+...",
"...+.+.+.+.+..+.",
"....+.+.+.+.+...",
"...+.+.+.+.+..+.",
"....+.+.+.+.+...",
"...+.+.+.+.+..+.",
"....+.+.+.+.+...",
"...+.+.+.+.+..+.",
"................",
"..+.+.+.+.+.+.+.",
"................"};

/* XPM */
static tyImage invalid_xpm = {
"16 16 2 1",
"   c None",
".  c #FFFFFF",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................",
"................"};

/* XPM */
static tyImage candy_xpm = {
"16 16 4 1",
"   c None",
".  c #FFFFFF",
"+  c #e8b5e0",
"-  c #d9239c",
"................",
"................",
"................",
"................",
".--..........--.",
".-+-.------.-+-.",
".-+---++++---+-.",
".-++-++++++-++-.",
".-++-++++++-++-.",
".-++-++++++-++-.",
".-+---++++---+-.",
".-+-.------.-+-.",
".--..........--.",
"................",
"................",
"................"};


/******************************************************************************
 * imagesCreate - Converts all the XPM images to the type Image
 ******************************************************************************/
void imagesCreate(void)
{
	emptyImg = tyCreateImage(empty_xpm);
	heroImg = tyCreateImage(hero_xpm);
	chaserImg = tyCreateImage(chaser_xpm);
	blockImg = tyCreateImage(block_xpm);
	boundaryImg = tyCreateImage(boundary_xpm);
	invalidImg = tyCreateImage(invalid_xpm);
	candyImg = tyCreateImage(candy_xpm);
}


/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

/* ACTORS */

/******************************************************************************
 * Constants, types and functions for all kinds of actors
 ******************************************************************************/

#define ACTOR_PIXELS_X	16
#define ACTOR_PIXELS_Y	16

typedef enum {
	EMPTY, HERO, CHASER, BLOCK, BOUNDARY, CANDY
} ActorKind;

typedef struct {
// specific fields can go here, but probably none will be needed
} Hero;

typedef struct {
// specific fields can go here, but probably none will be needed
} Chaser;

typedef struct {
// specific fields can go here, but probably none will be needed
} Block;

typedef struct {
// specific fields can go here, but probably none will be needed
} Boundary;

typedef struct {
// specific fields can go here, but probably none will be needed
} Candy;


typedef struct {
// factored common fields
    ActorKind kind;
 	int x, y;
	Image image;
    union {
// specific fields for each kind
        Hero hero;
        Chaser chaser;
        Block block;
        Boundary boundary;
	Candy candy;
    } u;
} ActorStruct, *Actor;

#define WORLD_SIZE_X	31
#define WORLD_SIZE_Y	18
#define N_MONSTERS		5

typedef struct {
  Actor world[WORLD_SIZE_X][WORLD_SIZE_Y];
  Actor hero;
  Actor monsters[N_MONSTERS];
  Actor candy;
  int second;
} GameStruct, *Game;

bool isMonsterBlocked(Game g, Actor a);
/******************************************************************************
 * actorImage - Get the screen image corresponding to some kind of actor
 ******************************************************************************/
Image actorImage(ActorKind kind)
{
	switch( kind ) {
		case EMPTY:		return emptyImg;
		case HERO:		return heroImg;
		case CHASER:		return chaserImg;
		case BLOCK:		return blockImg;
		case BOUNDARY:		return boundaryImg;
		case CANDY:             return candyImg;
		default:		return invalidImg;
	}
}

/******************************************************************************
 * cellSet - Useful function to update one cell in the matrix and in the screen
 ******************************************************************************/
void cellSet(Game g, Actor a, int x, int y, Image img)
{
	tyDrawImage(img, x * ACTOR_PIXELS_X, y * ACTOR_PIXELS_Y);
	g->world[x][y] = a;	
}

/******************************************************************************
 * cellIsEmpty - Check in the matrix if a cell is empty (if contains NULL)
 ******************************************************************************/
bool cellIsEmpty(Game g, int x, int y)
{
	return g->world[x][y] == NULL;
}

/******************************************************************************
 * actorShow - Install an actor in the matrix and in the screen
 ******************************************************************************/
void actorShow(Game g, Actor a)
{
	cellSet(g, a, a->x, a->y, a->image);
}

/******************************************************************************
 * actorHide - Removes an actor from the matrix and from the screen
 ******************************************************************************/
void actorHide(Game g, Actor a)
{
	cellSet(g, NULL, a->x, a->y, emptyImg);
}

/******************************************************************************
 * actorMove - Move an actor to a new position
 * pre: the new position is empty
 ******************************************************************************/
void actorMove(Game g, Actor a, int nx, int ny)
{
	actorHide(g, a);
	a->x = nx;
	a->y = ny;
	actorShow(g, a);
}

/******************************************************************************
 * actorNew - Creates a new actor and installs it in the matrix and the screen
 ******************************************************************************/
Actor actorNew(Game g, ActorKind kind, int x, int y)
{
	Actor a = malloc(sizeof(ActorStruct));
	a->kind = kind;
	a->x = x;
	a->y = y;
	a->image = actorImage(kind);
	actorShow(g, a);
	return a;
}

/******************************************************************************
 * heroAnimation - The hero moves using the cursor keys
 ******************************************************************************/

// check if a given actor is a power-up
bool isPowerUp(Actor a){
  bool ret = false;
  if(a->kind == CANDY)
    ret = true;
  return ret;
}


// check if a given actor is movable by the player
bool isMovable(Actor a){
  bool ret = false;
  if(a->kind == BLOCK)
    ret = true;
  return ret;
}

// executa os comandos para um dado power-up
void getPowerUp(Game g, Actor a){
  switch (a->kind){
  case CANDY:
    tyAlertDialog("Great","You catched the candy!!!");
     actorHide(g, g->candy);
     bool deleted = false;
     for(int i = 0; i<N_MONSTERS && !deleted ; ++i){
       if(!isMonsterBlocked(g,g->monsters[i])){
	 actorHide(g, g->monsters[i]);
	 g->monsters[i] = NULL;
	 deleted = true;
       }
     }
     g->candy = NULL;
  default:break;
  }
}


void heroAnimation(Game g, Actor a)
{
  int dx = tyKeyDeltaX(), dy = tyKeyDeltaY();
  int nx = a->x + dx, ny = a->y + dy;

  if (cellIsEmpty(g, nx, ny))
    actorMove(g, a, nx, ny);

  // o heroi apanha um powerUp
  else if (isPowerUp(g->world[nx][ny])) {
    getPowerUp(g, g->world[nx][ny]);
      actorMove(g, a, nx, ny);
  }  else if (isMovable(g->world[nx][ny])) {
    //calcula o fim da linha
    int lastX, lastY;
    for(lastX = nx, lastY = ny; !cellIsEmpty(g,lastX,lastY)
	  && isMovable(g->world[lastX][lastY]); lastX+=dx,lastY+=dy);

    //move o primeiro bloco para o fim da linha
    if(cellIsEmpty(g, lastX, lastY)){
      Actor block = g->world[nx][ny];
      actorMove(g,block, lastX, lastY);
      actorMove(g, a, nx, ny);
    }
  }
}


/******************************************************************************
 * chaserAnimation - The chaser moves trying to catch the hero
 ******************************************************************************/

void chaserAnimation(Game g, Actor a){
  int dx=0, dy=0;
  int chaserx = a->x, chasery = a->y;
  int herox = g->hero->x, heroy=g->hero->y;
  int xdistance = herox - a->x;
  int ydistance = heroy - a->y;

  //calculate x direction
  if( xdistance < 0)
    dx= -1;
  else if( xdistance > 0)
    dx= 1;
  
  //calculate y direction
  if( ydistance < 0)
    dy= -1;
  else if( ydistance > 0 )
    dy= 1;

  int nx = chaserx+dx, ny=chasery+dy;
  if(!cellIsEmpty(g,nx,ny) && nx == g->hero->x && ny == g->hero->y ){
    tyAlertDialog("Game Over", "Dead Meat!!!");
    tyQuit();
  }else if(cellIsEmpty(g,nx,ny))
      actorMove(g,a,nx,ny);
  else if(cellIsEmpty(g,nx+1,ny) && dx == 0)
    actorMove(g,a,nx+1,ny);
  else if(cellIsEmpty(g,nx,ny+1) && dy == 0)
    actorMove(g,a,nx,ny+1);
  else{
      if(cellIsEmpty(g,nx,chasery))
	actorMove(g,a,nx,chasery);
      if(cellIsEmpty(g,chaserx,ny))
	actorMove(g,a,chaserx,ny);
  }
}

/******************************************************************************
 * candyAnimation - The candy moves two spaces away from the hero
 ******************************************************************************/

void candyAnimation(Game g, Actor a){
  int dx=0, dy=0;
  int candyX = a->x; int candyY = a->y;
  int herox = g->hero->x, heroy=g->hero->y;
  int xdistance = herox - a->x;
  int ydistance = heroy - a->y;

  //calculate x direction
  if( xdistance < 0)
    dx= 2;
  else if( xdistance > 0)
    dx= -2;
  
  //calculate y direction
  if( ydistance < 0)
    dy= 2;
  else if( ydistance > 0 )
    dy= -2;

  int nx = candyX + dx, ny = candyY + dy;

  if (nx > 0 && ny >0 && nx < WORLD_SIZE_X && ny < WORLD_SIZE_Y){   //evitar que saia do mapa
    if(cellIsEmpty(g,nx,ny) )
      actorMove(g,a,nx,ny);
    else if(cellIsEmpty(g,nx+2,ny) && dx == 0)
      actorMove(g,a,nx+2,ny);
    else if(cellIsEmpty(g,nx,ny+2) && dy == 0)
      actorMove(g,a,nx,ny+2);
    else{
      if(cellIsEmpty(g,nx,candyY))
	actorMove(g,a,nx,candyY);
      if(cellIsEmpty(g,candyX,ny))
	actorMove(g,a,candyX,ny);
    }
  }
}


/******************************************************************************
 * actorAnimation - The actor behaves according to its kind
 ******************************************************************************/
void actorAnimation(Game g, Actor a)
{
	switch( a->kind ) {
		case HERO: heroAnimation(g, a); break;
		case CHASER: chaserAnimation(g, a); break;
		case CANDY: candyAnimation(g, a); break;
		default: break;
	}
}

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

/* GAME */

/******************************************************************************
 * gameClearWorld - Clears the matrix and the screen
 ******************************************************************************/
void gameClearWorld(Game g)
{
    for(int y = 0; y < WORLD_SIZE_Y ; y++)
        for(int x = 0; x < WORLD_SIZE_X ; x++ )
			cellSet(g, NULL, x, y, emptyImg);
}

/******************************************************************************
* isFarAway - Verifies if the candy is 2 spaces far from the hero
*******************************************************************************/
bool isFarAway (Game g, int rx, int ry){
  return tyDistance( g->hero->x, g->hero->y, rx, ry) > 2;
}

/******************************************************************************
 * gameInstallCandy - Install the candy
 ******************************************************************************/
void gameInstallCandy (Game g){
  int rx,ry;
  do {
    rx = tyRand(WORLD_SIZE_X);
    ry = tyRand(WORLD_SIZE_Y);
  }    while(!cellIsEmpty(g,rx,ry) || isFarAway(g, rx, ry) == false );
  g->candy = actorNew(g, CANDY, rx, ry);
}


/******************************************************************************
 * gameInstallBoundaries - Install the boundary blocks
 ******************************************************************************/
void gameInstallBoundaries(Game g)
{
     for(int y = 0; y < WORLD_SIZE_Y ; y++)
        for(int x = 0; x < WORLD_SIZE_X ; x++)
            if( x == 0 || x == WORLD_SIZE_X - 1
            || y == 0 || y == WORLD_SIZE_Y - 1 ) {
               actorNew(g, BOUNDARY, x, y);
             }
}

/******************************************************************************
 * gameInstallBlocks - Install the movable blocks
 ******************************************************************************/
void gameInstallBlocks(Game g)
{ 
  for(int i = 0; i < 110; ++i){
    int rx,ry;
    do{
      rx = tyRand(WORLD_SIZE_X);
      ry = tyRand(WORLD_SIZE_Y);
    } while(!cellIsEmpty(g,rx,ry));
    actorNew(g, BLOCK, rx , ry);
  }
}

/******************************************************************************
 * gameInstallMonsters - Install the monsters
 ******************************************************************************/
void gameInstallMonsters(Game g)
{ 
	for(int i = 0; i < N_MONSTERS; ++i){
	  int rx,ry;
	    do {
	      rx = tyRand(WORLD_SIZE_X);
	      ry = tyRand(WORLD_SIZE_Y);
	    }    while(!cellIsEmpty(g,rx,ry)); 
   	    g->monsters[i] = actorNew(g, CHASER, rx , ry);
   	}

}

/* isFourAwayFromMonsters - Verifies if the monsters installed are four units away from 
the hero */
bool isFourAwayFromMonsters(Game g, int rx, int ry){
	for(int i = 0; i< N_MONSTERS; i++){
	    if(tyDistance( g->monsters[i]->x, g->monsters[i]->y, rx, ry) <= 4)
	    	return false;
	}
	return true;
}

/******************************************************************************
 * gameInstallHero - Install the hero
 ******************************************************************************/
void gameInstallHero(Game g)
{
  int rx,ry;
  do {
    rx = tyRand(WORLD_SIZE_X);
    ry = tyRand(WORLD_SIZE_Y);
  }    while(!cellIsEmpty(g,rx,ry) || isFourAwayFromMonsters(g, rx, ry) == false );
  g->hero = actorNew(g, HERO, rx, ry);
}

/******************************************************************************
 * gameInit - Initialize the matrix and the screen
 ******************************************************************************/
Game gameInit(Game g)
{
  if (g == NULL)
    g = malloc(sizeof(GameStruct));
  imagesCreate();
  g->second = 0;
  gameClearWorld(g);
  gameInstallBoundaries(g);
  gameInstallBlocks(g);
  gameInstallMonsters(g);
  gameInstallHero(g);
  gameInstallCandy(g);
  return g;
}

/******************************************************************************
 * gameRedraw - Redraws the entire scenario. This function is called by
 * tyHandleRedraw in very specific circumstances. It should not be used anywhere
 * else because you don't want to be constantly redrawing the whole scenario.
 ******************************************************************************/
void gameRedraw(Game g)
{
	for(int y = 0; y < WORLD_SIZE_Y; y++)
		for(int x = 0; x < WORLD_SIZE_X; x++) {
			Actor a = g->world[x][y];
			if( !cellIsEmpty(g, x, y) )
				actorShow(g, a);
		}
}


bool isKillable(Actor a){
  bool ret= false;
  if(a->kind == HERO)
    ret = true;
  return ret;
}

/* isMonsterBlocked - Verifies if a monster is blocked */
bool isMonsterBlocked(Game g, Actor a){
  int chaserx = a->x,
      chasery = a->y;
  for(int x = -1; x <= 1; ++x){
    for(int y =-1; y <= 1; ++y){
      if(cellIsEmpty(g, chaserx+x, chasery+y)
	 || isKillable(g->world[chaserx+x][chasery+y])/*isplayer*/)
	return false;
    }
  }
  return true;
}

/* hasEnded - Verifies if the game ended */
bool hasEnded(Game g){
  for(int i = 0; i < N_MONSTERS; ++i){
    if(g->monsters[i] !=NULL)
      if(!isMonsterBlocked(g,g->monsters[i]))
	return false;
  }
  return true;
}

/******************************************************************************
 * gameAnimation - Sends animation events to all the animated actors
 * This function is called every tenth of a second (more or less...)
******************************************************************************/
void gameAnimation(Game g) {
  actorAnimation(g, g->hero);
  int currentSec = tySeconds();
  if(g->second != currentSec){
    for(int i = 0 ; i < N_MONSTERS ; i++){
      if(g->monsters[i] != NULL)
	actorAnimation(g, g->monsters[i]);
    }

    if(g->candy != NULL)
      actorAnimation(g, g->candy);}

  g->second = currentSec;
}


/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

/* STATUS BAR */

/******************************************************************************
 * The function status populates the status bar, at the bottom of the window
 ******************************************************************************/

#define STATUS_ITEMS	5

void status(void)
{
	String s;
	sprintf(s, "TIME = %d seg.", tySeconds());
	tySetStatusText(4, s);
}



/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

/* MENU COMMANDS */

/******************************************************************************
 * Each function handles one menu command
 ******************************************************************************/

void comandAbout(void)
{
	tyAlertDialog("About", "%s\n%s\n\n%s\n%s",
		APP_NAME,
		"(Reimplementation of the original game of Chuck Shotton)",
		AUTHOR1,
		AUTHOR2);


}

void comandRestart(void)
{
	tyHandleStart();
}

void comandFinish(void)
{
	tyAlertDialog("Quit", "See you later!");
	tyQuit();
}


/******************************************************************************/
/******************************************************************************/
/******************************************************************************/


/* FUNCTIONS REQUIRED BY THE FRAMEWORK wxTiny */

/******************************************************************************
 * Section with all the "root" "functions required by the wxTiny support system. 
 * 
 * There is no function "main" in a wxTiny program, as the main function is
 * hidden within the wxTiny library. The most important thing you need to know
 * is that the function "tyHandleStart" is called when the program begins,
 * and that function "tyHandleTime" is called periodically 10 times per second,
 * to make the program progress. In some sense, both this function make a kind
 * of main function.
 * 
 * More information about the wxTiny functions in the file "wxTiny.h".
 ******************************************************************************/

static Game game = NULL;  // defined here to be available to the "root" functions

/****************************************************************************** 
 * tyAppName - specify the name of the app
 ******************************************************************************/
tyStr tyAppName(void)
{
	return APP_NAME;
}

/****************************************************************************** 
 * tyWidth - specify the width of the window
 ******************************************************************************/
int tyWidth(void)
{
	return WORLD_SIZE_X * ACTOR_PIXELS_X;
}

/****************************************************************************** 
 * tyHeight - specify the height of the window
 ******************************************************************************/
int tyHeight(void)
{
	return WORLD_SIZE_Y * ACTOR_PIXELS_Y;
}

/****************************************************************************** 
 * tyStatusItems - specify the number of slots available in the status bar
 ******************************************************************************/
int tyStatusItems(void)
{
	return STATUS_ITEMS;
}

/****************************************************************************** 
 * tyMenus - specify the menus
 ******************************************************************************/
tyStr tyMenus(void)
{
	return ":+Menu"
			":&About\tCtrl-A"
			":-"
			":&Restart\tCtrl-R"
			":-"
			":&Quit\tCtrl-Q";
}

/****************************************************************************** 
 * tyHandleMenuCommand - Handles the menu commands
 ******************************************************************************/
void tyHandleMenuCommand(tyStr command)
{
	if( strcmp(command, "About") == 0 )
		comandAbout();
	else if( strcmp(command, "Restart") == 0 )
		comandRestart();
	else if( strcmp(command, "Quit") == 0 )
		comandFinish();
	else
		tyFatalError("Unknown command: \"%s\"", command);
}

/****************************************************************************** 
 * tyHandleRedraw - redraws the window
 *
 * Automatically called  in rare situations, for example if the game window is
 * minimized and then maximized
 ******************************************************************************/
void tyHandleRedraw(void)
{
	gameRedraw(game);
}

/****************************************************************************** 
 * tyHandleTime - Called periodically, around 10 time per second
 * 
 * This function does the following: animate the actors; update the status bar;
 *    possibly more things
 ******************************************************************************/
void tyHandleTime(void)
{
	status();
	gameAnimation(game);
	if(hasEnded(game)){
	  tyAlertDialog("Game Over", "You Win!");
	  tyQuit();
	}
}

/****************************************************************************** 
 * tyHandleStart - Program initialization
 ******************************************************************************/
void tyHandleStart(void)
{
	tySecondsSetZero();
	tySetSpeed(5);
	game = gameInit(game);
}

