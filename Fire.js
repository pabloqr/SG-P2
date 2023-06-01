import * as THREE from './libs/three.module.js'

class Fire extends THREE.Object3D
{
	constructor ()
	{
		super();

		var loader = new THREE.TextureLoader();
		var texture = loader.load ("imgs/fire.png");

		var fireMat = new THREE.MeshPhongMaterial({ map : texture, color : 0xffffff ,transparent:true});

		var geo = new THREE.PlaneGeometry (0.05,0.2);

		var fire = new THREE.Mesh(geo,fireMat);

		this.add(fire);
	}
}

export { Fire }
