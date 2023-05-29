import * as THREE from './libs/three.module.js'

class Paper extends THREE.Object3D
{
	constructor ()
	{
		super();

		var loader = new THREE.TextureLoader();
		var texture = loader.load ("imgs/drawing.png");

		var mat = new THREE.MeshPhongMaterial({ map : texture, color : 0xffffff ,transparent:true});

		var geo = new THREE.PlaneGeometry (1,0.82);

		geo.receiveShadow = true;

		var paper = new THREE.Mesh(geo,mat);
		paper.rotation.x = -Math.PI/2;

		this.add(paper);
	}
}

export { Paper }
