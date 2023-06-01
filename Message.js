import * as THREE from './libs/three.module.js'

class Message extends THREE.Object3D {
	constructor (msg = "msg", desp = 10.0, width = 15.0, height = 4.0)
	{
		super();

		const canvas = document.createElement ("canvas");
		const context = canvas.getContext ("2d");

		// Estilo del texto
		context.fillStyle = "#000000";
		context.font = "65px serif";
		context.fillText (msg, desp, 90.0);

		var messageTexture = new THREE.Texture (canvas);
		messageTexture.needsUpdate = true;

		var messageMaterial = new THREE.MeshBasicMaterial ({ map : messageTexture, side : THREE.DoubleSide });
		messageMaterial.transparent = true;

		var messageGeom = new THREE.PlaneGeometry (width-width/3.0, height);
		messageGeom.rotateX (-Math.PI/2.0);
		messageGeom.translate (0.0, 0.01, 0.0);

		var textureLoader = new THREE.TextureLoader ();
		var bgTexture = textureLoader.load ("imgs/blankPaper.png");

		var bgMaterial = new THREE.MeshLambertMaterial ({ color : 0xffffff });
		bgMaterial.map = bgTexture;
		bgMaterial.side = THREE.DoubleSide;

		var bgGeom = new THREE.PlaneGeometry (width, height);
		bgGeom.rotateX (Math.PI/2.0)
		bgGeom.translate (0.0, 0.0, 0.0);

		var messageMesh = new THREE.Mesh (messageGeom, messageMaterial);
		var bgMesh = new THREE.Mesh (bgGeom, bgMaterial);

		this.add (messageMesh);
		this.add (bgMesh);

		this.position.y = 0.01;
		
		var scale = 0.08;
		this.scale.set (scale, scale, scale);
	}
}

export { Message }