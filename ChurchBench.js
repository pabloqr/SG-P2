import * as THREE from './libs/three.module.js'

class ChurchBench extends THREE.Object3D {
	constructor ()
	{
		super();

		// Material del banco
		var benchMaterial = new THREE.MeshPhongMaterial ({ color: 0x755331 });

		var benchShape = new THREE.Shape ();
		benchShape.moveTo (-3.5, 0.0);
		benchShape.lineTo (0.5, 0.0);
		benchShape.bezierCurveTo (0.75, 0.0, 1.0, 0.5, 1.0, 1.0);
		benchShape.lineTo (1.75, 7.5);
		benchShape.quadraticCurveTo (1.75, 7.75, 2.0, 7.75);
		benchShape.lineTo (2.75, 7.75);
		benchShape.bezierCurveTo (3.0, 7.75, 3.0, 8.0, 2.75, 8.0);
		benchShape.lineTo (2.0, 8.0);
		benchShape.quadraticCurveTo (1.5, 8.0, 1.5, 7.5);
		benchShape.lineTo (0.75, 1.0);
		benchShape.bezierCurveTo (0.75, 0.75, 0.625, 0.25, 0.5, 0.25);
		benchShape.lineTo (-3.5, 0.25);
		benchShape.bezierCurveTo (-3.75, 0.25, -3.75, 0.0, -3.5, 0.0);

		// Para ver el contorno del shape
		var benchLineGeom = new THREE.BufferGeometry ();
		benchLineGeom.setFromPoints (benchShape.extractPoints (6).shape);
		var benchLine = new THREE.Line (benchLineGeom, benchMaterial);

		// Construcción de la extrusión
		var benchExtrudeOptions = {
			depth : 8,
			steps : 2,
			curveSegments : 4,
			bevelEnabled : false
		};
		var benchGeometry = new THREE.ExtrudeGeometry (benchShape, benchExtrudeOptions);
		var benchMesh = new THREE.Mesh (benchGeometry, benchMaterial);

		this.add (benchMesh);
		//this.add (benchLine);
	}
}

export { ChurchBench }
