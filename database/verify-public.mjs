import assert from 'node:assert/strict';
const origin='https://wgyxeqpnitgxhytvmztg.supabase.co';
const headers={apikey:'sb_publishable_AP0rclySB_yLJrl9-eb_9A_pWLQ1z9q','Content-Type':'application/json'};
async function call(path,init={}){const r=await fetch(origin+path,{...init,headers:{...headers,...init.headers}});let data;try{data=await r.json()}catch{data=null}return {status:r.status,data}}
const settings=await call('/rest/v1/portfolio_settings?id=eq.main&select=id,blogs_enabled,portrait');assert.equal(settings.status,200);assert.equal(settings.data.length,1);
const projects=await call('/rest/v1/portfolio_projects?select=id,title,published,archived&order=sort_order');assert.equal(projects.status,200);assert.equal(new Set(projects.data.map(p=>p.id)).size,projects.data.length);assert.ok(projects.data.every(p=>p.published&&!p.archived));
const admins=await call('/rest/v1/portfolio_admins?select=user_id');assert.ok(admins.status>=400,'Anonymous users must not read admin membership');
const insert=await call('/rest/v1/portfolio_projects',{method:'POST',body:JSON.stringify({id:'__unauthorized_probe',title:'Unauthorized probe',published:false})});assert.ok(insert.status>=400,'Anonymous writes must be rejected');
const update=await call('/rest/v1/portfolio_settings?id=eq.main',{method:'PATCH',body:JSON.stringify({blogs_enabled:false})});assert.ok(update.status>=400,'Anonymous settings updates must be rejected');
const storage=await call('/storage/v1/object/portfolio-media/__unauthorized_probe.webp',{method:'POST',headers:{'Content-Type':'image/webp'},body:new Uint8Array([82,73,70,70])});assert.ok(storage.status>=400,'Anonymous uploads must be rejected');
const drafts=await call('/rest/v1/portfolio_post_drafts?select=id');assert.ok(drafts.status>=400,'Anonymous users must not read private drafts');
console.log(JSON.stringify({privateDraftsProtected:'pass',publicSettings:'pass',publishedProjects:projects.data.length,adminMembershipProtected:'pass',anonymousInsertDenied:insert.status,anonymousUpdateDenied:update.status,anonymousUploadDenied:storage.status,blogsEnabled:settings.data[0].blogs_enabled},null,2));
