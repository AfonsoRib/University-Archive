/*     New Caches

       Aluno 1: 59895 Afonso Ribeiro <-- mandatory to fill
       Aluno 2: 60221 Leticia Silva <-- mandatory to fill

       Comment:

       No createAllPossible usamos o seguinta algoritmo:
       Fazemos pesquisa das coordenadas incrementando sempre pelo mesmo
       valor num dos quadrantes a volta do circulo.
       como fazemos em relacao ao centro da cache depois e so mudar
       os sinais para obter o mesmo nos outros quadrantes. Depois,
       tentamos criar as caches e incrementamos os contador causo seja
       bem sucedido.


       The file "newCaches.js" must include, in the first lines,
       an opening comment containing: the name and number of the two students who
       developd the project; indication of which parts of the work
       made and which were not made; possibly alerts to some aspects of the
       implementation that may be less obvious to the teacher.



       0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789

       HTML DOM documentation: https://www.w3schools.com/js/js_htmldom.asp
       Leaflet documentation: https://leafletjs.com/reference.html
*/



/* GLOBAL CONSTANTS */

const MAP_INITIAL_CENTRE =
      [38.661,-9.2044];  // FCT coordinates
const MAP_INITIAL_ZOOM =
      14
const MAP_ID =
      "mapid";
const MAP_ATTRIBUTION =
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> '
      + 'contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
const MAP_URL =
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token='
      + 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
const MAP_ERROR =
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/SNice.svg";
const MAP_LAYERS =
      ["streets-v11", "outdoors-v11", "light-v10", "dark-v10", "satellite-v9",
       "satellite-streets-v11", "navigation-day-v1", "navigation-night-v1"]
//const RESOURCES_DIR =
//	"http//ctp.di.fct.unl.pt/lei/lap/projs/proj2122-3/resources/";
const RESOURCES_DIR =
      "resources/";
const CACHE_KINDS = ["CITO", "Earthcache", "Event",
		     "Letterbox", "Mega", "Multi", "Mystery", "Other",
		     "Traditional", "Virtual", "Webcam", "Wherigo"];
const CACHE_RADIUS =
      161	// meters
const CACHES_FILE_NAME =
      "caches.xml";
const STATUS_ENABLED =
      "E"


/* GLOBAL VARIABLES */

let map = null;



/* USEFUL FUNCTIONS */

// Capitalize the first letter of a string.
function capitalize(str)
{
    return str.length > 0
	? str[0].toUpperCase() + str.slice(1)
	: str;
}

// Distance in km between to pairs of coordinates over the earth's surface.
// https://en.wikipedia.org/wiki/Haversine_formula
function haversine(lat1, lon1, lat2, lon2)
{
    function toRad(deg) { return deg * 3.1415926535898 / 180.0; }
    let dLat = toRad(lat2 - lat1), dLon = toRad (lon2 - lon1);
    let sa = Math.sin(dLat / 2.0), so = Math.sin(dLon / 2.0);
    let a = sa * sa + so * so * Math.cos(toRad(lat1)) * Math.cos(toRad(lat2));
    return 6372.8 * 2.0 * Math.asin (Math.sqrt(a));
}

function loadXMLDoc(filename)
{
    let xhttp = new XMLHttpRequest();
    xhttp.open("GET", filename, false);
    try {
	xhttp.send();
    }
    catch(err) {
	alert("Could not access the geocaching database via AJAX.\n"
	      + "Therefore, no POIs will be visible.\n");
    }
    return xhttp.responseXML;	
}

function getAllValuesByTagName(xml, name)  {
    return xml.getElementsByTagName(name);
}

function getFirstValueByTagName(xml, name)  {
    return getAllValuesByTagName(xml, name)[0].childNodes[0].nodeValue;
}

function kindIsPhysical(kind) {
    return kind === "Traditional";
}


/* POI CLASS + Cache CLASS */

class POI {
    constructor(xml) {
	this.decodeXML(xml);
    }

    decodeXML(xml) {
	if(xml === null)
	    return;
	this.name = getFirstValueByTagName(xml, "name");
	this.latitude = getFirstValueByTagName(xml, "latitude");
	this.longitude = getFirstValueByTagName(xml, "longitude");
    }

    installCircle(radius, color) {
	let pos = [this.latitude, this.longitude];
	let style = {color: color, fillColor: color, weight: 1, fillOpacity: 0.1};
	this.circle = L.circle(pos, radius, style);
	this.circle.bindTooltip(this.name);
	map.add(this.circle);	
    }
}

class Cache extends POI {
    constructor(xml) {
	super(xml);
	this.index = map.getCaches().length;
	this.installMarker();
	this.userCreated = false;

    }

    decodeXML(xml) {
	super.decodeXML(xml);
	this.code = getFirstValueByTagName(xml, "code");
	this.owner = getFirstValueByTagName(xml, "owner");
	this.altitude = getFirstValueByTagName(xml, "altitude");

	this.kind = getFirstValueByTagName(xml, "kind");
	this.size = getFirstValueByTagName(xml, "size");
	this.difficulty = getFirstValueByTagName(xml, "difficulty");
	this.terrain = getFirstValueByTagName(xml, "terrain");


	this.favorites = getFirstValueByTagName(xml, "favorites");
	this.founds = getFirstValueByTagName(xml, "founds");
	this.not_founds = getFirstValueByTagName(xml, "not_founds");
	this.state = getFirstValueByTagName(xml, "state");
	this.county = getFirstValueByTagName(xml, "county");

	this.publish = new Date(getFirstValueByTagName(xml, "publish"));
	this.status = getFirstValueByTagName(xml, "status");
	this.last_log = new Date(getFirstValueByTagName(xml, "last_log"));
    }

    installMarker() {
	let pos = [this.latitude, this.longitude];
	this.marker = L.marker(pos, {icon: map.getIcon(this.kind)});
	this.marker.bindTooltip(this.name);
	let cacheUrl = "https://coord.info/" + this.code;
	let streetViewUrl = "http://maps.google.com/maps?layer=c&cbll="
	    + this.latitude + "," + this.longitude;
	let cacheNum = this.index;
	let form = `<FORM>
     <P>
     <INPUT TYPE="button" ID="cache" VALUE="cache page" ONCLICK="openURL('${cacheUrl}')">
     <INPUT TYPE="button" ID="street" VALUE="StreetView" ONCLICK="openURL('${streetViewUrl}');">
     <INPUT TYPE="button" ID="delCache" VALUE="delete" ONCLICK="removeCache('${cacheNum}')"><br>
     <INPUT TYPE="button" ID="coords" VALUE="change coords" ONCLICK="changeCoords(form,'${cacheNum}')");">
     <INPUT TYPE="text" ID="lat" VALUE="lat" SIZE=10 style="text-align: left">
     <INPUT TYPE="text" ID="lng" VALUE="lng" SIZE=10 style="text-align: left">
        </FORM>`;

	this.marker.bindPopup("I'm the marker of the cache <b>" + this.name +"</b>."
			      + form
			      );
	map.add(this.marker);

    }
}

class Place extends POI {
    constructor(name, pos) {
	super(null);
	this.name = name;
	this.latitude = pos[0];
	this.longitude = pos[1];
	this.installCircle(CACHE_RADIUS, 'black');
    }
}

/* Owner Class */
class Owner {
	constructor(name){
		this.nameOwner = name;
		this.ownCaches = 0;
	}

	howMany(){
		return this.ownCaches;
	}

	ownerName(){
		return this.nameOwner;
	}

	setHowMany(){
		this.ownCaches++;
	}
}


/* Map CLASS */

class Map {
    constructor(center, zoom) {
	this.lmap = L.map(MAP_ID).setView(center, zoom);
	this.addBaseLayers(MAP_LAYERS);
	this.icons = this.loadIcons(RESOURCES_DIR);
	this.caches = [];
	this.owners = [];
	this.addClickHandler(e =>
	    {
		let streetViewUrl = "http://maps.google.com/maps?layer=c&cbll="
		    + e.latlng.lat + "," + e.latlng.lng;
		let form = `<FORM>
      <P>
      <INPUT TYPE="button" ID="street" VALUE="StreetView" ONCLICK="openURL('${streetViewUrl}');">
      <INPUT TYPE="button" ID="createCache" VALUE="new Cache"
 ONCLICK="newCache(${e.latlng.lat}, ${e.latlng.lng},'green')">
      </FORM>`;

		return L.popup()
		.setLatLng(e.latlng)
		    .setContent("You clicked the map at " + e.latlng.toString() + form);
	}
	);
    }

    populate() {
	this.loadCaches(RESOURCES_DIR + CACHES_FILE_NAME);
    }

    showFCT() {
	this.fct = new Place("FCT/UNL", MAP_INITIAL_CENTRE);
    }

    getIcon(kind) {
	return this.icons[kind];
    }

    getCaches() {
	return this.caches;
    }

    getOwners(){
	return this.owners;
    }

    makeMapLayer(name, spec) {
	let urlTemplate = MAP_URL;
	let attr = MAP_ATTRIBUTION;
	let errorTileUrl = MAP_ERROR;
	let layer =
	    L.tileLayer(urlTemplate, {
		minZoom: 6,
		maxZoom: 19,
		errorTileUrl: errorTileUrl,
		id: spec,
		tileSize: 512,
		zoomOffset: -1,
		attribution: attr
	    });
	return layer;
    }

    addBaseLayers(specs) {
	let baseMaps = [];
	for(let i in specs)
	    baseMaps[capitalize(specs[i])] =
	    this.makeMapLayer(specs[i], "mapbox/" + specs[i]);
	baseMaps[capitalize(specs[0])].addTo(this.lmap);
	L.control.scale({maxWidth: 150, metric: true, imperial: false})
	    .setPosition("topleft").addTo(this.lmap);
	L.control.layers(baseMaps, {}).setPosition("topleft").addTo(this.lmap);
	return baseMaps;
    }

    loadIcons(dir) {
	let icons = [];
	let iconOptions = {
	    iconUrl: "??",
	    shadowUrl: "??",
	    iconSize: [16, 16],
	    shadowSize: [16, 16],
	    iconAnchor: [8, 8], // marker's location
	    shadowAnchor: [8, 8],
	    popupAnchor: [0, -6] // offset the determines where the popup should open
	};
	for(let i = 0 ; i < CACHE_KINDS.length ; i++) {
	    iconOptions.iconUrl = dir + CACHE_KINDS[i] + ".png";
	    iconOptions.shadowUrl = dir + "Alive.png";
	    icons[CACHE_KINDS[i]] = L.icon(iconOptions);
	    iconOptions.shadowUrl = dir + "Archived.png";
	    icons[CACHE_KINDS[i] + "_archived"] = L.icon(iconOptions);
	}
	return icons;
    }

    loadCaches(filename) {
	let xmlDoc = loadXMLDoc(filename);
	let xs = getAllValuesByTagName(xmlDoc, "cache"); 
	let caches = [];
	if(xs.length === 0)
	    alert("Empty cache file");
	else {
	    for(let i = 0 ; i < xs.length ; i++)  // Ignore the disables caches
		if( getFirstValueByTagName(xs[i], "status") === STATUS_ENABLED ){
		    let nCache = new Cache(xs[i]);
		    this.caches.push(nCache);
		    if(nCache.kind == 'Traditional')
			nCache.installCircle(CACHE_RADIUS, 'red');
		    (document.getElementById(nCache.kind).innerHTML)++;
		    if(document.getElementById("highestAltitude").innerHTML < nCache.altitude)
			document.getElementById("highestAltitude").innerHTML = nCache.altitude;

		    //profilic owner
		    let ownerOfCache = nCache.owner;
		    let prolificOwner = (document.getElementById('prolificOwner').innerHTML);
		    if(this.getOwners().length == 0){
			this.getOwners().push(new Owner(ownerOfCache));
			this.getOwners()[0].setHowMany();
			document.getElementById('prolificOwner').innerHTML = ownerOfCache;
		    }	
		    else{
			let newOwner = this.findOwner(ownerOfCache);
			if(newOwner == null){
			    newOwner=new Owner(ownerOfCache);
			    this.owners.push(newOwner);
		        }
			newOwner.setHowMany();
			let countCaches = newOwner.howMany();
			let countProlific = this.findOwner(prolificOwner).howMany();
			if(countCaches>countProlific)
			    document.getElementById('prolificOwner').innerHTML = ownerOfCache;
		    }
		    
		}
	}
    }

    findOwner(name){ 
	for(let i = 0 ; i < this.getOwners().length ; i++){
		let nome = this.getOwners()[i].ownerName();
		if( nome === name ){
			let owner = this.getOwners()[i];
			return owner;
		}
	}
	return null;
    }

    add(marker) {
	marker.addTo(map.lmap);
    }

    remove(marker) {
	marker.remove();
    }

    addClickHandler(handler) {
	let m = this.lmap;
	function handler2(e) {
	    return handler(e).openOn(m);
	}
	return this.lmap.on('click', handler2);
    }
}


/* Some FUNCTIONS are conveniently placed here to be directly called from HTML.
   These functions must invoke operations defined in the classes, because
   this program must be written using the object-oriented style.
*/

function onLoad()
{
    map = new Map(MAP_INITIAL_CENTRE, MAP_INITIAL_ZOOM);
    map.showFCT();
    map.populate();
}



function openURL(url) {
    window.open(url, "_blank");
}

function removeCache(cacheNum){
    let cache = map.getCaches()[cacheNum];
    if(cache.userCreated){
	map.remove(cache.circle);
	map.remove(cache.marker);
	(document.getElementById(cache.kind).innerHTML)--;
	cache.status = 'A';
    }else{
	alert("Nao e possivel apagar esta cache");
    }
}

function newCache(lat, lng, circleColor){
    //TODO alterar o getElementByID para algo mais sano
    let txt =
          `<cache>
            <code>UNKNOWN</code>
            <name>UNKNOWN</name>
            <owner>UNKNOWN</owner>
            <latitude>${lat}</latitude>
            <longitude>${lng}</longitude>
            <altitude>-32768</altitude>
            <kind>Traditional</kind>
            <size>UNKNOWN</size>
            <difficulty>1</difficulty>
            <terrain>1</terrain>
            <favorites>0</favorites>
            <founds>0</founds>
            <not_founds>0</not_founds>
            <state>UNKNOWN</state>
            <county>UNKNOWN</county>
            <publish>2000/01/01</publish>
            <status>E</status>
            <last_log>2000/01/01</last_log>
          </cache>`;
    let nCache = new Cache(txt2xml(txt));
    if(isWithinAllowedRegion(nCache.latitude, nCache.longitude)){
	nCache.userCreated = true;
	map.caches.push(nCache);
	nCache.installCircle(CACHE_RADIUS, circleColor);
	(document.getElementById(nCache.kind).innerHTML)++;
    }else{
	map.remove(nCache.marker);
	delete nCache;
	return false;
    }
    return true;
}

function txt2xml(txt) {
    let parser = new DOMParser();
    return parser.parseFromString(txt,"text/xml");
}

function changeCoords(form, cacheNum){
    let cache = map.getCaches()[cacheNum];
    if(cache.kind == "Letterbox" ||
       cache.kind == "Multi" ||
       cache.kind == "Mystery" ||
       (cache.kind == "Traditional" && cache.userCreated)){
	lat = form.lat.value,
	lng = form.lng.value;
	if(isWithinAllowedRegion(lat,lng)){
	    cache.circle.setLatLng(L.latLng(lat,lng));
	    cache.marker.setLatLng(L.latLng(lat,lng));
	    cache.latitude = lat;
	    cache.longitude = lng;
	}
    }else{
	alert("Nao e possivel mudar as coordenadas desta cache");
    }
}

function isWithinAllowedRegion(lat, lng){
    let within400 = false;
    for(let i = 0; i < map.getCaches().length; ++i){
	let otherCache = map.getCaches()[i];
	if(otherCache.status === STATUS_ENABLED && otherCache.kind === "Traditional"){
	    if(haversine(lat,lng,
			 otherCache.latitude, otherCache.longitude) *1000 <= 161)
		return false;
	    else if(within400 ||
		    haversine(lat,lng,
			      otherCache.latitude, otherCache.longitude) *1000 < 400)
		within400 = true;
	}
    }
    return within400;
}

function createNewCacheOnClick(){
    let min = 0.00161; // 161m
    let max = 0.0040; // 400m
    let inc = 0.0001; // 1,11m
    let caches = map.getCaches().slice(0);
    let i = Math.floor(Math.random() * caches.length);
	let cache = caches[i];
    for(let inclat = inc;
	inclat + Number(cache.latitude)
	< Number(cache.latitude)+max;inclat += Number(inc)){
	    for(let inclng = inc;
		inclng + Number(cache.longitude)
		< Number(cache.longitude)+max; inclng += Number(inc)){
		if(newCache(Number(cache.latitude) +
			    inclat,Number(cache.longitude) + inclng,'blue')) return;
		if(newCache(Number(cache.latitude) +
			    inclat,Number(cache.longitude) - inclng,'blue')) return;
		if(newCache(Number(cache.latitude) -
			    inclat,Number(cache.longitude) - inclng,'blue')) return;
		if(newCache(Number(cache.latitude) -
			    inclat,Number(cache.longitude) + inclng,'blue')) return;
	    }
    }
}

function createAllPossible(){
    let max = 0.0036; // 400m
    let inc = 0.0005; // 1,11m * 5 mudar este valor para caches mais precisas ou menos precisas
    let caches = map.getCaches().slice(0);
    let counter = 0;
    for(let i = 0; i < caches.length; ++i){
	let cache = caches[i];
	if(cache.status === STATUS_ENABLED){
	    for(let inclat = inc;
		inclat + Number(cache.latitude) < Number(cache.latitude)+max;inclat += Number(inc)){
		for(let inclng = inc;
		    inclng + Number(cache.longitude)
		    < Number(cache.longitude)+max; inclng += Number(inc)){
		    if(haversine(cache.latitude,cache.longitude,
				 Number(cache.latitude) +
				 inclat,Number(cache.longitude) + inclng) *1000 < 400){
			if (newCache(Number(cache.latitude) +
				    inclat,Number(cache.longitude) + inclng, 'blue')) counter++;
			if (newCache(Number(cache.latitude) +
				    inclat,Number(cache.longitude) - inclng, 'blue')) counter++;
			if (newCache(Number(cache.latitude) -
				    inclat,Number(cache.longitude) - inclng, 'blue')) counter++;
			if (newCache(Number(cache.latitude) -
				    inclat,Number(cache.longitude) + inclng, 'blue')) counter++;
		    }
		}
		
	    }
	}

    }
    	alert("Foram criadas " + counter + "caches!");
}
