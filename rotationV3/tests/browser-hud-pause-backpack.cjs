const {chromium}=require('C:/Users/caohua/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const out='rotationV3/artifacts/hud-pause-backpack';fs.mkdirSync(out,{recursive:true});
 async function dragTool(from,to){const a=await p.locator(`[data-tool="${from}"]`).boundingBox(),b=await p.locator(`[data-tool="${to}"]`).boundingBox();await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:10});await p.mouse.up();}
 try{
 await p.goto('http://127.0.0.1:5188/rotationV3/?qa=1');await p.waitForFunction(()=>window.__liteQA);await p.evaluate(()=>{__liteQA.start();__liteQA.naturalFall=false;});
 await p.evaluate(()=>{const g=__liteQA.game;for(const id of ['supply','block-trim','repair'])g.liteGrantTool(id);__liteQA.refresh();});
 const visible=()=>p.locator('#lite-tool-rail>button:visible').evaluateAll(ns=>ns.map(n=>n.id));
 assert.deepEqual(await visible(),['lite-shovel','lite-swap','lite-supply','v3-backpack-open']);
 await p.locator('#v3-backpack-open').click();assert.equal(await p.evaluate(()=>__liteQA.paused),true);
 assert.equal(await p.locator('#backpack-active .backpack-row').count(),3);assert.equal(await p.locator('#backpack-reserve .backpack-row').count(),2);
 await dragTool('block-trim','supply');assert.deepEqual(await p.evaluate(()=>__liteQA.game.liteInventory().active),['shovel','swap','block-trim']);
 await dragTool('block-trim','repair');assert.deepEqual(await p.evaluate(()=>__liteQA.game.liteInventory().active),['shovel','swap','supply']);
 await p.screenshot({path:out+'/backpack-390.png'});await p.locator('#v3-backpack .v3-popup-close').click();await p.waitForFunction(()=>!__liteQA.paused);
 await p.locator('#lite-supply').click();await p.waitForFunction(()=>__liteQA.game.lite.tools.supply===0);assert.deepEqual(await visible(),['lite-shovel','lite-swap','lite-repair','v3-backpack-open']);
 await p.evaluate(()=>{__liteQA.game.lives=2;__liteQA.refresh();});assert.equal(await p.locator('#v3-life-hearts>.v3-life-heart').count(),2);
 await p.locator('#pause').click();await p.waitForSelector('#v3-codex[open][data-mode=pause]');const state=await p.evaluate(()=>JSON.stringify(__liteQA.game));
 assert.equal(await p.locator('#pause-tools:visible').count(),0);
 await p.getByRole('tab',{name:'特殊方块',exact:true}).click();await p.locator('[data-entry="block-heavy"]').click();assert.equal(await p.locator('#codex-name').innerText(),'超重方块');assert.equal(await p.evaluate(()=>JSON.stringify(__liteQA.game)),state);
 assert.equal(await p.locator('#v3-pause-settings').count(),0);
 await p.locator('#v3-pause-home').click();await p.waitForSelector('#exit-dialog[open]');await p.locator('#exit-cancel').click();assert.equal(await p.evaluate(()=>__liteQA.paused),true);assert.equal(await p.locator('#v3-codex').evaluate(n=>n.open),true);
 for(const [width,height] of [[390,844],[320,568],[1440,900]]){
  await p.setViewportSize({width,height});await p.getByRole('tab',{name:'道具',exact:true}).click();
  assert(await p.locator('#v3-codex').evaluate(n=>{const r=n.getBoundingClientRect();return n.scrollWidth<=n.clientWidth+1&&r.top>=0&&r.bottom<=innerHeight}));
  assert(await p.locator('#v3-pause-continue').evaluate(n=>{const r=n.getBoundingClientRect();return r.height>=44&&r.top>=0&&r.bottom<=innerHeight}));
  assert(await p.locator('.codex-detail').evaluate(n=>n.getBoundingClientRect().top<document.querySelector('.codex-index').getBoundingClientRect().top));
  await p.screenshot({path:out+'/pause-'+width+'.png'});await p.locator('#v3-pause-continue').click();await p.waitForFunction(()=>!__liteQA.paused);
  assert(await p.locator('#drop-budget').evaluate(n=>n.getBoundingClientRect().bottom<document.querySelector('#insertion-order').getBoundingClientRect().top));
  assert(await p.locator('#v3-life-hearts').evaluate(n=>n.getBoundingClientRect().bottom<=document.querySelector('#goal-track').getBoundingClientRect().top));
  await p.screenshot({path:out+'/hud-'+width+'.png'});await p.locator('#v3-backpack-open').click();assert(await p.locator('#v3-backpack').evaluate(n=>n.scrollWidth<=n.clientWidth+1));await p.screenshot({path:out+'/backpack-'+width+'.png'});await p.keyboard.press('Escape');await p.waitForFunction(()=>!__liteQA.paused);await p.locator('#pause').click();
 }
 await p.keyboard.press('Escape');await p.waitForFunction(()=>!__liteQA.paused);await p.locator('#pause').click();await p.locator('#v3-pause-home').click();await p.locator('#exit-save').click();await p.waitForSelector('#overlay[data-home=true]');assert.equal(await p.locator('#v3-codex').evaluate(n=>n.open),false);
 await p.locator('#motion-tuner-open').click();await p.waitForSelector('#motion-tuner[open]');
 await p.locator('#v3-volume').fill('35');await p.locator('#v3-volume').dispatchEvent('input');assert.equal(await p.locator('#v3-volume-value').innerText(),'35%');
 await p.locator('#v3-audio-toggle').click();assert.equal(await p.locator('#v3-volume-value').innerText(),'静音');await p.locator('#v3-audio-toggle').click();assert.equal(await p.locator('#v3-volume-value').innerText(),'35%');
 await p.screenshot({path:out+'/settings-390.png'});await p.keyboard.press('Escape');
 await p.reload();await p.waitForFunction(()=>window.__liteQA);await p.locator('#start').click();await p.waitForFunction(()=>!__liteQA.busy);await p.evaluate(()=>__liteQA.naturalFall=false);
 assert.deepEqual(await p.evaluate(()=>__liteQA.game.liteInventory().order),['shovel','swap','repair','block-trim']);
 assert.equal(await p.locator('#v3-volume-value').textContent(),'35%');
 assert.deepEqual(errors,[]);console.log('PASS: backpack capacity, reorder, auto-refill, save/load; heart HUD and responsive positions; shared pause guide, volume persistence, exit cancellation, resume and save/home.');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
