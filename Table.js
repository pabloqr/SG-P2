import * as THREE from './libs/three.module.js'
import { MTLLoader } from './libs/MTLLoader.js'
import { OBJLoader } from './libs/OBJLoader.js'

class Table extends THREE.Object3D
{
	constructor ()
	{
		super();

		var materialLoader = new MTLLoader ();
		var objectLoader = new OBJLoader ();

		materialLoader.load (
			"models/table.mtl",
			(materials) => {
				objectLoader.setMaterials (materials);
				objectLoader.load (
					'models/table.obj',
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
}

export { Table }
