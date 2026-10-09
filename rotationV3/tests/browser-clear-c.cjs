const {chromium}=require('C:/Users/caohua/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 const out='rotationV3/artifacts/clear-c';fs.mkdirSync(out,{recursive:true});
 try{
 await p.goto('http://127.0.0.1:5188/rotationV3/?qa=1');await p.waitForFunction(()=>window.__liteQA);await p.locator('#start').click();await p.waitForFunction(()=>!__liteQA.busy&&__liteQA.game.phase==='play');
 await p.evaluate(()=>{__liteQA.naturalFall=false;const g=__liteQA.game;g.checkpointScore=g.goal+25;g.completeCheckpoint();__liteQA.refresh();__liteQA.paused=true});
 await p.waitForSelector('#lite-stage-clear');await p.waitForFunction(()=>{const i=document.querySelector('.lite-clear-lettering');return i.complete&&i.naturalWidth>0});
 // Finish only the CSS entrance while the real settlement timer is paused.
 await p.locator('#lite-stage-clear').evaluate(n=>n.getAnimations({subtree:true}).forEach(a=>a.finish()));
 assert.equal(await p.locator('#lite-stage-clear').getAttribute('data-coin-source'),'overflow');
 assert.equal(await p.locator('#lite-coins').innerText(),'0');
 for(const [width,height] of [[390,844],[320,568],[1440,900]]){
  await p.setViewportSize({width,height});
  assert(await p.locator('.lite-clear-lettering').evaluate(n=>{const r=n.getBoundingClientRect(),s=document.querySelector('#stage').getBoundingClientRect();return r.left>=s.left&&r.right<=s.right&&r.top>=s.top&&r.bottom<=s.bottom}));
  await p.screenshot({path:out+'/clear-'+width+'.png'});
 }
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>__liteQA.paused=false);
 await p.waitForSelector('#lite-stage-clear[data-coin-source="base"]');
 assert.equal(await p.locator('.lite-clear-coins span').innerText(),'通关金币');
 assert.equal(await p.locator('#lite-coins').innerText(),'3');await p.screenshot({path:out+'/base-coins.png'});
 await p.waitForSelector('.v3-reward-choice',{timeout:15000});assert.equal(await p.locator('#lite-stage-clear').count(),0);assert.equal(await p.evaluate(()=>__liteQA.game.lite.coins),8);
 await p.locator('.v3-reward-choice').first().click();await p.locator('#lite-refresh-reward[data-action=next]').click();await p.waitForFunction(()=>!__liteQA.busy&&__liteQA.game.stage===1&&__liteQA.game.phase==='play');
 await p.emulateMedia({reducedMotion:'reduce'});await p.evaluate(()=>{const g=__liteQA.game;g.checkpointScore=g.goal;g.completeCheckpoint();__liteQA.refresh()});await p.waitForSelector('.v3-reward-choice',{timeout:15000});assert.equal(await p.locator('#lite-stage-clear').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS: approved transparent C sprite; desktop/mobile fit; overflow coins then base coins; reward transition; reduced-motion clear; no runtime errors.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
