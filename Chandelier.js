// Clases de la biblioteca
import * as THREE from './libs/three.module.js'
import { CSG } from './libs/CSG-v2.js'

// Clases del proyecto
import { Candle } from './ElectricCandle.js';
import { Message } from './Message.js';

class Chandelier extends THREE.Object3D {
	constructor (chandelierRadius = 8, chandelierRotation = Math.PI/3.0, shadows = false)
	{
		super();

		// Material del lampadario
		//var chandelierMaterial = new THREE.MeshPhongMaterial ({ color : 0x6b1e00 });

		var loader = new THREE.TextureLoader ();
		var chandelierTexture = loader.load ("imgs/Wood_024_basecolor.jpg");
		var moneyBoxTexture = loader.load ("imgs/Wood_024_basecolor.jpg")

		chandelierTexture.wrapT = THREE.RepeatWrapping;
		chandelierTexture.wrapS = THREE.RepeatWrapping;
		chandelierTexture.repeat.set (15.0, 15.0);

		var chandelierMaterial = new THREE.MeshPhongMaterial ({ map : chandelierTexture, color : 0xffffff });

		moneyBoxTexture.wrapT = THREE.RepeatWrapping;
		moneyBoxTexture.wrapS = THREE.RepeatWrapping;
		moneyBoxTexture.repeat.set (0.75, 0.75);

		var moneyBoxMaterial = new THREE.MeshPhongMaterial ({ map : moneyBoxTexture, color : 0xffffff });

		// Opciones del lampadario
		this.chandelierOptions = {
			l : chandelierRadius,
			r : chandelierRotation
		};

		// Caja para las monedas
		var moneyBoxGeometry = new MoneyBox (this.chandelierOptions.l/8.0);
		moneyBoxGeometry.translate (0.0, this.chandelierOptions.l+this.chandelierOptions.l/20.0, this.chandelierOptions.l/3.0-this.chandelierOptions.l/14.0);

		var moneyBoxMesh = new THREE.Mesh (moneyBoxGeometry, moneyBoxMaterial);
		
		this.moneyBox = new THREE.Object3D ();
		this.moneyBox.name = "moneyBox";
		moneyBoxMesh.userData = this.moneyBox;
		this.moneyBox.add (moneyBoxMesh);
		
		// Para habilitar las sombras
		moneyBoxMesh.castShadow = true;
		moneyBoxMesh.receiveShadow = true;

		// Geometrías para construir el lampadario
		// Base para las velas
		var holderGeometry = new TopHolder (this.chandelierOptions.l, this.chandelierOptions.r);
		holderGeometry.translate (0.0, this.chandelierOptions.l, this.chandelierOptions.l/16.0)

		var holderMesh = new THREE.Mesh (holderGeometry, chandelierMaterial);

		// Para habilitar las sombras
		holderMesh.castShadow = true;
		holderMesh.receiveShadow = true;
		
		// Laterales
		var lateralGeometryLeft = new Lateral (this.chandelierOptions.l);
		lateralGeometryLeft.translate (0.0, 0.0, this.chandelierOptions.l);
		lateralGeometryLeft.rotateY (-this.chandelierOptions.r/2.0);
		lateralGeometryLeft.translate (0.0, this.chandelierOptions.l, -this.chandelierOptions.l+this.chandelierOptions.l/16.0);
		var lateralGeometryRight = new Lateral (this.chandelierOptions.l);
		lateralGeometryRight.translate (0.0, 0.0, this.chandelierOptions.l);
		lateralGeometryRight.rotateY (this.chandelierOptions.r/2.0);
		lateralGeometryRight.translate (0.0, this.chandelierOptions.l, -this.chandelierOptions.l+this.chandelierOptions.l/16.0);

		var lateralMeshLeft = new THREE.Mesh (lateralGeometryLeft, chandelierMaterial);
		
		// Para habilitar las sombras
		lateralMeshLeft.castShadow = true;
		lateralMeshLeft.receiveShadow = true;
		
		var lateralMeshRight = new THREE.Mesh (lateralGeometryRight, chandelierMaterial);

		// Para habilitar las sombras
		lateralMeshRight.castShadow = true;
		lateralMeshRight.receiveShadow = true;

		// Base
		var baseGeometry = new Base (this.chandelierOptions.l);
		var baseMesh = new THREE.Mesh (baseGeometry, chandelierMaterial);

		// Para habilitar las sombras
		baseMesh.castShadow = true;
		baseMesh.receiveShadow = true;

		// Objeto que almacena el lampadario
		var chandelier = new THREE.Object3D ();
		chandelier.add (holderMesh);
		chandelier.add (this.moneyBox);
		chandelier.add (lateralMeshLeft);
		chandelier.add (lateralMeshRight);
		chandelier.add (baseMesh);

		// Velas
		this.numCandles = [];
		this.totalNumCandles = 0;
		this.candles = [];
		this.candlesPowered = [ 0, 0, 0 ];
		
		var numCandles = 16;
		
		var heightVar = 0.3;
		var widthVar = 0.8;

		for (var i = 0; i < 4; ++i) {

			var angle = this.chandelierOptions.r / (numCandles-1);
			var alpha = (2.0*Math.PI)-(this.chandelierOptions.r/2.0);

			var candlesRow = [];

			for (var j = 0; j < numCandles; ++j) {

				var x = (this.chandelierOptions.l-(widthVar*(i+1))) * Math.cos (alpha) - this.chandelierOptions.l + 2.1;
				var z = (this.chandelierOptions.l-(widthVar*(i))) * Math.sin (alpha);
	
				var candle = new Candle ();
				candle.scale.set (0.25, 0.25, 0.25);
				candle.position.set (z, this.chandelierOptions.l + (0.9 + heightVar*i), x);

				candlesRow.push (candle);

				if (candle.candlePower) {
					
					if (j < 5) this.candlesPowered[0]++;
					else if (5 <= j && j < numCandles-5) this.candlesPowered[1]++;
					else this.candlesPowered[2]++;
				}
				
				chandelier.add (candle);
	
				alpha += angle;
				this.totalNumCandles++;
			}

			this.numCandles.push (numCandles);
			this.candles.push (candlesRow);
			numCandles--;
		}

		// Se crea la luz
		this.createLights(shadows);

		// Mensajes
		var messages = [
			{ msg : new Message ("2 horas", 50.0, 10.0), row : 0, col : 15 },
			{ msg : new Message ("3 horas", 50.0, 10.0), row : 2, col : 1 },
			{ msg : new Message ("6 horas", 50.0, 10.0), row : 1, col : 3 },
			{ msg : new Message ("9 horas", 50.0, 10.0), row : 0, col : 13 },
			{ msg : new Message ("10 horas", 40.0, 10.0), row : 3, col : 5 },
			{ msg : new Message ("15 horas", 40.0, 10.0), row : 3, col : 8 },
			{ msg : new Message ("18 horas", 40.0, 10.0), row : 1, col : 7 },
			{ msg : new Message ("21 horas", 40.0, 10.0), row : 2, col : 4 },
			{ msg : new Message ("23 horas", 40.0, 10.0), row : 0, col : 2 },
			{ msg : new Message ("0 minutos"), row : 3, col : 11 },
			{ msg : new Message ("10 minutos"), row : 1, col : 14 },
			{ msg : new Message ("15 minutos"), row : 3, col : 0 },
			{ msg : new Message ("30 minutos"), row : 2, col : 10 },
			{ msg : new Message ("35 minutos"), row : 0, col : 7 },
			{ msg : new Message ("45 minutos"), row : 1, col : 9 },
			{ msg : new Message ("50 minutos"), row : 2, col : 13 },
		];

		messages[0].msg.rotation.set (0.0, Math.PI/4.0, 0.0);
		messages[0].msg.position.set (5.4, 0.0, -0.2);
		messages[1].msg.rotation.set (0.0, -Math.PI/4.0, 0.0);
		messages[1].msg.position.set (-3.8, 0.0, -1.0);
		messages[2].msg.position.set (-2.8, 0.0, 0.3);
		messages[3].msg.rotation.set (0.0, Math.PI/16.0, 0.0);
		messages[3].msg.position.set (4.6, 0.0, 0.3);		
		messages[4].msg.position.set (-0.6, 0.0, -0.8);
		messages[5].msg.rotation.set (0.0, Math.PI/10.0, 0.0);
		messages[5].msg.position.set (1.4, 0.0, -0.9);
		messages[6].msg.rotation.set (0.0, -Math.PI/8.0, 0.0);
		messages[6].msg.position.set (-0.1, 0.0, 0.8);
		messages[7].msg.rotation.set (0.0, -Math.PI/24.0, 0.0);
		messages[7].msg.position.set (-1.8, 0.0, -0.2);
		messages[8].msg.rotation.set (0.0, -Math.PI/3.0, 0.0);
		messages[8].msg.position.set (-4.2, 0.0, 0.6);
		messages[9].msg.rotation.set (0.0, Math.PI/12.0, 0.0);
		messages[9].msg.position.set (3.2, 0.0, -1.6);
		messages[10].msg.rotation.set (0.0, Math.PI/10.0, 0.0);
		messages[10].msg.position.set (4.9, 0.0, -0.7);
		messages[11].msg.rotation.set (0.0, -Math.PI/4.0, 0.0);
		messages[11].msg.position.set (-3.8, 0.0, -2.0);
		messages[12].msg.position.set (2.4, 0.0, -0.4);
		messages[13].msg.position.set (-0.4, 0.0, 1.6);
		messages[14].msg.rotation.set (0.0, Math.PI/4.0, 0.0);
		messages[14].msg.position.set (1.6, 0.0, 0.6);
		messages[15].msg.rotation.set (0.0, Math.PI/24.0, 0.0);
		messages[15].msg.position.set (4.2, 0.0, -1.3);

		for (var i = 0; i < messages.length; ++i) {
			
			messages[i].msg.position.y = this.chandelierOptions.l + (0.9+0.3*messages[i].row) + 0.01;
			chandelier.add (messages[i].msg);
		}

		this.add (chandelier);

		// Reloj de referencia para las actualizaciones
		this.refClock = new THREE.Clock ();
		this.secondsElapsed = [ 0.0, 0.0, 0.0 ];
	}

	powerOffCandles ()
	{
		if (this.candlesPowered[0] || this.candlesPowered[2] || this.candlesPowered[3]) {

			for (var i = 0; i < this.candles.length; ++i) {
				for (var j = 0; j < this.candles[i].length; ++j) {

					this.candles[i][j].candlePower = false;
				}
			}
		}

		this.candlesPowered = [ 0, 0, 0 ];
	}

	powerRandomCandles ()
	{
		var numCandles = (Math.random() * (this.totalNumCandles - 1) + 1).toFixed();

		if (numCandles > 0) {
			
			this.powerOffCandles();

			for (var i = 0; i < numCandles; ++i) {
				
				var row = (Math.random() * (this.candles.length-1)).toFixed();
				var position = (Math.random() * (this.candles[row].length-1)).toFixed();
				var posAux = position;
								
				while (this.candles[row][posAux].candlePower == true) {
					
					posAux = (posAux+1) % this.candles[row].length;

					if (posAux == position) {
						
						row = (row+1) % this.candles.length;

						position %= this.candles[row].length;
						posAux %= this.candles[row].length;
					}
				}
				
				position = posAux;
				this.candles[row][position].candlePower = true;

				if (position < 5) this.candlesPowered[0]++;
				else if (5 <= position && position < this.candles[row].length-5) this.candlesPowered[1]++;
				else this.candlesPowered[2]++;
			}

			for (var i = 0; i < this.candles.length; ++i) {
				for (var j = 0; j < this.candles[i].length; ++j) {

					this.candles[i][j].setCandlePower();
				}
			}
		}
	}

	powerSolutionCandles ()
	{
		this.powerOffCandles();

		this.candles[2][10].candlePower = true;
		this.candles[3][5].candlePower = true;

		this.candlesPowered[0] = 6;
		this.candlesPowered[1] = 6;
		this.candlesPowered[2] = 6;

		for (var i = 0; i < this.candles.length; ++i) {
			for (var j = 0; j < this.candles[i].length; ++j) {

				this.candles[i][j].setCandlePower();
			}
		}
	}

	createLights (shadows)
	{
		this.pointLights = [];

		var angle = this.chandelierOptions.r / (3-0.5);
		var alpha = (2.0*Math.PI)-(this.chandelierOptions.r/2.5);
		
		var widthVar = 0.8;

		for (var i = 0; i < 3; ++i) {

			var pointLight = new THREE.PointLight (0xffe138, 0.3, 0, 0);

			pointLight.position.set (
				(this.chandelierOptions.l-widthVar) * Math.sin (alpha), 
				this.chandelierOptions.l + 3.0, 
				(this.chandelierOptions.l-(widthVar*2)) * Math.cos (alpha) - this.chandelierOptions.l + 2.1);
				pointLight.visible = (this.candlesPowered[i]) ? true : false;
	
			alpha += angle;

			// Opciones para las sombras
			pointLight.castShadow = shadows;
			pointLight.shadow.mapSize.width = 512;
			pointLight.shadow.mapSize.height = 512;
			pointLight.shadow.camera.near = 0.5;
			pointLight.shadow.camera.far = 500;

			this.pointLights.push (pointLight);
			this.add (pointLight);
		}
	}

	update ()
	{
		var clockDelta = this.refClock.getDelta();
		
		for (var i = 0; i < this.candlesPowered.length; ++i) {
			
			this.secondsElapsed[i] += clockDelta;
			
			if (this.secondsElapsed[i] >= 0.15) {

				if (this.candlesPowered[i]) {

					this.pointLights[i].visible = true;

					var min = (this.candlesPowered[i] * 0.3) / this.numCandles[i];
					var max = (this.candlesPowered[i] * 0.5) / this.numCandles[i];
		
					this.pointLights[i].intensity = Math.random() * (max - min) + min;
					this.secondsElapsed[i] = 0.0;
				}
				else {
					
					this.pointLights[i].visible = false;
					this.secondsElapsed[i] = 0.0;
				}
			}
		}
	}
}

class TopHolder extends THREE.Object3D {
	constructor (radius = 8, angle = Math.PI/3.0, resolution = 24)
	{
		super();

		// Opciones del soporte
		var holderOptions = {
			d : radius,
			a : angle,
			r : resolution
		};

		// Construcción del shape
		var chandelierShape = new THREE.Shape ();
		chandelierShape.moveTo (-2.0, 0.0);
		chandelierShape.lineTo (2.0, 0.0);
		chandelierShape.lineTo (2.0, 0.5);
		chandelierShape.bezierCurveTo (2.05, 0.5, 2.05, 0.6, 2.0, 0.6);
		chandelierShape.lineTo (1.2, 0.6);
		chandelierShape.lineTo (1.2, 0.8);
		chandelierShape.bezierCurveTo (1.25, 0.8, 1.25, 0.9, 1.2, 0.9);
		chandelierShape.lineTo (0.4, 0.9);
		chandelierShape.lineTo (0.4, 1.1);
		chandelierShape.bezierCurveTo (0.45, 1.1, 0.45, 1.2, 0.4, 1.2);
		chandelierShape.lineTo (-0.4, 1.2);
		chandelierShape.lineTo (-0.4, 1.4);;
		chandelierShape.bezierCurveTo (-0.35, 1.4, -0.35, 1.5, -0.4, 1.5);
		chandelierShape.lineTo (-1.2, 1.5);
		chandelierShape.lineTo (-1.2, 1.7);
		chandelierShape.bezierCurveTo (-1.15, 1.7, -1.15, 1.8, -1.2, 1.8);
		chandelierShape.lineTo (-1.9, 1.8);
		chandelierShape.lineTo (-1.9, 1.9);
		chandelierShape.bezierCurveTo (-1.85, 1.9, -1.85, 2.0, -1.9, 2.0);
		chandelierShape.lineTo (-2.0, 2.0);
		chandelierShape.lineTo (-2.0, 0.0);

		var chandelierPoints = chandelierShape.extractPoints (6).shape;
		chandelierPoints.forEach (point => {
			point.set (point.x + holderOptions.d, point.y);
		});

		chandelierShape = new THREE.Shape (chandelierPoints);

		// Para ver el contorno del shape
		var chandelierLineGeom = new THREE.BufferGeometry ();
		chandelierLineGeom.setFromPoints (chandelierShape.extractPoints (6).shape);
		var chandelierLine = new THREE.Line (chandelierLineGeom, new THREE.MeshPhongMaterial ({ color : 0x000000 }));

		// Construcción de la revolución
		var chandelierGeom = new THREE.LatheGeometry (chandelierPoints, holderOptions.r, (2.0*Math.PI)-(holderOptions.a/2.0), holderOptions.a);
		chandelierGeom.translate (0.0, 0.0, -holderOptions.d);

		//this.add (chandelierLine);

		return chandelierGeom;
	}
}

class MoneyBox extends THREE.Object3D {
	constructor(boxWidth)
	{
		super();

		// Opciones de la caja
		var boxOptions = {
			w : boxWidth,
			h : 2.0*boxWidth/3.0
		};

		// Material para la caja
		var boxMaterial = new THREE.MeshNormalMaterial ();

		var bigBox = new THREE.BoxGeometry (boxOptions.w, boxOptions.h, boxOptions.h, 1, 1, 1);
		var smallBox = new THREE.BoxGeometry (boxOptions.w-boxOptions.w/10.0, boxOptions.h, boxOptions.h-boxOptions.w/10.0, 1, 1, 1);
		smallBox.translate (0.0, boxOptions.h-boxOptions.h/10.0, 0.0);
		var verySmallBox = new THREE.BoxGeometry (boxOptions.w-boxOptions.w/1.25, boxOptions.h, boxOptions.h-boxOptions.w/1.6, 1, 1, 1)
		verySmallBox.translate (0.0, boxOptions.h/10.0, 0.0);

		var bigBoxMesh = new THREE.Mesh (bigBox, boxMaterial);
		var smallBoxMesh = new THREE.Mesh (smallBox, boxMaterial);
		var verySmallBoxMesh = new THREE.Mesh (verySmallBox, boxMaterial);

		var CSGBox = new CSG ();
		CSGBox.subtract ([ bigBoxMesh, smallBoxMesh ]);
		CSGBox.subtract ([ verySmallBoxMesh ])

		var moneyBoxGeometry = CSGBox.toGeometry();

		return moneyBoxGeometry;
	}
}

class Lateral extends THREE.Object3D {
	constructor (radius = 8, resolution = 12)
	{
		super();

		// Opciones del lateral
		var lateralOptions = {
			l : 0.01,
			d : radius,
			r : resolution
		};

		// Construcción del shape
		var lateralShape = new THREE.Shape ();
		lateralShape.moveTo (-2.0, 0.0);
		lateralShape.lineTo (2.0, 0.0);
		lateralShape.lineTo (2.0, 0.6);
		lateralShape.lineTo (-1.9, 2.0);
		lateralShape.lineTo (-2.0, 2.0);
		lateralShape.lineTo (-2.0, 0.0);

		// Para ver el contorno del shape
		var lateralLineGeom = new THREE.BufferGeometry ();
		lateralLineGeom.setFromPoints (lateralShape.extractPoints (6).shape);
		var lateralLine = new THREE.Line (lateralLineGeom, new THREE.MeshPhongMaterial ({ color : 0x000000 }));

		// Construcción de la extrusión
		var lateralExtrudeOptions = {
			depth : lateralOptions.l,
			steps : 1,
			curveSegments : lateralOptions.r,
			bevelThickness : 0.1,
			bevelSize : 0.05,
			bevelSegments: lateralOptions.r
		};
		var lateralGeometry = new THREE.ExtrudeGeometry (lateralShape, lateralExtrudeOptions);
		lateralGeometry.rotateY (-Math.PI / 2.0);
		lateralGeometry.translate (-lateralOptions.l/2.0, 0.0, 0.0);

		//this.add (lateralLine);

		return lateralGeometry;
	}
}

class Base extends THREE.Object3D {
	constructor (baseHeight, baseResolution = 24)
	{
		super();

		// Opciones de la base
		var baseOptions = {
			h : baseHeight,
			l : baseHeight/8.0,
			r : baseResolution
		};

		// Construcción del shape
		var baseShape = new THREE.Shape ();
		baseShape.moveTo (0.001, 0.0);
		baseShape.lineTo (baseOptions.l+0.5, 0.0);
		baseShape.lineTo (baseOptions.l+0.5, 0.5);
		baseShape.lineTo (baseOptions.l, 0.5);
		baseShape.lineTo (baseOptions.l, baseOptions.h/2.0);
		baseShape.lineTo (baseOptions.l+0.15, baseOptions.h/2.0);
		baseShape.bezierCurveTo (baseOptions.l+0.25, baseOptions.h/2.0, baseOptions.l+0.25, (baseOptions.h/2.0)+0.1, baseOptions.l+0.15, (baseOptions.h/2.0)+0.1);
		baseShape.lineTo (baseOptions.l+0.15, baseOptions.h);
		baseShape.lineTo (0.001, baseOptions.h);

		// Para ver el contorno del shape
		var baseLineGeom = new THREE.BufferGeometry ();
		baseLineGeom.setFromPoints (baseShape.extractPoints (6).shape);
		var baseLine = new THREE.Line (baseLineGeom, new THREE.MeshPhongMaterial ({ color : 0x000000 }));

		// Construcción de la revolución
		var baseGeometry = new THREE.LatheGeometry (baseShape.extractPoints (6).shape, baseOptions.r, 0.0, 2.0*Math.PI);

		this.add (baseLine);

		return baseGeometry;
	}
}

export { Chandelier }
