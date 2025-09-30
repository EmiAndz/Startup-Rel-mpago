// Scrollspy (sección activa)
const links = [...document.querySelectorAll('.nav a')];
const secs  = links.map(a => document.querySelector(a.getAttribute('href')));
const opt = {rootMargin: '-40% 0px -55% 0px', threshold: 0};
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      links.forEach(l=>l.classList.remove('active'));
      const id = '#' + e.target.id;
      const link = links.find(l => l.getAttribute('href')===id);
      if(link){ link.classList.add('active'); }
    }
  })
}, opt);
secs.forEach(s=> s && io.observe(s));

// Tema eliminado: no hay alternancia claro/oscuro

// --- Simulador de mensajes en SVG ---
// Mueve un "paquete" (círculo) a lo largo de cada línea de mensaje para ilustrar latencias.
const svg = document.querySelector('#concurrencia svg');
if(svg){
  // seleccionamos las 3 líneas de mensaje (dos verdes, una azul)
  const msgs = [...svg.querySelectorAll('g[marker-end] line')];
  const colors = ['var(--accent)','var(--accent)','var(--accent2)'];
  const packets = msgs.map((line,i)=>{
    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('r','6');
    c.setAttribute('fill', colors[i]);
    c.style.opacity = '0';
    svg.appendChild(c);
    return {line, dot:c, len: Math.hypot(line.x2.baseVal.value - line.x1.baseVal.value, line.y2.baseVal.value - line.y1.baseVal.value)};
  });

  let t=0, reqId=null, playing=false, speed=1, variance=true;
  const speedEl = document.getElementById('speedSim');
  const varEl   = document.getElementById('varianceSim');
  const playEl  = document.getElementById('playSim');
  const pauseEl = document.getElementById('pauseSim');
  const resetEl = document.getElementById('resetSim');

  const schedule = ()=>[
    {start:0,    dur: 1500},
    {start: 800, dur: 1400},
    {start: 1800,dur: 1600},
  ];

  function frame(ts){
    if(!playing){ reqId=null; return; }
    if(!t) t = ts;
    const elapsed = (ts - t) * speed;
    const S = schedule();
    packets.forEach((p,i)=>{
      const jitter = variance ? (1 + (Math.random()-0.5)*0.4) : 1; // ±20%
      const start = S[i].start;
      const dur   = S[i].dur * jitter;
      const prog  = Math.min(1, Math.max(0, (elapsed - start)/dur));
      if(elapsed >= start && prog < 1){ p.dot.style.opacity = 1; }
      const x = p.line.x1.baseVal.value + (p.line.x2.baseVal.value - p.line.x1.baseVal.value)*prog;
      const y = p.line.y1.baseVal.value + (p.line.y2.baseVal.value - p.line.y1.baseVal.value)*prog;
      p.dot.setAttribute('cx', x);
      p.dot.setAttribute('cy', y);
      if(prog>=1){ p.dot.style.opacity = 0.25; }
    });
    reqId = requestAnimationFrame(frame);
  }

  function play(){ if(!playing){ playing=true; t=0; reqId=requestAnimationFrame(frame); }}
  function pause(){ playing=false; if(reqId) cancelAnimationFrame(reqId); }
  function reset(){ pause(); packets.forEach(p=>{p.dot.style.opacity=0;}); }

  playEl?.addEventListener('click', play);
  pauseEl?.addEventListener('click', pause);
  resetEl?.addEventListener('click', reset);
  speedEl?.addEventListener('input', e=>{ speed = parseFloat(e.target.value); });
  varEl?.addEventListener('change', e=>{ variance = e.target.checked; });
}
