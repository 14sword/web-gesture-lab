// ================================================================
//  CHRISTMAS TREE SYSTEM (Carol of the Bells Rhythm View)
// ================================================================
let treeCtx, treeW, treeH;
let treeP = [], treeSpiral = [], treeSnow = [], treeHeart = [], treeGifts = [], treeOrnaments = [];
let treeRotY = 0, treeRotSpeed = 0.002, treeEntrance = 0, treeTrail = [];
let treeHeartVis = 0, treeFrame = 0;

const TFOCAL = 500, TTH = 280, TTR = 150;

function tProject(x,y,z){
  const camZ = -350, dz = z - camZ;
  if(dz < 10) return null;
  const s = TFOCAL / dz;
  return {x: treeW/2 + x*s, y: treeH/2 - 20 + y*s, scale: s, z: dz};
}

function trY(x,y,z,a){
  const c = Math.cos(a), s = Math.sin(a);
  return {x: x*c + z*s, y, z: -x*s + z*c};
}

function initTree(){
  const c = document.getElementById('tree-c');
  if(!c) return;
  treeCtx = c.getContext('2d');
  treeW = c.width = window.innerWidth;
  treeH = c.height = window.innerHeight;
  treeP = []; treeSpiral = []; treeSnow = []; treeHeart = []; treeGifts = []; treeOrnaments = [];
  treeEntrance = 0; treeTrail = []; treeHeartVis = 0; treeFrame = 0; treeRotY = 0; treeRotSpeed = 0.002;

  // Tree body
  const layers = [{yS:-130,yE:-75,rS:6,rE:50},{yS:-80,yE:-10,rS:42,rE:95},{yS:-15,yE:65,rS:82,rE:128},{yS:60,yE:130,rS:115,rE:148}];
  for(let i = 0; i < 450; i++){
    const h = Math.random(), li = Math.min(Math.floor(h*4), 3), L = layers[li], lh = (h*4 - li);
    const y = L.yS + (L.yE - L.yS)*lh, r = L.rS + (L.rE - L.rS)*lh;
    const a = Math.random()*Math.PI*2, rr = Math.sqrt(Math.random())*r;
    const x = Math.cos(a)*rr, z = Math.sin(a)*rr;
    const cool = Math.random() > 0.35;
    let cr, cg, cb;
    if(cool){
      const t2 = Math.random(); cr = 150 + Math.floor(t2*105); cg = 180 + Math.floor(t2*75); cb = 220 + Math.floor(t2*35);
    } else {
      cr = 255; cg = 180 + Math.floor(Math.random()*60); cb = Math.floor(Math.random()*60);
    }
    treeP.push({
      x, y, z, ox: x, oy: y, oz: z, vx: 0, vy: 0, vz: 0,
      size: 0.1 + Math.random()*0.35, // Micro-particle scaled down
      r: cr, g: cg, b: cb,
      phase: Math.random()*Math.PI*2, twinkleSpeed: 0.02 + Math.random()*0.04,
      type: 'sparkle', enterDelay: h, enterY: TTH/2 + 50 + Math.random()*80, prevSx: 0, prevSy: 0
    });
  }

  // Spiral
  for(let i = 0; i < 120; i++){
    const t2 = i/120, y = -TTH/2 + TTH*t2, r = TTR*t2*0.85, a = t2*Math.PI*8;
    const x = Math.cos(a)*r + (Math.random()-.5)*3, z = Math.sin(a)*r + (Math.random()-.5)*3;
    treeSpiral.push({ x, y, z, ox: x, oy: y, oz: z, vx: 0, vy: 0, vz: 0, size: 0.15 + Math.random()*0.25,
      r: 255, g: 200 + Math.floor(Math.random()*40), b: 20 + Math.floor(Math.random()*40), phase: Math.random()*Math.PI*2,
      twinkleSpeed: 0.03 + Math.random()*0.03, type: 'spiral', enterDelay: t2, enterY: TTH/2 + 50 + Math.random()*80, prevSx: 0, prevSy: 0 });
  }

  // Heart
  const hs = 3.2;
  for(let i = 0; i < 100; i++){
    const a = i/100 * Math.PI*2, hx = 16 * Math.pow(Math.sin(a), 3) * hs;
    const hy = -(13*Math.cos(a) - 5*Math.cos(2*a) - 2*Math.cos(3*a) - Math.cos(4*a)) * hs;
    treeHeart.push({ x: 0, y: 0, z: 0, ox: hx, oy: hy - 80, oz: 0, vx: 0, vy: 0, vz: 0, size: 0.15 + Math.random()*0.25,
      r: 255, g: 50 + Math.floor(Math.random()*40), b: 90 + Math.floor(Math.random()*50), phase: Math.random()*Math.PI*2, twinkleSpeed: 0.02 + Math.random()*0.025 });
  }

  // Snow
  for(let i = 0; i < 100; i++){
    treeSnow.push({ x: Math.random()*treeW, y: Math.random()*treeH, size: 0.1 + Math.random()*0.4,
      speed: 0.15 + Math.random()*0.35, drift: (Math.random()-0.5)*0.3, phase: Math.random()*Math.PI*2, alpha: 0.08 + Math.random()*0.15 });
  }

  // Ornaments
  for(let i = 0; i < 35; i++){
    const h = Math.random(), li = Math.min(Math.floor(h*4), 3), L = layers[li], lh = (h*4 - li);
    const y = L.yS + (L.yE - L.yS)*lh, r = L.rS + (L.rE - L.rS)*lh, a = Math.random()*Math.PI*2;
    const x = Math.cos(a)*r, z = Math.sin(a)*r, colType = Math.random();
    let col = colType < 0.33 ? [255,50,60] : (colType < 0.66 ? [50,220,255] : [255,215,0]);
    treeOrnaments.push({ x, y, z, ox: x, oy: y, oz: z, vx: 0, vy: 0, vz: 0, size: 0.35 + Math.random()*0.35,
      r: col[0], g: col[1], b: col[2], phase: Math.random()*Math.PI*2, twinkleSpeed: 0.01 + Math.random()*0.02,
      type: 'ornament', enterDelay: h, enterY: TTH/2 + 50 + Math.random()*80 });
  }

}

function treeUpdate(){
  if(treeEntrance < 1){
    var remaining = 1 - treeEntrance;
    treeEntrance = Math.min(1, treeEntrance + Math.max(0.0008, remaining*0.016));
  }
  treeRotY += treeRotSpeed;
  treeRotSpeed += (0.002 - treeRotSpeed) * 0.01;
  let isHeart = ActiveHands.some(h => h.visible && h.confirmedType === 'heart');
  treeHeartVis += (isHeart ? 1-treeHeartVis : 0-treeHeartVis) * (isHeart ? 0.05 : 0.1);

  if(treeEntrance < 1){
    const th = treeEntrance, ty = -TTH/2 + TTH*(1-th), tr = TTR*(1-th)*0.85;
    treeTrail.push({x: Math.cos(treeEntrance*Math.PI*10)*tr, y: ty, z: Math.sin(treeEntrance*Math.PI*10)*tr, age: 0});
    if(treeTrail.length > 60) treeTrail.shift();
  }
  treeTrail.forEach(p => p.age++);

  function springP(p, damp, force){
    const revealAt = 1 - p.enterDelay;
    const revealed = treeEntrance >= revealAt;
    let fx = 0, fy = 0, fz = 0;
    if(revealed){
      const f = treeEntrance < 1 ? 0.012 : force;
      fx += (p.ox - p.x) * f; fy += (p.oy - p.y) * f; fz += (p.oz - p.z) * f;
    } else {
      fx += (p.ox - p.x) * 0.005; fy += (p.enterY - p.y) * 0.02; fz += (p.oz - p.z) * 0.005;
    }
    p.vx += fx; p.vy += fy; p.vz += fz;
    p.vx *= damp; p.vy *= damp; p.vz *= damp;
    p.x += p.vx; p.y += p.vy; p.z += p.vz;
  }

  treeP.forEach(p => {
    springP(p, treeEntrance < 1 ? 0.92 : 0.95, 0.03);
    const rot = trY(p.x, p.y, p.z, treeRotY);
    const proj = tProject(rot.x, rot.y, rot.z);
    p.proj = proj;
    p.rotZ = rot.z;

    for(let h of ActiveHands) {
      if(h.visible && h.holdTime > 8 && treeEntrance > 0.5){
        if(proj){
          const hx = proj.x - h.sx, hy = proj.y - h.sy;
          const dSq = hx*hx + hy*hy;
          if(dSq < 78400){ // 280 * 280
            const d = Math.sqrt(dSq) || 1;
            const s = (1 - d/280), inv = rot.z > 0 ? rot.z/TFOCAL : 0.001;
            switch(h.confirmedType){
              case 'rotate': { treeRotSpeed += (h.sx - treeW/2)/(treeW/2)*0.0001; break; }
              case 'attract': { const f = s*0.4; p.vx -= (hx*inv)*f; p.vy += (hy*inv)*f; break; }
              case 'stream': { const f = s*2.5; p.vx += (hx*inv)*f; p.vy -= (hy*inv)*f; p.vz += s*1; break; }
              case 'gather': { const f = s*0.6; p.vx -= (hx*inv)*f; p.vy += (hy*inv)*f; p.vx += p.z*0.006*f; p.vz -= p.x*0.006*f; break; }
            }
          }
        }
      }
    }
  });

  treeSpiral.forEach(p => {
    springP(p, treeEntrance < 1 ? 0.92 : 0.95, 0.03);
    const rot = trY(p.x, p.y, p.z, treeRotY);
    p.proj = tProject(rot.x, rot.y, rot.z);
    p.rotZ = rot.z;
  });

  treeOrnaments.forEach(p => {
    springP(p, treeEntrance < 1 ? 0.92 : 0.95, 0.03);
    const rot = trY(p.x, p.y, p.z, treeRotY);
    const proj = tProject(rot.x, rot.y, rot.z);
    p.proj = proj;
    p.rotZ = rot.z;

    for(let h of ActiveHands) {
      if(h.visible && h.holdTime > 8 && treeEntrance > 0.5){
        if(proj){
          const hx = proj.x - h.sx, hy = proj.y - h.sy;
          const dSq = hx*hx + hy*hy;
          if(dSq < 78400){ // 280 * 280
            const d = Math.sqrt(dSq) || 1;
            const s = (1 - d/280), inv = rot.z > 0 ? rot.z/TFOCAL : 0.001;
            switch(h.confirmedType){
              case 'attract': { const f = s*0.4; p.vx -= (hx*inv)*f; p.vy += (hy*inv)*f; break; }
              case 'stream': { const f = s*2.5; p.vx += (hx*inv)*f; p.vy -= (hy*inv)*f; p.vz += s*1; break; }
              case 'gather': { const f = s*0.6; p.vx -= (hx*inv)*f; p.vy += (hy*inv)*f; p.vx += p.z*0.006*f; p.vz -= p.x*0.006*f; break; }
            }
          }
        }
      }
    }
  });

  if(treeHeartVis > 0.01){
    treeHeart.forEach(p => {
      p.vx += (p.ox - p.x)*0.03; p.vy += (p.oy - p.y)*0.03; p.vz += (p.oz - p.z)*0.03;
      p.vx *= 0.92; p.vy *= 0.92; p.vz *= 0.92;
      p.x += p.vx; p.y += p.vy; p.z += p.vz;

      const rot = trY(p.x, p.y, p.z, treeRotY);
      p.proj = tProject(rot.x, rot.y, rot.z);
      p.rotZ = rot.z;
    });
  } else if(treeHeartVis <= 0.01){
    treeHeart.forEach(p => {
      p.x = 0; p.y = 0; p.z = 0; p.vx = 0; p.vy = 0; p.vz = 0;
      p.proj = null;
      p.rotZ = 0;
    });
  }

  treeSnow.forEach(s => {
    let vx = s.drift + Math.sin(treeFrame*0.008 + s.phase)*0.15;
    let vy = s.speed;
    
    for(let h of ActiveHands) {
      if(h.visible && treeEntrance > 0.5) {
        let dx = h.x - s.x;
        let dy = h.y - s.y;
        let d = Math.hypot(dx, dy) || 1;
        
        if((h.confirmedType === 'attract' || h.confirmedType === 'gather') && d < 300) {
          let f = (1 - d/300) * 1.5;
          vx += (dx/d) * f; vy += (dy/d) * f;
        }
        if(h.confirmedType === 'stream' && d < 300) {
          let f = (1 - d/300) * 3.0;
          vx -= (dx/d) * f; vy -= (dy/d) * f;
        }
      }
    }
    
    s.x += vx; s.y += vy;
    if(s.y > treeH + 5){ s.y = -5; s.x = Math.random()*treeW; }
    if(s.x < -5) s.x = treeW + 5;
    if(s.x > treeW + 5) s.x = -5;
  });

  // Gift eruption gesture (palm active stream)
  for(let h of ActiveHands) {
    if(h.visible && h.confirmedType === 'stream' && h.holdTime > 5 && treeEntrance > 0.8) {
      if(treeFrame % 2 === 0) {
        const topRot = trY(0, -TTH/2 - 8, 0, treeRotY), topProj = tProject(topRot.x, topRot.y, topRot.z);
        if(topProj){
          const a = Math.random()*Math.PI*2;
          const sp = 2 + Math.random()*5;
          const col = Math.random() > 0.5 ? [255,50,70] : (Math.random() > 0.5 ? [60,255,120] : [255,230,60]);
          treeGifts.push({
            x: topProj.x, y: topProj.y,
            vx: Math.cos(a)*sp + (Math.random()-0.5)*2,
            vy: -6 - Math.random()*8,
            sz: 0.5 + Math.random()*0.8, // Micro-particle scaled down
            c: col, life: 1, rot: Math.random()*Math.PI, rotSp: (Math.random()-0.5)*0.35
          });
        }
      }
    }
  }

  for(let i = treeGifts.length - 1; i >= 0; i--){
    let g = treeGifts[i];
    g.vy += 0.35; g.vx *= 0.98;
    g.x += g.vx; g.y += g.vy;
    g.rot += g.rotSp;
    g.life -= (g.y > treeH - 50) ? 0.04 : 0;
    if(g.life <= 0 || g.y > treeH + 50){ treeGifts.splice(i, 1); }
  }
}

function treeProject(arr, type){
  const out = [];
  arr.forEach(p => {
    const proj = p.proj;
    const rotZ = p.rotZ;
    if(proj){
      const revealAt = 1 - (p.enterDelay || 0);
      const revealed = treeEntrance >= revealAt;
      const rf = revealed ? Math.min(1, (treeEntrance - revealAt)*4) : 0;
      if(rf <= 0.01 && type !== 'heart') return;
      const tw = 0.5 + 0.5 * Math.abs(Math.sin(treeFrame*p.twinkleSpeed + p.phase));
      const vel = Math.sqrt(p.vx*p.vx + p.vy*p.vy + p.vz*p.vz);
      const prx = p.prevSx || 0, pry = p.prevSy || 0;
      if(type === 'sparkle'){ p.prevSx = proj.x; p.prevSy = proj.y; }
      out.push({
        sx: proj.x, sy: proj.y, z: rotZ, sc: proj.scale, size: p.size, r: p.r, g: p.g, b: p.b,
        tw: tw * Math.max(0.4, 1 - vel*0.05) * (type === 'heart' ? treeHeartVis : rf),
        type, vel, prx, pry
      });
    }
  });
  return out;
}

function treeRender(){
  treeFrame++;
  for(let h of ActiveHands) {
    if(h.visible) {
      h.sx += (h.x - h.sx)*0.1;
      h.sy += (h.y - h.sy)*0.1;
    }
  }
  treeUpdate();
  treeCtx.fillStyle = 'rgba(4,6,12,0.13)';
  treeCtx.fillRect(0, 0, treeW, treeH);

  let musicPulse = 1.0;
  let musicGlow = 1.0;
  if(xmasAudio && !xmasAudio.paused) {
    musicPulse = 1.0 + 0.12 * Math.sin(xmasAudio.currentTime * Math.PI * 4.5);
    musicGlow = 1.0 + 0.3 * Math.sin(xmasAudio.currentTime * Math.PI * 4.5);
  }

  // Heart full-screen effect
  if(treeHeartVis > 0.05){
    const hg = treeCtx.createRadialGradient(treeW/2, treeH*0.35, 0, treeW/2, treeH*0.35, treeW*0.5);
    hg.addColorStop(0, `rgba(255,60,100,${treeHeartVis*0.06})`);
    hg.addColorStop(0.5, `rgba(255,30,80,${treeHeartVis*0.03})`);
    hg.addColorStop(1, 'transparent');
    treeCtx.fillStyle = hg; treeCtx.fillRect(0, 0, treeW, treeH);
    for(let i = 0; i < 2; i++){
      const hx = treeW*0.15 + Math.random()*treeW*0.7;
      treeSnow.push({
        x: hx, y: -5,
        size: 0.1 + Math.random()*0.4, // Micro-particle scaled down
        speed: 0.5 + Math.random()*1.5, drift: (Math.random()-0.5)*0.2,
        phase: Math.random()*Math.PI*2, alpha: 0.15 + Math.random()*0.25
      });
    }
  }

  // Nebula
  if(treeFrame % 120 === 1){
    const nx = treeW*0.3 + Math.random()*treeW*0.4, ny = treeH*0.2 + Math.random()*treeH*0.3, nr = 100 + Math.random()*150;
    const ng = treeCtx.createRadialGradient(nx, ny, 0, nx, ny, nr);
    ng.addColorStop(0, `hsla(${220+Math.random()*40},40%,25%,0.006)`);
    ng.addColorStop(1, 'transparent');
    treeCtx.fillStyle = ng; treeCtx.fillRect(nx-nr, ny-nr, nr*2, nr*2);
  }

  // Snow
  treeSnow.forEach(s => {
    treeCtx.beginPath(); treeCtx.arc(s.x, s.y, s.size, 0, Math.PI*2);
    treeCtx.fillStyle = `rgba(200,215,240,${s.alpha})`; treeCtx.fill();
    var sg = treeCtx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size*2);
    sg.addColorStop(0, `rgba(255,255,255,${s.alpha*0.3})`);
    sg.addColorStop(1, 'rgba(255,255,255,0)');
    treeCtx.fillStyle = sg; treeCtx.beginPath(); treeCtx.arc(s.x, s.y, s.size*2, 0, Math.PI*2); treeCtx.fill();
  });

  // Ground glow
  const gy = treeH/2 - 20 + TTH/2*TFOCAL/(TFOCAL+350) + 20;
  const gg = treeCtx.createRadialGradient(treeW/2, gy, 0, treeW/2, gy, treeW*0.18);
  gg.addColorStop(0, 'rgba(120,140,180,0.025)'); gg.addColorStop(1, 'transparent');
  treeCtx.fillStyle = gg; treeCtx.fillRect(0, gy-40, treeW, 80);

  // Tracer
  if(treeEntrance < 1 && treeTrail.length > 1){
    treeCtx.save(); treeCtx.lineCap = 'round';
    for(let i = 1; i < treeTrail.length; i++){
      const p0 = treeTrail[i-1], p1 = treeTrail[i];
      const r0 = trY(p0.x, p0.y, p0.z, treeRotY), r1 = trY(p1.x, p1.y, p1.z, treeRotY);
      const pr0 = tProject(r0.x, r0.y, r0.z), pr1 = tProject(r1.x, r1.y, r1.z);
      if(pr0 && pr1){
        const f = 1 - p0.age/60;
        if(f > 0){
          treeCtx.beginPath(); treeCtx.moveTo(pr0.x, pr0.y); treeCtx.lineTo(pr1.x, pr1.y);
          treeCtx.strokeStyle = `rgba(255,220,120,${f*0.15})`; treeCtx.lineWidth = Math.max(0.5, 2*f); treeCtx.stroke();
        }
      }
    }
    const last = treeTrail[treeTrail.length-1];
    if(last){
      const rr = trY(last.x, last.y, last.z, treeRotY), hp = tProject(rr.x, rr.y, rr.z);
      if(hp){
        const hg = treeCtx.createRadialGradient(hp.x, hp.y, 0, hp.x, hp.y, 15*hp.scale);
        hg.addColorStop(0, 'rgba(255,230,140,0.35)'); hg.addColorStop(1, 'transparent');
        treeCtx.fillStyle = hg; treeCtx.beginPath(); treeCtx.arc(hp.x, hp.y, 15*hp.scale, 0, Math.PI*2); treeCtx.fill();
        treeCtx.beginPath(); treeCtx.arc(hp.x, hp.y, 2*Math.max(0.5, hp.scale), 0, Math.PI*2); treeCtx.fillStyle = 'rgba(255,245,200,0.8)'; treeCtx.fill();
      }
    }
    treeCtx.restore();
  }

  // All particles
  const all = [
    ...treeProject(treeP, 'sparkle'),
    ...treeProject(treeSpiral, 'spiral'),
    ...treeProject(treeOrnaments, 'ornament')
  ];
  if (treeHeartVis > 0.01) {
    all.push(...treeProject(treeHeart, 'heart'));
  }
  all.sort((a,b) => b.z - a.z);
  all.forEach(p => {
    let sz = p.size * Math.max(0.4, p.sc * 0.7);
    if(p.type === 'sparkle' || p.type === 'spiral') { sz *= musicPulse; }
    const a = 0.35 + 0.65*p.tw;
    if(a < 0.01) return;
    const eg = p.type==='heart' ? 1.6 : 1;

    // Shiny Christmas tree ornaments rendering
    if(p.type === 'ornament') {
      let orsz = sz * 1.1; // Micro-ornaments drawing size
      if(xmasAudio && !xmasAudio.paused) {
        orsz *= (1.0 + 0.15 * Math.sin(xmasAudio.currentTime * Math.PI * 4.5));
      }
      treeCtx.globalAlpha = a * 0.9;
      treeCtx.beginPath(); treeCtx.arc(p.sx, p.sy, orsz, 0, Math.PI*2);
      treeCtx.fillStyle = `rgb(${p.r}, ${p.g}, ${p.b})`; treeCtx.fill();
      treeCtx.fillStyle = 'rgba(255,255,255,0.75)';
      treeCtx.beginPath(); treeCtx.arc(p.sx - orsz*0.3, p.sy - orsz*0.3, orsz*0.25, 0, Math.PI*2); treeCtx.fill();
      
      // Large glow under ornament
      treeCtx.globalAlpha = a * 0.12;
      treeCtx.beginPath(); treeCtx.arc(p.sx, p.sy, orsz * 1.5, 0, Math.PI*2); // Micro-glow range
      treeCtx.fillStyle = `rgb(${p.r}, ${p.g}, ${p.b})`; treeCtx.fill();
      return;
    }

    // Motion trail for tree particles
    if(p.type==='sparkle' && p.vel > 0.3 && p.prx){
      const dx = p.sx - p.prx, dy = p.sy - p.pry, dist = Math.sqrt(dx*dx + dy*dy) || 1;
      const tl = Math.min(8, p.vel*2);
      treeCtx.beginPath(); treeCtx.moveTo(p.sx, p.sy);
      treeCtx.lineTo(p.sx - dx/dist*tl, p.sy - dy/dist*tl);
      treeCtx.strokeStyle = `rgba(${p.r},${p.g},${p.b},${a*0.2})`;
      treeCtx.lineWidth = sz*0.4; treeCtx.lineCap = 'round'; treeCtx.stroke();
    }
    // Glow
    let gr = sz * (1.5 + p.tw) * eg;
    let alphaMult = p.type==='spiral' ? 0.25 : 0.08;
    if (p.type==='spiral') gr *= 1.5;
    treeCtx.globalAlpha = a * alphaMult * eg * (p.type==='sparkle' || p.type==='spiral' ? musicGlow : 1.0);
    treeCtx.beginPath(); treeCtx.arc(p.sx, p.sy, gr, 0, Math.PI*2);
    treeCtx.fillStyle = `rgb(${p.r}, ${p.g}, ${p.b})`; treeCtx.fill();
    // Core
    treeCtx.globalAlpha = a * 0.85;
    treeCtx.beginPath(); treeCtx.arc(p.sx, p.sy, sz*0.5, 0, Math.PI*2);
    treeCtx.fillStyle = `rgb(${Math.min(255,p.r+40)},${Math.min(255,p.g+40)},${Math.min(255,p.b+40)})`;
    treeCtx.fill();
    treeCtx.globalAlpha = 1;
  });

  // Star
  const sf = treeEntrance >= 1 ? 1 : 0;
  if(sf > 0){
    const _sr = trY(0, -TTH/2-8, 0, treeRotY), sp = tProject(_sr.x, _sr.y, _sr.z);
    if(sp){
      let pulse = 0.7 + 0.3*Math.sin(treeFrame*0.03);
      if(xmasAudio && !xmasAudio.paused) {
        pulse = 0.7 + 0.3 * Math.sin(xmasAudio.currentTime * Math.PI * 4.5);
      }
      const sz = Math.max(7, 10*sp.scale);
      const sg = treeCtx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, sz*5);
      sg.addColorStop(0, `rgba(255,220,80,${0.18*pulse*sf})`);
      sg.addColorStop(0.3, `rgba(255,180,40,${0.05*pulse*sf})`);
      sg.addColorStop(1, 'transparent');
      treeCtx.fillStyle = sg; treeCtx.beginPath(); treeCtx.arc(sp.x, sp.y, sz*5, 0, Math.PI*2); treeCtx.fill();
      treeCtx.save(); treeCtx.beginPath();
      for(let i = 0; i < 10; i++){
        const a = treeFrame*0.004 + Math.PI*2*i/10 - Math.PI/2;
        const rd = i % 2 === 0 ? sz : sz*0.4;
        i === 0 ? treeCtx.moveTo(sp.x+Math.cos(a)*rd, sp.y+Math.sin(a)*rd) : treeCtx.lineTo(sp.x+Math.cos(a)*rd, sp.y+Math.sin(a)*rd);
      }
      treeCtx.closePath();
      const sg2 = treeCtx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, sz);
      sg2.addColorStop(0, `rgba(255,235,130,${0.85*pulse*sf})`);
      sg2.addColorStop(0.5, `rgba(255,200,50,${0.55*pulse*sf})`);
      sg2.addColorStop(1, `rgba(255,160,20,${0.3*pulse*sf})`);
      treeCtx.fillStyle = sg2; treeCtx.fill(); treeCtx.restore();
    }
  }

  // Erupted gift particles rendering
  treeGifts.forEach(g => {
    treeCtx.save();
    treeCtx.globalAlpha = g.life;
    treeCtx.translate(g.x, g.y);
    treeCtx.rotate(g.rot);
    treeCtx.fillStyle = `rgb(${g.c[0]},${g.c[1]},${g.c[2]})`;
    treeCtx.fillRect(-g.sz, -g.sz, g.sz*2, g.sz*2);
    treeCtx.fillStyle = 'rgba(255,255,255,0.8)';
    treeCtx.fillRect(-g.sz*0.5, -g.sz*0.5, g.sz, g.sz);
    treeCtx.restore();
    
    treeCtx.beginPath();
    treeCtx.moveTo(g.x, g.y);
    treeCtx.lineTo(g.x - g.vx*2, g.y - g.vy*2);
    treeCtx.strokeStyle = `rgba(${g.c[0]},${g.c[1]},${g.c[2]},${g.life*0.6})`;
    treeCtx.lineWidth = g.sz;
    treeCtx.stroke();
  });

  // Magical hand cursor trails
  treeCtx.save();
  treeCtx.globalCompositeOperation = 'lighter';
  cursorP.forEach(p => {
    if (p.type === 'tree') {
      let g = treeCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.0);
      g.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, ${p.life * 0.85})`);
      g.addColorStop(1, 'transparent');
      treeCtx.fillStyle = g;
      treeCtx.beginPath(); treeCtx.arc(p.x, p.y, p.size * 3.0, 0, Math.PI * 2); treeCtx.fill();
      treeCtx.fillStyle = `rgba(255, 255, 255, ${p.life * 0.95})`;
      treeCtx.beginPath(); treeCtx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2); treeCtx.fill();
    }
  });
  treeCtx.restore();

  // Vignette
  treeCtx.fillStyle = 'rgba(4,6,15,0.3)'; treeCtx.fillRect(0, 0, treeW, treeH*0.15);
  treeCtx.fillRect(0, treeH*0.85, treeW, treeH*0.15);
  treeCtx.fillRect(0, 0, treeW*0.1, treeH); treeCtx.fillRect(treeW*0.9, 0, treeW*0.1, treeH);
}
