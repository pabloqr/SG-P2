import * as THREE from './libs/three.module.js'

class Selector extends THREE.Object3D {
	constructor (name, alphaMap)
	{
		super();

		var textureLoader = new THREE.TextureLoader ();
		var selectorTexture = textureLoader.load ("imgs/Wood_024_basecolor.jpg");
		var selectorTextAlpha = textureLoader.load (alphaMap);

		var selectorMaterial = new THREE.MeshPhongMaterial ({ color : 0xffffff });
		selectorMaterial.map = selectorTexture;

		selectorMaterial.alphaMap = selectorTextAlpha;
		selectorMaterial.transparent = true;
		selectorMaterial.side = THREE.DoubleSide;

		var selectorGeom = new THREE.PlaneGeometry (0.5, 0.5);
		selectorGeom.rotateX (-Math.PI/2.0);
		selectorGeom.translate (0.0, 0.001, 0.0);
		var selectorMesh = new THREE.Mesh (selectorGeom, selectorMaterial);

		this.name = name;
		selectorMesh.userData = this;

		this.add (selectorMesh);
	}
}

export { Selector }
