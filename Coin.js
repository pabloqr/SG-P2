import * as THREE from './libs/three.module.js'

class Coin extends THREE.Object3D {
	constructor ()
	{
		super();

		var textureLoader = new THREE.TextureLoader ();
		var coinTexture = textureLoader.load ("imgs/Coin.png");
		var coinNormalTexture = textureLoader.load ("imgs/Coin_Normal.png");
		var coinAlphaTexture = textureLoader.load ("imgs/Coin_Alpha.png");

		var coinMaterial = new THREE.MeshPhongMaterial ({ color : 0xffffff, map : coinTexture });
		coinMaterial.normalMap = coinNormalTexture;

		coinMaterial.alphaMap = coinAlphaTexture;
		coinMaterial.transparent = true;
		coinMaterial.side = THREE.DoubleSide;

		var coinGeom = new THREE.CylinderGeometry (5.0, 5.0, 0.5, 32, 1);
		var coinMesh = new THREE.Mesh (coinGeom, coinMaterial);

		return coinMesh;
	}
}

export { Coin }
