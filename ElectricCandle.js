import * as THREE from './libs/three.module.js'
import { MTLLoader } from './libs/MTLLoader.js'
import { OBJLoader } from './libs/OBJLoader.js'

class Candle extends THREE.Object3D {
	constructor(powerOn = false)
	{
		super();

		// Se crea la interfaz
		//this.createGUI (gui, titleGui);

		// Opciones de la llama
		this.flameOffMaterial = new THREE.MeshLambertMaterial ({ color : 0xfaefd4 });
		this.flameOnMaterial = new THREE.MeshLambertMaterial ({ color : 0xfaefd4, emissive : 0xffe44a, emissiveIntensity : 1 });
		//this.flameOnMaterial = new THREE.MeshLambertMaterial ({ color : 0x000000 });
		this.candlePower = powerOn;

		// Propiedades de la vela
		var candleMaterial = new THREE.MeshLambertMaterial ({ color : 0xffebb8 });
		var candleContainerMaterial = new THREE.MeshPhongMaterial ({ color : 0x353637, specular : 0xe6e7e7, shininess : 50 });
		var objMesh = new THREE.Object3D ();

		// Se crea la base de la vela
		var candleBaseGeometry = new CandleBase (48);
		
		var containerMesh = new THREE.Mesh (candleBaseGeometry[0], candleContainerMaterial);
		// Para habilitar las sombras
		containerMesh.castShadow = true; 
		containerMesh.receiveShadow = true;

		var candleMesh = new THREE.Mesh (candleBaseGeometry[1], candleMaterial);
		// Para habilitar las sombras
		candleMesh.castShadow = true; 
		candleMesh.receiveShadow = true;

		// Se crea la luz
		//this.createLights();

		// Se crea la llama
		var flameGeometry = new Flame ();
		flameGeometry.scale (1.5, 1.5, 1.5);
		flameGeometry.translate (0.0, 0.4, 0.0);
		
		this.flameMesh = new THREE.Mesh (flameGeometry, (this.candlePower) ? this.flameOnMaterial : this.flameOffMaterial);
		this.setCandlePower (this.candlePower);

		objMesh.add (this.flameMesh);
		objMesh.add (containerMesh);
		objMesh.add (candleMesh);
		this.add (objMesh);
	}

	setCandlePower ()
	{
		this.flameMesh.material = (this.candlePower) ? this.flameOnMaterial : this.flameOffMaterial;
		//this.pointLight.visible = (candlePower) ? true : false;
	}

	createGUI (gui, titleGui)
	{
		this.guiControls = {
			candlePower : false
		};

		// Sección para para los controles de la vela
		var folder = gui.addFolder (titleGui);

		// Se añaden los componentes de la interfaz
		folder.add (this.guiControls, 'candlePower').name ("Vela On/Off : ").onChange ((value) => this.setCandlePower (value));
	}

	update ()
	{
		
	}
}

class Flame extends THREE.Object3D {
	constructor (resolution = 12)
	{
		super();

		var flameOptions = {
			r : resolution
		};

		// Construcción del shape
		var flameShape = new THREE.Shape ();
		flameShape.moveTo (0.0001, 0.0);
		flameShape.bezierCurveTo (0.015, 0.0, 0.025, 0.01, 0.025, 0.02);
		flameShape.quadraticCurveTo (0.025, 0.03, 0.015, 0.05);
		flameShape.quadraticCurveTo (0.00675, 0.0665, 0.002, 0.095);
		flameShape.quadraticCurveTo (0.00115, 0.1, 0.0001, 0.1);

		// Para ver el contorno del shape
		var flameLineGeom = new THREE.BufferGeometry ();
		flameLineGeom.setFromPoints (flameShape.extractPoints (6).shape);
		var flameLine = new THREE.Line (flameLineGeom, new THREE.MeshPhongMaterial ({ color : 0x000000 }));

		// Construcción de la revolución
		var flameGeom = new THREE.LatheGeometry (flameShape.extractPoints (6).shape, flameOptions.r, 0.0, 2.0*Math.PI);
		flameGeom.scale (2.0, 2.0, 2.0);

		//this.add (flameLine);

		return flameGeom;
	}
}

class CandleBase extends THREE.Object3D {
	constructor (resolution = 12)
	{
		super();

		// Opciones de la base de la vela
		var baseOptions = {
			r : resolution
		}

		// Construcción del shape
		var containerShape = new THREE.Shape ();
		containerShape.moveTo (0.001, 0.0);
		containerShape.lineTo (0.6, 0.0);
		containerShape.bezierCurveTo (0.9, 0.0, 1.0, 0.1, 1.0, 0.3);
		containerShape.lineTo (1.0, 0.5);
		containerShape.lineTo (0.995, 0.5);
		containerShape.lineTo (0.995, 0.3);
		containerShape.bezierCurveTo (0.995, 0.1, 0.895, 0.005, 0.6, 0.005);
		containerShape.lineTo (0.001, 0.005);

		// Para ver el contorno del shape
		var containerLineGeom = new THREE.BufferGeometry ();
		containerLineGeom.setFromPoints (containerShape.extractPoints (6).shape);
		var containerLine = new THREE.Line (containerLineGeom, new THREE.MeshPhongMaterial ({ color : 0x000000 }));

		var containerGeom = new THREE.LatheGeometry (containerShape.extractPoints (6).shape, baseOptions.r, 0.0, 2.0*Math.PI);
		
		// Construcción del shape
		var paraffinShape = new THREE.Shape ();
		paraffinShape.moveTo (0.001, 0.005);
		paraffinShape.lineTo (0.6, 0.005);
		paraffinShape.bezierCurveTo (0.895, 0.005, 0.995, 0.1, 0.995, 0.3);
		paraffinShape.lineTo (0.995, 0.3);
		paraffinShape.lineTo (0.995, 0.4);
		paraffinShape.lineTo (0.7, 0.4);
		paraffinShape.quadraticCurveTo (0.7, 0.35, 0.65, 0.35);
		paraffinShape.lineTo (0.25, 0.35);
		paraffinShape.bezierCurveTo (0.225, 0.35, 0.225, 0.4, 0.2, 0.4);
		paraffinShape.lineTo (0.001, 0.4);

		// Para ver el contorno del shape
		var paraffinLineGeom = new THREE.BufferGeometry ();
		paraffinLineGeom.setFromPoints (paraffinShape.extractPoints (6).shape);
		var paraffinLine = new THREE.Line (paraffinLineGeom, new THREE.MeshPhongMaterial ({ color : 0x000000 }));

		var paraffinGeom = new THREE.LatheGeometry (paraffinShape.extractPoints (6).shape, baseOptions.r, 0.0, 2.0*Math.PI);

		this.add (containerLine);
		this.add (paraffinLine);

		return [ containerGeom, paraffinGeom ];
	}
}

export { Candle }
