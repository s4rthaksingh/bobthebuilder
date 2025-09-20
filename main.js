import * as THREE from "three";
import { OrbitControls, plane } from "three/examples/jsm/Addons.js";
import { io } from "socket.io-client";

const socket = io('http://localhost:3000');


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 150;
camera.position.y = 100;
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const loader = new THREE.TextureLoader();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const controls = new OrbitControls(camera, renderer.domElement);

const planeGeometry = new THREE.PlaneGeometry(4, 4);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: false,
  opacity: 0,
});
const planes = [];
const boxes = [];

function generatePlanes(size) {
  for (let i = -size / 2; i < size / 2; i += 4) {
    for (let j = 0; j < size; j += 4) {
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = -Math.PI / 2;
      plane.position.set(i, 0, j);
      scene.add(plane);
      planes.push(plane);
    }
  }
}

generatePlanes(100);

const invisibleBoxGeometry = new THREE.BoxGeometry(4, 4, 4);
const invisibleBoxMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.3,
});
const invisibleBox = new THREE.Mesh(invisibleBoxGeometry, invisibleBoxMaterial);
let hoveredObject = planes[0];

socket.on('newBox',(boxData) => {
  const newBox = invisibleBox.clone();
  newBox.material = new THREE.MeshBasicMaterial({color : 0xffff00});

  newBox.position.set(
    boxData.position.x,
    boxData.position.y,
    boxData.position.z
  );
  newBox.rotation.set(
    boxData.rotation.x,
    boxData.rotation.y,
    boxData.rotation.z
  );
  newBox.scale.set(
    boxData.scale.x,
    boxData.scale.y,
    boxData.scale.z
  );

  scene.add(newBox);
  boxes.push(newBox);

  const edges = new THREE.EdgesGeometry(newBox.geometry);
  const outline = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({color:0x000000, linewidth : 2})
  );
  newBox.add(outline);
})

window.addEventListener("mousemove", (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  hover();
});

window.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    const newBox = invisibleBox.clone();
    newBox.material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    scene.add(newBox);
    boxes.push(newBox);
    scene.remove(invisibleBox);

    const edges = new THREE.EdgesGeometry(newBox.geometry);
    const outline = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 }) // Black outline
    );
    newBox.add(outline);
    socket.emit("newBox", {
      position: { x: newBox.position.x, y: newBox.position.y, z: newBox.position.z },
      rotation: { x: newBox.rotation.x, y: newBox.rotation.y, z: newBox.rotation.z },
      scale:    { x: newBox.scale.x,    y: newBox.scale.y,    z: newBox.scale.z }
    });    
  }
});

function hover() {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(planes.concat(boxes));
  if (!intersects[0]) return;
  if (hoveredObject && hoveredObject === intersects[0].object) return;
  scene.remove(invisibleBox);
  hoveredObject = intersects[0].object;
  if (hoveredObject.geometry === planeGeometry)
    invisibleBox.position.set(
      hoveredObject.position.x,
      hoveredObject.position.y + 2,
      hoveredObject.position.z
    );
  else
    invisibleBox.position.set(
      hoveredObject.position.x,
      hoveredObject.position.y + 4,
      hoveredObject.position.z
    );
  scene.add(invisibleBox);
}

function animate() {
  controls.update();
  renderer.render(scene, camera);
}
