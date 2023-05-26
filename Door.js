import * as THREE from './libs/three.module.js'
import { MTLLoader } from './libs/MTLLoader.js'
import { OBJLoader } from './libs/OBJLoader.js'

class Door extends THREE.Object3D
{
	constructor (withLock=false)
	{
		super();

		var materialLoader = new MTLLoader ();
		var objectLoader = new OBJLoader ();

		materialLoader.load (
			"models/churchDoor.mtl",
			(materials) => {
				objectLoader.setMaterials (materials);
				objectLoader.load (
					'models/churchDoor.obj',
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

		if(withLock)
		{
			this. lock = new Lock();
			this.add(this.lock);
			this.lock.position.set(1.184,1.6,1.3);
			this.lock.scale.set(0.5,0.5,1);
		}
	}
}

export { Door }


class Lock extends THREE.Object3D
{
	constructor ()
	{
		super();

		this.name = "lock";

		var materialLoaderLock = new MTLLoader ();
		var objectLoaderLock = new OBJLoader ();

		materialLoaderLock.load (
			"models/lock.mtl",
			(materials) => {
				objectLoaderLock.setMaterials (materials);
				objectLoaderLock.load (
					'models/lock.obj',
					(object) => {
						this.add (object);
						for(var i = 0; i<object.children.length;i++)
						{
							object.children[i].userData = this;
						}
					},
					null,
					null
				);
			}
		);
	}
}
