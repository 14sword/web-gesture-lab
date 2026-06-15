// ================================================================
//  MAIN APPLICATION ORCHESTRATOR & VIEW CONTROLLER
// ================================================================
const $ = id => document.getElementById(id);

let activeView = null; // 'ink' or 'tree' or null

// Frame throttling for smoother rendering
let lastRenderTime = 0;
const MIN_FRAME_MS = 1000 / 45; // target ~45 FPS
const bgC = $('bg-c'), bgX = bgC.getContext('2d');
let bgW, bgH, bgP = [];

function bgResize(){
  bgW = bgC.width = window.innerWidth;
  bgH = bgC.height = window.innerHeight;
  bgP = [];
  for(let i = 0; i < 150; i++) {
    bgP.push({
      x: Math.random()*bgW,
      y: Math.random()*bgH,
      s: 0.6 + Math.random()*1.4,
      sp: 0.05 + Math.random()*0.12,
      a: 0.02 + Math.random()*0.03,
      d: (Math.random() - 0.5)*0.15,
      ph: Math.random()*6.28
    });
  }
}

function bgRender(){
  bgX.clearRect(0, 0, bgW, bgH);
  bgP.forEach(p => {
    p.y -= p.sp;
    p.x += p.d + Math.sin(Date.now()*0.0007 + p.ph)*0.06;
    if(p.y < -5){ p.y = bgH + 5; p.x = Math.random()*bgW; }
    if(p.x < -5) p.x = bgW + 5;
    if(p.x > bgW + 5) p.x = -5;
    bgX.beginPath();
    bgX.arc(p.x, p.y, p.s, 0, Math.PI*2);
    bgX.fillStyle = `rgba(190, 215, 255, ${p.a})`;
    bgX.fill();
  });
}

// Window resize listener
window.addEventListener('resize', () => {
  bgResize();
  if(activeView === 'ink'){
    const c = $('ink-c');
    if(c) {
      sW = c.width = window.innerWidth;
      sH = c.height = window.innerHeight;
      sBgStars.forEach(s => { s.ox = Math.random()*sW; s.oy = Math.random()*sH; });
    }
  } else if(activeView === 'tree'){
    const c = $('tree-c');
    if(c) {
      treeW = c.width = window.innerWidth;
      treeH = c.height = window.innerHeight;
      treeSnow.forEach(s => { s.x = Math.random()*treeW; s.y = Math.random()*treeH; });
    }
  }
});

// View switcher
function switchView(view){
  activeView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $('selector').classList.add('hidden');
  $('back').classList.add('show');
  $('music-btn').style.display = 'flex';

  startMusic();

  // Reset all hand states when switching views
  for(let h of ActiveHands) {
    h.confirmedType = 'none';
    h.visible = false;
    h.holdTime = 0;
  }

  if(view === 'ink'){ $('view-ink').classList.add('active'); initSolar(); }
  if(view === 'tree'){ $('view-tree').classList.add('active'); initTree(); }
}

function showSelector(){
  activeView = null;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $('selector').classList.remove('hidden');
  $('back').classList.remove('show');
  $('music-btn').style.display = 'none';

  stopMusic();

  for(let h of ActiveHands) {
    h.confirmedType = 'none';
    h.type = 'none';
    h.holdTime = 0;
  }
}

// Event listeners — card click / touch to select view
document.querySelectorAll('.card').forEach(c => {
  c.addEventListener('click', () => switchView(c.dataset.view));
});

$('back').addEventListener('click', showSelector);

// Escape key returns to selector (desktop convenience)
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') showSelector();
});

// Main Loop
function mainLoop(){
  // Throttle rendering to maintain target FPS
  const now = Date.now();
  if (now - lastRenderTime < MIN_FRAME_MS) {
    requestAnimationFrame(mainLoop);
    return;
  }
  lastRenderTime = now;

  if(activeView === null) {
    bgRender();
  } else {
    updateCursorParticles();
    updateGestureHUD();
    if(activeView === 'ink') updateSolar();
    else if(activeView === 'tree') treeRender();
  }
  
  requestAnimationFrame(mainLoop);
}

// Start orchestrator
bgResize();
mainLoop();
initCamera().then(ok => {
  console.log('Camera init result:', ok);
  const loader = $('main-loader');
  const cards = document.querySelector('.cards');
  if (ok) {
    if (loader) loader.classList.add('hidden');
    if (cards) cards.classList.add('show');
  } else {
    // Show error state inside the loader card
    const spinner = document.querySelector('.loader-spinner');
    const loaderText = document.querySelector('.loader-text');
    const loaderSub = document.querySelector('.loader-sub');
    const retryBtn = $('retry-btn');
    if (spinner) spinner.style.display = 'none';
    if (loaderText) loaderText.textContent = '❌ 初始化未就绪';
    if (loaderSub) loaderSub.textContent = '手势识别组件加载失败，或摄像头权限被拒绝。请确保在浏览器中允许摄像头访问，并刷新页面重试。';
    if (retryBtn) {
      retryBtn.style.display = 'block';
      retryBtn.onclick = () => window.location.reload();
    }
  }
});

