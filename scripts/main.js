window.onload = function () {
    function placeWall(fromX, fromZ, toX, toZ) {
        var xSize = (toX-fromX)*fieldSize + 2*wallWidth;
        var zSize = (toZ-fromZ)*fieldSize + 2*wallWidth;

        var wall = new THREE.Mesh(
            new THREE.BoxGeometry( xSize, wallHeight, zSize ),
            new THREE.MeshLambertMaterial( { color: 0x3333ff} )
        );
        wall.position.x = (toX+fromX)*fieldSize/2;
        wall.position.y = wallHeight/2;
        wall.position.z = (toZ+fromZ)*fieldSize/2;
        scene.add( wall );
    }

    function m(x, y) {
        if(x<0 || x>=map[0].length || y<0 || y>=map.length) return ' ';
        return map[y][x];
    }

    function canStepInto(x, y) {
        // todo jest zle
        return m(Math.floor(x/fieldSize-0.5), Math.floor(y/fieldSize-0.5))===' ';
    }

    function drawFloor() {
        var texture = new THREE.TextureLoader().load( "images/checkerboard.jpg" );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 8, 8 );
        //texture.minFilter = THREE.LinearNearest;
        //texture.magFilter = THREE.LinearFilter;

        var geometry = new THREE.PlaneGeometry( 400, 400 );
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
        material.map = texture;
        var plane = new THREE.Mesh( geometry, material );
        plane.rotation.x = 3.14/2;
        scene.add(plane);
    }

    function drawWalls() {
        for(var y=0; y<map.length; y++) {
            var startX = null;
            for(var x=0; x<map[y].length; x++) {
                if(startX==null && m(x, y)==='#') startX = x;
                else if(m(x, y)===' ') {
                    if(startX!=null && x!=startX) placeWall(startX, y, x-1, y);
                    startX = null;
                }
            }
            if(startX!=null) placeWall(startX, y, map[y].length-1, y);
        }

        for(var x=0; x<map[0].length; x++) {
            var startZ = null;
            for(var z=0; z<map.length; z++) {
                if(startZ==null && m(x, z)==='#') startZ = z;
                else if(m(x, z)===' ') {
                    if(startZ!=null && z!=startZ) placeWall(x, startZ, x, z-1);
                    startZ = null;
                }
            }
            if(startZ!=null) placeWall(x, startZ, x, map.length-1);
        }
    }

    function addLights() {
        var light = new THREE.AmbientLight( 0x999999 ); // soft white light
        scene.add( light );

        var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        directionalLight.position.set( 10, 5, 8 );
        scene.add( directionalLight );
    }

    var map = [
        "####################",
        "###          #      ",
        "####  #    *  ###  #",
        "#  #  #  # #  # ## #",
        "#  * #    #   # *# #",
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
    var walkingSpeed = 0.65;
    var rotationSpeed = 0.25;

    var startingPosition = { x: 8, z: 5 };
    var myHeight = 3;

    var wallHeight = 5;
    var wallWidth = 2;

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

    drawFloor();
    drawWalls();
    addLights();

    var render = function () {
        requestAnimationFrame( render );

        //cube.rotation.x += 0.01;

        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
    };

    document.addEventListener('keydown', function (event) {
        var keycode = event.keyCode;
        switch(keycode){
            case 37 : //left
                camera.rotation.y += rotationSpeed;
                break;
            case 38 : // up
                var newX = camera.position.x - walkingSpeed*Math.sin(camera.rotation.y);
                var newZ = camera.position.z - walkingSpeed*Math.cos(camera.rotation.y);
                if(canStepInto(newX, newZ)) {
                    camera.position.x = newX
                    camera.position.y = myHeight + stepHeight*Math.sin(step)*Math.sin(step);
                    camera.position.z = newZ;
                    step += 0.2;
                }
                break;
            case 39 : // right
                camera.rotation.y -= rotationSpeed;
                break;
            case 40 : // down
                camera.position.x += walkingSpeed*Math.sin(camera.rotation.y);
                camera.position.y = myHeight + stepHeight*Math.sin(step)*Math.sin(step);
                camera.position.z += walkingSpeed*Math.cos(camera.rotation.y);
                step += 0.2;
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
    }, false);

    function degInRad(deg) {
        return deg * Math.PI / 180;
    }

    render();
};