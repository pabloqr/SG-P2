import * as THREE from './libs/three.module.js'

class ClockHand extends THREE.Object3D {
	constructor (n, radius = 0.05,length = 0.3,width = 0.02,thickness = 0.01,tipLength = 0.3)
	{
		super();
        this.name = n;
        var handShape = new THREE.Shape ();
        handShape.moveTo (0.0, -radius);
        
        handShape.quadraticCurveTo(radius*0.707,-radius*0.707,radius,0);
        handShape.quadraticCurveTo(radius*0.707,radius*0.707,radius*0.3,radius*0.6);
        handShape.lineTo(radius*0.3,length);
        handShape.quadraticCurveTo(width,tipLength*0.15+length,width,tipLength*0.3+length);
        handShape.quadraticCurveTo(width*0.1,tipLength*0.7+length,0,length+tipLength);

        handShape.quadraticCurveTo(-width*0.1,tipLength*0.7+length,-width,tipLength*0.3+length);
        handShape.quadraticCurveTo(-width,tipLength*0.15+length,-radius*0.3,length);
        handShape.lineTo(-radius*0.3,radius*0.6);
        handShape.quadraticCurveTo(-radius*0.707,radius*0.707,-radius,0);
        handShape.quadraticCurveTo(-radius*0.707,-radius*0.707,0.0,-radius);

        var extrudeSettings = {
			depth : thickness,
			steps : 1,
			curveSegments : 20,
			bevelEnabled : false
		};
        var mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(handShape,extrudeSettings),new THREE.MeshPhongMaterial({color : 0xffffff }));
        mesh.userData = this;
        this.add(mesh);
    }
}
export { ClockHand }
