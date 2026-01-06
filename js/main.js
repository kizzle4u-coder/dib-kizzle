// Load THREE + GLTFLoader from CDN
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

import {
  renderTemplatePicker,
  renderSaveTemplateBtn,
  renderExportBtn
} from "./uiTemplates.js";

let renderer, scene, camera;
let wooferModel = null;
let coneMesh = null;

let analyser = null;
let dataArray = null;
let audio = null;

async function init(){

  // ---------------- UI BAR ----------------
  const ui = document.getElementById("ui");

  ui.appendChild(
    renderTemplatePicker(templateId => {
      console.log("Template selected:", templateId);
    })
  );

  ui.appendChild(
    renderSaveTemplateBtn(() => {
      console.log("Save current chops clicked");
    })
  );

  ui.appendChild(
    renderExportBtn(() => {
      console.log("Export clicked");
    })
  );

  // ---------------- RENDERER & SCENE ----------------
  const canvas = document.getElementById("canvas");

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  scene = new THREE.Scene();
  scene.background = null;

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.2, 3.2);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(2, 2, 2);
  scene.add(dir);

  // ---------------- LOAD WOOFER MODEL ----------------
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    "./woofer.glb",          // file is in /js/ relative to main.js
    gltf => {
      wooferModel = gltf.scene;

      wooferModel.position.set(0, 0, 0);
      wooferModel.rotation.set(0, 0, 0);
      wooferModel.scale.set(1, 1, 1);

      // Try to find the cone mesh by name
      wooferModel.traverse(obj => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;

          const n = obj.name.toLowerCase();
          if (
            n.includes("cone") ||
            n.includes("woofer") ||
            n.includes("dust")
          ) {
            coneMesh = obj;
          }
        }
      });

      // Fallback: if we didn't find a cone, just pick first mesh
      if (!coneMesh) {
        wooferModel.traverse(obj => {
          if (obj.isMesh && !coneMesh) coneMesh = obj;
        });
      }

      scene.add(wooferModel);
    },
    undefined,
    err => {
      console.error("Error loading woofer.glb:", err);

      // Fallback placeholder so screen isn't empty
      const geo = new THREE.CylinderGeometry(0.8, 0.8, 0.4, 64);
      const mat = new THREE.MeshStandardMaterial({ color: 0x222222 });
      coneMesh = new THREE.Mesh(geo, mat);
      scene.add(coneMesh);
    }
  );

  // ---------------- AUDIO ----------------
  const listener = new THREE.AudioListener();
  camera.add(listener);

  audio = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();

  audioLoader.load(
    "./track.mp3",  // must exist as /js/track.mp3
    buffer => {
      audio.setBuffer(buffer);
      audio.setLoop(true);
      audio.setVolume(0.9);

      // Browser may require a click before play; this is OK.
      try { audio.play(); } catch(e) { console.log("Autoplay blocked"); }

      analyser = new THREE.AudioAnalyser(audio, 32);
      dataArray = new Uint8Array(analyser.analyser.frequencyBinCount);
    },
    undefined,
    err => {
      console.error("Error loading track.mp3:", err);
    }
  );

  // ---------------- RESIZE ----------------
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
}

// ---------------- ANIMATION LOOP ----------------
function animate(){
  requestAnimationFrame(animate);

  // Bass → cone motion
  if (analyser && coneMesh) {
    analyser.analyser.getByteFrequencyData(dataArray);
    let bass = (dataArray[0] + dataArray[1] + dataArray[2]) / 3;
    let push = THREE.MathUtils.mapLinear(bass, 0, 255, 0, 0.12);
    coneMesh.position.z = -push;
  }

  // Slow spin of whole model
  if (wooferModel) {
    wooferModel.rotation.y += 0.002;
  }

  renderer.render(scene, camera);
}

init();
