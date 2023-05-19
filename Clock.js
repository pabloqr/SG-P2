import * as THREE from './libs/three.module.js'
import * as TWEEN from './libs/tween.esm.js'
import { MTLLoader } from './libs/MTLLoader.js'
import { OBJLoader } from './libs/OBJLoader.js'

class ClockHand extends THREE.Object3D {
	constructor(n, radius = 0.05, length = 0.3, width = 0.02, thickness = 0.01, tipLength = 0.3) {
		super();
		this.name = n;
		var handShape = new THREE.Shape();
		handShape.moveTo(0.0, -radius);

		handShape.quadraticCurveTo(radius * 0.707, -radius * 0.707, radius, 0);
		handShape.quadraticCurveTo(radius * 0.707, radius * 0.707, radius * 0.3, radius * 0.6);
		handShape.lineTo(radius * 0.3, length);
		handShape.quadraticCurveTo(width, tipLength * 0.15 + length, width, tipLength * 0.3 + length);
		handShape.quadraticCurveTo(width * 0.1, tipLength * 0.7 + length, 0, length + tipLength);

		handShape.quadraticCurveTo(-width * 0.1, tipLength * 0.7 + length, -width, tipLength * 0.3 + length);
		handShape.quadraticCurveTo(-width, tipLength * 0.15 + length, -radius * 0.3, length);
		handShape.lineTo(-radius * 0.3, radius * 0.6);
		handShape.quadraticCurveTo(-radius * 0.707, radius * 0.707, -radius, 0);
		handShape.quadraticCurveTo(-radius * 0.707, -radius * 0.707, 0.0, -radius);

		var extrudeSettings = {
			depth: thickness,
			steps: 1,
			curveSegments: 20,
			bevelEnabled: false
		};
		var mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(handShape, extrudeSettings), 
			new THREE.MeshPhongMaterial({ 
					color: 0x1e1e1e ,
					specular:0xafafaf,
					shininess:30
				}));
		mesh.userData = this;
		this.add(mesh);
	}
}

class ClockPendulus extends THREE.Object3D {
	constructor(radius = 0.2, length = 1.3) {
		super();

		this.maxAngle = Math.PI / 20;

		var material = new THREE.MeshPhongMaterial({ 
			color: 0xbfa43b,
			specular:0xead670,
			shininess:60
		});
		var tip = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.01, 20), material);
		var body = new THREE.Mesh(new THREE.BoxGeometry(0.02, length, 0.02), material);
		this.hinge = new THREE.Object3D();
		body.add(tip);
		this.hinge.add(body);
		tip.position.set(0, -length / 2, 0);
		body.position.set(0, -length / 2, 0);

		tip.rotation.set(Math.PI / 2, 0, Math.PI / 2);

		this.add(this.hinge);

		var origen = [
			{p:0},
			{p:this.maxAngle},
			{p:0},
			{p:-this.maxAngle}
		];
		var destino = [
			{p:this.maxAngle},
			{p:0},
			{p:-this.maxAngle},
			{p:0}
		];
		var anim = [];

		anim.push(new TWEEN.Tween(origen[0])
			.to(destino[0], 500)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate(() => { this.hinge.rotation.x = origen[0].p }));
		anim.push(new TWEEN.Tween(origen[1])
			.to(destino[1], 500)
			.easing(TWEEN.Easing.Quadratic.In)
			.onUpdate(() => { this.hinge.rotation.x = origen[1].p }));
		anim.push(new TWEEN.Tween(origen[2])
			.to(destino[2], 500)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate(() => { this.hinge.rotation.x = origen[2].p }));
		anim.push(new TWEEN.Tween(origen[3])
			.to(destino[3], 500)
			.easing(TWEEN.Easing.Quadratic.In)
			.onUpdate(() => { this.hinge.rotation.x = origen[3].p }));

		anim[0].chain(anim[1]);
		anim[1].chain(anim[2]);
		anim[2].chain(anim[3]);
		anim[3].chain(anim[0]);
		anim[0].start();
	}
}

class Clock extends THREE.Object3D {
	body() {
		//Reutilizar el mismo loader para distintos materiales causa problemas
		var materialLoader = new MTLLoader();
		var objectLoader = new OBJLoader();

		materialLoader.load(
			"models/clock.mtl",
			(materials) => {
				console.log(materials);
				objectLoader.setMaterials(materials);
				objectLoader.load(
					'models/clock.obj',
					(object) => {
						this.add(object);
						object.traverseVisible(function (node) {
							if (node instanceof THREE.Mesh) {
								node.castShadow = true;
								node.receiveShadow = true;
							}
						});
					},
					null,
					null
				);
			}
		);
	}

	door() {
		var materialLoader = new MTLLoader();
		var objectLoader = new OBJLoader();
		materialLoader.load(
			"models/clockDoor.mtl",
			(materials) => {
				objectLoader.setMaterials(materials);
				objectLoader.load(
					'models/clockDoor.obj',
					(object) => {
						object.position.set(0.65, 0, -0.6);
						this.doorHinge.add(object);
						object.traverseVisible(function (node) {
							if (node instanceof THREE.Mesh) {
								node.receiveShadow = true;
							}
						});
					},
					null,
					null
				);
			}
		);
	}

	face() {
		var materialLoader = new MTLLoader();
		var objectLoader = new OBJLoader();
		materialLoader.load(
			"models/clockFace.mtl",
			(materials) => {
				console.log(materials);
				objectLoader.setMaterials(materials);
				objectLoader.load(
					'models/clockFace.obj',
					(object) => {
						this.add(object);
						object.traverseVisible(function (node) {
							if (node instanceof THREE.Mesh) {
								node.receiveShadow = true;
							}
						});
					},
					null,
					null
				);
			}
		);
	}
	constructor() {
		super();

		this.body();
		this.door();
		this.face();


		this.doorHinge = new THREE.Object3D();
		this.doorHinge.position.set(-0.65, 0, 0.6);
		this.add(this.doorHinge);

		//Agujas
		var clockHandMinute = new ClockHand("clockHandMinute");
		var clockHandHour = new ClockHand("clockHandHour", 0.05, 0.2);
		// var clockPendulus = new ClockPendulus();
		this.clockHandMinutesAngle = Math.PI / 2;
		this.clockHandHourAngle = this.clockHandMinutesAngle / 12;
		clockHandHour.position.set(-0.92, 4.40729);
		clockHandMinute.position.set(-0.94, 4.40729);
		clockHandHour.rotation.set(-this.clockHandMinutesAngle / 12 + Math.PI / 2, Math.PI / 2, 0);
		clockHandMinute.rotation.set(-this.clockHandMinutesAngle + Math.PI / 2, Math.PI / 2, 0);
		this.clockHandHour = clockHandHour;
		this.clockHandMinute = clockHandMinute;
		this.add(clockHandHour);
		this.add(clockHandMinute);

		this.pendulus = new ClockPendulus(0.2, 1.5);
		this.pendulus.position.set(0, 4, 0);
		this.add(this.pendulus);
		// this.add(clockPendulus);
		this.testTimeCount = 0;
		this.active = false;
	}
	setHours(angle) {
		var delta = angle - ((this.clockHandHourAngle) % (Math.PI * 2));

		if ((delta) > Math.PI) {
			delta -= Math.PI * 2;
		}
		else if ((delta) < -Math.PI) {
			delta += Math.PI * 2;
		}

		this.clockHandMinutesAngle += delta * 12;
		this.clockHandHourAngle += delta;
		this.clockHandMinute.rotation.x = -this.clockHandMinutesAngle;
		this.clockHandHour.rotation.x = -this.clockHandHourAngle + Math.PI / 2;
	}

	setMinutes(angle) {
		var delta = angle - Math.PI / 2 - (this.clockHandMinutesAngle % (Math.PI * 2));

		if (delta > Math.PI) {
			delta -= Math.PI * 2;
		}
		else if ((delta) < -Math.PI) {
			delta += Math.PI * 2;
		}

		this.clockHandMinutesAngle += delta;
		this.clockHandHourAngle += delta / 12;
		this.clockHandMinute.rotation.x = -this.clockHandMinutesAngle;
		this.clockHandHour.rotation.x = -this.clockHandHourAngle + Math.PI / 2;
	}

	incrementHour(handDelta) {
		this.clockHandHour.rotateZ(handDelta / (60 * 12));
		this.clockHandMinute.rotateZ(handDelta / 60);
	}

	getClockCenter() {
		var center = new THREE.Vector3();
		this.clockHandHour.getWorldPosition(center);
		return center;
	}

	getHandHours() {
		return this.clockHandHour;
	}

	getHandMinutes() {
		return this.clockHandMinute;
	}

	setDoor(angle) {
		this.doorHinge.rotation.y = angle;
	}

	testTime(hour, delta) {
		if (hour - 3 < 0)
			var testHourAngle = (hour + 9) / 12 * (Math.PI * 2);
		else
			var testHourAngle = (hour - 3) / 12 * (Math.PI * 2);

		const umbralHoras = Math.PI / 24; //radianes
		const activationTime = 2; //segundos

		var handHour = ((this.clockHandHourAngle + Math.PI / 2) % (Math.PI * 2));

		if (handHour < 0) handHour += Math.PI * 2;

		if ((testHourAngle - umbralHoras < handHour) && (testHourAngle + umbralHoras > handHour)) {
			this.testTimeCount += delta;
			if (this.testTimeCount > activationTime) {
				// console.log("activated");
				this.active = true;

			}
			return;
		}
		this.testTimeCount = 0;
	}

	openDoor(deltaTime) {
		const speed = 0.5;
		if (this.doorHinge.rotation.y < Math.PI / 2 && (this.active == true))
			this.doorHinge.rotation.y += (deltaTime * speed);
	}

	update() {
		TWEEN.update();
	}

	isActive()
	{
		return this.active;
	}
}
export { Clock }
