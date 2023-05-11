import * as THREE from './libs/three.module.js'

class ClockPendulus extends THREE.Object3D {
	constructor (radius = 0.2,length = 1.3)
	{
        super();
        var tip = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,0.01),new THREE.MeshPhongMaterial({color : 0xffffff }));
        var body = new THREE.Mesh(new THREE.BoxGeometry(0.02,length,0.02),new THREE.MeshPhongMaterial({color : 0xffffff }));
        body.add(tip);
        tip.position.set(0,-length/2,0);
        this.add(body);
    }
}
export { ClockPendulus }
