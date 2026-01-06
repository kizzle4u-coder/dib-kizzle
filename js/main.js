import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

let scene, camera, renderer, model;

init();
animate();

function init() {

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 1, 3);

  // Renderer
  const canvas = document.getElementById("canvas");
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Lights
  const amb = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(amb);

  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(3, 3, 3);
  scene.add(dir);

  // TEMP TEST OBJECT (so you always see something)
  const geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const mat = new THREE.MeshStandardMaterial({ color: 0x00ff99 });
  const cube = new THREE.Mesh(geo, mat);
  cube.name = "testCube";
  scene.add(cube);

  // Load woofer model
  const loader = new GLTFLoader();

  // IMPORTANT: this path must match where you uploaded woofer.glb
  loader.load(
    "./js/woofer.glb",
    (gltf) => {
      model = gltf.scene;
      model.position.set(0, 0, 0);
      scene.add(model);

      // remove test cube when model loads
      const temp = scene.getObjectByName("testCube");
      if (temp) scene.remove(temp);

      console.log("Woofer model loaded");
    },
    (xhr) => {
      console.log(`Loading: ${(xhr.loaded / xhr.total) * 100}%`);
    },
    (err) => {
      console.error("GLB load error:", err);
    }
  );

  // Resize support
  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  if (model) {
    model.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}
