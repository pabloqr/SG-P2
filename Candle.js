import * as THREE from './libs/three.module.js'
import { MTLLoader } from './libs/MTLLoader.js'
import { OBJLoader } from './libs/OBJLoader.js'
import { Fire} from './Fire.js'

class Candle extends THREE.Object3D
{
	constructor (shadows)
	{
		super();
		this.name = "candle";
		this.activeFire = true;

		var materialLoader = new MTLLoader ();
		var objectLoader = new OBJLoader ();

		materialLoader.load (
			"models/candle.mtl",
			(materials) => {
				objectLoader.setMaterials (materials);
				objectLoader.load (
					'models/candle.obj',
					(object) => {
						this.add (object);
						for(var i = 0; i<object.children.length;i++)
						{
							object.children[i].userData = this;
						}
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
		this. light = new THREE.PointLight(0xea7115, 0.3,0,0);
		this.light.castShadow = shadows;
		var shadowRes = 512;
		this.light.shadow.mapSize.width = shadowRes;
		this.light.shadow.mapSize.height = shadowRes;
		this.light.shadow.camera.near = 0.5;
		this.light.shadow.camera.far = 200;

		this. fire0 = new Fire();
		this. fire1 = new Fire();
		this.fire0.position.set(19.4539 ,5.7,-0.581754);
		this.fire1.position.set(19.4539 ,5.7,0.581754);

		this.add(this.fire0);
		this.add(this.fire1);
		this.add(this.light);
	}

	update(angle)
	{
		if(this.scale.x<0)
		{
			this.fire0.rotation.y = -angle;
			this.fire1.rotation.y = -angle;
		}
		else
		{
			this.fire0.rotation.y = angle;
			this.fire1.rotation.y = angle;
		}

		if(this.activeFire==false)
		{
			this.fire0.scale.y = 0.0;
			this.fire1.scale.y = 0.0;
		}
		else
		{
			this.fire0.scale.y = Math.random()*0.2+1;
			this.fire1.scale.y = Math.random()*0.2+1;
			this.fire0.scale.x = Math.random()*0.1+1;
			this.fire1.scale.x = Math.random()*0.1+1;
		}


	}

	toggleFire()
	{
		console.log("toggleLight");
		if(this.activeFire)
		{
			this.activeFire = false;
			this.light.intensity = 0;
			this.fire0.scale.y=0;
			this.fire1.scale.y=0;
		}
		else
		{
			this.activeFire = true;
			this.light.intensity = 0.3;
			this.fire0.scale.y=1;
			this.fire1.scale.y=1;
		}
	}
}

export { Candle }
