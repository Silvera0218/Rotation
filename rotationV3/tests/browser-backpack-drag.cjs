const{chromium}=require('C:/Users/caohua/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),out='rotationV3/artifacts/backpack-drag';fs.mkdirSync(out,{recursive:true});
 try{for(const touch of [false,true]){
  const context=await browser.newContext({viewport:{width:touch?320:390,height:touch?650:844},hasTouch:touch,isMobile:touch,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5188/rotationV3/?qa=1');await page.waitForFunction(()=>window.__liteQA);await page.evaluate(()=>{__liteQA.start();__liteQA.naturalFall=false;const g=__liteQA.game;for(const id of ['block-column','block-blast'])g.liteGrantTool(id);__liteQA.refresh();});await page.locator('#v3-backpack-open').click();
  assert.equal(await page.locator('.backpack-actions').count(),0);assert.equal(await page.locator('#backpack-effect').count(),0);
  assert(await page.locator('[data-tool="block-column"] .backpack-effect-copy').innerText());
  const order=()=>page.evaluate(()=>__liteQA.game.liteInventory().order),original=await order();
  await page.locator('[data-tool="shovel"]').click();assert.deepEqual(await order(),original);
  const cdp=touch?await context.newCDPSession(page):null;
  async function drag(from,to,cancel=false){
   const a=await page.locator(`[data-tool="${from}"]`).boundingBox(),b=await page.locator(`[data-tool="${to}"]`).boundingBox(),x=a.x+a.width/2,y=a.y+a.height/2,tx=b.x+b.width/2,ty=b.y+b.height/2;
   if(touch){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+(tx-x)*i/12,y:y+(ty-y)*i/12}]});await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});}
   else{await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(tx,ty,{steps:12});if(cancel)await page.keyboard.press('Escape');await page.mouse.up();}
   await page.waitForFunction(()=>!document.querySelector('.backpack-drag-ghost'));
  }
  await drag('block-blast','shovel');assert.deepEqual(await order(),['block-blast','shovel','swap','block-column']);assert.equal(await page.evaluate(()=>__liteQA.paused),true);
  await drag('block-blast','block-column');assert.deepEqual(await order(),['shovel','swap','block-column','block-blast']);
  await drag('swap','shovel',true);assert.deepEqual(await order(),['shovel','swap','block-column','block-blast']);
  await page.locator('[data-tool="swap"]').focus();await page.keyboard.press('Alt+ArrowUp');assert.deepEqual(await order(),['swap','shovel','block-column','block-blast']);
  assert(await page.locator('#v3-backpack').evaluate(n=>n.scrollWidth<=n.clientWidth+1));assert(await page.locator('.backpack-row').evaluateAll(ns=>ns.every(n=>n.scrollWidth<=n.clientWidth+1&&n.scrollHeight<=n.clientHeight+1)));
  await page.screenshot({path:out+'/'+(touch?'mobile-320':'desktop-390')+'.png'});
  await page.locator('#v3-backpack .v3-popup-close').click();await page.waitForFunction(()=>!__liteQA.paused);
  await page.reload();await page.waitForFunction(()=>window.__liteQA);await page.locator('#start').click();await page.waitForFunction(()=>!__liteQA.busy);assert.deepEqual(await order(),['swap','shovel','block-column','block-blast']);assert.deepEqual(errors,[]);
  await context.close();
 }console.log('PASS: inline effects, desktop and touch reorder across both sections, cancel rollback, keyboard reorder, 320px layout, pause/resume and saved order.');}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
