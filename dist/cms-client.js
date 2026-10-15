/* The Supabase publishable key is a public client identifier. RLS enforces access. */
window.PortfolioCMS = (() => {
  const url='https://wgyxeqpnitgxhytvmztg.supabase.co';
  const key='sb_publishable_AP0rclySB_yLJrl9-eb_9A_pWLQ1z9q';
  const client=window.supabase.createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'sathwik-portfolio-auth'}});
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function safeURL(value,{relative=true}={}){if(!value)return '';try{const u=new URL(value,location.origin);if(u.protocol!=='https:'&&!(u.origin===location.origin&&relative))return '';return u.href}catch{return ''}}
  const defaults={shape:'circle',size:100,height:390,zoom:100,x:50,y:50,grayscale:0,brightness:100,saturation:100,url:''};
  function portraitStyles(slot,portrait={}){const p={...defaults,...portrait};const clamp=(v,a,b)=>Math.min(b,Math.max(a,Number(v)||a));slot.style.width=`${clamp(p.size,60,100)}%`;slot.style.height=`${clamp(p.height,240,520)}px`;slot.style.borderRadius=({circle:'50%',arch:'180px 180px 18px 18px',rounded:'28px',square:'0'})[p.shape]||'50%';if(p.shape==='circle')slot.style.height='auto';slot.style.aspectRatio=p.shape==='circle'?'1':'auto';const image=slot.querySelector('img');if(image){image.style.objectPosition=`${clamp(p.x,0,100)}% ${clamp(p.y,0,100)}%`;image.style.transform=`scale(${clamp(p.zoom,100,200)/100})`;image.style.filter=`grayscale(${clamp(p.grayscale,0,100)}%) brightness(${clamp(p.brightness,50,150)}%) saturate(${clamp(p.saturation,0,200)}%)`;}}
  async function getSettings(){const {data,error}=await client.from('portfolio_settings').select('*').eq('id','main').single();if(error)throw error;return data}
  async function isAdmin(){const {data:{user},error}=await client.auth.getUser();if(error||!user)return false;const {data,error:roleError}=await client.from('portfolio_admins').select('user_id').eq('user_id',user.id).maybeSingle();if(roleError)throw roleError;return !!data}
  return {client,escape,safeURL,defaults,portraitStyles,getSettings,isAdmin};
})();
