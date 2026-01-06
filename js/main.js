// THREE from CDN
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

// UI imports
import { 
  renderTemplatePicker, 
  renderSaveTemplateBtn, 
  renderExportBtn 
} from "./uiTemplates.js";

let renderer, scene, camera;
let wooferModel = null;
let coneMesh = null;

let analyser, dataArray, audio;

// ========================
// INIT
// ========================
async function init(){

  // ---------- UI ----------
  const ui = document.getElementById("ui");

  ui.appendChild(
    renderTemplatePicker(templateId=>{
      console.log("Template selected:", templateId);
    })
  );

  ui.appendChild(
    renderSaveTemplateBtn(()=>{
      console.log("Save current chops clicked");
    })
  );

  ui.appendChild(
    renderExportBtn(()=>{
      console.log("Export now");
    })
  );


  // ---------- SCENE ----------
  const canvas = document.getElementById("canvas");

  renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(devicePixelRatio);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.2, 3.2);


  // ---------- LIGHTS ----------
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(2,2,2);
  scene.add(dir);


  // ---------- LOAD WOOFER ----------
  const loader = new GLTFLoader();

  loader.load("./woofer.glb", gltf => {

    wooferModel = gltf.scene;

    wooferModel.position.set(0,0,0);
    wooferModel.rotation.set(0,0,0);
    wooferModel.scale.set(1,1,1);

    // try to find a cone-like object by name
    wooferModel.traverse(o=>{
      if(o.isMesh){
        o.castShadow = true;
        o.receiveShadow = true;

        const name = o.name.toLowerCase();
        if(
          name.includes("cone") || 
          name.includes("woofer") ||
          name.includes("dust")
        ){
          coneMesh = o;
        }
      }
    });

    scene.add(wooferModel);

  }, undefined, err=>{
    console.error("GLB load error:", err);
  });


  // ---------- AUDIO ----------
  const listener = new THREE.AudioListener();
  camera.add(listener);

  audio = new THREE.Audio(listener);

  const loaderAudio = new THREE.AudioLoader();
  loaderAudio.load("./track.mp3", buffer => {
    audio.setBuffer(buffer);
    audio.setLoop(true);
    audio.setVolume(0.9);
    audio.play();

    analyser = new THREE.AudioAnalyser(audio, 32);
    dataArray = new Uint8Array(analyser.analyser.frequencyBinCount);

  });


  // ---------- RESIZE ----------
  window.addEventListener("resize", ()=>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
}


// ========================
// ANIMATE
// ========================
function animate(){

  if(analyser && coneMesh){

    analyser.analyser.getByteFrequencyData(dataArray);

    let bass = (dataArray[0] + dataArray[1] + dataArray[2]) / 3;

    let push = THREE.MathUtils.mapLinear(bass, 0, 255, 0, 0.12);

    coneMesh.position.z = -push;
  }

  if(wooferModel){
    wooferModel.rotation.y += 0.002;
  }

  renderer.render(scene,camera);
  requestAnimationFrame(animate);
}

init();
