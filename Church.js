import * as THREE from './libs/three.module.js'
import { MTLLoader } from './libs/MTLLoader.js'
import { OBJLoader } from './libs/OBJLoader.js'

class Church extends THREE.Object3D
{
	constructor ()
	{
		super();

		var materialLoader = new MTLLoader ();
		var objectLoader = new OBJLoader ();
		
		// materialLoader.setMaterialOptions ({side: THREE.FrontSide, wrap: THREE.RepeatWrapping});
		materialLoader.load (
			"./models/churchInterior.mtl",
			(materials) => {
				objectLoader.setMaterials (materials);
				objectLoader.load (
					'./models/churchInterior.obj',
					(object) => {
						// object.material.repeat.set(10,10);
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
}

export { Church }
