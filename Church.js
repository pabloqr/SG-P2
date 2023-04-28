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

		materialLoader.load (
			"./models/churchInterior.mtl",
			(materials) => {
				objectLoader.setMaterials (materials);
				objectLoader.load (
					'./models/churchInterior.obj',
					(object) => {
						this.add (object);
					},
					null,
					null
				);
			}
		);
	}
}

export { Church }
