const art = document.querySelector('.hero-art');
const diagram = document.createElement('div');
diagram.className='diagram-window';
diagram.hidden=true;
diagram.setAttribute('aria-hidden','true');
art.append(diagram);
const scenes={
  software:{color:'#ded5f3',label:'ideas → interfaces',title:'Machine possibilities.',small:'From first sketch to last commit.'},
  intelligence:{color:'#f0dfcf',label:'questions → possibilities',title:'Learning to think bigger.',small:'Open questions. New connections.',svg:`<svg viewBox="0 0 320 150"><g fill="none" stroke="#a08ab4" stroke-width="1.5"><path class="diagram-flow" d="M35 35 140 20 265 45M35 35 140 75 265 45M35 115 140 20 265 110M35 115 140 130 265 110M35 35 140 130M35 115 140 75 265 110M140 130 265 45"/></g><g fill="#f8f7f2" stroke="#8f769f" stroke-width="2"><circle cx="35" cy="35" r="12"/><circle cx="35" cy="115" r="12"/><circle cx="140" cy="20" r="12"/><circle cx="140" cy="75" r="12"/><circle cx="140" cy="130" r="12"/><circle cx="265" cy="45" r="12"/><circle cx="265" cy="110" r="12"/></g><g fill="#a08ab4" class="diagram-pulse"><circle cx="140" cy="75" r="6"/><circle cx="265" cy="45" r="6"/></g></svg><div class="diagram-caption">EXPLORE / CONNECT / UNDERSTAND</div>`},
  connected:{color:'#dbead7',label:'software → the real world',title:'Ideas beyond the screen.',small:'A little code. A physical connection.',svg:`<svg viewBox="0 0 320 150"><g stroke="#8c9d75" fill="none" stroke-width="1.5"><path class="diagram-flow" d="M150 75 45 30M150 75 45 120M150 75 265 30M150 75 265 120"/><circle cx="150" cy="75" r="31"/><rect x="23" y="12" width="44" height="34" rx="8"/><rect x="23" y="104" width="44" height="34" rx="8"/><rect x="243" y="12" width="44" height="34" rx="8"/><rect x="243" y="104" width="44" height="34" rx="8"/></g><g fill="#60734e" text-anchor="middle" font-family="monospace" font-size="10"><text x="150" y="79">SYSTEM</text><text x="45" y="33">ESP</text><text x="45" y="125">MQTT</text><text x="265" y="33">APP</text><text x="265" y="125">ROOM</text></g><circle class="diagram-pulse" cx="150" cy="75" r="37" fill="none" stroke="#9db78a" stroke-width="1"/></svg><div class="diagram-caption">BRINGING THE PIECES TOGETHER</div>`}
};
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{
  const mode=button.dataset.mode,scene=scenes[mode];
  art.dataset.scene=mode;
  art.style.background=scene.color;
  art.querySelector('.floating-label').innerHTML=`<span class="tiny-dot"></span>${scene.label}`;
  art.querySelector('.widget-ai strong').textContent=scene.title;
  art.querySelector('.widget-build small').textContent=scene.small;
  diagram.hidden=mode==='software';
  diagram.innerHTML=scene.svg||'';
  document.querySelectorAll('[data-mode]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active))});
}));
const progress=document.querySelector('.reading-progress');
let framePending=false;
function updateProgress(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?scrollY/max:0})`;framePending=false;}
addEventListener('scroll',()=>{if(!framePending){framePending=true;requestAnimationFrame(updateProgress)}},{passive:true});
addEventListener('resize',updateProgress);updateProgress();
if('IntersectionObserver' in window){
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}}),{threshold:.08});
  const revealItems=document.querySelectorAll('.section-top,.project,.process-card,.about-grid,.experience-rows,.research-card,.resume-panel,.social-card');
  revealItems.forEach(el=>{el.classList.add('reveal');revealObserver.observe(el)});
  document.body.classList.add('motion-ready');
  const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('.header nav a').forEach(link=>{if(link.hash===`#${entry.target.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')})}}),{rootMargin:'-15% 0px -55% 0px',threshold:0});
  document.querySelectorAll('main>section[id]').forEach(section=>sectionObserver.observe(section));
}
