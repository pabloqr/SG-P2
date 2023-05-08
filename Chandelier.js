import * as THREE from './libs/three.module.js'

class Chandelier extends THREE.Object3D {
	constructor (chandelierRadius = 8, chandelierRotation = Math.PI/3.0)
	{
		super();

		// Material del lampadario
		//var chandelierMaterial = new THREE.MeshPhongMaterial ({ color : 0x6b1e00 });

		var loader = new THREE.TextureLoader ();
		var texture = loader.load ("imgs/Wood_024_basecolor.jpg");

		texture.wrapT = THREE.RepeatWrapping;
		texture.wrapS = THREE.RepeatWrapping;
		texture.repeat.set (8.0, 8.0);

		var chandelierMaterial = new THREE.MeshPhongMaterial ({ map : texture, color : 0xffffff });

		// Geometrías para construir el lampadario
		// Base para las velas
		var holderGeometry = new TopHolder (chandelierRadius, chandelierRotation);
		holderGeometry.translate (0.0, chandelierRadius, chandelierRadius/16.0)

		var holderMesh = new THREE.Mesh (holderGeometry, chandelierMaterial);
		
		// Laterales
		var lateralGeometryLeft = new Lateral (chandelierRadius);
		lateralGeometryLeft.translate (0.0, 0.0, chandelierRadius);
		lateralGeometryLeft.rotateY (-chandelierRotation/2.0);
		lateralGeometryLeft.translate (0.0, chandelierRadius, -chandelierRadius+chandelierRadius/16.0);
		var lateralGeometryRight = new Lateral (chandelierRadius);
		lateralGeometryRight.translate (0.0, 0.0, chandelierRadius);
		lateralGeometryRight.rotateY (chandelierRotation/2.0);
		lateralGeometryRight.translate (0.0, chandelierRadius, -chandelierRadius+chandelierRadius/16.0);

		var lateralMeshLeft = new THREE.Mesh (lateralGeometryLeft, chandelierMaterial);
		var lateralMeshRight = new THREE.Mesh (lateralGeometryRight, chandelierMaterial);

		// Base
		var baseGeometry = new Base (chandelierRadius);
		var baseMesh = new THREE.Mesh (baseGeometry, chandelierMaterial);

		// Objeto que almacena el lampadario
		var chandelier = new THREE.Object3D ();
		chandelier.add (holderMesh);
		chandelier.add (lateralMeshLeft);
		chandelier.add (lateralMeshRight);
		chandelier.add (baseMesh);

		this.add (chandelier);
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
		//baseShape.moveTo (-baseOptions.l-0.5, 0.0);
		baseShape.moveTo (0.001, 0.0);
		baseShape.lineTo (baseOptions.l+0.5, 0.0);
		baseShape.lineTo (baseOptions.l+0.5, 0.5);
		baseShape.lineTo (baseOptions.l, 0.5);
		baseShape.lineTo (baseOptions.l, baseOptions.h/2.0);
		baseShape.lineTo (baseOptions.l+0.15, baseOptions.h/2.0);
		baseShape.bezierCurveTo (baseOptions.l+0.25, baseOptions.h/2.0, baseOptions.l+0.25, (baseOptions.h/2.0)+0.1, baseOptions.l+0.15, (baseOptions.h/2.0)+0.1);
		baseShape.lineTo (baseOptions.l+0.15, baseOptions.h);
		baseShape.lineTo (0.001, baseOptions.h);
		//baseShape.lineTo (-baseOptions.l-0.15, baseOptions.h);
		//baseShape.lineTo (-baseOptions.l-0.15, (baseOptions.h/2.0)+0.1);
		//baseShape.bezierCurveTo (-baseOptions.l-0.25, (baseOptions.h/2.0)+0.1, -baseOptions.l-0.25, baseOptions.h/2.0, -baseOptions.l-0.15, baseOptions.h/2.0);
		//baseShape.lineTo (-baseOptions.l, baseOptions.h/2.0);
		//baseShape.lineTo (-baseOptions.l, 0.5);
		//baseShape.lineTo (-baseOptions.l-0.5, 0.5);
		//baseShape.lineTo (-baseOptions.l-0.5, 0.0);

		// Para ver el contorno del shape
		var baseLineGeom = new THREE.BufferGeometry ();
		baseLineGeom.setFromPoints (baseShape.extractPoints (6).shape);
		var baseLine = new THREE.Line (baseLineGeom, new THREE.MeshPhongMaterial ({ color : 0x000000 }));

		// Construcción de la extrusión
		/*
		var baseExtrudeOptions = {
			depth : 2.0*baseOptions.l,
			steps : 1,
			curveSegments : baseOptions.r,
			bevelThickness : 0.05,
			bevelSize : 0.05,
			bevelSegments: baseOptions.r
		};
		var baseGeometry = new THREE.ExtrudeGeometry (baseShape, baseExtrudeOptions);
		baseGeometry.translate (0.0, 0.0, -baseOptions.l);
		*/

		// Construcción de la revolución
		var baseGeometry = new THREE.LatheGeometry (baseShape.extractPoints (6).shape, baseOptions.r, 0.0, 2.0*Math.PI);

		this.add (baseLine);

		return baseGeometry;
	}
}

export { Chandelier }
