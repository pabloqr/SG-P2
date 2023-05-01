import * as THREE from './libs/three.module.js'

class ChurchBench extends THREE.Object3D {
	constructor (benchLong = 16)
	{
		super();

		// Opciones del banco
		var benchOptions = {
			long : benchLong
		};

		// Material del banco
		var benchMaterial = new THREE.MeshPhongMaterial ({ color: 0x755331 });

		// Construcción del shape del banco
		var lineFunction = [
			{ m : (7.5-1.0) / (1.75-1.0), b : 1.0 - ((7.5-1.0) / (1.75-1.0)) * 1.00 },
			{ m : (7.5-1.0) / (1.5-0.75), b : 1.0 - ((7.5-1.0) / (1.5-0.75)) * 0.75 }
		];

		var benchShape = new THREE.Shape ();
		benchShape.moveTo (-3.5, 0.0);
		benchShape.lineTo (0.5, 0.0);
		benchShape.quadraticCurveTo ((0.0 - lineFunction[0].b) / lineFunction[0].m, 0.0, 1.0, 1.0);
		benchShape.lineTo (1.75, 7.5);
		benchShape.quadraticCurveTo ((7.75 - lineFunction[0].b) / lineFunction[0].m, 7.75, 2.0, 7.75);
		benchShape.lineTo (2.75, 7.75);
		benchShape.bezierCurveTo (3.0, 7.75, 3.0, 8.0, 2.75, 8.0);
		benchShape.lineTo (2.0, 8.0);
		benchShape.quadraticCurveTo ((8.0 - lineFunction[1].b) / lineFunction[1].m, 8.0, 1.5, 7.5);
		benchShape.lineTo (0.75, 1.0);
		benchShape.quadraticCurveTo ((0.25 - lineFunction[1].b) / lineFunction[1].m, 0.25, 0.25, 0.25);
		benchShape.lineTo (-3.5, 0.25);
		benchShape.bezierCurveTo (-3.75, 0.25, -3.75, 0.0, -3.5, 0.0);

		// Para ver el contorno del shape
		var benchLineGeom = new THREE.BufferGeometry ();
		benchLineGeom.setFromPoints (benchShape.extractPoints (6).shape);
		var benchLine = new THREE.Line (benchLineGeom, benchMaterial);

		// Construcción de la extrusión
		var benchExtrudeOptions = {
			depth : benchOptions.long,
			steps : 2,
			curveSegments : 24,
			bevelEnabled : false
		};
		var benchGeometry = new THREE.ExtrudeGeometry (benchShape, benchExtrudeOptions);
		benchGeometry.rotateY (Math.PI / 2.0);
		benchGeometry.translate (-benchOptions.long/2.0, 0.0, 0.0);

		var benchMesh = new THREE.Mesh (benchGeometry, benchMaterial);

		this.add (benchMesh);
		//this.add (benchLine);
	}
}

export { ChurchBench }
