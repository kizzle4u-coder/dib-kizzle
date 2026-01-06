// Load THREE from CDN (this replaces three.min.js completely)
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

// UI helper imports
import { 
  renderTemplatePicker, 
  renderSaveTemplateBtn, 
  renderExportBtn 
} from "./uiTemplates.js";

import { getTemplates } from "./userTemplates.js";

let renderer, scene, camera, cone;

async function init(){

  // =========================
  // UI BAR
  // =========================
  const ui = document.getElementById("ui");

  // Template Picker
  ui.appendChild(
    renderTemplatePicker(templateId=>{
      console.log("Template selected:", templateId);
    })
  );

  // Save Button
  ui.appendChild(
    renderSaveTemplateBtn(()=>{
      console.log("Save current chops clicked");
    })
  );

  // Export Button
  ui.appendChild(
    renderExportBtn(()=>{
      console.log("Export now");
    })
  );


  // =========================
  // 3D SPEAKER SCENE
  // =========================
  const canvas = document.getElementById("canvas");

  renderer = new THREE.WebGLRenderer({ canvas, alpha:true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0,1,3);

  // Lights
  const amb = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(amb);

  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(2,2,2);
  scene.add(dir);

  // Woofer Cone
  const geo = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 64);
  const mat = new THREE.MeshStandardMaterial({ color:0x111111 });
  cone = new THREE.Mesh(geo, mat);
  scene.add(cone);

  animate();
}

function animate(){
  cone.rotation.y += 0.01;
  renderer.render(scene,camera);
  requestAnimationFrame(animate);
}

init();
