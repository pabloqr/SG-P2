// Clases de la biblioteca
import * as THREE from './libs/three.module.js'
import * as TWEEN from './libs/tween.esm.js'
import { Stats } from './libs/stats.module.js'

// Clases de mi proyecto
import { Key } from './Key.js';
import { Church } from './Church.js';
import { Column } from './Column.js';
import { Fachade } from './Fachade.js';
import { Clock } from './Clock.js';
import { ChurchBench } from './ChurchBench.js';
import { Door } from './Door.js';
import { Chandelier } from './Chandelier.js';
import { Candle } from './Candle.js';
import { DeadBody } from './DeadBody.js';
import { SecretDoor } from './SecretDoor.js';
import { Paper } from './Paper.js';
import { Tree } from './Tree.js';
import { Ground } from './Ground.js';
import { Selector } from './Selector.js';
import { Table } from './Table.js';
import { Painting } from './Painting.js';

/// La clase fachada del modelo
/**dw
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */

class MyScene extends THREE.Scene {
	constructor (myCanvas)
	{
		super();

		var pointShadows = false;

		// Estado de la escena
		MyScene.NO_ACTION = 0 ;
		MyScene.PICKING_MINUTES = 1;
		MyScene.PICKING_HOURS = 2;
		MyScene.INSERTING_COINS = 3;

		this.sceneState = MyScene.NO_ACTION;
		this.hasCoins = false;
		this.CORRECT_COINS = 6;
		this.hasKey = false;
		this.closedExit = false;

		//controla que se hayan creado el audio listener y los audio sources
		this.soundCreated = false;

		// Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
		this.renderer = this.createRenderer(myCanvas);

		this.renderer.shadowMap.enabled = true;
		// this.renderer.shadowMap.type = THREE.BasicShadowMap;
		// this.renderer.shadowMap.type = THREE.PCFShadowMap;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		this.initStats();

		this.raycaster = new THREE.Raycaster();

		// Construimos los distinos elementos que tendremos en la escena

		// Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
		// Tras crear cada elemento se añadirá a la escena con   this.add(variable)
		this.createLights ();

		// Tendremos una cámara con un control de movimiento con el ratón
		this.createCamera ();

		// Array de colisiones estáticas
		this.collisionBoxArray = [];

		// Array de objetos pickables
		this.pickableObjects = [];

		// Array de candelabros
		this.candles = [];

		// Número de monedas insertadas
		this.numCoins = 0;

		// Creamos reloj de actualizaciones
		this.clock = new THREE.Clock();

		// Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
		this.axis = new THREE.AxesHelper (5);
		// this.add (this.axis);

		// Por último creamos el modelo.
		
		// Creación de la iglesia
		var church = new Church ();
		church.bb0 = new THREE.Box3(new THREE.Vector3(-31,0,-30),new THREE.Vector3(-30,10,120));//pared izquierda
		church.bb1 = new THREE.Box3(new THREE.Vector3(30,0,-30),new THREE.Vector3(31,10,-8));
		church.bb2 = new THREE.Box3(new THREE.Vector3(-30,0,-40),new THREE.Vector3(30,10,-30));
		church.bb3 = new THREE.Box3(new THREE.Vector3(-30,0,-30),new THREE.Vector3(30,2.75,-20.75));
		church.bb4 = new THREE.Box3(new THREE.Vector3(-30,0,32.5),new THREE.Vector3(-8,10,35));
		church.bb5 = new THREE.Box3(new THREE.Vector3(8,0,32.5),new THREE.Vector3(30,10,35));

		church.bb6 = new THREE.Box3(new THREE.Vector3(30,0,1),new THREE.Vector3(31,10,120));//pared derecha (exterior) 

		church.bb7 = new THREE.Box3(new THREE.Vector3(42,0,-8),new THREE.Vector3(43,10,1));
		church.bb8 = new THREE.Box3(new THREE.Vector3(30,0,-9),new THREE.Vector3(43,10,-8));
		church.bb9 = new THREE.Box3(new THREE.Vector3(30,0,0),new THREE.Vector3(43,10,1));

		church.bb10 = new THREE.Box3(new THREE.Vector3(-30,0,120),new THREE.Vector3(31,10,121));//fondo exterior

		this.collisionBoxArray.push(church.bb0);
		this.collisionBoxArray.push(church.bb1);
		this.collisionBoxArray.push(church.bb2);
		this.collisionBoxArray.push(church.bb3);
		this.collisionBoxArray.push(church.bb4);
		this.collisionBoxArray.push(church.bb5);

		this.collisionBoxArray.push(church.bb6);
		this.collisionBoxArray.push(church.bb7);

		this.collisionBoxArray.push(church.bb8);
		this.collisionBoxArray.push(church.bb9);
		this.collisionBoxArray.push(church.bb10);

		// genShadows(church);

		// Creación de la fachada
		var fachade = new Fachade ();

		// Creación de las puertas
		this.doorOffsetX = 8.2;
		this.doorOffsetZ = 0.3;
		this.doorLeft = new Door(true);
		this.doorLeft.position.set(-this.doorOffsetX,0,this.doorOffsetZ);
		this.doorHingeLeft = new THREE.Object3D();
		this.doorHingeLeft.position.set(this.doorOffsetX,0,35.3);
		this.doorHingeLeft.rotation.y = Math.PI/4;
		this.doorRight = new Door();
		this.doorRight.scale.x=-1;
		this.doorRight.position.set(this.doorOffsetX,0,this.doorOffsetZ);
		this.doorHingeRight = new THREE.Object3D();
		this.doorHingeRight.position.set(-this.doorOffsetX,0,35.3);
		this.doorHingeRight.rotation.y = -Math.PI/4;
		this.doorHingeLeft.add(this.doorLeft);
		this.doorHingeRight.add(this.doorRight);
		// this.doorHingeLeft.rotation.y = Math.PI/2;
		this.setupKey(this.doorLeft);

		// Creación de árboles
		this.setupTrees();

		// Creación del suelo
		var ground = new Ground()
		this.add(ground);
		// ground.rotation.y = Math.PI/2;
		ground.position.set(0,-0.5,0);
		// ground.scale.set(3,3,3);

		// Creación de columnas y candelabros
		var columnSeparation = 21;
		var columnSize = 1.5;
		for(var i = 0; i < 5; i++)
		{
			var columna = new Column ();
			columna.position.set(0,0,i*9-15);
			var min0 = new THREE.Vector3(-columnSize+columnSeparation,0,-columnSize+i*9-15);
			var max0 = new THREE.Vector3(columnSize+columnSeparation,2,columnSize+i*9-15);
			var min1 = new THREE.Vector3(-columnSize-columnSeparation,0,-columnSize+i*9-15);
			var max1 = new THREE.Vector3(columnSize-columnSeparation,2,columnSize+i*9-15);
			columna.boundingBox0 = new THREE.Box3(min0,max0);
			columna.boundingBox1 = new THREE.Box3(min1,max1);
			
			// columna.boundingBoxHelper0 = new THREE.Box3Helper (columna.boundingBox0, 0xffff00);
			// columna.boundingBoxHelper1 = new THREE.Box3Helper (columna.boundingBox1, 0xffff00);
			// this.add(columna.boundingBoxHelper0);
			// this.add(columna.boundingBoxHelper1);

			// columna.boundingBoxHelper0.visible = true;
			// columna.boundingBoxHelper1.visible = true;
			this.add (columna);
			this.collisionBoxArray.push(columna.boundingBox0);
			this.collisionBoxArray.push(columna.boundingBox1);

			// candles
			var candle0 = new Candle(pointShadows);
			var candle1 = new Candle(pointShadows);
			candle0.position.set(0,0,i*9-15);
			candle1.position.set(0,0,i*9-15);
			candle1.scale.x = -1;
			this.add(candle0);
			this.add(candle1);
			this.candles.push(candle0);
			this.candles.push(candle1);
			this.pickableObjects.push(candle0);
			this.pickableObjects.push(candle1);
		}

		// Creacion de la mesa
		this.table = new Table();
		this.table.scale.set(0.6,0.6,0.6);
		this.table.position.set(38,0,-2);

		this.table.bb = new THREE.Box3 (
			new THREE.Vector3 (-0.3+this.table.position.x, 0, -0.3+this.table.position.z),
			new THREE.Vector3 (0.3+this.table.position.x, 0.6, 0.3+this.table.position.z)
		);
		this.collisionBoxArray.push (this.table.bb);

		this.pickableObjects.push (this.table.coins);

		// Creacion del cuadro
		var painting = new Painting();
		painting.position.set(-29.5,4,-5);
		painting.rotation.set(0,Math.PI/2,0);

		// Creacion de la puerta secreta

		var secretDoor = new SecretDoor();
		var wall = new SecretDoor();
		secretDoor.position.set(31,0,-7);
		wall.position.set(-31,0,-7);
		this.add(secretDoor);
		this.add(wall);

		this.setupSecretDoor(secretDoor);

		// Creación del reloj (modelo jerárquico)
		this.clockModel = new Clock ();
		this.clockModel.position.set(29,0,2);
		this.clockModel.boundingBox = new THREE.Box3(new THREE.Vector3(-1+29,0,-1+2),new THREE.Vector3(1+29,2,1+2));
		this.collisionBoxArray.push(this.clockModel.boundingBox);

		this.pickableObjects.push(this.clockModel.getHandMinutes());//He intentado usar bounding box pero da error el raycaster !!!!
		this.pickableObjects.push(this.clockModel.getHandHours());

		// Creación de bancos
		var benchScale = 0.18;
		var benchSeparation = 10;
		for(var i = 0; i < 10; i++)
		{
			for(var j = -1; j < 2;j+=2)
			{
				var bench = new ChurchBench (52, 8);
				bench.position.set (benchSeparation*j, 0, i*4.5-15);
				bench.rotation.set (0, Math.PI, 0);
				bench.scale.set (benchScale, benchScale, benchScale);
				
				bench.boundingBox = new THREE.Box3 ().setFromObject (bench);
				// bench.boundingBoxHelper = new THREE.Box3Helper (bench.boundingBox, 0xffff00);
				// this.add (bench.boundingBoxHelper);
				// bench.boundingBoxHelper.visible = true;

				this.add (bench);

				this.collisionBoxArray.push(bench.boundingBox);
			}
		}

		// Creación del lampadario
		this.chandelier = new Chandelier (8, 4.0*Math.PI/9.0,pointShadows);
		this.chandelier.position.set (-29.5, 0.0, 10.0);
		this.chandelier.rotation.set (0.0, Math.PI/2.0, 0.0);
		this.chandelier.scale.set (0.15, 0.15, 0.15);

		//this.add (new THREE.CameraHelper (this.chandelier.pointLights[0].shadow.camera));
		//this.add (new THREE.CameraHelper (this.chandelier.pointLights[1].shadow.camera));
		//this.add (new THREE.CameraHelper (this.chandelier.pointLights[2].shadow.camera));

		this.chandelier.boundingBox = new THREE.Box3 ().setFromObject (this.chandelier);
		//this.chandelier.boundingBoxHelper = new THREE.Box3Helper (this.chandelier.boundingBox, 0xffff00);
		//this.add (this.chandelier.boundingBoxHelper);
		//this.chandelier.boundingBoxHelper.visible = true;

		this.collisionBoxArray.push (this.chandelier.boundingBox);
		this.pickableObjects.push (this.chandelier.moneyBox);

		// Creación de la llave
		var key = new Key();
		key.position.set(this.clockModel.position.x,0.59,this.clockModel.position.z);
		this.pickableObjects.push(key);
		// key.position.set(29,0.8,1);

		// Creación de la silueta del cadáver
		var deadBody = new DeadBody ();
		deadBody.scale.set (0.6, 0.6, 0.6);
		deadBody.position.set (0.0, 0.0, -16.0);

		// Creacion del dibujo
		var drawing = new Paper();
		drawing.position.set(4,0.001,-15);
		drawing.rotation.y = 1;
		
		this.pickableObjects.push (this.minusSelector);
		this.pickableObjects.push (this.plusSelector);

		this.add (church);
		this.add (fachade);
		this.add (this.clockModel);
		this.add (this.chandelier);
		this.add (key);
		this.add (this.doorHingeLeft);
		this.add (this.doorHingeRight);
		this.add (deadBody);
		this.add (drawing);
		this.add (this.table);
		this.add (painting);
	}

	setBG()
	{
		const loader = new THREE.CubeTextureLoader();
		const texture = loader.load([
		  './imgs/skyRight.png',
		  './imgs/skyLeft.png',
		  './imgs/skyUp.png',
		  './imgs/skyDown.png',
		  './imgs/skyFront.png',
		  './imgs/skyBack.png',
		]);
		this.background = texture;

		const color = 0x50505;
		const near = 5;
		const far = 100;
		this.fog = new THREE.Fog(color, near, far);
		const density = 0.1;
		// this.fog = new THREE.FogExp2(texture, density);
	}

	setupSecretDoor(secretDoor)
	{
		this.secretDoorActivated = false;

		var bb = new THREE.Box3(new THREE.Vector3(30,0,-8),new THREE.Vector3(30,10,1));
		this.collisionBoxArray.push(bb);

		var origenPosicionX = {p:secretDoor.position.x}
		var destinoPosicionX = {p:secretDoor.position.x+0.5}

		var origenPosicionZ = {p:secretDoor.position.z}
		var destinoPosicionZ = {p:secretDoor.position.z-8}

		this.secretDoorAnim = [];
		this.secretDoorAnim.push(new TWEEN.Tween(origenPosicionX).to(destinoPosicionX, 800)
		.easing(TWEEN.Easing.Quadratic.Out)
		.onUpdate(() => { secretDoor.position.x = origenPosicionX.p}));

		this.secretDoorAnim.push(new TWEEN.Tween(origenPosicionZ).to(destinoPosicionZ, 4000)
		.easing(TWEEN.Easing.Quadratic.Out)
		.onUpdate(() => { secretDoor.position.z = origenPosicionZ.p})
		.onComplete(() => {
			bb.min = new THREE.Vector3(0,0,0);
			bb.max = new THREE.Vector3(0,0,0);
		}));

		this.secretDoorAnim[0].chain(this.secretDoorAnim[1]);
	}

	setupKey(door)
	{
		this.exitBB = new THREE.Box3(new THREE.Vector3(-8,0,35),new THREE.Vector3(8,10,40));

		this.doorKey = new Key();

		this.doorKey.position.set(1.184,-10,this.doorKey.rotation.z-1);
		this.doorKey.rotation.z = -Math.PI/2;
		door.add(this.doorKey);

		this.pickableObjects.push(door.lock);


		var origenPosicion = {p:this.doorKey.position.z}
		var destinoPosicion = {p:door.lock.position.z-0.5}

		var origenRotacion = {p:this.doorKey.rotation.z}
		var destinoRotacion = {p:0}

		var origenPuerta = {p:0}
		var destinoPuerta = {p:Math.PI/2}

		this.openDoorAnim = [];

		this.openDoorAnim.push(new TWEEN.Tween(origenPosicion)
			.to(destinoPosicion, 300)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate(() => { this.doorKey.position.z = origenPosicion.p}));
		this.openDoorAnim.push(new TWEEN.Tween(origenRotacion)
			.to(destinoRotacion, 300)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate(() => { this.doorKey.rotation.z = origenRotacion.p}));

		this.openDoorAnim.push(new TWEEN.Tween(origenPuerta)
			.to(destinoPuerta, 2000)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.onUpdate(() => { 
				this.doorHingeLeft.rotation.y = origenPuerta.p;
				this.doorHingeRight.rotation.y = -origenPuerta.p;
			})
			.onComplete(()=>{
				this.exitBB.max = new THREE.Vector3(0,0,0);
				this.exitBB.min = new THREE.Vector3(0,0,0);
			}));

		this.openDoorAnim[0].chain(this.openDoorAnim[1]);
		this.openDoorAnim[1].chain(this.openDoorAnim[2]);

		var origenPuertaCerrar = {p:Math.PI/4}
		var destinoPuertaCerrar = {p:0}

		this.closeDoorAnim = [];

		this.closeDoorAnim.push(new TWEEN.Tween(origenPuertaCerrar)
		.to(destinoPuertaCerrar, 800)
		.easing(TWEEN.Easing.Quadratic.In)
		.onUpdate(() => { 
			this.doorHingeLeft.rotation.y = origenPuertaCerrar.p;
			this.doorHingeRight.rotation.y = -origenPuertaCerrar.p;
		})
		.onComplete(()=>{
			const soundEvent = this.soundEvent;
			const audioLoader = new THREE.AudioLoader();
			audioLoader.load( 'sfx/closeDoor.ogg', function( buffer ) {
				soundEvent.setBuffer( buffer );
				soundEvent.setVolume( 1 );
				soundEvent.play();
			});

			this.soundAmbient.setVolume( 0.02 );
		}));
		
	}

	setupTrees()
	{
		var trees = [];
		trees.push({x:17,z:40,r:1});
		trees.push({x:-24,z:55,r:2});
		trees.push({x:15,z:50,r:3});
		trees.push({x:20,z:60,r:4});
		trees.push({x:-13,z:56,r:5});
		trees.push({x:13,z:70,r:6});
		trees.push({x:-18,z:65,r:7});
		trees.push({x:25,z:67,r:8});
		trees.push({x:-22,z:60,r:9});
		trees.push({x:-3,z:71,r:10});
		trees.push({x:-10,z:64,r:11});

		var treeSize = 1.5;

		for(var i = 0; i < trees.length; i++)
		{
			var tree = new Tree();
			tree.position.set(trees[i].x,0,trees[i].z);
			tree.rotation.y = trees[i].r;
			tree.scale.set(2,2,2);
			tree.bb = new THREE.Box2(new THREE.Vector3(-treeSize+tree.position.x,0,-treeSize+tree.position.z),new THREE.Vector3(treeSize+tree.position.x,10,treeSize+tree.position.z));
			this.collisionBoxArray.push(tree.bb);
			this.add(tree);
		}
	}

	initStats()
	{
		var stats = new Stats();

		stats.setMode(0); // 0: fps, 1: ms

		// Align top-left
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';

		$("#Stats-output").append( stats.domElement );

		this.stats = stats;
	}

	createCamera () {
		// Para crear una cámara le indicamos
		//   El ángulo del campo de visión en grados sexagesimales
		//   La razón de aspecto ancho/alto
		//   Los planos de recorte cercano y lejano
		this.camera = new THREE.PerspectiveCamera (45, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.cameraObj = new THREE.Object3D ();
		this.cameraObj.position.set (0, 2, 0);
		this.cameraObj.add (this.camera);

		this.cameraHAngle = 0.0;
		this.cameraVAngle = 0.0;

		this.cameraMovement = {
			right: 0, left: 0, front: 0, back: 0
		};

		this.bgMat = new THREE.MeshBasicMaterial({color : 0x000000 ,transparent:true,opacity:0});

		var cameraBG = new THREE.Mesh(new THREE.BoxGeometry(10,1,10),this.bgMat);
		cameraBG.position.z = -1;
		cameraBG.rotation.x = Math.PI/2;
		
		this.minusSelector = new Selector ("minus", "imgs/Minus_Alpha.png");
		this.minusSelector.scale.set (0.05, 0.05, 0.05);
		this.minusSelector.rotation.set (Math.PI/2.0, 0.0, 0.0);
		this.minusSelector.position.set (-0.13, -0.06, -0.2);
		this.minusSelector.visible = false;

		this.plusSelector = new Selector ("plus", "imgs/Plus_Alpha.png");
		this.plusSelector.name = "plus";
		this.plusSelector.scale.set (0.05, 0.05, 0.05);
		this.plusSelector.rotation.set (Math.PI/2.0, 0.0, 0.0);
		this.plusSelector.position.set (0.13, -0.06, -0.2);
		this.plusSelector.visible = false;

		this.camera.add (this.minusSelector);
		this.camera.add (this.plusSelector);
		this.camera.add(cameraBG);

		//Creamos jugador
		this.jugador = new THREE.Object3D ();
		this.jugador.position.z = 90;
		const min = new THREE.Vector3(-0.5, 0, -0.5);
		const max = new THREE.Vector3(0.5, 2.5, 0.5);
		this.jugador.add(this.cameraObj);

		this.jugador.boundingBox = new THREE.Box3 (min,max);

		this.add (this.jugador);
	}

	createGround () {
		// El suelo es un Mesh, necesita una geometría y un material.

		// La geometría es una caja con muy poca altura
		var geometryGround = new THREE.BoxGeometry (50,0.2,50);

		// El material se hará con una textura de madera
		var texture = new THREE.TextureLoader().load('../imgs/wood.jpg');
		var materialGround = new THREE.MeshPhongMaterial ({map: texture});

		// Ya se puede construir el Mesh
		var ground = new THREE.Mesh (geometryGround, materialGround);

		// Todas las figuras se crean centradas en el origen.
		// El suelo lo bajamos la mitad de su altura para que el origen del mundo se quede en su lado superior
		ground.position.y = -0.1;

		// Que no se nos olvide añadirlo a la escena, que en este caso es  this
		this.add (ground);
	}

	createLights () {
		// Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
		// La luz ambiental solo tiene un color y una intensidad
		// Se declara como   var   y va a ser una variable local a este método
		//    se hace así puesto que no va a ser accedida desde otros métodos
		var dirLightTarget = new THREE.Object3D();
		dirLightTarget.position.set(0,15,0);
		var ambientLight = new THREE.AmbientLight(0xccddee, 0.6);
		var directionLight = new THREE.DirectionalLight(0xc9fcf9,0.9);
		directionLight.position.set(20,65,100);
		directionLight.target = dirLightTarget;

		var shadowRes = 2048;

		//Configuracion de las luces
		directionLight.castShadow = true;
		directionLight.shadow.mapSize.width = shadowRes;
		directionLight.shadow.mapSize.height = shadowRes;
		directionLight.shadow.camera.near = 0.5;
		directionLight.shadow.camera.far = 200;

		var dirLightSize = 50;

		directionLight.shadow.camera.left = -dirLightSize;
		directionLight.shadow.camera.bottom = -dirLightSize;
		directionLight.shadow.camera.right = dirLightSize;
		directionLight.shadow.camera.top = dirLightSize;

		// La añadimos a la escena
		this.add (ambientLight);
		this.add (directionLight);
		this.add (dirLightTarget);
	}

	setLightIntensity (valor) {
		this.spotLight.intensity = valor;
	}

	setAxisVisible (valor) {
		this.axis.visible = valor;
	}

	createRenderer (myCanvas) {
		// Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.

		// Se instancia un Renderer   WebGL
		var renderer = new THREE.WebGLRenderer();

		// Se establece un color de fondo en las imágenes que genera el render
		renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);

		// Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
		renderer.setSize(window.innerWidth, window.innerHeight);

		// La visualización se muestra en el lienzo recibido
		$(myCanvas).append(renderer.domElement);

		return renderer;  
	}

	getCamera () {
		// En principio se devuelve la única cámara que tenemos
		// Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
		return this.camera;
	}

	setCameraAspect (ratio) {
		// Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
		// su sistema operativo hay que actualizar el ratio de aspecto de la cámara
		this.camera.aspect = ratio;
		// Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
		this.camera.updateProjectionMatrix();
	}

	onWindowResize () {
		// Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
		// Hay que actualizar el ratio de aspecto de la cámara
		this.setCameraAspect (window.innerWidth / window.innerHeight);

		// Y también el tamaño del renderizador
		this.renderer.setSize (window.innerWidth, window.innerHeight);
	}

	onMouseDown (event)
	{
		if (event.which == 1) {

			this.cameraRotation = true;
			this.mousePosition = { x: event.clientX, y: event.clientY };
		}
	}

	onMouseUp (event)
	{
		if(this.sceneState == MyScene.NO_ACTION)
		{
			if (event.which == 1) {

				this.cameraRotation = false;
			}
		}
	}

	onMouseMove (event)
	{
		this.mouse = { x: 0, y: 0};

		this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.mouse.y = 1 - 2 * (event.clientY / window.innerHeight);


		if(this.sceneState == MyScene.NO_ACTION)
		{
			if (this.cameraRotation) {

				this.mouseDelta = {
				x: event.clientX - this.mousePosition.x,
				y: event.clientY - this.mousePosition.y
				};

				this.mousePosition.x = event.clientX;
				this.mousePosition.y = event.clientY;

				var cameraDelta = {
				h: this.mouseDelta.x / window.innerWidth,
				v: this.mouseDelta.y / window.innerHeight
				};

				var cameraRotationSpeed = 3;

				this.cameraHAngle += cameraDelta.h*cameraRotationSpeed;
				this.cameraVAngle += cameraDelta.v*(cameraRotationSpeed*(window.innerHeight/window.innerWidth));

				this.camera.rotation.x = -this.cameraVAngle;
				this.cameraObj.rotation.y = -this.cameraHAngle;
			}
		}
	}

	onDoubleClick(event)
	{
		if(event.button == 0)
		{
			this.raycaster.setFromCamera (this.mouse, this.camera);

			var pickedObjects = this.raycaster.intersectObjects (this.pickableObjects, true);

			if(pickedObjects.length>0)
			{
				var selectedObject = pickedObjects[0].object.userData;
				var selectedPoint = pickedObjects[0].point;
				//console.log("pick! "+selectedObject.name);
				//console.log(pickedObjects[0]);
				switch (selectedObject.name)
				{
					case "clockHandHour":
						this.sceneState = MyScene.PICKING_HOURS;
						break;
					case "clockHandMinute":
						this.sceneState = MyScene.PICKING_MINUTES;
						break;
					case "key":
						if(this.clockModel.isActive())
						{
							selectedObject.position.y = -10;
							this.hasKey = true;
						}
						break;
					case "candle":
						selectedObject.toggleFire();

						var valid = true;

						//	26	21
						this.binaryPuzzle = [
							false,true,
							true,false,
							false,true,
							true,false,
							true,true
						];

						if(this.secretDoorActivated==false)
						{
							for(var i = 0; i < this.candles.length;i++)
							{
								if(this.candles[i].activeFire != this.binaryPuzzle[i])
								{
									valid = false;
								}
							}
	
							if(valid==true)
							{
								this.secretDoorActivated = true;
								this.secretDoorAnim[0].start();

								const soundEvent = this.soundEvent;
								const audioLoader = new THREE.AudioLoader();
								audioLoader.load( 'sfx/secretDoor.ogg', function( buffer ) {
									soundEvent.setBuffer( buffer );
									soundEvent.setVolume( 1 );
									soundEvent.play();
								});
					
							}
						}
						break;
					case "lock":
							if(this.hasKey)
							{
								this.doorKey.position.y = 1.6;
								this.openDoorAnim[0].start();
								this.hasKey = false;
							}
							break;
					case "moneyBox":
						if (this.sceneState != MyScene.INSERTING_COINS && this.hasCoins) {

							this.sceneState = MyScene.INSERTING_COINS;
							
							this.minusSelector.visible = true;
							this.plusSelector.visible = true;
						}
						else {

							this.sceneState = MyScene.NO_ACTION;
							
							this.minusSelector.visible = false;
							this.plusSelector.visible = false;
						}
						break;
					case "minus":
						if (this.sceneState == MyScene.INSERTING_COINS) {

							if (this.numCoins > 0) this.numCoins--;

							if (this.numCoins == this.CORRECT_COINS) this.chandelier.powerSolutionCandles();
							else this.chandelier.powerRandomCandles();
						}
						break;
					case "plus":
						if (this.sceneState == MyScene.INSERTING_COINS) {

							this.numCoins++;

							if (this.numCoins == this.CORRECT_COINS) this.chandelier.powerSolutionCandles();
							else this.chandelier.powerRandomCandles();
						}
						break;
					case "coins":
						if (!this.hasCoins) this.table.coins.visible = false;
						this.hasCoins = true;
						break;
				}
			}
			else
			{
				this.sceneState = MyScene.NO_ACTION;
				this.cameraRotation = false;
				this.minusSelector.visible = false;
				this.plusSelector.visible = false;
			}
		}
	}

	keyboardKeyDown (event)
	{
		this.key = event.which || event.key;

		if(this.sceneState == MyScene.NO_ACTION)
		{
			switch (String.fromCharCode (this.key).toUpperCase())
			{
				case 'W': this.cameraMovement.front = 1; break;
				case 'A': this.cameraMovement.left = 1; break;
				case 'S': this.cameraMovement.back = 1; break;
				case 'D': this.cameraMovement.right = 1; break;
			}
		}

		if(this.soundCreated==false)
		{
			this.soundCreated = true;

			const listener = new THREE.AudioListener();
			this.camera.add( listener );
			// create a global audio source
			
			this.soundEvent = new THREE.Audio( listener );
			this.soundAmbient = new THREE.Audio( listener );

			const soundAmbient = this.soundAmbient;
			// load a sound and set it as the Audio object's buffer
			const audioLoader = new THREE.AudioLoader();
			audioLoader.load( 'sfx/ambient.ogg', function( buffer ) {
				soundAmbient.setBuffer( buffer );
				soundAmbient.setLoop( true );
				soundAmbient.setVolume( 0.3 );
				soundAmbient.play();
			});
		}
	}

	keyboardKeyUp (event)
	{
		this.key = event.which || event.key;

		if(this.sceneState == MyScene.NO_ACTION)
		{
			switch (String.fromCharCode (this.key).toUpperCase())
			{
				case 'W': this.cameraMovement.front = 0; break;
				case 'A': this.cameraMovement.left = 0; break;
				case 'S': this.cameraMovement.back = 0; break;
				case 'D': this.cameraMovement.right = 0; break;
			}
		}
	}

	updateCamera ()
	{
		var cameraMoveSpeed = 20;
		var cameraMove = this.cameraMovement.right || this.cameraMovement.left || this.cameraMovement.front || this.cameraMovement.back;

		if (cameraMove) {

			var xMove = this.cameraMovement.right - this.cameraMovement.left;
			var yMove = this.cameraMovement.back - this.cameraMovement.front;

			var rot = this.cameraObj.rotation.y + Math.atan2 (xMove, yMove);

			var lastPosition = {
				x : this.jugador.position.x,
				z : this.jugador.position.z
			};

			this.jugador.position.x += Math.sin (rot)*cameraMoveSpeed*this.deltaTime;
			this.jugador.position.z += Math.cos (rot)*cameraMoveSpeed*this.deltaTime;

			var min = new THREE.Vector3(-0.5+this.jugador.position.x, 0, -0.5+lastPosition.z);
			var max = new THREE.Vector3(0.5+this.jugador.position.x, 2.5, 0.5+lastPosition.z);
			this.jugador.boundingBox.min = min;
			this.jugador.boundingBox.max = max;

			this.collisionBoxArray.forEach(collider => {
				if(this.jugador.boundingBox.intersectsBox(collider))
				{
					this.jugador.position.x = lastPosition.x;
				}
			})

			min = new THREE.Vector3(-0.5+this.jugador.position.x, 0, -0.5+this.jugador.position.z);
			max = new THREE.Vector3(0.5+this.jugador.position.x, 2.5, 0.5+this.jugador.position.z);
			this.jugador.boundingBox.min = min;
			this.jugador.boundingBox.max = max;
			this.collisionBoxArray.forEach(collider => {
				if(this.jugador.boundingBox.intersectsBox(collider))
				{
					this.jugador.position.z = lastPosition.z;
				}
			});
		}
	}
	
	updateClockModel()
	{
		var handDelta = Math.PI*2/60*this.deltaTime;//una vuelta en 1 minuto

		if(this.sceneState == MyScene.PICKING_HOURS || this.sceneState == MyScene.PICKING_MINUTES )
		{
			var center = this.clockModel.getClockCenter();

			this.raycaster.setFromCamera(this.mouse,this.camera);
	
			var objects = [];
			objects.push(this.clockModel); // No me deja hacerlo de un tirón !!!!
	
			var pickedObjects = this.raycaster.intersectObjects(objects, true);
	
			var angle;
	
			if(pickedObjects.length>0)
			{
				var selectedPoint = pickedObjects[0].point;

				var v = 
				{
					x:selectedPoint.z-center.z,
					y:selectedPoint.y-center.y
				}

				angle = Math.sign(v.y) * Math.acos(v.x/((Math.sqrt(v.x*v.x+v.y*v.y))));
			}

			if( !isNaN(angle))
			{
				if(this.sceneState == MyScene.PICKING_HOURS )
				{
					this.clockModel.setHours(angle);
				}
				else
				{
					this.clockModel.setMinutes(angle);
				}
			}
		}
		else
		{
			this.clockModel.incrementHour(handDelta);
		}

		//probar si la hora es correcta
		this.clockModel.testTime(10.5,this.deltaTime);
		this.clockModel.openDoor(this.deltaTime);
		this.clockModel.update();
	}

	update ()
	{
		if (this.stats) this.stats.update();

		this.deltaTime = this.clock.getDelta();

		// Se actualizan los elementos de la escena para cada frame

		// Se actualiza la posición de la cámara según su controlador
		this.updateCamera();
		//this.cameraControl.update();

		// Se actualiza el resto del modelo
		this.chandelier.update();

		// this.doorHingeLeft.rotateY(0.02);

		this.updateClockModel();

		this.candles.forEach(candle => {
			candle.update(this.cameraObj.rotation.y);
		});

		// Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
		this.renderer.render (this, this.getCamera());

		// Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
		// Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
		// Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
		requestAnimationFrame(() => this.update())

		//cerrar la puerta cuando se entre a la iglesia por primera vez
		if(this.jugador.position.z < 30 && this.closedExit == false)
		{	
			this.closeDoorAnim[0].start();
			this.closedExit = true;
			this.collisionBoxArray.push(this.exitBB);
		}

		//finalizar el juego cuando se salga de la iglesia
		if(this.jugador.position.z>40 && this.closedExit == true)
		{
			this.bgMat.opacity+=this.deltaTime*0.5;
		}
	}
}

/// La función   main
$(function () {

	// Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
	var scene = new MyScene("#WebGL-output");

	// Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
	window.addEventListener ("resize", () => scene.onWindowResize());

	window.addEventListener ("mousedown", (event) => scene.onMouseDown (event));
	window.addEventListener ("mouseup", (event) => scene.onMouseUp (event));
	window.addEventListener ("mousemove", (event) => scene.onMouseMove (event));

	window.addEventListener ("keydown", (event) => scene.keyboardKeyDown (event));
	window.addEventListener ("keyup", (event) => scene.keyboardKeyUp (event));

	window.addEventListener ("dblclick", (event) => scene.onDoubleClick (event));

	// Que no se nos olvide, la primera visualización.
	scene.update();

	scene.setBG();
});
