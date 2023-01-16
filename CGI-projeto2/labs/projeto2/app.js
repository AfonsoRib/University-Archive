import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { perspective,ortho, lookAt, translate, mult, rotateY,flatten, rotateX, rotateZ, inverse,mat4,vec4,vec3 } from "../../libs/MV.js";
import {modelView, loadMatrix, multRotationY, multRotationZ, multRotationX, multScale, multTranslation, pushMatrix, popMatrix } from "../../libs/stack.js";
import {GUI} from "../../libs/dat.gui.module.js"
import * as SPHERE from '../../libs/objects/sphere.js';
import * as CUBE from '../../libs/objects/cube.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as BUNNY from '../../libs/objects/bunny.js';
import * as TORUS from '../../libs/objects/torus.js';

/** @type WebGLRenderingContext */
let gl;

let time = 0;           // Global simulation time in days
let speed = 1/60.0;     // Speed (how many days added to time on each render pass
let mode;               // Drawing mode (gl.LINES or gl.TRIANGLES)
let animation = true;   // Animation is running


let height = 0;
let tilt = 0;
let heliMovement = 0; // angle for the helicopter position along the scene
let bladeRot = 0; // angle for blade rotation
let goForward = false;
let liftOff = false;
let descend= false;
let heliCamera = false
let boxes = [];

const VP_DISTANCE = 80;
const MAX_HEIGHT = 40;
const MAX_TILT = 30;
const RADIUS = 40
const HELI_TURNS_PER_SECOND = 1/8
const BLADES_TURNS_PER_SECOND = 3
const GRAVITY = 9.8*2
const INCLINATION_FACTOR= 20 * speed
const ASCEND_FACTOR = 10*speed

let heliModelForCamera = mat4()
let heliModelForBoxes= mat4()
let heliPosition = [RADIUS,0,0];


//floor properties
let floorProp={
    height: 1,
    widthLength:150
}

//cube properties
let cubeProp = {
    scale: 2
}

//helicopter properties
let heliProp={
    mainBladeSize: 5,
    tailBladeSize: 1,
    scale: 2,
    body: {
	height:2.5,
	width:2.5,
	length:5
    },

    landingBar:{
	width:0.25,
	rotation: 90
    },

    bodyTail:{
	width:1

    },
    rotor: {
	height: 1
    }
}

//the value needed to put the origin of the helicopter on the landing bar plane
let heliOriginToLegPlane = heliProp.body.height/2 +
                             heliProp.body.height/4+
                             heliProp.landingBar.width/2

//angles for axionometric view
let ax = {
    gamma: 30,
    theta: 30
}




//viewModel
let look = mult(mult(lookAt( [0,0,VP_DISTANCE], [0,0,0], [0,1,0]), rotateX(ax.gamma)), rotateY(ax.theta))

//stores the function with the current view we want. Axionometric by default
let currentView = function(){look = mult(mult(lookAt( [0,0,VP_DISTANCE], [0,0,0], [0,1,0]), rotateX(ax.gamma)), rotateY(ax.theta))}



function setup(shaders)
{
    let canvas = document.getElementById("gl-canvas");
    let aspect = canvas.width / canvas.height;

    const gui = new GUI();
    const axionometricFolder = gui.addFolder('Axionometric')
    axionometricFolder.add(ax, 'gamma', 0, 90)
    axionometricFolder.add(ax,'theta', 0, 360)
    axionometricFolder.open()
    const helicopterFolder = gui.addFolder('Helicopter')
    helicopterFolder.add(heliProp, 'mainBladeSize', 0, 20)
    helicopterFolder.add(heliProp, 'tailBladeSize', 0, 20)
    helicopterFolder.add(heliProp, 'scale', 0.5, 20)
    helicopterFolder.open()
    const boxFolder = gui.addFolder('Box')
    boxFolder.add(cubeProp, "scale", 0,20)
    boxFolder.open()
    
    

    gl = setupWebGL(canvas);
    

    let program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

    let mProjection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-3*VP_DISTANCE,6*VP_DISTANCE); 


    mode = gl.TRIANGLES; 

    resize_canvas();
    window.addEventListener("resize", resize_canvas);

    document.onkeydown = function(event) {
        switch(event.key) {
	case 'ArrowLeft':
	    goForward = true
            break;
	case 'ArrowUp':
	    liftOff=true;
            break;
	case 'ArrowDown':
	    descend=true;
            break;
        case 'd':
            liftOff = false;
	    goForward = false;
            break;
        case 'w':
            mode = gl.LINES; 
            break;
        case 's':
            mode = gl.TRIANGLES;
            break;
        case 'p':
            animation = !animation;
            break;
        case '+':
            if(animation) speed *= 1.1;
            break;
        case '-':
            if(animation) speed /= 1.1;
            break;
	case '5':
	    heliCamera = true;
	    mProjection = perspective(VP_DISTANCE, aspect, 0.01,3*VP_DISTANCE);
	    currentView = function(){
		look = mult(lookAt([-heliProp.body.length/2-0.5,0,0],[-1-heliProp.body.length/2,0,0],[0,1,0]),
			    inverse(heliModelForCamera))
	    }
	    break
	case '4':
	    currentView = function(){
		look = lookAt([VP_DISTANCE,0,0], [0,0,0], [0,1,0])
		
	    }
	    heliCamera=false
	    break
	case '3':
	    currentView=function(){
	    look = lookAt([0,VP_DISTANCE,0], [0,0,0], [0,0,-1]);}
	    heliCamera=false
	    break
	case '2':
	    currentView= function(){
		look = lookAt([0,0,VP_DISTANCE], [0,0,0], [0,1,0])
	    }
	    heliCamera=false
	    break
	case '1':
	    currentView= function(){
		look = mult(mult(lookAt( [0,0,VP_DISTANCE], [0,0,0], [0,1,0]), rotateX(ax.gamma)), rotateY(ax.theta))
	    }
	    heliCamera=false
	    break;
	case ' ':
	    boxes.push({
		position: [0,0,0],
		height: height,
		downVelocity: 0,
		airResistance: 0,
		velocity: RADIUS * (Math.PI*HELI_TURNS_PER_SECOND) * (tilt/maxTilt()),
		scale: cubeProp.scale,
		time: time,
		model:  heliModelForBoxes
	    });
	    console.log("dropped")
	    break;
        }
	    
    }



    document.onkeyup = function(event) {
	switch(event.key) {
	case 'ArrowLeft':
	    goForward = false
            break;
	case 'ArrowUp':
	    liftOff=false;
            break;
	case 'ArrowDown':
	    descend=false;
            break;
	}
	

    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    SPHERE.init(gl);
    CUBE.init(gl);
    CYLINDER.init(gl);
    BUNNY.init(gl);
    TORUS.init(gl)
    gl.enable(gl.DEPTH_TEST);   // Enables Z-buffer depth test
    
    window.requestAnimationFrame(render);


    function resize_canvas(event)
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        aspect = canvas.width / canvas.height;

        gl.viewport(0,0,canvas.width, canvas.height);
	if(!heliCamera){
	    mProjection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-3*VP_DISTANCE,6*VP_DISTANCE);
	}
    }

    function uploadModelView()
    {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(modelView()));
    }


    function render()
    {
        if(animation) time += speed;
        window.requestAnimationFrame(render);


        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(program);
        
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mProjection"), false, flatten(mProjection));

	currentView()
    
        loadMatrix(look);

	if(goForward)
	    tilt += tilt < maxTilt() ? INCLINATION_FACTOR : 0
	else{
	    tilt -= tilt > 0  ? INCLINATION_FACTOR : 0
	    if(tilt < 0)
		tilt = 0
	}
	
	if(liftOff)
	    height +=  height < MAX_HEIGHT ? ASCEND_FACTOR : 0
	if(descend){
	    height -= height > 0  ? ASCEND_FACTOR : 0
	    if(height < 0) height = 0;
	    if(tilt > maxTilt()){
		tilt = maxTilt()
	    }
	    
	}



	if(!heliCamera){
	    mProjection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-3*VP_DISTANCE,6*VP_DISTANCE); 

	}


	heliMovement += getAngularVelocity() 	//calculate helicopter movement
	bladeRot += getBladeAngle()

	

	
	scene();
	
    }

    function maxTilt(){
	let h= heliProp.body.length/2 * heliProp.scale;
	return height < Math.PI/2*heliProp.scale ? Math.asin(height/h) * (180/Math.PI) : MAX_TILT
    }

    function getAngularVelocity(){
	return (360* HELI_TURNS_PER_SECOND * (tilt/MAX_TILT))*speed
    }

    function getBladeAngle(){
	return (360* BLADES_TURNS_PER_SECOND * ( height/MAX_HEIGHT))*speed
    }

    
    function changeColor(color){
	const uColor = gl.getUniformLocation(program, "color")
	switch(color){
	case "grass":
	    gl.uniform3fv(uColor, [0.0,0.6,0.3])
	    break;
	case "templeWhite":
	    gl.uniform3fv(uColor, [0.8,0.8,0.8])
	    break;
	case "templeBlue":
	    gl.uniform3fv(uColor, [0,0.7,0.7])
	    break;
	case "columnWhite":
	    gl.uniform3fv(uColor, [0.75,0.75,0.75])
	    break;
	case "metal":
	    gl.uniform3fv(uColor, [0.5,0.5,0.5])
	    break;
	case "blue":
	    gl.uniform3fv(uColor, [0,0,1])
	    break;
	case "white":
	    gl.uniform3fv(uColor, [1,1,1])
	    break;
	case "Yellow":
	    gl.uniform3fv(uColor, [1,1,0.5])
	    break;
	case "wood":
	    gl.uniform3fv(uColor, [0.6,0.4,0.0])
	    break;
	case "leather":
	    gl.uniform3fv(uColor, [0.9,0.9,0.6])
	    break;

	case "bunny":
	    gl.uniform3fv(uColor, [0.58,0.58,0.58])
	}

	
    }

    function scene(){

	pushMatrix()
	pushMatrix()
	agora()
	popMatrix()

	
	pushMatrix()
	multRotationY(heliMovement)
	multTranslation( [heliPosition[0], height+floorProp.height/2, heliPosition[2]])
	heliModelForBoxes= mult(inverse(look),modelView())
	multRotationY(-90);

	multRotationZ(tilt);
	multScale([heliProp.scale,heliProp.scale,heliProp.scale])	
	multTranslation([0,heliOriginToLegPlane,0])
	heliModelForCamera= mult(inverse(look),modelView())
	helicopter()
	popMatrix()

	//draw boxes here
	updateBoxes()
	for(let i = 0; i < boxes.length; ++i){
	    pushMatrix()
	    
	    loadMatrix(mult(look, boxes[i].model))
 	    box(boxes[i])
	    popMatrix()

	}
	popMatrix()

    }


    function updateBoxes(){
	for(let i = 0; i < boxes.length; ++i){
	    boxes[i].downVelocity += speed * GRAVITY;
	    boxes[i].airResistance = boxes[i].airResistance < GRAVITY ?  boxes[i].airResistance + (GRAVITY) * speed : 0
	    boxes[i].velocity = boxes[i].velocity > 0 ? boxes[i].velocity - boxes[i].airResistance*speed: 0
	    boxes[i].position[1] -= boxes[i].downVelocity*speed
	    boxes[i].position[2] -=  boxes[i].velocity*speed 
	    if(boxes[i].position[1]  < -boxes[i].height + boxes[i].scale/2 ) {
		boxes[i].position[1] = -boxes[i].height + boxes[i].scale/2 
		boxes[i].velocity = 0
		
	    }
	    if(time - boxes[i].time > 5){
		boxes.splice(i,1)
		--i;
	    }
	}
    }
    function box(currentBox){
	pushMatrix()
	changeColor("wood")
	multTranslation(currentBox.position) 
	multScale([currentBox.scale,currentBox.scale,currentBox.scale])
	uploadModelView()
	CUBE.draw(gl, program, mode);
	popMatrix()
	
	pushMatrix()
	
	popMatrix()
    }

    function floor(){
	multScale([floorProp.widthLength,floorProp.height,floorProp.widthLength])
	uploadModelView()
	CUBE.draw(gl, program, mode);

    }

    //helicopter
    function helicopter(){
	changeColor("blue")
	pushMatrix()
	body()
	popMatrix()
	changeColor("metal")
	pushMatrix()
	multTranslation([0,heliProp.body.height/2,0])
	bladesAndRotor()
	popMatrix()
	changeColor("Yellow")
	pushMatrix()
	multTranslation([3*heliProp.body.length/4,heliProp.body.height/8,0])
	tail()
	popMatrix()
	pushMatrix()
	multTranslation([0,-heliProp.body.height/2,0])
	legs()
	popMatrix()
    }
    
    function body(){
	pushMatrix()
	multScale([heliProp.body.length,heliProp.body.height,heliProp.body.width])	
	uploadModelView()
	SPHERE.draw(gl, program, mode);
	popMatrix()
    }

    //legs
    function legs(){
	pushMatrix()
	multTranslation([0,0,heliProp.body.width/3])
	leg()
	popMatrix()
	pushMatrix()
	multTranslation([0,0,-heliProp.body.width/3])
	leg()
	popMatrix()
    }

    function leg(){
	pushMatrix()
	multTranslation([-heliProp.body.length/4,0,0])
	multRotationZ(-30)
	holdingBar()
	popMatrix()
	pushMatrix()
	multTranslation([heliProp.body.length/4,0,0])
	multRotationZ(30)
	holdingBar()
	popMatrix()
	pushMatrix()
	multTranslation([0,-heliProp.body.height/4,0])
	landingBar()
	popMatrix()
    }
    
    function landingBar(){
	multScale([heliProp.body.length,
		   heliProp.landingBar.width
		   ,heliProp.landingBar.width])
	multRotationZ(heliProp.landingBar.rotation)

	uploadModelView()
	CYLINDER.draw(gl, program, mode);
    }

    function holdingBar(){
	multScale([heliProp.landingBar.width,
		   heliProp.body.height/1.75,
		   heliProp.landingBar.width])
	uploadModelView()
	CYLINDER.draw(gl, program, mode);
    }


    // top blades and rotor
    
    function bladesAndRotor(){
	pushMatrix()
	rotor();
	popMatrix()
	pushMatrix()
	multTranslation([0,heliProp.rotor.height/2,0])
	blades();
	popMatrix()
    }

    function blades(){
	pushMatrix()
	multRotationY(0+bladeRot)
	blade()
	popMatrix()
	pushMatrix()
	multRotationY(120+bladeRot)
	blade()
	popMatrix()
	pushMatrix()
	multRotationY(240+bladeRot)
	blade()
	popMatrix()
    }
    
    function rotor(){
	multScale([heliProp.body.width/5,
		   heliProp.rotor.height,
		   heliProp.body.width/5])
	uploadModelView()
	CYLINDER.draw(gl, program, mode);
    }
    
    function blade(){
	pushMatrix()

	multScale([heliProp.body.length/5,0.1,0.1].map((x) => x*heliProp.mainBladeSize))	
	multTranslation([0.5,0,0])
	uploadModelView()
	SPHERE.draw(gl, program, mode);
	popMatrix()
    }


    // tail

    function tail(){
	pushMatrix()
	bodyTail()
	popMatrix()
	pushMatrix()
	multTranslation([heliProp.body.length/2 + heliProp.body.length/8,0,0])
	backTail()
	popMatrix()

    }

    function backTail(){
	pushMatrix()
	multRotationZ(45)
	multTranslation([0,heliProp.bodyTail.width/2,0])
	rudder()
	popMatrix()
	changeColor("metal")
	pushMatrix()
	multRotationZ(45)
	 multTranslation([heliProp.bodyTail.width/2,
	 		 heliProp.bodyTail.width/2,
	 		 0]) 
	tailBladeAndRotor()
	popMatrix()
    }
    

    function tailBladeAndRotor(){

	pushMatrix()
	multTranslation([0,0,heliProp.bodyTail.width/2])
	tailRotor()
	popMatrix()
	pushMatrix()
	multTranslation([0,0,heliProp.bodyTail.width/1.5])
	tailBlades()
	popMatrix()
    }

    function tailBlades(){
	pushMatrix()
	multRotationZ(bladeRot)

	tailBlade()
	popMatrix()
	pushMatrix()
	multRotationZ(180+bladeRot)
	//multTranslation([0,0.5,0])
	tailBlade()
	popMatrix()
    }

    function bodyTail(){
	multScale([heliProp.body.length + heliProp.body.length/8,
		   heliProp.bodyTail.width,
		   heliProp.bodyTail.width])	
	uploadModelView()
	SPHERE.draw(gl, program, mode);

    }
    
    function tailRotor(){
	multRotationY(90)
	multRotationZ(90)	    
	multScale([heliProp.bodyTail.width* 0.25,0.5*heliProp.bodyTail.width,heliProp.bodyTail.width * 0.25])
	uploadModelView()
	CYLINDER.draw(gl, program, mode);
    }

    function rudder(){

	multScale([heliProp.bodyTail.width  *2,
		   heliProp.bodyTail.width ,
		   heliProp.bodyTail.width])
	uploadModelView()
	SPHERE.draw(gl, program, mode);
    }

    function tailBlade(){
	multScale([0.1,heliProp.bodyTail.width *1.5,0.1].map((x)=>x*heliProp.tailBladeSize))
	multTranslation([0,0.5,0])
	uploadModelView()
	SPHERE.draw(gl, program, mode);
    }


    //Agora

    function agora(){
	//agora
	pushMatrix()
	
	multRotationY(-45)
	changeColor("grass")
	floor()
	popMatrix()

	pushMatrix()
	roundTemple()
	popMatrix()

	for(let i = 0; i < 4; ++i ){
	    //stoa
	    pushMatrix()
	    multRotationY(90*i)
	    multTranslation([45,0,45])
	    multRotationY(45);

	    stoa()
	    popMatrix()
	}

	for(let i = 0; i<4; ++i){
	    multRotationY(90*i)
	    pushMatrix()
	    multTranslation([75,0,0])
	    stands()
	    popMatrix()

	}
    }
    //stand

    function stand(){
	
	changeColor("leather")
	pushMatrix()
	standRoof()
	popMatrix()

	changeColor("wood")
	pushMatrix()
	standLegs()
	popMatrix()
	
    }

    function standRoof(){
	multRotationZ(-10)
	multTranslation([0,6,0])
	multScale([8,1,12])
	uploadModelView()
	CUBE.draw(gl, program, mode);
    }
    function standLegs(){
	//frontLeg1
	pushMatrix()
	multTranslation([4,2.5,-5])
	multScale([1,5,1])
	uploadModelView()
	CYLINDER.draw(gl, program, mode)
	popMatrix()

	//frontleg2
	pushMatrix()
	multTranslation([4,2.5,5])
	multScale([1,5,1])
	uploadModelView()
	CYLINDER.draw(gl, program, mode)
	popMatrix()

	//backLeg1
	pushMatrix()
	multTranslation([-2,3.5,-5])
	multScale([1,6.5,1])
	uploadModelView()
	CYLINDER.draw(gl, program, mode)
	popMatrix()

	//backLeg2
	pushMatrix()
	multTranslation([-2,3.5,5])
	multScale([1,6.5,1])
	uploadModelView()
	CYLINDER.draw(gl, program, mode)
	popMatrix()
    }
    
    function stands(){
	pushMatrix()
	stand()
	popMatrix()
	pushMatrix()
	multTranslation([-4,0,18])
	multRotationY(-30)
	stand()
	popMatrix()
	pushMatrix()
	multTranslation([-4,0,-18])
	multRotationY(30)
	stand()
	popMatrix()
    }
    //stoa

    function stoa(){
	//floor
	changeColor("templeWhite")
	pushMatrix()
	multTranslation([0,1,0])
	multScale([40,1,15])
	uploadModelView()
	CUBE.draw(gl, program, mode);
	popMatrix()

	//sidewall1
	pushMatrix()
	multTranslation([19.5,1+8,1.5])
	multScale([1,15,12])
	uploadModelView()
	CUBE.draw(gl, program, mode);
	popMatrix()

	//sidewall2
	pushMatrix()
	multTranslation([-19.5,1+8,1.5])
	multScale([1,15,12])
	uploadModelView()
	CUBE.draw(gl, program, mode);
	popMatrix()

	//backwall
	pushMatrix()
	multTranslation([0,1+8,7])
	multScale([38,15,1])
	uploadModelView()
	CUBE.draw(gl, program, mode);
	popMatrix()

	//stoaRoof
	pushMatrix()
	multTranslation([0,1+16,0])
	multScale([40,1,15])
	uploadModelView()
	CUBE.draw(gl, program, mode);
	popMatrix()

	//stoa columns
	changeColor("columnWhite")
	for(let i = 0; i < 36; i += 4){
	    pushMatrix()
	    multTranslation([i-16,1+8,-4])
	    multScale([1.5,15,1.5])
	    uploadModelView()
	    CYLINDER.draw(gl, program, mode);
	    popMatrix()
	}

	
    }

    // round temple

    function roundStairs(){
	//step1
	pushMatrix()
	multTranslation([0,1,0])
	multScale([40,1,40])
	uploadModelView()
	CYLINDER.draw(gl, program, mode);
	popMatrix()
	//step2
	pushMatrix()
	multTranslation([0,1.5,0])
	multScale([35,2,35])
	uploadModelView()
	CYLINDER.draw(gl, program, mode);
	popMatrix()
	//step3
	pushMatrix()
	multTranslation([0,2,0])
	multScale([32.5,3,32.5])
	uploadModelView()
	CYLINDER.draw(gl, program, mode);
	popMatrix()
    }

    function roundTemple(){
	pushMatrix()
	changeColor("templeWhite")
	roundStairs()
	popMatrix()
	pushMatrix()
	multTranslation([0,13,0])
	roundTempleTop()
	popMatrix()

	changeColor("columnWhite")
	for(let i = 0; i < 360; i += 30){
	    //round temple pillar
	    pushMatrix()
	    multRotationY(i)
	    multTranslation([14,8.5,0])
	    multScale([2,10,2])
	    uploadModelView()
	    CYLINDER.draw(gl, program, mode);
	    popMatrix()
	}


	pushMatrix()
	multTranslation([0,13+1.5+3+2.5+1.5+1,0])
	//bunny
	pushMatrix()
	multTranslation([0,3,0])
	multScale([32,32,32])
	uploadModelView()
	changeColor("bunny")
	BUNNY.draw(gl, program, mode);
	popMatrix()

	//halo
	pushMatrix()
	multTranslation([0,3+5,0])
	multScale([4,4,4])
	multRotationX(-30)
	multRotationZ(-30)
	uploadModelView()
	changeColor("Yellow")
	TORUS.draw(gl, program, mode);
	
	//bunny column
	popMatrix()
	pushMatrix()
	multScale([8,2,8])
	changeColor("columnWhite")
	uploadModelView()
	CYLINDER.draw(gl, program, mode);
	popMatrix()
	popMatrix()

	//temple inside
	changeColor("templeBlue")
	pushMatrix()
	multTranslation([0,1+7.5,0])
	multScale([20,10,20])
	uploadModelView()
	CYLINDER.draw(gl, program, mode);
	popMatrix()
    }

    function roundTempleTop(){
	// round temple roof
	pushMatrix()
	multTranslation([0,1.5,0])
	multScale([35,2,35])
	uploadModelView()
	CYLINDER.draw(gl, program, mode);
	popMatrix()
	pushMatrix()
	multTranslation([0,3.5,0])
	multScale([30,2,30])
	uploadModelView()
	CYLINDER.draw(gl, program, mode);
	popMatrix()	
	pushMatrix()
	multTranslation([0,5.5,0])
	multScale([25,2,25])
	uploadModelView()
	CYLINDER.draw(gl, program, mode);
	popMatrix()
	multTranslation([0,7.5,0])
	multScale([20,2,20])
	uploadModelView()
	CYLINDER.draw(gl, program, mode);
	popMatrix()
    }

    

    
    
}

const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))
