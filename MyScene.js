// Clases de la biblioteca
import * as THREE from './libs/three.module.js'
import { GUI } from './libs/dat.gui.module.js'
import { Stats } from './libs/stats.module.js'
import { Object3D } from './libs/three.module.js';

// Clases de mi proyecto
import { Church } from './Church.js';
import { Column } from './Column.js';
import { Fachade } from './Fachade.js';
import { Clock } from './Clock.js';
import { ClockPendulus } from './ClockPendulus.js';
import { ChurchBench } from './ChurchBench.js';
import { Chandelier } from './Chandelier.js';

/// La clase fachada del modelo
/**dw
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */
var doorAngle = 0;

var nShadows = 0;
function genShadows(obj)
{
	obj.receiveShadow = true;
	obj.traverseVisible((node)=>{
		if ( node instanceof THREE.Mesh ) 
		{ 
			node.castShadow = true; 
			node.receiveShadow = true;
			console.log(node);
			nShadows++;
		} 
	});
	
}

function angleFromVector(v0,v1)//no se usa(entre 0 y 180)
{
	return Math.acos( (v0.x * v1.x + v0.y * v1.y) / (Math.sqrt(Math.pow(v0.x,2)+Math.pow(v0.x,2)) * Math.sqrt(Math.pow(v1.x,2)+Math.pow(v1.y,2))) );
}

class MyScene extends THREE.Scene {
	constructor (myCanvas)
	{
		super();

		// Estado de la escena
		MyScene.NO_ACTION = 0 ;
		MyScene.PICKING_MINUTES = 1;
		MyScene.PICKING_HOURS = 2;

		this.sceneState = MyScene.NO_ACTION;

		// Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
		this.renderer = this.createRenderer(myCanvas);

		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		// Se añade a la gui los controles para manipular los elementos de esta clase
		this.gui = this.createGUI ();

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

		// Creamos reloj de actualizaciones
		this.clock = new THREE.Clock();

		// Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
		this.axis = new THREE.AxesHelper (5);
		this.add (this.axis);

		// Por último creamos el modelo.
		// El modelo puede incluir su parte de la interfaz gráfica de usuario. Le pasamos la referencia a 
		// la gui y el texto bajo el que se agruparán los controles de la interfaz que añada el modelo.
		
		// Creación de iglesia
		var church = new Church ();
		church.bb0 = new THREE.Box3(new THREE.Vector3(-31,0,-30),new THREE.Vector3(-30,10,40));
		church.bb1 = new THREE.Box3(new THREE.Vector3(30,0,-30),new THREE.Vector3(31,10,40));
		church.bb2 = new THREE.Box3(new THREE.Vector3(-30,0,-40),new THREE.Vector3(30,10,-30));
		church.bb3 = new THREE.Box3(new THREE.Vector3(-30,0,-30),new THREE.Vector3(30,2.75,-20.75));
		church.bb4 = new THREE.Box3(new THREE.Vector3(-30,0,32.5),new THREE.Vector3(-8,10,35));
		church.bb5 = new THREE.Box3(new THREE.Vector3(8,0,32.5),new THREE.Vector3(30,10,35));

		this.add(new THREE.Box3Helper(church.bb0,0xffff00));
		this.add(new THREE.Box3Helper(church.bb1,0xffff00));
		this.add(new THREE.Box3Helper(church.bb2,0xffff00));
		this.add(new THREE.Box3Helper(church.bb3,0xffff00));
		this.add(new THREE.Box3Helper(church.bb4,0xffff00));
		this.add(new THREE.Box3Helper(church.bb5,0xffff00));

		this.collisionBoxArray.push(church.bb0);
		this.collisionBoxArray.push(church.bb1);
		this.collisionBoxArray.push(church.bb2);
		this.collisionBoxArray.push(church.bb3);
		this.collisionBoxArray.push(church.bb4);
		this.collisionBoxArray.push(church.bb5);

		// genShadows(church);

		// Creación de la fachada
		var fachade = new Fachade ();

		// genShadows(fachade);

		// Creación de columnas
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
			
			columna.boundingBoxHelper0 = new THREE.Box3Helper (columna.boundingBox0, 0xffff00);
			columna.boundingBoxHelper1 = new THREE.Box3Helper (columna.boundingBox1, 0xffff00);
			this.add(columna.boundingBoxHelper0);
			this.add(columna.boundingBoxHelper1);

			columna.boundingBoxHelper0.visible = true;
			columna.boundingBoxHelper1.visible = true;
			this.add (columna);
			this.collisionBoxArray.push(columna.boundingBox0);
			this.collisionBoxArray.push(columna.boundingBox1);

			// genShadows(columna);
		}

		// Creación del reloj (modelo jerárquico)
		this.clockModel = new Clock ();
		this.clockModel.position.set(29,0,2);


		// this.clockHandMinute.boundingBox = new THREE.Box3 ().setFromObject (this.clockHandMinute);
		// this.clockHandMinute.boundingBoxHelper = new THREE.Box3Helper (this.clockHandMinute.boundingBox, 0x0000ff);
		// this.add (this.clockHandMinute.boundingBoxHelper);
		// this.clockHandMinute.boundingBoxHelper.visible = true;

		this.pickableObjects.push(this.clockModel.getHandMinutes());//He intentado usar bounding box pero da error el raycaster !!!!
		this.pickableObjects.push(this.clockModel.getHandHours());

		// Creación de bancos
		var benchScale = 0.2;
		var benchSeparation = 10;
		for(var i = 0; i < 10; i++)
		{
			for(var j = -1; j < 2;j+=2)
			{
				var bench = new ChurchBench (48, 8);
				bench.position.set(benchSeparation*j,0,i*4.5-15);
				bench.rotation.set(0,Math.PI,0);
				bench.scale.set(benchScale,benchScale,benchScale);
				
				bench.boundingBox = new THREE.Box3 ().setFromObject (bench);
				bench.boundingBoxHelper = new THREE.Box3Helper (bench.boundingBox, 0xffff00);
				this.add (bench.boundingBoxHelper);
				bench.boundingBoxHelper.visible = true;

				this.add (bench);

				this.collisionBoxArray.push(bench.boundingBox);
			}
		}

		// Creación del lampadario
		var chandelier = new Chandelier (8, 4.0*Math.PI/9.0);
		chandelier.position.set (-29.5, 0.0, 10.0);
		chandelier.rotation.set (0.0, Math.PI/2.0, 0.0);
		chandelier.scale.set (0.15, 0.15, 0.15);

		chandelier.boundingBox = new THREE.Box3 ().setFromObject (chandelier);
		chandelier.boundingBoxHelper = new THREE.Box3Helper (chandelier.boundingBox, 0xffff00);
		this.add (chandelier.boundingBoxHelper);
		chandelier.boundingBoxHelper.visible = true;

		this.collisionBoxArray.push (chandelier.boundingBox);

		this.add (church);
		this.add (fachade);
		this.add (this.clockModel);
		this.add (chandelier);
	}

	initStats() {

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
		// También se indica dónde se coloca
		// Y hacia dónde mira
		this.cameraObj = new THREE.Object3D ();
		this.cameraObj.position.set (0, 2, 0);
		this.cameraObj.add (this.camera);
		

		this.cameraHAngle = 0.0;
		this.cameraVAngle = 0.0;

		this.cameraMovement = {
			right: 0, left: 0, front: 0, back: 0
		};


		//Creamos jugador
		this.jugador = new THREE.Object3D ();
		const min = new THREE.Vector3(-0.5, 0, -0.5);
		const max = new THREE.Vector3(0.5, 2.5, 0.5);
		this.jugador.add(this.cameraObj);

		this.jugador.boundingBox = new THREE.Box3 (min,max);
		this.jugador.boundingBoxHelper = new THREE.Box3Helper (this.jugador.boundingBox, 0xffff00);
		this.add (this.jugador.boundingBoxHelper);
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

	createGUI () {
		// Se crea la interfaz gráfica de usuario
		var gui = new GUI();

		// La escena le va a añadir sus propios controles. 
		// Se definen mediante un objeto de control
		// En este caso la intensidad de la luz y si se muestran o no los ejes
		this.guiControls = {
			// En el contexto de una función   this   alude a la función
			lightIntensity : 0.5,
			axisOnOff : true
		}

		// Se crea una sección para los controles de esta clase
		var folder = gui.addFolder ('Luz y Ejes');

		// Se le añade un control para la intensidad de la luz
		folder.add (this.guiControls, 'lightIntensity', 0, 1, 0.1)
		.name('Intensidad de la Luz : ')
		.onChange ( (value) => this.setLightIntensity (value) );

		// Y otro para mostrar u ocultar los ejes
		folder.add (this.guiControls, 'axisOnOff')
		.name ('Mostrar ejes : ')
		.onChange ( (value) => this.setAxisVisible (value) );

		return gui;
	}

	createLights () {
		// Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
		// La luz ambiental solo tiene un color y una intensidad
		// Se declara como   var   y va a ser una variable local a este método
		//    se hace así puesto que no va a ser accedida desde otros métodos
		var dirLightTarget = new THREE.Object3D();
		dirLightTarget.position.set(0,15,0);
		var ambientLight = new THREE.AmbientLight(0xccddee, 2/*0.6 */);
		var directionLight = new THREE.DirectionalLight(0xc9fcf9,0.9);
		directionLight.position.set(-50,65,100);
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
		this.add(dirLightTarget);

		// Se crea una luz focal que va a ser la luz principal de la escena
		// La luz focal, además tiene una posición, y un punto de mira
		// Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
		// En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
		this.spotLight = new THREE.SpotLight( 0xffffff, this.guiControls.lightIntensity );
		this.spotLight.position.set( 0, 1, 0 );
		// this.add (this.spotLight);

		this.add(new THREE.CameraHelper(directionLight.shadow.camera));
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

	onDoubleClick(event)
	{
		if(event.button == 0)
		{

			this.raycaster.setFromCamera(this.mouse,this.camera);

			var pickedObjects = this.raycaster.intersectObjects(this.pickableObjects, true);

			if(pickedObjects.length>0)
			{
				var selectedObject = pickedObjects[0].object.userData;
				var selectedPoint = pickedObjects[0].point;
				console.log("pick! "+selectedObject.name);
				console.log(pickedObjects[0]);
				switch(selectedObject.name)
				{
					case "clockHandHour":
						this.sceneState = MyScene.PICKING_HOURS;
						break;
					case "clockHandMinute":
						this.sceneState = MyScene.PICKING_MINUTES;
						break;
				}
			}
			else
			{
				this.sceneState = MyScene.NO_ACTION;
				this.cameraRotation = false;
			}
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
		this.mouse = {x:0,y:0};

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
			})
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
	}

	update () {

		if (this.stats) this.stats.update();

		this.deltaTime = this.clock.getDelta();

		// Se actualizan los elementos de la escena para cada frame

		// Se actualiza la posición de la cámara según su controlador
		this.updateCamera();
		//this.cameraControl.update();

		// Se actualiza el resto del modelo

		// Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
		this.renderer.render (this, this.getCamera());

		// Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
		// Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
		// Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
		requestAnimationFrame(() => this.update())

		this.updateClockModel();

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

	window.addEventListener("dblclick", (event) => scene.onDoubleClick(event));

	// Que no se nos olvide, la primera visualización.
	scene.update();
});
