import * as THREE from './libs/three.module.js'
import { MTLLoader } from './libs/MTLLoader.js'
import { OBJLoader } from './libs/OBJLoader.js'

class Key extends THREE.Object3D
{
	constructor ()
	{
		super();

		var materialLoader = new MTLLoader ();
		var objectLoader = new OBJLoader ();

		materialLoader.load (
			"models/key.mtl",
			(materials) => {
				objectLoader.setMaterials (materials);
				objectLoader.load (
					'models/key.obj',
					(object) => {
						this.add (object);
						var scale = 0.1;
						object.scale.set(scale,scale,scale);
						// object.traverseVisible( function( node ) { if ( node instanceof THREE.Mesh ) 
						// 	{ 
						// 		node.castShadow = true; 
						// 		node.receiveShadow = true;
						// 	}});
					},
					null,
					null
				);
			}
		);
	}
}

export { Key }
