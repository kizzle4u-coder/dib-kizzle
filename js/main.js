/* global THREE */
(() => {
  const statusEl = document.getElementById("status");
  const bootLog = (msg) => {
    console.log(msg);
    statusEl.textContent = msg;
  };

  bootLog("DIB_BOOT_OK v1 — DIB");

  // ---- Three.js minimal scene (no loaders, no modules) ----
  const canvas = document.getElementById("canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 1, 3);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(3, 3, 3);
  scene.add(dir);

  // "Woofer" placeholder: a cylinder that moves like a cone
  const basket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.12, 64),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );
  scene.add(basket);

  const cone = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.38, 0.06, 64),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
  );
  cone.position.y = 0.04;
  basket.add(cone);

  // Resize handling
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  // ---- Audio: use built-in AnalyserNode (simpler than AudioWorklet) ----
  let audioCtx = null;
  let analyser = null;
  let sourceNode = null;
  let gainNode = null;
  let audioBuffer = null;

  async function ensureAudio() {
    if (audioCtx) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.8;

    analyser.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // IMPORTANT: your screenshot shows track.mp3 inside /js/
    // If you move it later, update this path.
    const resp = await fetch("./js/track.mp3");
    const arr = await resp.arrayBuffer();
    audioBuffer = await audioCtx.decodeAudioData(arr);
  }

  function startPlayback() {
    if (!audioCtx || !audioBuffer) return;

    if (sourceNode) {
      try { sourceNode.stop(); } catch (_) {}
      sourceNode.disconnect();
      sourceNode = null;
    }

    sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.loop = true;
    sourceNode.connect(analyser);
    sourceNode.start();
  }

  function stopPlayback() {
    if (gainNode && audioCtx) {
      gainNode.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.05);
    }
  }

  function resetGain() {
    if (gainNode && audioCtx) {
      gainNode.gain.setTargetAtTime(0.8, audioCtx.currentTime, 0.05);
    }
  }

  // UI hooks
  document.getElementById("playBtn").onclick = async () => {
    await ensureAudio();
    await audioCtx.resume();
    resetGain();
    startPlayback();
    bootLog("Playing — no black screen");
  };

  document.getElementById("stopBtn").onclick = () => {
    stopPlayback();
    bootLog("Stopped (gain down)");
  };

  document.getElementById("resetBtn").onclick = () => {
    resetGain();
    bootLog("Reset gain");
  };

  // ---- Bass movement ----
  const timeData = new Uint8Array(2048);
  let pos = 0;
  let vel = 0;

  // Tunables (simple spring)
  const excursion = 0.05;
  const spring = 1400;
  const damping = 40;

  function getBassLevel() {
    if (!analyser) return 0;
    analyser.getByteTimeDomainData(timeData);

    // Cheap amplitude estimate
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      const v = (timeData[i] - 128) / 128;
      sum += Math.abs(v);
    }
    const amp = sum / timeData.length; // ~0..1
    return Math.min(amp * 1.8, 1.0);
  }

  function animate() {
    const bass = getBassLevel();
    const target = bass * excursion;

    const force = -spring * (pos - target) - damping * vel;
    vel += force * 0.001;
    pos += vel * 0.001;

    // clamp
    if (pos > excursion) pos = excursion;
    if (pos < -excursion) pos = -excursion;

    cone.position.y = 0.04 + pos;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
})();
