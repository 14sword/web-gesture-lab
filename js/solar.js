// ================================================================
//  NEBULA STATE & PHYSICS SYSTEM (Earth Pulsation Theme)
// ================================================================
let sCtx, sW, sH, sFrame = 0;
let sClouds = [], sStardust = [], sBgStars = [], sParticles = [];
let sNovaRings = [];
let sPlanets = [];
let streamActive = false;
let currentShape = "pillars"; // 初始形态
let subtitleAlpha1 = 0;
let subtitleAlpha2 = 0;
let subtitleAlpha3 = 0;

function initSolar(){
  const c = document.getElementById('ink-c');
  if(!c) return;
  sCtx = c.getContext('2d');
  sW = c.width = window.innerWidth;
  sH = c.height = window.innerHeight;
  sFrame = 0; sParticles = []; sClouds = []; sStardust = []; sNovaRings = [];
  streamActive = false;
  subtitleAlpha1 = 0; subtitleAlpha2 = 0; subtitleAlpha3 = 0;
  currentShape = "pillars";


  // 背景微星
  sBgStars = [];
  for(var i = 0; i < 300; i++){
    sBgStars.push({
      x: Math.random() * sW, y: Math.random() * sH,
      sz: 0.5 + Math.random() * 1.5, a: 0.1 + Math.random() * 0.4,
      tw: 0.02 + Math.random() * 0.05, ph: Math.random() * 6.28,
      c: [200 + Math.random() * 55, 200 + Math.random() * 55, 255]
    });
  }

  // 初始化行星
  sPlanets = [];
  var planetColors = [
    [160, 200, 255], 
    [240, 210, 160], 
    [110, 185, 255], 
    [255, 130, 90],  
    [220, 190, 150]  
  ];
  for(var i = 0; i < 5; i++) {
    sPlanets.push({
      orbitR: 120 + i * 65,
      speed: 0.006 - i * 0.0009,
      angle: Math.random() * 6.28,
      size: 4 + i * 1.6,
      c: planetColors[i],
      trail: [],
      vx: 0, vy: 0,
      x: 0, y: 0
    });
  }

  var initParticle = function(arr, count, isCloud) {
    for(var i = 0; i < count; i++){
        var t = Math.random();
        var angle = Math.random() * 6.28;
        var col;
        if(isCloud) {
            col = Math.random() > 0.5 ? [15, 60, 150] : (Math.random() > 0.5 ? [120, 20, 80] : [20, 100, 120]);
        } else {
            if(t < 0.2) col = [200, 230, 255]; 
            else if(t < 0.6) col = [150, 200, 255]; 
            else col = [100, 120, 180];
            if(Math.random() < 0.1) col = [255, 200, 150]; 
        }

        var pillarIdx = i % 3;
        var px = (pillarIdx - 1) * 150 + (Math.random() - 0.5) * 80;
        var py = (Math.random() - 0.5) * 600;
        if(py < 0) px += (Math.random() - 0.5) * 40;
        
        var isPupil = Math.random() < 0.15;
        var eyeR = isPupil ? Math.random() * 40 : 200 + Math.random() * 100;
        var eyeAng = angle;
        var ex = Math.cos(eyeAng) * eyeR;
        var ey = Math.sin(eyeAng) * eyeR;
        if(!isPupil && Math.random() < 0.5) col = [200, 40, 60];

        var wing = Math.random() < 0.5 ? 1 : -1;
        var wingAng = (Math.random() - 0.5) * 1.2;
        var wingDist = Math.random() * 400;
        var bx = wing * Math.cos(wingAng) * wingDist;
        var by = Math.sin(wingAng) * wingDist;
        if(wingDist > 200 && Math.random() < 0.4) col = [255, 100, 50];

        arr.push({
            id: i,
            x: px, y: py,
            vx: 0, vy: 0,
            targets: {
                pillars: {x: px, y: py},
                eye: {x: ex, y: ey},
                butterfly: {x: bx, y: by}
            },
            sz: isCloud ? 80 + Math.random() * 200 : 0.5 + Math.random() * 2.0,
            a: isCloud ? 0.02 + Math.random() * 0.05 : (1 - t) * (0.3 + Math.random() * 0.7),
            c: col,
            rgbPrefix: 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',',
            tw: Math.random() * 0.1
        });
    }
  };

  initParticle(sClouds, 45, true);
  initParticle(sStardust, 600, false);
}

function boom(x, y, c, n){
  if(!n) n = 60;
  for(var i = 0; i < n; i++){
    sNovaRings.push({r: 10, maxR: Math.max(sW, sH) * 0.8, life: 1, x: x, y: y});
  }
  for(var i = 0; i < n * 4; i++){
    var a = Math.random() * 6.28, sp = 3 + Math.random() * 12;
    sParticles.push({
      x: x, y: y,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      sz: 1.5 + Math.random() * 4, life: 1.5, decay: 0.01 + Math.random() * 0.02,
      c: [Math.min(255, c[0] + 80), Math.min(255, c[1] + 80), Math.min(255, c[2] + 80)]
    });
  }
  if(sParticles.length > 800) sParticles.splice(0, sParticles.length - 800);

  if(sBgStars && sBgStars.length > 0) {
    sBgStars.forEach(function(s){
      var dx = s.x - x;
      var dy = s.y - y;
      var d = Math.hypot(dx, dy) || 1;
      if (d < 600) {
        var force = (1 - d / 600) * 12;
        s.vx += (dx / d) * force;
        s.vy += (dy / d) * force;
      }
    });
  }
}

function updateSolar(){
  sFrame++;
  for(let h of ActiveHands) {
    h.closeParticles = [];
    if(h.visible) {
        if(!h.sx) { h.sx = h.x; h.sy = h.y; }
        else { h.sx += (h.x - h.sx) * 0.15; h.sy += (h.y - h.sy) * 0.15; }
    }
  }

  let targetShape = 'pillars';
  let isOverride = false;

  let hMain = ActiveHands[0];
  if (hMain && hMain.visible && hMain.confirmedType !== 'none') {
      const gt = hMain.confirmedType;
      if (gt === 'gather' || gt === 'rotate') {
          targetShape = 'pillars';
          isOverride = true;
      } else if (gt === 'heart' || gt === 'attract') {
          targetShape = 'eye';
          isOverride = true;
      } else if (gt === 'stream') {
          targetShape = 'butterfly';
          isOverride = true;
      }
  }

  if (isOverride) {
      if (currentShape !== targetShape) {
          currentShape = targetShape;
          const explosionCol = targetShape === 'pillars' ? [180, 210, 255] : (targetShape === 'eye' ? [100, 200, 255] : [255, 100, 50]);
          boom(sW/2, sH/2, explosionCol, 30);
      }
      if (currentShape === 'pillars') {
          subtitleAlpha3 += (1.0 - subtitleAlpha3) * 0.05;
          subtitleAlpha1 *= 0.9; subtitleAlpha2 *= 0.9;
      } else if (currentShape === 'eye') {
          subtitleAlpha1 += (1.0 - subtitleAlpha1) * 0.05;
          subtitleAlpha2 *= 0.9; subtitleAlpha3 *= 0.9;
      } else if (currentShape === 'butterfly') {
          subtitleAlpha2 += (1.0 - subtitleAlpha2) * 0.05;
          subtitleAlpha1 *= 0.9; subtitleAlpha3 *= 0.9;
      }
  } else {
      subtitleAlpha1 *= 0.9;
      subtitleAlpha2 *= 0.9;
      subtitleAlpha3 *= 0.9;
  }

  drawBg();
  drawStarParticles();

  streamActive = false;
  for(let h of ActiveHands) {
    if(h.visible && activeView === 'ink'){
      if(h.confirmedType === 'stream') streamActive = true;
      if((h.confirmedType === 'stream' || h.confirmedType === 'heart') && h.holdTime === 1){
        boom(h.x, h.y, [180, 210, 255], 35);
        sClouds.forEach(p => {
          var dx = (p.x + sW/2) - h.x, dy = (p.y + sH/2) - h.y;
          var dist = Math.hypot(dx, dy) || 1;
          p.vx += (dx / dist) * 25; p.vy += (dy / dist) * 25;
        });
        sStardust.forEach(p => {
          var dx = (p.x + sW/2) - h.x, dy = (p.y + sH/2) - h.y;
          var dist = Math.hypot(dx, dy) || 1;
          p.vx += (dx / dist) * 30; p.vy += (dy / dist) * 30;
        });
      }
    }
  }

  drawNebula();

  sPlanets.forEach(p => {
    var speedMult = 1.0;
    for(let h of ActiveHands) {
      if(h.visible && activeView === 'ink') {
        var dx = h.x - (p.x + sW/2);
        var dy = h.y - (p.y + sH/2);
        var d = Math.hypot(dx, dy) || 1;
        if(h.confirmedType === 'rotate' && d < 300) { speedMult += 1.5; }
      }
    }
    p.angle += p.speed * speedMult;
    var tx = Math.cos(p.angle) * p.orbitR;
    var ty = Math.sin(p.angle) * p.orbitR * 0.5;
    
    for(let h of ActiveHands) {
      if(h.visible && activeView === 'ink') {
        var dx = h.x - (tx + sW/2);
        var dy = h.y - (ty + sH/2);
        var d = Math.hypot(dx, dy) || 1;
        if(h.confirmedType === 'gather' && d < 400) {
          var f = (1 - d/400) * 0.18;
          p.vx += (dx / d) * f * 22; p.vy += (dy / d) * f * 11;
        }
      }
    }
    p.vx *= 0.9; p.vy *= 0.9;
    p.x = tx + p.vx; p.y = ty + p.vy;
    p.trail.push({x: p.x, y: p.y});
    if(p.trail.length > 25) p.trail.shift();
  });

  sCtx.save();
  sCtx.globalCompositeOperation = 'lighter';
  sPlanets.forEach(p => {
    sCtx.beginPath();
    sCtx.ellipse(sW/2, sH/2, p.orbitR, p.orbitR * 0.5, 0, 0, Math.PI*2);
    sCtx.strokeStyle = 'rgba(' + p.c[0] + ',' + p.c[1] + ',' + p.c[2] + ', 0.06)';
    sCtx.lineWidth = 1; sCtx.setLineDash([4, 8]); sCtx.stroke();
  });

  sCtx.strokeStyle = 'rgba(100, 180, 255, 0.07)';
  sCtx.lineWidth = 0.5;
  for(let h of ActiveHands) {
    if(h.visible && activeView === 'ink' && h.closeParticles && h.closeParticles.length > 0) {
      sCtx.beginPath();
      for(var i = 0; i < h.closeParticles.length; i++) {
        var p1 = h.closeParticles[i];
        for(var j = i + 1; j < h.closeParticles.length; j++) {
          var p2 = h.closeParticles[j];
          var dx2 = p1.x - p2.x, dy2 = p1.y - p2.y;
          if (dx2 * dx2 + dy2 * dy2 < 1600) { // 40 * 40
            sCtx.moveTo(p1.x, p1.y); sCtx.lineTo(p2.x, p2.y);
          }
        }
      }
      sCtx.stroke();
    }
  }

  sPlanets.forEach(p => {
    var cx = sW/2, cy = sH/2;
    for(var i = 0; i < p.trail.length; i++) {
      var pt = p.trail[i];
      var alpha = (i / p.trail.length) * 0.15;
      sCtx.fillStyle = 'rgba(' + p.c[0] + ',' + p.c[1] + ',' + p.c[2] + ',' + alpha + ')';
      sCtx.fillRect(pt.x + cx - p.size*0.3, pt.y + cy - p.size*0.3, p.size*0.6, p.size*0.6);
    }
    var px = p.x + cx, py = p.y + cy;
    var g = sCtx.createRadialGradient(px, py, 0, px, py, p.size * 2.6);
    g.addColorStop(0, 'rgba(' + p.c[0] + ',' + p.c[1] + ',' + p.c[2] + ', 0.45)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = g;
    sCtx.beginPath(); sCtx.arc(px, py, p.size * 2.6, 0, Math.PI*2); sCtx.fill();
    sCtx.fillStyle = 'rgb(' + p.c[0] + ',' + p.c[1] + ',' + p.c[2] + ')';
    sCtx.beginPath(); sCtx.arc(px, py, p.size * 0.8, 0, Math.PI*2); sCtx.fill();
    sCtx.fillStyle = 'rgba(255,255,255,0.7)';
    sCtx.beginPath(); sCtx.arc(px - p.size*0.2, py - p.size*0.2, p.size*0.25, 0, Math.PI*2); sCtx.fill();
  });
  sCtx.restore();

  sCtx.save();
  sCtx.globalCompositeOperation = 'lighter';
  cursorP.forEach(p => {
    if (p.type === 'ink') {
      let g = sCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5);
      g.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, ${p.life * 0.9})`);
      g.addColorStop(1, 'transparent');
      sCtx.fillStyle = g;
      sCtx.beginPath(); sCtx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2); sCtx.fill();
      sCtx.fillStyle = `rgba(255, 255, 255, ${p.life * 0.9})`;
      sCtx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
    }
  });
  sCtx.restore();

  drawParts();
  drawBirthdayText();
}
