import * as THREE from './libs/three.module.js'
import { MTLLoader } from './libs/MTLLoader.js'
import { OBJLoader } from './libs/OBJLoader.js'

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
		var mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(handShape,extrudeSettings),new THREE.MeshPhongMaterial({color : 0x6e6e6e }));
		mesh.userData = this;
		this.add(mesh);
	}
}

class Clock extends THREE.Object3D
{
	body()
	{
		//Reutilizar el mismo loader para distintos materiales causa problemas
		var materialLoader = new MTLLoader ();
		var objectLoader = new OBJLoader ();

		materialLoader.load (
			"models/clock.mtl",
			(materials) => {
				console.log(materials);
				objectLoader.setMaterials (materials);
				objectLoader.load (
					'models/clock.obj',
					(object) => {
						this.add (object);						
						object.traverseVisible( function( node ) { if ( node instanceof THREE.Mesh ) 
							{ 
								node.castShadow = true; 
								node.receiveShadow = true;
							}});
					},
					null,
					null
				);
			}
		);
	}

	door()
	{
		var materialLoader = new MTLLoader ();
		var objectLoader = new OBJLoader ();
		materialLoader.load (
			"models/clockDoor.mtl",
			(materials) => {
				objectLoader.setMaterials (materials);
				objectLoader.load (
					'models/clockDoor.obj',
					(object) => {
						object.position.set(0.65,0,-0.6);
						this.doorHinge.add (object);						
						object.traverseVisible( function( node ) { if ( node instanceof THREE.Mesh ) 
							{ 
								node.receiveShadow = true;
							}});
					},
					null,
					null
				);
			}
		);
	}

	face()
	{
		var materialLoader = new MTLLoader ();
		var objectLoader = new OBJLoader ();
		materialLoader.load (
			"models/clockFace.mtl",
			(materials) => {
				console.log(materials);
				objectLoader.setMaterials (materials);
				objectLoader.load (
					'models/clockFace.obj',
					(object) => {
						this.add (object);						
						object.traverseVisible( function( node ) { if ( node instanceof THREE.Mesh ) 
							{ 
								node.receiveShadow = true;
							}});
					},
					null,
					null
				);
			}
		);
	}
	constructor ()
	{
		super();

		this.body();
		this.door();
		this.face();

		this.doorHinge = new THREE.Object3D();
		this.doorHinge.position.set(-0.65,0,0.6);
		this.add(this.doorHinge);

		//Agujas
		var clockHandMinute = new ClockHand("clockHandMinute");
		var clockHandHour = new ClockHand("clockHandHour",0.05,0.2);
		// var clockPendulus = new ClockPendulus();
		this.clockHandMinutesAngle = Math.PI/2;
		this.clockHandHourAngle = this.clockHandMinutesAngle/12;
		clockHandHour.position.set(-0.92,4.40729);
		clockHandMinute.position.set(-0.94,4.40729);
		clockHandHour.rotation.set(-this.clockHandMinutesAngle/12+Math.PI/2,Math.PI/2,0);
		clockHandMinute.rotation.set(-this.clockHandMinutesAngle+Math.PI/2,Math.PI/2,0);
		this.clockHandHour = clockHandHour;
		this.clockHandMinute = clockHandMinute;
		this.add (clockHandHour);
		this.add (clockHandMinute);
		// genShadows(this.clockModel);

		// this.add(clockPendulus);
	}
	setHours(angle) {
		var delta = angle - ((this.clockHandHourAngle) % (Math.PI*2));
	
		if((delta)>Math.PI) 
		{
			delta-=Math.PI*2;
		}
		else if((delta)<-Math.PI) 
		{
			delta+=Math.PI*2;
		}

		this.clockHandMinutesAngle += delta*12;
		this.clockHandHourAngle += delta;
		this.clockHandMinute.rotation.x = -this.clockHandMinutesAngle+Math.PI/2;
		this.clockHandHour.rotation.x = -this.clockHandHourAngle+Math.PI/2;
	}

	setMinutes(angle) {
		var delta = angle - (this.clockHandMinutesAngle % (Math.PI*2));
	
		if(delta>Math.PI) 
		{
			delta-=Math.PI*2;
		}
		else if((delta)<-Math.PI) 
		{
			delta+=Math.PI*2;
		}

		this.clockHandMinutesAngle += delta;
		this.clockHandHourAngle += delta/12;
		this.clockHandMinute.rotation.x = -this.clockHandMinutesAngle+Math.PI/2;
		this.clockHandHour.rotation.x = -this.clockHandHourAngle+Math.PI/2;
	}

	incrementHour(handDelta)
	{
		this.clockHandHour.rotateZ(handDelta/(60*12));
		this.clockHandMinute.rotateZ(handDelta/60);
	}

	getClockCenter()
	{
		var center = new THREE.Vector3();
		this.clockHandHour.getWorldPosition ( center );
		return center;
	}

	getHandHours()
	{
		return this.clockHandHour;
	}

	getHandMinutes()
	{
		return this.clockHandMinute;
	}

	setDoor(angle)
	{
		this.doorHinge.rotation.y = angle;
	}
}
export { Clock }
