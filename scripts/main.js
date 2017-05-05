window.onload = function () {

  function placePainting(wallX, wallZ, facing) { //     <3 <3
    var haroldPath = "images/harold"+(Math.floor(Math.random()*4)+1)+".png";   // <3 <3
    var texture = new THREE.TextureLoader().load(haroldPath);      // <3 <3
    var haroldMaterial = new THREE.MeshLambertMaterial( { color: 0x666666, map: texture} );

    var harold = new THREE.Mesh(
      new THREE.BoxGeometry(
        facing==='n' || facing==='s' ? 0.9*fieldSize : 0.05*wallWidth,
        0.9*fieldSize,
        facing==='w' || facing==='e' ? 0.9*fieldSize : 0.05*wallWidth
      ),
      haroldMaterial
    );
    harold.position.x = wallX*fieldSize;
    if(facing==='w') harold.position.x += wallWidth;
    if(facing==='e') harold.position.x -= wallWidth;
    harold.position.y = wallHeight/2;
    harold.position.z = wallZ*fieldSize;
    if(facing==='n') harold.position.z += wallWidth;
    if(facing==='s') harold.position.z -= wallWidth;
    scene.add(harold);

  }    // <3 <3

  function placeWall(fromX, fromZ, toX, toZ) {

    var lenX = Math.abs(toX-fromX);
    var lenZ = Math.abs(toZ-fromZ);

    var textureX = new THREE.TextureLoader().load( "images/stone.jpg" );

    var bump = new THREE.TextureLoader().load("images/stone-bump.jpg");
    textureX.bumpMap = bump;
    textureX.bumpScale = 0.2;

    textureX.wrapS = THREE.RepeatWrapping;
    textureX.wrapT = THREE.RepeatWrapping;
    textureX.repeat.set(Math.max(lenX, 1), 3 );
    var materialX = new THREE.MeshLambertMaterial( { color: 0x666666, map: textureX} );

    var textureZ = new THREE.TextureLoader().load( "images/stone.jpg" );
    textureZ.wrapS = THREE.RepeatWrapping;
    textureZ.wrapT = THREE.RepeatWrapping;
    textureZ.repeat.set(Math.max(lenZ, 1), 3 );
    var materialZ = new THREE.MeshLambertMaterial( { color: 0x666666, map: textureZ} );

    var xSize = lenX*fieldSize;
    var zSize = lenZ*fieldSize;
    if(toX===fromX) xSize+=2*wallWidth; else zSize+=2*wallWidth;

    var wall = new THREE.Mesh(
      new THREE.BoxGeometry( xSize, wallHeight, zSize ),
      new THREE.MeshFaceMaterial([materialZ, materialZ, materialX, materialX, materialX, materialX])
    );
    wall.position.x = (toX+fromX)*fieldSize/2;
    wall.position.y = wallHeight/2;
    wall.position.z = (toZ+fromZ)*fieldSize/2;
    scene.add(wall);

    // place paintings
    if(lenX>1) {
      var paintingX = Math.ceil((toX+fromX)/2);
      if(Math.random()>0.5 && m(paintingX, toZ+1)!=='#') placePainting(paintingX, toZ, 's');
      else if(m(paintingX, toZ-1)!=='#') placePainting(paintingX, toZ, 'n');
    }

    if(lenZ>1) {
      var paintingZ = Math.ceil((toZ+fromZ)/2);
      if(Math.random()>0.5 && m(toX+1, paintingZ)!=='#') placePainting(toX, paintingZ, 'w');
      else if(m(toX, paintingZ)!=='#') placePainting(toX, paintingZ, 'e');
    }
  }

  function placeColumn(x, z) {
    var texture = new THREE.TextureLoader().load( "images/stone.jpg" );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 5, 3 );

    var column = new THREE.Mesh(
      new THREE.CylinderGeometry(fieldSize/1.5, fieldSize/1.5, wallHeight, 32),
      new THREE.MeshLambertMaterial( {color: 0x330000, map: texture} )
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
    if(x2Field<0 || x2Field>map[0].length || z2Field<0 || z2Field>map.length) return false;
    return m(x2Field, z2Field)!=='#' && (m(x1Field, z2Field)!=='#' || m(x2Field, z1Field)!=='#');
  }

  function drawFloor(x, z) {
    var texture = new THREE.TextureLoader().load( "images/floor.png" );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 2*(x+2), 2*(z+2) );

    var geometry = new THREE.PlaneGeometry( (x+2)*fieldSize, (z+2)*fieldSize );
    var material = new THREE.MeshLambertMaterial( {color: 0x888888, side: THREE.DoubleSide, map: texture} );
    var plane = new THREE.Mesh( geometry, material );
    plane.rotation.x = 3.14/2;
    plane.position.set(x*fieldSize/2, 0, z*fieldSize/2);
    scene.add(plane);
  }

  function drawWalls() {
    for(var z=0; z<map.length; z++) {
      var startX = null;
      for(var x=0; x<=map[z].length; x++) {
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

    for(x=0; x<map[0].length; x++) {
      var startZ = null;
      for(z=0; z<map.length; z++) {
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
          var tmp_teapot = createNewTeapot(x,z);
          teapots.push(tmp_teapot);
          scene.add(tmp_teapot);
          teapots_amount++;
        }
      }
    }
  }

  function createNewTeapot(x,z) {
    var teapot;
    var size = 0.5;
    var	segments = 10;
    var bottom = true;
    var lid = true;
    var body = true;
    var fitLid = false;
    var blinn = true
    var teapotGeometry = new THREE.TeapotBufferGeometry( size, segments, bottom, lid, body, fitLid, blinn)
    teapot = new THREE.Mesh(
      teapotGeometry,
      new THREE.MeshPhongMaterial( {color: 0x8b8762, shininess: 50} ) );

      teapot.position.x = x*fieldSize;
      teapot.position.z = z*fieldSize;
      teapot.position.y = 3;
      return teapot;
    }


    function isNearTeapot( x_pos, z_pos, teapot){
      if( teapot != undefined &&
        x_pos < teapot.position.x + 1 && x_pos > teapot.position.x - 1 &&
        z_pos < teapot.position.z + 1 && z_pos > teapot.position.z - 1){
          return true;
        }
        else return false;
      }

      function removeTeapot(teapot){
        teapot.material.dispose();
        teapot.geometry.dispose();
        scene.remove(teapot);
      }


      var map = [
        "####################",
        " *    ###          #",
        "####  #    *  ###  #",
        "#  #  #  # #  # ## #",
        "#  * #*    #  # *# #",
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
      var teapots = [];
      var teapots_amount = 0;
      var teapots_found = 0;




      var newX, newZ;


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
      drawWalls();
      drawFloor(map[0].length, map.length);
      addLights();

      var render = function () {
        requestAnimationFrame( render );

        skybox.position.copy(camera.position);


        //rotate teapots
        teapots.forEach(function(teapot) {
          teapot.rotation.x+=0.01;
          teapot.rotation.z+=0.01;
        });

        //walking into teapot
        var x_pos = camera.position.x;
        var z_pos = camera.position.z;

        teapots.forEach(function(t, i, teapots){
          if(isNearTeapot(x_pos, z_pos,t)){
            teapots_found ++;
            removeTeapot(t);
            delete teapots[i];
            console.log("teapots found: "+ teapots_found);
          }});

          if(teapots_found == teapots_amount){
            console.log("You've found all teapots!");

          }




          if(currentAction=='l') camera.rotation.y += rotationSpeed;
          else if(currentAction=='r') camera.rotation.y -= rotationSpeed;
          else if(currentAction=='u') {
            newX = camera.position.x - walkingSpeed*Math.sin(camera.rotation.y);
            newZ = camera.position.z - walkingSpeed*Math.cos(camera.rotation.y);
            if(canMakeStep(camera.position.x, camera.position.z, newX, newZ)) {
              camera.position.x = newX;
              camera.position.y = myHeight + stepHeight*Math.sin(step)*Math.sin(step);
              camera.position.z = newZ;
              step += 0.2;
            }
          } else if(currentAction=='d') {
            newX = camera.position.x + walkingSpeed*Math.sin(camera.rotation.y);
            newZ = camera.position.z + walkingSpeed*Math.cos(camera.rotation.y);
            if(canMakeStep(camera.position.x, camera.position.z, newX, newZ)) {
              camera.position.x = newX;
              camera.position.y = myHeight + stepHeight*Math.sin(step)*Math.sin(step);
              camera.position.z = newZ;
              step += 0.2;
            }
          } else if(currentAction=='cu' && camera.rotation.x<3.14/2)
          camera.rotateOnAxis((new THREE.Vector3(1, 0, 0)).normalize(), degInRad(1));
          else if(currentAction=='cd' && camera.rotation.x>-3.14/2)
          camera.rotateOnAxis((new THREE.Vector3(1, 0, 0)).normalize(), degInRad(-1));

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
            currentAction = 'cu';
            break;
            case 67 : // c
            // look down
            currentAction = 'cd';
            break;

            case 81 : // q
            camera.position.z +=walkingSpeed;
            break;

            case 87 : // w
            camera.position.x -=walkingSpeed;
            break;

          }
        }, false);
        document.addEventListener('keyup', function() {
          step = 0;
          camera.position.y = myHeight;
          currentAction = '';
        }, false);

        function degInRad(deg) {
          return deg * Math.PI / 180;
        }

        render();
      };
