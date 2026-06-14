// ================================================================
//  NEBULA DRAWING & RENDERING SYSTEM (Earth Pulsation Theme)
// ================================================================

function drawBg(){
  sCtx.globalCompositeOperation = 'source-over';
  sCtx.fillStyle = 'rgba(4, 5, 12, 1)';
  sCtx.fillRect(0, 0, sW, sH);
}

function drawStarParticles(){
  sCtx.globalCompositeOperation = 'source-over';
  var cx = sW / 2, cy = sH / 2;
  var px = 0, py = 0;
  var hMain = ActiveHands[0];
  if(hMain && hMain.visible) {
    px = (hMain.x - cx) * 0.03;
    py = (hMain.y - cy) * 0.03;
  }
  
  var beatPulsate = 1.0;
  var beatOffset = 0;
  if(bgmAudio && !bgmAudio.paused) {
     beatPulsate = 1.0 + 0.35 * Math.sin(bgmAudio.currentTime * Math.PI * 3.333);
     beatOffset = Math.sin(bgmAudio.currentTime * Math.PI * 3.333) * 1.5;
  }

  for(var i = 0; i < sBgStars.length; i++){
    var s = sBgStars[i];
    if(s.vx === undefined) { s.vx = 0; s.vy = 0; s.ox = s.x; s.oy = s.y; }
    
    for(let h of ActiveHands) {
      if(h.visible && activeView === 'ink') {
        var dx = h.x - s.x;
        var dy = h.y - s.y;
        var dSq = dx * dx + dy * dy;
        
        let isInside = false;
        const gt = h.confirmedType;
        if (gt === 'gather' && dSq < 640000) isInside = true;
        else if (gt === 'stream' && dSq < 250000) isInside = true;
        else if (gt === 'rotate' && dSq < 160000) isInside = true;
        else if (gt === 'attract' && dSq < 90000) isInside = true;
        else if (gt === 'heart' && dSq < 122500) isInside = true;

        if (isInside) {
          var d = Math.sqrt(dSq) || 1;
          if (gt === 'stream') {
            s.vx += h.vx * 0.003;
            s.vy += h.vy * 0.003;
          } else if (gt === 'gather') {
            s.vx += (dx / d) * 0.22;
            s.vy += (dy / d) * 0.22;
          } else if (gt === 'rotate') {
            s.vx += (dy / d) * 0.12;
            s.vy -= (dx / d) * 0.12;
          } else if (gt === 'attract') {
            var f = (1 - d / 300) * 1.5;
            s.vx += (dx / d) * f;
            s.vy += (dy / d) * f;
          } else if (gt === 'heart') {
            var f = (1 - d / 350);
            s.vx += h.vx * 0.005 * f;
            s.vy += h.vy * 0.005 * f;
            s.vx += (dy / d) * 0.5 * f;
            s.vy -= (dx / d) * 0.5 * f;
          }
        }
      }
    }
    
    let isGather = ActiveHands.some(h => h.visible && h.confirmedType === 'gather');
    var springCoeff = isGather ? 0.08 : 0.012;
    s.vx += (s.ox - s.x) * springCoeff;
    s.vy += (s.oy - s.y) * springCoeff;
    s.vx *= 0.9;
    s.vy *= 0.9;
    s.x += s.vx;
    s.y += s.vy;

    var a = s.a * (0.5 + 0.5 * Math.sin(sFrame * s.tw + s.ph)) * beatPulsate;
    a = Math.min(1.0, Math.max(0, a));
    sCtx.fillStyle = 'rgba(' + s.c[0] + ',' + s.c[1] + ',' + s.c[2] + ',' + a + ')';
    
    var sx = s.x - px * s.sz + beatOffset * (s.sz - 1.0);
    var sy = s.y - py * s.sz + beatOffset * (s.sz - 1.0);
    sCtx.fillRect(sx, sy, s.sz, s.sz);
  }
}

function drawNebula(){
  var cx = sW / 2, cy = sH / 2;
  var damp = 0.92;
  let isGather = ActiveHands.some(h => h.visible && h.confirmedType === 'gather');
  var spring = isGather ? 0.08 : 0.015;

  var applyForce = function(p) {
    var target = p.targets[currentShape];
    var targetX = target.x;
    var targetY = target.y;

    var ang = Math.atan2(targetY, targetX) + sFrame * 0.001;
    var dist = Math.hypot(targetX, targetY);
    targetX = Math.cos(ang) * dist;
    targetY = Math.sin(ang) * dist;

    p.vx += (targetX - p.x) * spring;
    p.vy += (targetY - p.y) * spring;
    p.vx *= damp; p.vy *= damp;

    for (let h of ActiveHands) {
      if(!h.visible) continue;
      var dx = h.x - (p.x + cx);
      var dy = h.y - (p.y + cy);
      var dSq = dx * dx + dy * dy;

      // 收集靠近手势的星尘用于绘制连线，避免在 updateSolar() 中重复遍历
      if (dSq < 16900) {
        if (h.closeParticles && h.closeParticles.length < 45) {
          h.closeParticles.push({x: p.x + cx, y: p.y + cy});
        }
      }

      let isInside = false;
      const gt = h.confirmedType;
      if (gt === 'gather') isInside = true;
      else if (gt === 'rotate' && dSq < 90000) isInside = true;
      else if (gt === 'stream' && dSq < 160000) isInside = true;
      else if (gt === 'attract' && dSq < 62500) isInside = true;
      else if (gt === 'heart' && dSq < 122500) isInside = true;

      if (isInside) {
        var d = Math.sqrt(dSq) || 1;
        if(gt === 'rotate' && d < 300) {
          var force = (1 - d / 300) * 0.8;
          p.vx += (dy / d) * force;
          p.vy -= (dx / d) * force;
          p.vx += (dx / d) * force * 0.2;
          p.vy += (dy / d) * force * 0.2;
        }
        else if(gt === 'stream' && d < 400) {
          var hSpeed = Math.hypot(h.vx, h.vy);
          if(hSpeed > 2) {
             var f = (1 - d / 400) * 0.15;
             p.vx += h.vx * f;
             p.vy += h.vy * f;
          }
        }
        else if(gt === 'gather' && d > 10) {
           var gf = Math.min(3.0, 80 / d);
           p.vx += (dx / d) * gf;
           p.vy += (dy / d) * gf;
        }
        else if(gt === 'attract' && d < 250) {
          var f = (1 - d / 250) * 0.4;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        else if(gt === 'heart' && d < 350) {
           var f = (1 - d/350);
           p.vx += h.vx * 0.02 * f;
           p.vy += h.vy * 0.02 * f;
           p.vx += (dy/d) * 1.5 * f;
           p.vy -= (dx/d) * 1.5 * f;
        }
      }
    }
    p.x += p.vx; p.y += p.vy;
  };

  sCtx.globalCompositeOperation = 'lighter';
  for(var i = 0; i < sClouds.length; i++){
    var p = sClouds[i];
    applyForce(p);
    var x = p.x + cx, y = p.y + cy;
    var g = sCtx.createRadialGradient(x, y, 0, x, y, p.sz);
    var alpha = p.a * (0.8 + 0.2 * Math.sin(sFrame * 0.02 + i));
    g.addColorStop(0, p.rgbPrefix + alpha + ')');
    g.addColorStop(1, p.rgbPrefix + '0)');
    sCtx.fillStyle = g;
    sCtx.beginPath(); sCtx.arc(x, y, p.sz, 0, 6.28); sCtx.fill();
  }

  for(var i = 0; i < sStardust.length; i++){
    var p = sStardust[i];
    applyForce(p);
    var x = p.x + cx, y = p.y + cy;
    var a = p.a * (0.5 + 0.5 * Math.sin(sFrame * p.tw + i));
    
    sCtx.fillStyle = p.rgbPrefix + a + ')';
    if(p.sz > 1.5) {
      sCtx.beginPath(); sCtx.arc(x, y, p.sz, 0, 6.28); sCtx.fill();
    } else {
      sCtx.fillRect(x - p.sz / 2, y - p.sz / 2, p.sz, p.sz);
    }
    
    var speed = Math.hypot(p.vx, p.vy);
    if(speed > 1.0) {
       sCtx.strokeStyle = p.rgbPrefix + (a * 0.5) + ')';
       sCtx.lineWidth = p.sz * 0.8;
       sCtx.beginPath(); sCtx.moveTo(x, y); sCtx.lineTo(x - p.vx * 2, y - p.vy * 2); sCtx.stroke();
    }
  }
}

function drawParts(){
  sCtx.globalCompositeOperation = 'lighter';
  for(var i = sParticles.length - 1; i >= 0; i--){
    var p = sParticles[i];
    p.x += p.vx; p.y += p.vy;
    p.vx *= 0.97; p.vy *= 0.97;
    p.life -= p.decay;
    if(p.life <= 0){ sParticles.splice(i, 1); continue; }
    var a = Math.max(0, p.life);
    var g = sCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.sz * 4);
    g.addColorStop(0, 'rgba(' + p.c[0] + ',' + p.c[1] + ',' + p.c[2] + ',' + a + ')');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = g;
    sCtx.beginPath(); sCtx.arc(p.x, p.y, p.sz * 4, 0, 6.28); sCtx.fill();
  }
  
  for(var _ri = sNovaRings.length - 1; _ri >= 0; _ri--){
    var _rr = sNovaRings[_ri];
    _rr.r += (_rr.maxR - _rr.r) * 0.06;
    _rr.life = 1 - _rr.r / _rr.maxR;
    if(_rr.life <= 0){ sNovaRings.splice(_ri, 1); continue; }
    sCtx.save();
    sCtx.globalAlpha = _rr.life * 0.5;
    sCtx.strokeStyle = 'rgba(150,220,255,1)';
    sCtx.lineWidth = Math.max(1.0, 4 * _rr.life);
    sCtx.beginPath(); sCtx.arc(_rr.x, _rr.y, _rr.r, 0, 6.28); sCtx.stroke();
    sCtx.restore();
  }
}

function drawBirthdayText() {
    sCtx.globalCompositeOperation = 'source-over';
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';
    sCtx.shadowColor = 'rgba(0,150,255,0.8)';
    sCtx.shadowBlur = 20;

    let tx = sW / 2;
    let ty = sH / 2;
    var hMain = ActiveHands[0];
    if (hMain && hMain.visible) {
        tx += (hMain.x - sW / 2) * 0.12;
        ty += (hMain.y - sH / 2) * 0.12;
    }

    if (subtitleAlpha3 > 0) {
        sCtx.font = "italic 300 48px 'Helvetica Neue', Helvetica, Arial, sans-serif";
        sCtx.fillStyle = `rgba(255, 255, 255, ${subtitleAlpha3})`;
        sCtx.fillText("Happy Birthday", tx, ty);
        sCtx.font = "300 16px 'Helvetica Neue'";
        sCtx.fillStyle = `rgba(180, 220, 255, ${subtitleAlpha3 * 0.75})`;
        sCtx.fillText("THE CRADLE OF STARLIGHT", tx, ty + 50);
    }
    if (subtitleAlpha1 > 0) {
        sCtx.font = "italic 300 48px 'Helvetica Neue', Helvetica, Arial, sans-serif";
        sCtx.fillStyle = `rgba(255, 255, 255, ${subtitleAlpha1})`;
        sCtx.fillText("Happy Birthday", tx, ty);
        sCtx.font = "300 16px 'Helvetica Neue'";
        sCtx.fillStyle = `rgba(200, 220, 255, ${subtitleAlpha1 * 0.7})`;
        sCtx.fillText("IN THE EYE OF GOD", tx, ty + 50);
    }
    if (subtitleAlpha2 > 0) {
        sCtx.font = "italic 300 56px 'Helvetica Neue', Helvetica, Arial, sans-serif";
        sCtx.fillStyle = `rgba(255, 255, 255, ${subtitleAlpha2})`;
        sCtx.fillText("Happy Birthday", tx, ty);
        sCtx.font = "300 18px 'Helvetica Neue'";
        sCtx.fillStyle = `rgba(255, 200, 180, ${subtitleAlpha2 * 0.8})`;
        sCtx.fillText("ON THE WINGS OF THE BUTTERFLY NEBULA", tx, ty + 60);
    }
    sCtx.shadowBlur = 0;
}
