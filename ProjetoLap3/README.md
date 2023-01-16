1. On the map, draw many circles with a radius of 161 meters (there is a constant already defined):

   - All caches with a known physical location obtained from the original file must be drawn with a red circle around them;
   - All caches with a physical location entered manually by the user must be drawn with a green circle around them; **(Fazer primeiro o 2. e 3.)**
   - All caches with a physical location assigned automatically by the application must be drawn with a blue circle around them; **(fazer primeiro o 5. e o 6.)**
   - All caches without known physical location do not have a circle drawn around; 

2. On the map, clicking on a cache icon makes a balloon appear with all the information available about that cache. In this balloon, four links (or buttons) also appear:

   1.  the first one opens the cache page on the geocaching.com site (for example, https://coord.info/GC2J445);
   2.  the second opens Google Maps in Street View mode at the cache coordinates (for example, http://maps.google.com/maps?layer=c&cbll=38.659917, -9.202417);
   3.  the third one allows the user to set or change the coordinates of a cache with secret physical location (applies to Multicache, Mystery, Letterbox), and also allows changing the coordinates of a Traditional cache that has been created manually or automatically (when the coordinates of a cache change, the placement of the icon in the screen changes accordingly.)
   4.  the fourth allows the user to delete a Traditional cache that has been created manually or automatically. 

3. On the map, clicking outside any cache icon causes a balloon to appear indicating the coordinates of the clicked position. There are also two links (or buttons) in this balloon:

   1. the first opens Google Maps in Street View mode at the indicated coordinates;
   2. the second allows the user to create a Traditional cache at the indicated coordinates, as long as the system invariants are respected (in case of invariant violation, present an alert box with an error message). 

4. On the left control panel there is a small section with some statistics about the caches currently displayed: for example, the number of caches of each kind; the most prolific owner, the cache with highest altitude (note that the special altitude "-32768" means "unknown altitude"), etc. Do not forget to update the statistics when a Traditional cache is created or deleted.

5. On the left control panel there is a button to automatically create a new Traditional cache at a valid location. The time allowance for searching for a valid position is 1 second.

6. On the left control panel there is a button to automatically create as many Traditional cache as possible, all with valid locations. The time allowance for each cache is 1 second. At the end, an alert box must tell how many caches have been successfully created. The graphical animation of the caches creation algorithm will be valued. 