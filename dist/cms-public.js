(async()=>{
const {client,escape:esc,safeURL,portraitStyles}=PortfolioCMS;
function coverHTML(p){return '<button class="project-cover" data-project="'+esc(p.id)+'" aria-label="Explore '+esc(p.title)+'">'+ProjectCovers.render(p)+'</button>'}
try{
const [settingsResult,projectsResult]=await Promise.all([client.from('portfolio_settings').select('*').eq('id','main').single(),client.from('portfolio_projects').select('*').eq('published',true).eq('archived',false).order('sort_order').order('created_at')]);
if(settingsResult.error)throw settingsResult.error;if(projectsResult.error)throw projectsResult.error;
const settings=settingsResult.data,projects=projectsResult.data;
const portrait=settings.portrait||{},slot=document.querySelector('#portrait-slot');
if(slot){const imageURL=safeURL(portrait.url);if(imageURL){const img=new Image();img.src=imageURL;img.alt='Sathwik Tadivaka';img.className='portrait-photo';img.addEventListener('error',()=>img.remove());slot.prepend(img)}portraitStyles(slot,portrait);}
if(settings.blogs_enabled){const nav=document.querySelector('.header nav'),link=document.createElement('a');link.href='/blogs/';link.textContent='Blogs';nav.append(link);const footer=document.querySelector('.footer>div'),footLink=link.cloneNode(true);footer.prepend(footLink);}
Object.keys(projectData).forEach(key=>delete projectData[key]);
for(const p of projects)projectData[p.id]={title:p.title,intro:p.intro,image:p.cover_url,alt:p.title+' project image',tags:p.tags||[],story:p.story,approach:p.approach,status:p.status_note,repository_url:p.repository_url,demo_url:p.demo_url,gallery:p.gallery||[]};
const grid=document.querySelector('.project-grid');
grid.innerHTML=projects.length?projects.map((p,i)=>`<article class="project${i%2?' stagger':''}">${coverHTML(p)}<div class="project-meta"><div><h3><button data-project="${esc(p.id)}">${esc(p.title)}</button></h3><p>${esc(p.description)}</p></div><span class="project-number">${String(i+1).padStart(2,'0')}</span></div><div class="tags">${(p.tags||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div></article>`).join(''):'<p class="cms-empty">New work is on its way. Come back soon.</p>';
grid.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>openProject(button.dataset.project,button)));
document.querySelector('#cms-live-status')?.replaceChildren(document.createTextNode('CONTENT CONNECTED · SUPABASE'));
document.documentElement.dataset.cms='connected';
}catch(error){document.documentElement.dataset.cms='unavailable';console.warn('Live portfolio content is unavailable. Showing the saved portfolio.');}
})();
