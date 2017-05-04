window.onload = function () {
    function placeWall(fromX, fromZ, toX, toZ) {

        var texture = new THREE.TextureLoader().load( "images/stone.jpg" );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( Math.max(toX-fromX, toZ-fromZ), 3 );

        var xSize = (toX-fromX)*fieldSize;
        var zSize = (toZ-fromZ)*fieldSize;
        if(toX===fromX) xSize+=2*wallWidth; else zSize+=2*wallWidth;

        var wall = new THREE.Mesh(
            new THREE.BoxGeometry( xSize, wallHeight, zSize ),
            new THREE.MeshLambertMaterial( { color: 0x666666, map: texture} )
        );
        wall.position.x = (toX+fromX)*fieldSize/2;
        wall.position.y = wallHeight/2;
        wall.position.z = (toZ+fromZ)*fieldSize/2;
        scene.add(wall);
    }

    function placeColumn(x, z) {
        var texture = new THREE.TextureLoader().load( "images/stone.jpg" );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 5, 3 );

        var column = new THREE.Mesh(
            new THREE.CylinderGeometry(fieldSize/1.5, fieldSize/1.5, wallHeight, 32),
            new THREE.MeshLambertMaterial( {color: 0x550022, map: texture} )
        );
        column.position.x = x*fieldSize;
        column.position.y = wallHeight/2;
        column.position.z = z*fieldSize;
        scene.add(column);
    }

    function m(x, z) {
        if(x<0 || x>=map[0].length || z<0 || z>=map.length) return ' ';
        return map[z][x];
    }

    function canMakeStep(x1, z1, x2, z2) {
        var x1Field = Math.floor(x1/fieldSize+0.5);
        var z1Field = Math.floor(z1/fieldSize+0.5);
        var x2Field = Math.floor(x2/fieldSize+0.5);
        var z2Field = Math.floor(z2/fieldSize+0.5);
        return m(x2Field, z2Field)!=='#' && (m(x1Field, z2Field)!=='#' || m(x2Field, z1Field)!=='#');
    }

    function drawFloor() {
        var texture = new THREE.TextureLoader().load( "images/crate.jpg" );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 8, 8 );
        //texture.minFilter = THREE.LinearNearest;
        //texture.magFilter = THREE.LinearFilter;

        var geometry = new THREE.PlaneGeometry( 400, 400 );
        var material = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
        material.map = texture;
        var plane = new THREE.Mesh( geometry, material );
        plane.rotation.x = 3.14/2;
        scene.add(plane);
    }

    function drawWalls() {
        for(var z=0; z<map.length; z++) {
            var startX = null;
            for(var x=0; x<map[z].length; x++) {
                if(startX==null && m(x, z)==='#') startX = x;
                else if(m(x, z)!=='#') {
                    if(startX!=null) {
                        if(x!=startX+1) placeWall(startX, z, x-1, z);
                        else if(m(x-1, z-1)!=='#' && m(x-1, z+1)!=='#') placeColumn(x-1, z);
                    }
                    startX = null;
                }
            }
            if(startX!=null) placeWall(startX, z, map[z].length-1, z);
        }

        for(var x=0; x<map[0].length; x++) {
            var startZ = null;
            for(var z=0; z<map.length; z++) {
                if(startZ==null && m(x, z)==='#') startZ = z;
                else if(m(x, z)!=='#') {
                    if(startZ!=null && z!=startZ+1) placeWall(x, startZ, x, z-1);
                    startZ = null;
                }
            }
            if(startZ!=null) placeWall(x, startZ, x, map.length-1);
        }
    }
    
    function drawSkybox() {
        // http://www.custommapmakers.org/skyboxes.php
        var loader = new THREE.CubeTextureLoader();
        loader.setPath('images/skybox/');
        var texture = loader.load([
            'b.jpg',
            'f.jpg',
            'd.jpg',
            'u.jpg',
            'r.jpg',
            'l.jpg'
        ]);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;

        skybox = new THREE.Mesh(
            new THREE.BoxGeometry( 160, 160, 160 ),
            new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: texture, side: THREE.BackSide} )
        );
        scene.add( skybox );
    }

    function addLights() {
        var ambientLight = new THREE.AmbientLight( 0xffffff ); // soft white light
        scene.add( ambientLight );

        for(var z=0; z<map.length; z++) {
            for(var x=0; x<map[z].length; x++) {
                if(m(x, z)==='*') {
                    var light = new THREE.PointLight( 0xffffff, 5, 3*fieldSize );
                    light.position.set(x*fieldSize, wallHeight, z*fieldSize);
                    scene.add( light );
                    var candleLight = new THREE.PointLight( 0xaa6600, 19, 2*fieldSize );
                    candleLight.position.set(x*fieldSize, wallHeight, z*fieldSize);
                    scene.add( candleLight );
                }
            }
        }
    }

    var map = [
        "####################",
        " *    ###          #",
        "####  #    *  ###  #",
        "#  #  #  # #  # ## #",
        "#  * #*    #   # *# #",
        "#  ##      #     # #",
        "#     *   ## # #   #",
        "# ## ### #  ## ## ##",
        "#        #  #   #  #",
        "####################"
    ];
    var fieldSize = 4;

    var scene = new THREE.Scene();
    var step = 0;
    var stepHeight = 0.15;
    var walkingSpeed = 0.15;
    var rotationSpeed = 0.05;

    var startingPosition = { x: 2, z: 1 };
    var myHeight = 3;

    var wallHeight = 8;
    var wallWidth = 1;
	
	var currentAction = '';

    var skybox;

    // scene init
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( 0.9*window.innerWidth, 0.9*window.innerHeight );  // TODO make it 100% screen
    document.body.appendChild( renderer.domElement );

    // camera init
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    camera.position.set(startingPosition.x*fieldSize, myHeight, startingPosition.z*fieldSize);
    camera.up = new THREE.Vector3(0,1,0);
    camera.lookAt({x: startingPosition.x*fieldSize+1, y: myHeight, z: 0});
    camera.rotation.order = 'YXZ';

    drawSkybox();
    drawFloor();
    drawWalls();
    addLights();

    var render = function () {
        requestAnimationFrame( render );
		
        skybox.position.copy(camera.position);
		
		if(currentAction=='l') camera.rotation.y += rotationSpeed;
		else if(currentAction=='r') camera.rotation.y -= rotationSpeed;
		else if(currentAction=='u') {
			var newX = camera.position.x - walkingSpeed*Math.sin(camera.rotation.y);
			var newZ = camera.position.z - walkingSpeed*Math.cos(camera.rotation.y);
			if(canMakeStep(camera.position.x, camera.position.z, newX, newZ)) {
				camera.position.x = newX
				camera.position.y = myHeight + stepHeight*Math.sin(step)*Math.sin(step);
				camera.position.z = newZ;
				step += 0.2;
			}
		} else if(currentAction=='d') {
			var newX = camera.position.x + walkingSpeed*Math.sin(camera.rotation.y);
			var newZ = camera.position.z + walkingSpeed*Math.cos(camera.rotation.y);
			if(canMakeStep(camera.position.x, camera.position.z, newX, newZ)) {
				camera.position.x = newX
				camera.position.y = myHeight + stepHeight*Math.sin(step)*Math.sin(step);
				camera.position.z = newZ;
				step += 0.2;
			}
		}
		
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
    };

    document.addEventListener('keydown', function (event) {
        var keycode = event.keyCode;
        switch(keycode){
            case 37 : //left
				currentAction = 'l';
                break;
            case 38 : // up
                currentAction = 'u';
                break;
            case 39 : // right
				currentAction = 'r';
                break;
            case 40 : // down
				currentAction = 'd';
                break;
            case 68 : // d
                // look up
                camera.rotateOnAxis((new THREE.Vector3(1, 0, 0)).normalize(), degInRad(1)); //niby działa, ale sześcian jakiś rozjechany :O
                break;
            case 67 : // c
                // look down
                camera.rotateOnAxis((new THREE.Vector3(1, 0, 0)).normalize(), degInRad(-1));
                break;

            case 81 : // q
                camera.position.z +=walkingSpeed;
                break;

            case 87 : // w
                camera.position.x -=walkingSpeed;
                break;

        }
    }, false);
    document.addEventListener('keyup', function (event) {
        step = 0;
        camera.position.y = myHeight;
		currentAction = '';
    }, false);

    function degInRad(deg) {
        return deg * Math.PI / 180;
    }

    render();
};