// Clases de la biblioteca
import * as THREE from './libs/three.module.js'
import { GUI } from './libs/dat.gui.module.js'
import { TrackballControls } from './libs/TrackballControls.js'
import { Stats } from './libs/stats.module.js'
import { Object3D } from './libs/three.module.js';

// Clases de mi proyecto
import { Church } from './Church.js';
import { ChurchBench } from './ChurchBench.js';
import { Clock } from './Clock.js';
import { Column } from './Column.js';
import { Fachade } from './Fachade.js';

/// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */

class MyScene extends THREE.Scene {
	constructor (myCanvas)
	{
		super();

		// Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
		this.renderer = this.createRenderer(myCanvas);

		// Se añade a la gui los controles para manipular los elementos de esta clase
		this.gui = this.createGUI ();

		this.initStats();

		// Construimos los distinos elementos que tendremos en la escena

		// Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
		// Tras crear cada elemento se añadirá a la escena con   this.add(variable)
		this.createLights ();

		// Tendremos una cámara con un control de movimiento con el ratón
		this.createCamera ();

		// Creamos reloj
		this.clock = new THREE.Clock();

		// Un suelo 
		//this.createGround ();

		// Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
		this.axis = new THREE.AxesHelper (5);
		this.add (this.axis);

		// Por último creamos el modelo.
		// El modelo puede incluir su parte de la interfaz gráfica de usuario. Le pasamos la referencia a 
		// la gui y el texto bajo el que se agruparán los controles de la interfaz que añada el modelo.
		var church = new Church ();
		// var bench = new ChurchBench ();
		var clock = new Clock ();
		var fachade = new Fachade ();

		clock.position.set(29,0,2);
		

		for(var i = 0; i < 5; i++)
		{
			var columna = new Column ();
			columna.position.set(0,0,i*9-15);
			this.add (columna);
		}

		var benchScale = 0.2;
		var benchLength = 4;
		var benchSeparation = 10;
		for(var i = 0; i < 10; i++)
		{
			for(var j = -1; j < 2;j+=2)
			{
				var bench0 = new ChurchBench ();
				bench0.position.set(benchSeparation*j,0,i*4.5-15);
				bench0.rotation.set(0,Math.PI,0);
				bench0.scale.set(benchScale*benchLength,benchScale,benchScale);
				this.add (bench0);
			}

		}

		this.add (church);
		// this.add (bench);
		this.add (clock);
		this.add (fachade);

		/*
		var boundingBox = new THREE.Box3 ().setFromObject (church);
		var boundingBoxHelper = new THREE.Box3Helper (boundingBox, 0xffff00);
		this.add (boundingBoxHelper);
		boundingBoxHelper.visible = true;

		var vector = new THREE.Vector3 ();
		boundingBox.getSize(vector);
		console.log (vector);
		*/
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
		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		// También se indica dónde se coloca
		// Y hacia dónde mira
		//this.look = new THREE.Vector3 (0,0,0);
		//this.camera.lookAt(this.look);
		this.cameraObj = new THREE.Object3D ();
		this.cameraObj.position.set (0, 2, 0);
		this.cameraObj.add (this.camera);
		this.add (this.cameraObj);

		this.cameraHAngle = 0.0;
		this.cameraVAngle = 0.0;

		this.cameraMovement = {
			right: 0, left: 0, front: 0, back: 0
		};

		/*
		// Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
		this.cameraControl = new TrackballControls (this.camera, this.renderer.domElement);
		// Se configuran las velocidades de los movimientos
		this.cameraControl.rotateSpeed = 5;
		this.cameraControl.zoomSpeed = 2;
		this.cameraControl.panSpeed = 0.5;
		// Debe orbitar con respecto al punto de mira de la cámara
		this.cameraControl.target = this.look;
		*/
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
		var ambientLight = new THREE.AmbientLight(0xccddee, 0.35);
		// La añadimos a la escena
		this.add (ambientLight);

		// Se crea una luz focal que va a ser la luz principal de la escena
		// La luz focal, además tiene una posición, y un punto de mira
		// Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
		// En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
		this.spotLight = new THREE.SpotLight( 0xffffff, this.guiControls.lightIntensity );
		this.spotLight.position.set( 60, 60, 40 );
		this.add (this.spotLight);
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
		if (event.which == 1) {

			this.cameraRotation = false;
		}
	}

	onMouseMove (event)
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

	keyboardKeyDown (event)
	{
		this.key = event.which || event.key;

		switch (String.fromCharCode (this.key).toUpperCase())
		{
			case 'W': this.cameraMovement.front = 1; break;
			case 'A': this.cameraMovement.left = 1; break;
			case 'S': this.cameraMovement.back = 1; break;
			case 'D': this.cameraMovement.right = 1; break;
		}
	}

	keyboardKeyUp (event)
	{
		this.key = event.which || event.key;

		switch (String.fromCharCode (this.key).toUpperCase())
		{
			case 'W': this.cameraMovement.front = 0; break;
			case 'A': this.cameraMovement.left = 0; break;
			case 'S': this.cameraMovement.back = 0; break;
			case 'D': this.cameraMovement.right = 0; break;
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

			this.cameraObj.position.x += Math.sin (rot)*cameraMoveSpeed*this.deltaTime;
			this.cameraObj.position.z += Math.cos (rot)*cameraMoveSpeed*this.deltaTime;
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

	// Que no se nos olvide, la primera visualización.
	scene.update();
});
