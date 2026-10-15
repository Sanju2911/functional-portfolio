/* One constrained rich-text format for the writing canvas and published reader. */
window.BlogContent=(()=>{
  const esc=PortfolioCMS.escape;
  const tags=new Set(['P','DIV','BR','STRONG','B','EM','I','U','S','STRIKE','H2','H3','H4','UL','OL','LI','BLOCKQUOTE','PRE','CODE','HR','A','SPAN','FONT','FIGURE','FIGCAPTION','IMG']);
  const blocked=new Set(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','SVG','MATH','TEMPLATE','FORM','INPUT','BUTTON','TEXTAREA','SELECT','META','LINK']);
  const sizes={'1':'0.8em','2':'0.9em','3':'1em','4':'1.2em','5':'1.5em','6':'2em','7':'2.5em'};
  function url(value){if(!value)return '';try{const u=new URL(value,location.origin);return u.protocol==='https:'||(u.origin===location.origin&&u.protocol===location.protocol)?u.href:''}catch{return ''}}
  function color(value){return /^(#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\))$/i.test(value||'')?value:''}
  function sanitize(html){const source=document.createElement('template');source.innerHTML=String(html||'').slice(0,500000);const out=document.createElement('div');
    function walk(node,parent){if(node.nodeType===3){parent.append(document.createTextNode(node.textContent));return}if(node.nodeType!==1||blocked.has(node.tagName))return;if(!tags.has(node.tagName)){for(const child of node.childNodes)walk(child,parent);return}
      const tag=node.tagName==='FONT'?'span':node.tagName.toLowerCase(),el=document.createElement(tag);
      if(tag==='img'){const src=url(node.getAttribute('src'));if(!src)return;el.src=src;el.alt=(node.getAttribute('alt')||'').slice(0,300);el.loading='lazy';const width=node.getAttribute('data-width');if(['40','65','100'].includes(width))el.dataset.width=width;}
      if(tag==='a'){const href=url(node.getAttribute('href'));if(href){el.href=href;el.rel='noopener noreferrer';el.target='_blank'}}
      const style=node.style;
      const fg=color(style.color||node.getAttribute('color'));if(fg)el.style.color=fg;
      const bg=color(style.backgroundColor);if(bg)el.style.backgroundColor=bg;
      if(['left','center','right','justify'].includes(style.textAlign))el.style.textAlign=style.textAlign;
      const size=sizes[node.getAttribute('size')]||style.fontSize;
      if(/^(0\.[89]|1(?:\.[125])?|2(?:\.5)?)em$/.test(size||''))el.style.fontSize=size;
      if(['bold','700'].includes(style.fontWeight))el.style.fontWeight='700';
      if(style.fontStyle==='italic')el.style.fontStyle='italic';
      if(style.textDecorationLine==='underline')el.style.textDecorationLine='underline';
      for(const child of node.childNodes)walk(child,el);parent.append(el);
    }
    for(const child of source.content.childNodes)walk(child,out);return out.innerHTML;
  }
  function legacy(text){if(!text)return '';return String(text).split(/\n\s*\n/).map(p=>`<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join('')}
  function text(html){const div=document.createElement('div');div.innerHTML=sanitize(html);div.querySelectorAll('p,div,h2,h3,h4,li,blockquote,pre,br').forEach(el=>el.append(document.createTextNode('\n')));return div.textContent.replace(/\n{3,}/g,'\n\n').trim()}
  function render(post){return post.body_html?sanitize(post.body_html):legacy(post.body)}
  return {sanitize,legacy,text,render,url};
})();
