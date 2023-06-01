import * as THREE from './libs/three.module.js'

class DeadBody extends THREE.Object3D {
	constructor ()
	{
		super();

		var textureLoader = new THREE.TextureLoader ();
		var bodyTexture = textureLoader.load ("imgs/Snow_001_COLOR.png");
		var bodyTextNorm = textureLoader.load ("imgs/Snow_001_NORM.png");
		var bodyTextOutline = textureLoader.load ("imgs/Body_Outline_Alpha.png");

		var bodyMaterial = new THREE.MeshPhongMaterial ({ color : 0xffffff });
		bodyMaterial.map = bodyTexture;
		bodyMaterial.normalMap = bodyTextNorm;

		bodyMaterial.alphaMap = bodyTextOutline;
		bodyMaterial.transparent = true;
		bodyMaterial.side = THREE.DoubleSide;

		var bodyGeom = new THREE.PlaneGeometry (10, 10);
		bodyGeom.rotateX (-Math.PI/2.0);
		bodyGeom.translate (0.0, 0.001, 0.0);
		var bodyMesh = new THREE.Mesh (bodyGeom, bodyMaterial);

		this.add (bodyMesh);
	}
}

export { DeadBody }
