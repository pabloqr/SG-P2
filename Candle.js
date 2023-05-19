import * as THREE from './libs/three.module.js'
import { MTLLoader } from './libs/MTLLoader.js'
import { OBJLoader } from './libs/OBJLoader.js'

class Candle extends THREE.Object3D
{
	constructor ()
	{
		super();

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
		var light = new THREE.PointLight(0xea7115, 0.3,0,0);
		light.castShadow = true;
		var shadowRes = 128;
		light.shadow.mapSize.width = shadowRes;
		light.shadow.mapSize.height = shadowRes;
		light.shadow.camera.near = 0.5;
		light.shadow.camera.far = 200;
		this.add(light);
	}
}

export { Candle }
