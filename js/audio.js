// ================================================================
//  Music System — 纯Web Audio，无网络加载
// ================================================================
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null, musicPlaying = false;
let xmasAudio = null;
let bgmAudio = null;

function initAudio(){
  if(audioCtx) {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return;
  }
  audioCtx = new AudioCtx();
}

// 播放单个音符
function playTone(freq, dur, vol = 0.12, type = 'sine'){
  if(!audioCtx) return;
  const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
  osc.type = type; osc.frequency.value = freq;
  g.gain.setValueAtTime(vol, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  osc.connect(g); g.connect(audioCtx.destination);
  osc.start(); osc.stop(audioCtx.currentTime + dur);
}

function playBGMForView(view) {
  initAudio();
  if(!bgmAudio) bgmAudio = document.getElementById('bgm');
  if(!xmasAudio) xmasAudio = document.getElementById('xmas-bgm');
  
  if(bgmAudio) bgmAudio.pause();
  if(xmasAudio) xmasAudio.pause();
  
  if(!musicPlaying) return;
  
  if(view === 'ink' && bgmAudio) {
    bgmAudio.currentTime = 0;
    bgmAudio.play().catch(e => console.log('BGM play blocked:', e));
  } else if(view === 'tree' && xmasAudio) {
    xmasAudio.currentTime = 0;
    xmasAudio.play().catch(e => console.log('Xmas BGM play blocked:', e));
  }
}

function startMusic(){
  musicPlaying = true;
  const mBtn = document.getElementById('music-btn');
  if(mBtn) {
    mBtn.textContent = '♫';
    mBtn.style.color = 'rgba(255,200,80,.5)';
  }
  playBGMForView(activeView);
}

function stopMusic(){
  musicPlaying = false;
  const mBtn = document.getElementById('music-btn');
  if(mBtn) {
    mBtn.textContent = '♪';
    mBtn.style.color = 'rgba(255,255,255,.2)';
  }
  
  if(!bgmAudio) bgmAudio = document.getElementById('bgm');
  if(!xmasAudio) xmasAudio = document.getElementById('xmas-bgm');
  if(bgmAudio) bgmAudio.pause();
  if(xmasAudio) xmasAudio.pause();
}

// 手势音效
function playGestureSound(type){
  initAudio();
  switch(type){
    case 'scatter': playTone(880,0.1,0.15); playTone(1100,0.15,0.12); break;
    case 'gather':
    case 'attract': playTone(220,0.2,0.12); break;
    case 'heart': playTone(523.3,0.25,0.12); playTone(659.3,0.25,0.1); playTone(784,0.25,0.08); break;
    case 'rotate': playTone(440,0.1,0.08); break;
    case 'gravity': playTone(330,0.2,0.1); playTone(277.2,0.2,0.1); break;
    case 'stream': playTone(587.3,0.08,0.08); playTone(659.3,0.08,0.08); playTone(784,0.12,0.08); break;
    case 'reset': playTone(523.3,0.15,0.1); playTone(392,0.2,0.1); break;
  }
}

// 音乐按钮 — 切换开关
document.addEventListener('DOMContentLoaded', () => {
  const musicBtn = document.getElementById('music-btn');
  if(musicBtn) {
    musicBtn.addEventListener('click', () => { musicPlaying ? stopMusic() : startMusic(); });
  }
});


