import * as THREE from './libs/three.module.js'
import { Coin } from './Coin.js';
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

		this.coins = new THREE.Object3D ();
		this.coins.name = "coins";

		for (var i = 0; i < 32; ++i) {

			var coin = new Coin ();
			coin.userData = this.coins;

			coin.scale.set (0.01, 0.01, 0.01);
			coin.rotation.set (Math.random()*Math.PI/24.0, Math.random()*Math.PI*2.0, Math.random()*Math.PI/24.0);
			coin.position.set (Math.random()*0.7 - 0.7, Math.random()*0.05, Math.random()*0.7 - 0.7);
			
			this.coins.add (coin);
		}

		this.coins.position.y = 2;
		this.add (this.coins);
	}
}

export { Table }
