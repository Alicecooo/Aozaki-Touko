(() => {
  const canvas = document.getElementById('kb-starfield');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.body.classList.add('kb-has-starfield');
  let width = 0, height = 0, frame = 0, lastDraw = 0, nextMeteor = 0;
  let immersive = false, enteredAt = 0, meteors = [], letters = [];
  let seed = 7319;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const star = () => ({x: random(), y: random(), radius: .45 + random() * 1.05, phase: random() * Math.PI * 2});
  const stars = Array.from({length: 80}, star);
  const dust = Array.from({length: 130}, star);
  const clusters = [[.15,.22,.13,5],[.78,.23,.18,8],[.83,.7,.14,6],[.19,.76,.15,7],[.49,.49,.16,4]];
  const nodes = [], edges = [];
  // Each cluster has its own geometry and a minimum-length branching network.
  clusters.forEach(([cx,cy,size,count]) => {
    const start = nodes.length;
    const group = [];
    for (let i = 0; i < count; i++) {
      let x, y, attempts = 0;
      do {
        const angle = random() * Math.PI * 2;
        const radius = .25 + random() * .75;
        x = cx + Math.cos(angle) * size * radius;
        y = cy + Math.sin(angle) * size * radius;
        attempts++;
      } while (attempts < 40 && group.some(p => Math.hypot(p.x-x,p.y-y) < size*.3));
      const point = {x,y,radius:1.25+random()*.9,phase:random()*Math.PI*2};
      group.push(point); nodes.push(point);
    }
    const connected = new Set([0]);
    while (connected.size < count) {
      let best = [0,0,Infinity];
      for (const a of connected) for (let b = 0; b < count; b++) {
        if (connected.has(b)) continue;
        const distance = Math.hypot(group[a].x-group[b].x,group[a].y-group[b].y);
        if (distance < best[2]) best = [a,b,distance];
      }
      edges.push([start+best[0],start+best[1]]); connected.add(best[1]);
    }
    if (count > 6) edges.push([start+1,start+count-1]);
  });
  let rgb = '170,190,218';
  let letterRgb = '210,225,248';
  function makeLetters() {
    const text = 'love';
    const sample = document.createElement('canvas');
    sample.width = Math.ceil(width);
    const pen = sample.getContext('2d', {willReadFrequently: true});
    let fontSize = Math.min(176, width * .19);
    pen.font = `italic 500 ${fontSize}px Georgia, "Times New Roman", serif`;
    fontSize *= Math.min(1, width * .8 / pen.measureText(text).width);
    sample.height = Math.ceil(fontSize * 1.6);
    pen.font = `italic 500 ${fontSize}px Georgia, "Times New Roman", serif`;
    pen.textAlign = 'center';
    const metrics = pen.measureText(text);
    const baseline = (sample.height + metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
    pen.fillText(text, width / 2, baseline);
    const pixels = pen.getImageData(0,0,sample.width,sample.height).data;
    const gap = Math.max(2.1, fontSize / 42);
    letters = [];
    for (let y=0; y<sample.height; y+=gap) for (let x=0; x<sample.width; x+=gap) {
      if (pixels[(Math.floor(y)*sample.width+Math.floor(x))*4+3] < 110) continue;
      letters.push({
        x:x+(random()-.5)*gap*.3, y:y+height*.46-sample.height/2+(random()-.5)*gap*.3,
        fromX:random()*width, fromY:random()*height,
        radius:.65+random()*.55, phase:random()*Math.PI*2, delay:random()*750
      });
    }
  }
  function drawLetters(t) {
    if (!immersive) return;
    // Stars settle once and hold the words indefinitely; only their light shimmers.
    letters.forEach(star => {
      const progress = reduced.matches ? 1 : Math.max(0,Math.min(1,(t-enteredAt-star.delay)/3400));
      const blend = progress*progress*(3-2*progress);
      const shimmer = reduced.matches ? .8 : .7+Math.sin(t*.0012+star.phase)*.2;
      const x = star.fromX+(star.x-star.fromX)*blend;
      const y = star.fromY+(star.y-star.fromY)*blend;
      context.fillStyle = `rgba(${letterRgb},${shimmer*(.12+.88*blend)})`;
      context.beginPath();context.arc(x,y,star.radius,0,Math.PI*2);context.fill();
    });
  }
  function point(star, t) {
    if (!immersive || reduced.matches) return {x:star.x*width,y:star.y*height};
    const age = t-enteredAt;
    const blend = Math.min(1,age/2800);
    const dx = Math.sin(age*.000075+star.phase)*.028*blend;
    const dy = Math.cos(age*.000055+star.phase)*.024*blend;
    const angle = age*.000008;
    const x = (star.x+dx-.5)*width, y = (star.y+dy-.5)*height;
    return {x:width/2+x*Math.cos(angle)-y*Math.sin(angle),y:height/2+x*Math.sin(angle)+y*Math.cos(angle)};
  }
  function addMeteor(t, delay = 0) {
    if (meteors.length >= (immersive ? (width<500?32:48) : 12)) return;
    meteors.push({x:width*(.1+random()*.95),y:height*random()*.8,start:t+delay,duration:1000+random()*800,distance:190+random()*220,tail:50+random()*70,slope:.45+random()*.4});
  }
  function draw(t) {
    context.clearRect(0,0,width,height);
    const points = nodes.map(star => point(star,t));
    context.lineWidth = .65;
    edges.forEach(([a,b]) => {
      context.strokeStyle = `rgba(${rgb},${immersive ? .045 : .12})`;
      context.beginPath(); context.moveTo(points[a].x,points[a].y); context.lineTo(points[b].x,points[b].y); context.stroke();
    });
    const visibleStars = immersive ? [...stars,...nodes,...dust] : [...stars,...nodes];
    visibleStars.forEach(star => {
      const p = point(star,t);
      const brightness = reduced.matches ? .45 : (immersive ? .16 : .24)+(Math.sin(t*.0007+star.phase)+1)*.17;
      context.fillStyle = `rgba(${rgb},${brightness})`;
      context.beginPath(); context.arc(p.x,p.y,star.radius,0,Math.PI*2); context.fill();
    });
    drawLetters(t);
    if (reduced.matches) return;
    if (!nextMeteor) nextMeteor = t+800;
    if (t >= nextMeteor) {
      addMeteor(t);
      if (random() < (immersive ? .8 : .55)) addMeteor(t,60+random()*160);
      if (immersive && random()<.3) addMeteor(t,160+random()*180);
      nextMeteor = t+(immersive ? 110+random()*140 : 900+random()*850);
    }
    meteors = meteors.filter(meteor => t-meteor.start <= meteor.duration);
    meteors.forEach(meteor => {
      const progress = (t-meteor.start)/meteor.duration;
      if (progress < 0) return;
      const x=meteor.x-progress*meteor.distance,y=meteor.y+progress*meteor.distance*meteor.slope;
      const tailX=x+meteor.tail,tailY=y-meteor.tail*meteor.slope;
      const tail=context.createLinearGradient(tailX,tailY,x,y);
      tail.addColorStop(0,`rgba(${rgb},0)`); tail.addColorStop(1,`rgba(${rgb},${Math.sin(progress*Math.PI)*.8})`);
      context.strokeStyle=tail;context.lineWidth=immersive?1.45:1.2;context.beginPath();context.moveTo(tailX,tailY);context.lineTo(x,y);context.stroke();
      context.fillStyle=`rgba(${rgb},${Math.sin(progress*Math.PI)*.85})`;context.beginPath();context.arc(x,y,1,0,Math.PI*2);context.fill();
    });
  }
  function animate(t) {
    if (document.hidden || reduced.matches) return;
    if (t-lastDraw >= 1000/24) {draw(t);lastDraw=t;}
    frame=requestAnimationFrame(animate);
  }
  function start() {
    cancelAnimationFrame(frame); frame=0;
    if (document.hidden) return;
    draw(performance.now());
    if (!reduced.matches) frame=requestAnimationFrame(animate);
  }
  function resize() {
    meteors=[]; nextMeteor=0;
    width=document.documentElement.clientWidth;height=innerHeight;
    const ratio=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;
    context.setTransform(ratio,0,0,ratio,0,0);
    const color=getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g);
    const dark=color && color.slice(0,3).reduce((sum,value)=>sum+Number(value),0)<384;
    rgb=dark?'170,190,218':'89,108,140';
    letterRgb=dark?'210,225,248':'61,83,119';
    makeLetters();
    start();
  }
  document.addEventListener('kb:stargazing',event => {
    immersive=event.detail.active; enteredAt=performance.now();
    resize();
    if (immersive && !reduced.matches) {
      for (let i=0;i<12;i++) addMeteor(enteredAt,i*85);
      nextMeteor=enteredAt+180;
    }
  });
  document.addEventListener('visibilitychange',start);
  reduced.addEventListener('change',start);
  window.addEventListener('resize',resize);
  window.addEventListener('pagehide',()=>cancelAnimationFrame(frame));
  window.addEventListener('pageshow',start);
  resize();
})();
