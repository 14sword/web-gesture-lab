// ================================================================
//  GESTURE DETECTION & CAMERA SYSTEM (Pure Camera Mode)
// ================================================================

// Shared hands state — read by solar.js / tree.js / main.js
let ActiveHands = [];

// Camera state flag — true once MediaPipe starts sending frames with hands
let cameraActive = false;

// Concurrency lock to prevent MediaPipe inference overload
let isProcessingFrame = false;

// Detect if we're on a mobile device (affects camera resolution)
const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

// ----------------------------------------------------------------
//  Magical Cursor Particles (rendered by solar.js / tree.js)
// ----------------------------------------------------------------
let cursorP = [];
function updateCursorParticles(){
  if(!activeView){ cursorP = []; return; }
  for (let h of ActiveHands) {
    if(h.visible){
      if(activeView === 'ink'){
        for(let i=0; i<2; i++){
          const angle = Math.random() * Math.PI * 2;
          const dist = 10 + Math.random() * 25;
          cursorP.push({
            x: h.x + Math.cos(angle) * dist,
            y: h.y + Math.sin(angle) * dist,
            vx: -Math.sin(angle) * (1.5 + Math.random() * 2) + (Math.random() - 0.5) * 0.5,
            vy: Math.cos(angle) * (1.5 + Math.random() * 2) + (Math.random() - 0.5) * 0.5,
            size: 0.3 + Math.random() * 0.5,
            life: 1.0,
            decay: 0.02 + Math.random() * 0.03,
            r: 100 + Math.floor(Math.random() * 80),
            g: 180 + Math.floor(Math.random() * 75),
            b: 255,
            type: 'ink'
          });
        }
      } else if(activeView === 'tree'){
        for(let i=0; i<2; i++){
          cursorP.push({
            x: h.x + (Math.random() - 0.5) * 16,
            y: h.y + (Math.random() - 0.5) * 16,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -1 - Math.random() * 2,
            size: 0.4 + Math.random() * 0.7,
            life: 1.0,
            decay: 0.015 + Math.random() * 0.025,
            r: 255,
            g: 200 + Math.floor(Math.random() * 55),
            b: 50 + Math.floor(Math.random() * 100),
            type: 'tree'
          });
        }
      }
    }
  }
  for(let i = cursorP.length - 1; i >= 0; i--){
    const p = cursorP[i];
    if(p.type === 'tree') p.vy += 0.08;
    p.x += p.vx; p.y += p.vy;
    p.life -= p.decay;
    if(p.life <= 0) cursorP.splice(i, 1);
  }
}

// ----------------------------------------------------------------
//  Gesture Classification from MediaPipe Landmarks
// ----------------------------------------------------------------
function detectGesture(lm){
  if(!lm) return {type:'none'};
  const thumb=lm[4], index=lm[8], middle=lm[12], ring=lm[16], pinky=lm[20];
  const thumbMcp=lm[2], indexMcp=lm[5], middleMcp=lm[9], ringMcp=lm[13], pinkyMcp=lm[17];

  const dist3D = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
  const palmSize = dist3D(indexMcp, pinkyMcp) || 0.01;

  const ext=[
    dist3D(index, indexMcp) > palmSize * 0.95,
    dist3D(middle, middleMcp) > palmSize * 1.0,
    dist3D(ring, ringMcp) > palmSize * 0.9,
    dist3D(pinky, pinkyMcp) > palmSize * 0.8
  ];
  const extCount = ext.filter(Boolean).length;
  // 大拇指判定：大拇指尖到大拇指 MCP 关节的距离在伸直时较长，同时大拇指尖到食指 MCP 的距离也需保持一定宽度
  const thumbExt = dist3D(thumb, thumbMcp) > palmSize * 0.65 && dist3D(thumb, indexMcp) > palmSize * 0.85;
  const totalFingers = extCount + (thumbExt ? 1 : 0);

  let type = 'none';
  if(totalFingers === 5 || extCount === 4) type = 'stream';
  else if(extCount === 3) type = 'heart';
  else if(extCount === 2) type = 'attract';
  else if(extCount === 1) type = 'rotate';
  else if(extCount === 0) type = 'gather';

  return {type};
}

// ----------------------------------------------------------------
//  Camera Status UI Helper
// ----------------------------------------------------------------
function setCamStatus(msg, isError) {
  const el = document.getElementById('cam-status');
  if (!el) return;
  if (!msg) {
    el.classList.remove('show');
    return;
  }
  el.textContent = msg;
  el.className = 'show' + (isError ? ' error' : '');
}

// ----------------------------------------------------------------
//  Dynamic Script Loader with Timeout
// ----------------------------------------------------------------
function loadScript(u){
  return new Promise((ok, no) => {
    const s = document.createElement('script');
    s.src = u; s.crossOrigin = 'anonymous';
    s.onload = ok;
    s.onerror = () => { s.remove(); no(); };
    document.head.appendChild(s);
  });
}
function loadWithTimeout(url, ms){
  return Promise.race([
    loadScript(url),
    new Promise((_, no) => setTimeout(() => no(new Error('timeout')), ms))
  ]);
}

// ----------------------------------------------------------------
//  Camera Initialization (Pure MediaPipe, no mouse fallback)
// ----------------------------------------------------------------
async function initCamera(){
  setCamStatus('🎥 正在请求摄像头权限…');

  // Request camera — mobile uses front camera, lower resolution for performance
  let stream;
  const videoConstraints = isMobile
    ? { width: 320, height: 240, facingMode: 'user' }
    : { width: 640, height: 480, facingMode: 'user' };

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
  } catch(e) {
    console.log('Camera error:', e.message);
    if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
      setCamStatus('⚠️ 请在浏览器中允许摄像头权限，刷新后重试', true);
    } else {
      setCamStatus('⚠️ 摄像头不可用：' + e.message, true);
    }
    return null;
  }

  setCamStatus('⏳ 正在加载手势识别模块…');

  // Load MediaPipe Hands from CDN (try local lib/ first, then CDNs)
  let cdn = null;
  for(const p of ['lib/', 'https://cdn.jsdelivr.net/npm/', 'https://unpkg.com/']){
    try {
      await loadWithTimeout(p + '@mediapipe/hands@0.4.1675469240/hands.js', 6000);
      cdn = p + '@mediapipe/hands@0.4.1675469240/';
      break;
    } catch(e) { console.log('Hands CDN fail:', p); }
  }
  if(!cdn){
    setCamStatus('⚠️ 手势识别模块加载失败，请检查网络连接', true);
    return null;
  }

  // Try to load CameraUtils (optional, gracefully skip if fails)
  for(const p of ['lib/', 'https://cdn.jsdelivr.net/npm/', 'https://unpkg.com/']){
    await loadWithTimeout(p + '@mediapipe/camera_utils@0.3.1675466862/camera_utils.js', 5000).catch(() => {});
  }

  // Configure MediaPipe Hands
  const hands = new Hands({ locateFile: f => cdn + f });
  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.5
  });

  hands.onResults(res => {
    const W = window.innerWidth, H = window.innerHeight;
    if(res.multiHandLandmarks && res.multiHandLandmarks.length > 0){
      cameraActive = true;

      for(let i = 0; i < res.multiHandLandmarks.length; i++){
        if(!ActiveHands[i]) ActiveHands[i] = {
          type: 'none', x: 0, y: 0, visible: false,
          vx: 0, vy: 0, sx: 0, sy: 0, holdTime: 0, confirmedType: 'none'
        };
        const lm = res.multiHandLandmarks[i];
        let h = ActiveHands[i];

        const targetX = (1 - lm[9].x) * W;
        const targetY = lm[9].y * H;
        if(!h.visible){ h.x = targetX; h.y = targetY; h.sx = targetX; h.sy = targetY; }
        else { h.x += (targetX - h.x) * 0.35; h.y += (targetY - h.y) * 0.35; }
        h.visible = true;
        h.vx = h.x - h.sx; h.vy = h.y - h.sy;
        h.sx = h.x; h.sy = h.y;

        const d = detectGesture(lm);
        if(d.type === h.type) h.holdTime++; else { h.holdTime = 0; h.type = d.type; }

        const thr = ({ gather: 5, heart: 6, stream: 6, attract: 4, rotate: 3 })[h.type] || 5;
        if(h.holdTime >= thr && h.confirmedType !== h.type){
          h.confirmedType = h.type;
          if(musicPlaying) playGestureSound(h.type);
        }
      }

      // Hide extra slots if fewer hands than before
      for(let i = res.multiHandLandmarks.length; i < ActiveHands.length; i++){
        ActiveHands[i].visible = false;
        ActiveHands[i].confirmedType = 'none';
      }

      if(window.noneTimeout){ clearTimeout(window.noneTimeout); window.noneTimeout = null; }
    } else {
      cameraActive = false;
      for(let h of ActiveHands){ h.visible = false; h.type = 'none'; }
      if(!window.noneTimeout){
        window.noneTimeout = setTimeout(() => {
          for(let h of ActiveHands){ h.confirmedType = 'none'; h.holdTime = 0; }
          window.noneTimeout = null;
        }, 250);
      }
    }
  });

  // Attach stream to video element
  const v = document.getElementById('cam');
  if(v){
    v.srcObject = stream;
    v.style.display = 'block';
    setTimeout(() => v.classList.add('on'), 300);
  }

  // Start camera loop
  const camW = isMobile ? 320 : 640;
  const camH = isMobile ? 240 : 480;
  if (typeof Camera !== 'undefined') {
    const camera = new Camera(v, { 
      onFrame: async () => { 
        if (isProcessingFrame) return; // 正在处理上一帧时直接丢帧，防止推理并发排队卡死主线程
        isProcessingFrame = true;
        try {
          await hands.send({ image: v }); 
        } catch(e) {
          console.error('hands.send error:', e);
        } finally {
          isProcessingFrame = false;
        }
      }, 
      width: camW, 
      height: camH 
    });
    await camera.start();
  } else {
    console.log('Camera helper not found, falling back to manual requestAnimationFrame loop');
    const onFrameLoop = async () => {
      if (!stream || v.paused || v.ended) return;
      if (!isProcessingFrame) {
        isProcessingFrame = true;
        try {
          await hands.send({ image: v });
        } catch(err) {
          console.error('hands.send error:', err);
        } finally {
          isProcessingFrame = false;
        }
      }
      requestAnimationFrame(onFrameLoop);
    };
    v.addEventListener('playing', () => {
      requestAnimationFrame(onFrameLoop);
    }, { once: true });
    v.play().catch(err => console.log('Video play failed:', err));
  }

  setCamStatus('✅ 手势识别已就绪，举起你的手！');
  setTimeout(() => setCamStatus(null), 2500);

  console.log('Camera + MediaPipe ready (mobile:', isMobile, ')');
  return true;
}

// ----------------------------------------------------------------
//  Gesture HUD — Top Status Bar
// ----------------------------------------------------------------
const GESTURE_NAMES_CN = {
  'gather':  '✊ 握拳 — 万象归一',
  'rotate':  '☝️ 单指 — 漩涡旋转',
  'attract': '✌️ 双指 — 引力吸引',
  'heart':   '🤟 三指 — 流体涡流',
  'stream':  '🖐 全掌 — 流体喷发',
  'none':    '无'
};

function updateGestureHUD(){
  const el = document.getElementById('gesture-label');
  if(!el || !activeView) return;

  const visible = ActiveHands.filter(h => h.visible && h.confirmedType !== 'none');
  if(visible.length > 0){
    let prefix = activeView === 'ink' ? '🪐 星尘漩涡' : '🎄 粒子圣诞';
    const parts = visible.map((h, i) => {
      const name = GESTURE_NAMES_CN[h.confirmedType] || h.confirmedType;
      return visible.length > 1 ? `<span>[手 ${i+1}] ${name}</span>` : `<span>${name}</span>`;
    });
    el.innerHTML = `<span style="opacity:0.45;margin-right:8px">${prefix}</span>` + parts.join(' <span style="opacity:0.3">|</span> ');
    el.classList.add('show');
  } else {
    el.classList.remove('show');
  }
}
