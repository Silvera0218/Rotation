const {chromium}=require('C:/Users/caohua/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),out='rotationV3/artifacts/popup-motion';fs.mkdirSync(out,{recursive:true});
 const report={checks:[],errors:[]};
 try{for(const reducedMotion of ['no-preference','reduce']){
  const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion});p.on('pageerror',e=>report.errors.push(e.message));
  await p.goto('http://127.0.0.1:5188/rotationV3/?qa=1');await p.waitForFunction(()=>window.__liteQA);
  await p.evaluate(()=>{window.dismissals=[];window.addEventListener('rotation:ui-dismiss',e=>dismissals.push({id:e.detail.target.id,accepted:e.defaultPrevented}));});
  const waitClosed=id=>p.waitForFunction(id=>!document.getElementById(id).open,id);
  async function dismiss(id,trigger,{paused=false}={}){
   const count=await p.evaluate(()=>dismissals.length);await trigger();
   assert.equal(await p.locator('#'+id).getAttribute('data-v3-closing'),'true');
   assert.equal(await p.locator(`[data-arc-particle-for="${id}"][data-arc-motion="exit"]`).count(),1);
   assert.equal(await p.locator('#'+id).getAttribute('aria-busy'),'true');
   if(paused)assert.equal(await p.evaluate(()=>__liteQA.paused),true);
   // Repeated close requests must retain the same animation and run only one completion.
   await p.evaluate(id=>{const d=document.getElementById(id);d.close();d.close();},id);
   await waitClosed(id);assert.equal(await p.evaluate(()=>dismissals.length),count+1);
   assert.equal(await p.locator('#'+id).getAttribute('data-v3-closing'),null);
   assert.equal(await p.locator('#'+id).getAttribute('aria-busy'),null);
  }
  await p.locator('#home-library-open').click();await dismiss('v3-codex',()=>p.locator('#v3-codex .v3-popup-close').click());assert.equal(await p.evaluate(()=>document.activeElement.id),'home-library-open');
  await p.locator('#start').click();await p.waitForFunction(()=>!__liteQA.busy);await p.evaluate(()=>{__liteQA.naturalFall=false;__liteQA.game.liteGrantTool('supply');__liteQA.refresh();});
  await p.locator('#v3-backpack-open').click();const before=await p.evaluate(()=>__liteQA.game.liteInventory().order);
  const row=await p.locator('#backpack-active [data-tool]').first().boundingBox();await p.mouse.move(row.x+60,row.y+30);await p.mouse.down();await p.mouse.move(row.x+60,row.y+100,{steps:6});assert.equal(await p.locator('.backpack-drag-ghost').count(),1);
  const requests=await p.evaluate(()=>dismissals.length);await p.keyboard.press('Escape');assert.equal(await p.locator('#v3-backpack').evaluate(n=>n.open),true);assert.equal(await p.locator('.backpack-drag-ghost').count(),0);assert.equal(await p.evaluate(()=>dismissals.length),requests);await p.mouse.up();assert.deepEqual(await p.evaluate(()=>__liteQA.game.liteInventory().order),before);
  await dismiss('v3-backpack',()=>p.keyboard.press('Escape'),{paused:true});await p.waitForFunction(()=>!__liteQA.paused);assert.equal(await p.evaluate(()=>document.activeElement.id),'v3-backpack-open');
  for(const action of ['x','continue','escape']){
   await p.locator('#pause').click();await dismiss('v3-codex',()=>action==='escape'?p.keyboard.press('Escape'):p.locator(action==='x'?'#v3-codex .v3-popup-close':'#v3-pause-continue').click(),{paused:true});await p.waitForFunction(()=>!__liteQA.paused);assert.equal(await p.evaluate(()=>document.activeElement.id),'move-left');
  }
  await p.locator('#pause').click();await p.locator('#v3-pause-home').click();await p.locator('#exit-cancel').click();await waitClosed('exit-dialog');assert.equal(await p.evaluate(()=>__liteQA.paused),true);assert.equal(await p.locator('#v3-codex').evaluate(n=>n.open),true);
  await p.locator('#v3-pause-home').click();await p.locator('#exit-save').click();await p.waitForSelector('#overlay[data-home=true]');assert.equal(await p.locator('#v3-codex').evaluate(n=>n.open),false);
  await p.locator('#start').click();await p.waitForFunction(()=>!__liteQA.busy);await p.evaluate(()=>{__liteQA.naturalFall=false;const g=__liteQA.game;g.lite.coins=100;g.checkpointScore=g.goal;g.completeCheckpoint();__liteQA.refresh();});await p.waitForSelector('.v3-reward-choice');await p.locator('#v3-shop-open').click();
  for(const action of ['x','escape','outside','buy']){
   await p.locator('.lite-shop-buy').first().click();const coins=await p.evaluate(()=>__liteQA.game.lite.coins);
   await dismiss('lite-shop-detail',()=>action==='escape'?p.keyboard.press('Escape'):action==='outside'?p.mouse.click(4,4):p.locator(action==='buy'?'#lite-shop-detail-buy':'#lite-shop-detail-cancel').click());
   if(action==='buy')assert.equal(await p.evaluate(()=>__liteQA.game.lite.coins),coins-5);else assert.equal(await p.evaluate(()=>__liteQA.game.lite.coins),coins);
   await p.waitForFunction(()=>document.activeElement.matches('.lite-shop-buy'));
  }
  await p.locator('.lite-shop-buy').first().click();await p.locator('#lite-shop-detail-cancel').click();await p.screenshot({path:out+'/shop-close-'+reducedMotion+'.png'});await waitClosed('lite-shop-detail');
  assert.equal(await p.evaluate(()=>dismissals.filter(d=>['v3-codex','v3-backpack','lite-shop-detail'].includes(d.id)).every(d=>d.accepted)),true);report.checks.push(reducedMotion+': codex, backpack, pause X / continue / Escape, home cancellation / save, shop X / Escape / backdrop / purchase; duplicate close, focus, pause retention, drag Escape and single debit');await p.close();
 }
 assert.deepEqual(report.errors,[]);report.status='PASS';
 }catch(e){report.status='FAIL';report.failure=e.stack;process.exitCode=1;}finally{fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();}
})();
