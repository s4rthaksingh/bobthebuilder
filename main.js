import * as THREE from 'three';
import { OrbitControls, plane } from 'three/examples/jsm/Addons.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const loader = new THREE.TextureLoader();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const controls = new OrbitControls(camera,renderer.domElement);

const planeGeometry = new THREE.PlaneGeometry(4,4);
const planeMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff ,  transparent:false, opacity: 0} );
const planes = [];
const boxes = [];

function generatePlanes(size){
  for (let i = -size/2; i < size/2; i+=4) {
    for (let j = 0; j < size; j+=4) {
      const plane = new THREE.Mesh(planeGeometry,planeMaterial);
      plane.rotation.x = -Math.PI/2;
      plane.position.set(i,0,j)
      scene.add(plane);
      planes.push(plane);  
    }

  }
}

generatePlanes(16);



const invisibleBoxGeometry = new THREE.BoxGeometry(4,4,4);
const invisibleBoxMaterial = new THREE.MeshBasicMaterial({color:0xffffff, transparent:true  , opacity: 0.3})
const invisibleBox = new THREE.Mesh(invisibleBoxGeometry,invisibleBoxMaterial);
let hoveredObject = planes[0];

camera.position.z = 20;
camera.position.y = 20;
camera.lookAt(0,0,0);


window.addEventListener("mousemove",(event)=>{
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  hover();
})

window.addEventListener("keydown",(e)=>{
  if(e.key === " "){
    const newBox = invisibleBox.clone();
    loader.load("./textures/maxvanden.jpg", function(texture) {
      // For Three.js r150+:
      texture.colorSpace = THREE.SRGBColorSpace;
      // For older Three.js:
      // texture.encoding = THREE.sRGBEncoding;

      newBox.material = new THREE.MeshBasicMaterial({ map: texture });
      scene.add(newBox);
      boxes.push(newBox);
      scene.remove(invisibleBox);
    });
  }
})

function hover(){
  raycaster.setFromCamera(pointer,camera);
  const intersects = raycaster.intersectObjects(planes.concat(boxes));
  if (!intersects[0]) return;
  if (hoveredObject && hoveredObject === intersects[0].object) return;
  scene.remove(invisibleBox);
  hoveredObject = intersects[0].object;
  if(hoveredObject.geometry === planeGeometry) invisibleBox.position.set(hoveredObject.position.x,hoveredObject.position.y+2,hoveredObject.position.z);
  else invisibleBox.position.set(hoveredObject.position.x,hoveredObject.position.y+4,hoveredObject.position.z);
  scene.add(invisibleBox);
}


function animate() {

  controls.update();
  renderer.render( scene, camera );

}