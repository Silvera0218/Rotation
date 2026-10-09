const {chromium}=require('C:/Users/caohua/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const out='rotationV3/artifacts/heavy-diamond';fs.mkdirSync(out,{recursive:true});
 try{for(const reducedMotion of ['no-preference','reduce']){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion}),p=await context.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  await p.goto('http://127.0.0.1:5188/rotationV3/?qa=1');await p.waitForFunction(()=>window.__liteQA);
  await p.locator('#home-library-open').click();
  for(const id of ['heavy','diamond']){
   await p.locator(`[data-entry="block-${id}"]`).click();
   assert((await p.locator('#codex-name').innerText()).includes(id==='heavy'?'超重':'钻石'));
   await p.locator(`[data-entry="block-${id}"] img`).evaluate(img=>img.decode());
   if(reducedMotion==='reduce')await p.screenshot({path:`${out}/codex-${id}.png`});
  }
  await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('#v3-codex').open);
  await p.locator('#start').click();await p.waitForFunction(()=>!__liteQA.busy);
  await p.evaluate(()=>{
   __liteQA.naturalFall=false;const g=__liteQA.game;
   g.board=[[1,-2,'T'],[2,-1,'S']].map(([x,y,type])=>({x,y,type,id:g.id++}));
   g.active={type:'L',color:'L',shape:[[0,0],[1,0],[2,0],[3,0]],x:0,y:5,liteEffect:'heavy'};
   window.heavyTimeline=[];const push=g.events.push;g.events.push=function(...events){for(const e of events)heavyTimeline.push({kind:e.kind,heavy:!!e.liteHeavyFall,fallen:e.fallen?.length,time:performance.now()});return push.apply(this,events);};
   __liteQA.refresh();__liteQA.action('drop');
  });
  await p.waitForFunction(()=>__liteQA.game.phase==='settling');
  const during=await p.evaluate(()=>({phase:__liteQA.game.phase,lives:__liteQA.game.lives,events:heavyTimeline}));
  assert.equal(during.lives,3);assert(!during.events.some(e=>e.kind==='turn'));assert(during.events.some(e=>e.heavy&&e.fallen===1));
  await p.screenshot({path:`${out}/heavy-falling-${reducedMotion}.png`});
  await p.waitForFunction(()=>heavyTimeline.some(e=>e.kind==='turn'));
  const order=await p.evaluate(()=>heavyTimeline);const fall=order.find(e=>e.heavy),turn=order.find(e=>e.kind==='turn');
  assert(turn.time>fall.time+100,'Turn must wait for the fall animation');
  await p.waitForFunction(()=>__liteQA.game.phase==='play'&&!__liteQA.busy);
  await p.evaluate(()=>{
   const g=__liteQA.game;g.board=[{x:1,y:0,id:g.id++,type:'L'}];g.active={type:'L',color:'L',shape:[[0,0]],x:0,y:5};g.liteGrantTool('block-diamond');__liteQA.refresh();
  });
  await p.locator('#lite-block-diamond').click();assert.equal(await p.evaluate(()=>__liteQA.game.active.liteEffect),'diamond');
  await p.evaluate(()=>__liteQA.action('drop'));await p.waitForFunction(()=>__liteQA.game.board.some(c=>c.liteHeavyBonus));
  const boosted=await p.evaluate(()=>__liteQA.game.board.filter(c=>c.type==='L'));assert(boosted.every(c=>c.liteHeavyBonus===boosted.length));
  await p.waitForSelector('#lite-heavy-markers span');assert.equal(await p.locator('#lite-heavy-markers span').first().innerText(),'×'+(1+boosted.length));
  assert.deepEqual(errors,[]);console.log('PASS '+reducedMotion+': codex/icons, heavy fall before turn, safe fallout, diamond inventory and +N markers');
  await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
