const assert=require('node:assert/strict');
const covers=require('../dist/project-covers.js');
for(const template of Object.keys(covers.types)){
  const p={id:'example',title:'A real project',cover_url:'https://example.com/screenshot.png',cover_color:'mint',cover_layout:{template}};
  const html=covers.render(p);
  assert.ok(html.includes('template-'+template));assert.ok(html.includes('screenshot.png'));assert.ok(html.includes('color-mint'));
}
assert.equal(covers.config({id:'news'}).template,'watch');
assert.equal(covers.config({id:'creator'}).template,'browser');
assert.equal(covers.config({id:'cli'}).template,'terminal');
assert.equal(covers.config({id:'trip'}).template,'travel');
const clamped=covers.config({cover_layout:{template:'phone',rotation:999,frameSize:-4,imageZoom:999,imageX:-50,fit:'invalid'}});
assert.equal(clamped.rotation,15);assert.equal(clamped.frameSize,70);assert.equal(clamped.imageZoom,220);assert.equal(clamped.imageX,0);assert.equal(clamped.fit,'cover');
const escaped=covers.render({title:'<script>bad()</script>',cover_url:'javascript:alert(1)',cover_layout:{headline:'<img src=x onerror=alert(1)>',eyebrow:'" onmouseover="bad()'}});
assert.ok(!escaped.includes('<script>'));assert.ok(!escaped.includes('<img src=x'));assert.ok(!escaped.includes('src="javascript:'));assert.ok(escaped.includes('&lt;img'));
const terminal=covers.render({id:'cli'});assert.ok(terminal.includes('template-terminal-text'));assert.ok(terminal.includes('belazywithreact'));
assert.equal(covers.config({cover_layout:{template:'missing'}}).template,'browser');
assert.equal(covers.config({id:'__proto__'}).template,'browser');
console.log('Project covers: five templates, legacy defaults, input bounds, image protocol checks, and escaped text passed.');
