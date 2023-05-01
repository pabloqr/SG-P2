import * as THREE from './libs/three.module.js'
import { CSG } from './libs/CSG-v2.js'

class ChurchBench extends THREE.Object3D {
	constructor (benchLong = 16)
	{
		super();

		// Material del banco
		var benchMaterial = new THREE.MeshPhongMaterial ({ color: 0x755331 });

		// Geometrías necesarias para construir el banco
		// Asiento
		var seatGeometry = new Seat (benchLong);
		seatGeometry.translate (0.0, 3.0, -0.5);

		var seatMesh = new THREE.Mesh (seatGeometry, benchMaterial);
		
		// Reclinatorio
		var reclinerGeometry = new Recliner (benchLong);
		reclinerGeometry.translate (0.0, 1.0, -4.25);
		
		var reclinerMesh = new THREE.Mesh (reclinerGeometry, benchMaterial);
		
		// Laterales
		var lateralGeometryLeft = new Lateral ();
		lateralGeometryLeft.translate (-benchLong/2.0, 0.0, 0.0);
		var lateralGeometryRight = new Lateral ();
		lateralGeometryRight.translate (benchLong/2.0, 0.0, 0.0);
		
		var lateralMeshLeft = new THREE.Mesh (lateralGeometryLeft, benchMaterial);
		var lateralMeshRight = new THREE.Mesh (lateralGeometryRight, benchMaterial);
		
		// Conectores (con reclinatorios)
		var connectorGeometryLeft = new Connector ();
		connectorGeometryLeft.translate (-benchLong/2.0 + 0.375, 0.5, -2.5);
		var connectorGeometryRight = new Connector ();
		connectorGeometryRight.translate (benchLong/2.0 - 0.375, 0.5, -2.5);
		
		var connectorMeshLeft = new THREE.Mesh (connectorGeometryLeft, benchMaterial);
		var connectorMeshRight = new THREE.Mesh (connectorGeometryRight, benchMaterial);

		// Objeto que almacena el banco
		var bench = new THREE.Object3D ();
		bench.add (seatMesh);
		bench.add (reclinerMesh);
		bench.add (lateralMeshLeft);
		bench.add (lateralMeshRight);
		bench.add (connectorMeshLeft);
		bench.add (connectorMeshRight);

		//bench.scale.set (0.5, 0.5, 0.5);

		// Se añade al modelo
		this.add (bench);
	}
}

class Seat extends THREE.Object3D {
	constructor (seatLong)
	{
		super();

		// Opciones del banco
		var seatOptions = {
			long : seatLong
		};

		// Construcción del shape del banco
		var lineFunction = [
			{ m : (7.5-1.0) / (1.75-1.0), b : 1.0 - ((7.5-1.0) / (1.75-1.0)) * 1.00 },
			{ m : (7.5-1.0) / (1.5-0.75), b : 1.0 - ((7.5-1.0) / (1.5-0.75)) * 0.75 }
		];

		var seatShape = new THREE.Shape ();
		seatShape.moveTo (-3.5, 0.0);
		seatShape.lineTo (0.5, 0.0);
		seatShape.quadraticCurveTo ((0.0 - lineFunction[0].b) / lineFunction[0].m, 0.0, 1.0, 1.0);
		seatShape.lineTo (1.75, 5.5);
		seatShape.quadraticCurveTo ((5.75 - lineFunction[0].b) / lineFunction[0].m, 5.75, 1.5, 5.75);
		seatShape.lineTo (2.5, 5.75);
		seatShape.bezierCurveTo (2.75, 5.75, 2.75, 6.0, 2.5, 6.0);
		seatShape.lineTo (1.5, 6.0);
		seatShape.quadraticCurveTo ((6.0 - lineFunction[1].b) / lineFunction[1].m, 6.0, 1.25, 5.5);
		seatShape.lineTo (0.75, 1.0);
		seatShape.quadraticCurveTo ((0.25 - lineFunction[1].b) / lineFunction[1].m, 0.25, 0.25, 0.25);
		seatShape.lineTo (-3.5, 0.25);
		seatShape.bezierCurveTo (-3.75, 0.25, -3.75, 0.0, -3.5, 0.0);

		// Para ver el contorno del shape
		var seatLineGeom = new THREE.BufferGeometry ();
		seatLineGeom.setFromPoints (seatShape.extractPoints (6).shape);
		var seatLine = new THREE.Line (seatLineGeom, new THREE.MeshPhongMaterial ({ color: 0x000000 }));

		// Construcción de la extrusión
		var seatExtrudeOptions = {
			depth : seatOptions.long,
			steps : 2,
			curveSegments : 24,
			bevelEnabled : false
		};
		var seatGeometry = new THREE.ExtrudeGeometry (seatShape, seatExtrudeOptions);
		seatGeometry.rotateY (Math.PI / 2.0);
		seatGeometry.translate (-seatOptions.long/2.0, 0.0, 0.0);

		//this.add (seatLine);

		return seatGeometry;
	}
}

class Recliner extends THREE.Object3D {
	constructor (reclinerLong)
	{
		super();

		// Opciones del reclinatorio
		var reclinerOptions = {
			long : reclinerLong - 0.5
		};

		var reclinerShape = new THREE.Shape ();
		reclinerShape.moveTo (-0.4, 0.0);
		reclinerShape.lineTo (0.4, 0.0);
		reclinerShape.bezierCurveTo (0.4625, 0.0, 0.4625, 0.15, 0.25, 0.15);
		reclinerShape.lineTo (-0.25, 0.15);
		reclinerShape.bezierCurveTo (-0.4625, 0.15, -0.4625, 0.0, -0.4, 0.0);

		// Para ver el contorno del shape
		var reclinerLineGeom = new THREE.BufferGeometry ();
		reclinerLineGeom.setFromPoints (reclinerShape.extractPoints (6).shape);
		var reclinerLine = new THREE.Line (reclinerLineGeom, new THREE.MeshPhongMaterial ({ color: 0x000000 }));

		// Construcción de la extrusión
		var reclinerExtrudeOptions = {
			depth : reclinerOptions.long,
			steps : 2,
			curveSegments : 24,
			bevelThickness : 0.5,
			bevelSize : 0.05,
			bevelSegments: 24
		};
		var reclinerGeometry = new THREE.ExtrudeGeometry (reclinerShape, reclinerExtrudeOptions);
		reclinerGeometry.rotateY (Math.PI / 2.0);
		reclinerGeometry.translate (-reclinerOptions.long/2.0, -0.075, 0.0);

		//this.add (reclinerLine);

		return reclinerGeometry;
	}
}

class Lateral extends THREE.Object3D {
	constructor ()
	{
		super();

		// Opciones del lateral
		var lateralOptions = {
			long : 0.01
		};

		var lateralShape = new THREE.Shape ();
		lateralShape.moveTo (-3.0, 0.0);
		lateralShape.lineTo (2.0, 0.0);
		lateralShape.lineTo (2.0, 1.0);
		lateralShape.quadraticCurveTo (1.5, 1.5, 1.5, 2.5);
		lateralShape.quadraticCurveTo (1.5, 4.5, 2.5, 5.0);
		lateralShape.quadraticCurveTo (3.0, 5.25, 3.0, 7.0);
		lateralShape.lineTo (3.0, 8.0);
		lateralShape.quadraticCurveTo (3.0, 8.5, 3.5, 8.5);
		lateralShape.bezierCurveTo (3.75, 8.5, 3.75, 9.0, 3.5, 9.0);
		lateralShape.lineTo (2.0, 9.0);
		lateralShape.quadraticCurveTo (0.5, 9.0, 0.5, 7.0);
		lateralShape.lineTo (0.5, 5.0);
		lateralShape.quadraticCurveTo (0.5, 4.0, -1.0, 4.0);
		lateralShape.lineTo (-3.0, 4.0);
		lateralShape.quadraticCurveTo (-3.5, 4.0, -3.5, 3.5);
		lateralShape.lineTo (-3.5, 3.5);
		lateralShape.quadraticCurveTo (-3.5, 2.5, -3.0, 2.25);
		lateralShape.quadraticCurveTo (-2.5, 2.0, -2.5, 1.5);
		lateralShape.quadraticCurveTo (-2.5, 1.0, -3.0, 0.75);
		lateralShape.lineTo (-3.0, 0.0);

		// Para ver el contorno del shape
		var lateralLineGeom = new THREE.BufferGeometry ();
		lateralLineGeom.setFromPoints (lateralShape.extractPoints (6).shape);
		var lateralLine = new THREE.Line (lateralLineGeom, new THREE.MeshPhongMaterial ({ color: 0x000000 }));

		// Construcción de la extrusión
		var lateralExtrudeOptions = {
			depth : lateralOptions.long,
			steps : 1,
			curveSegments : 24,
			bevelThickness : 0.25,
			bevelSize : 0.05,
			bevelSegments: 24
		};
		var lateralGeometry = new THREE.ExtrudeGeometry (lateralShape, lateralExtrudeOptions);
		lateralGeometry.rotateY (Math.PI / 2.0);
		lateralGeometry.translate (-lateralOptions.long/2.0, 0.0, 0.0);

		//this.add (lateralLine);

		return lateralGeometry;
	}
}

class Connector extends THREE.Object3D {
	constructor ()
	{
		super();

		var horizontalConnector = new THREE.BoxGeometry (0.25, 0.5, 4.0);
		var verticalConnector = new THREE.BoxGeometry (0.5, 1.0, 0.25);
		verticalConnector.translate (0.0, 0.0, -1.75);

		var horizontalConnectorMesh = new THREE.Mesh (horizontalConnector);
		var verticalConnectorMesh = new THREE.Mesh (verticalConnector);

		var CSGMesh = new CSG ();
		var connectorGeometry = CSGMesh.union ([ horizontalConnectorMesh, verticalConnectorMesh ]).toGeometry ();

		return connectorGeometry;
	}
}

export { ChurchBench }
