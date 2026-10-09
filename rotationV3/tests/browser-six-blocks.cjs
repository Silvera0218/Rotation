const {chromium}=require('C:/Users/caohua/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('assert/strict');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});const p=await b.newPage({viewport:{width:390,height:844}});const out='rotationV3/artifacts/six-blocks';fs.mkdirSync(out,{recursive:true});const report={checks:[],errors:[]};p.on('pageerror',e=>report.errors.push(e.stack));p.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url())});
try{
await p.goto('http://127.0.0.1:5188/rotationV3/?qa=1');await p.waitForFunction(()=>window.__liteQA);await p.locator('#start').click();await p.waitForFunction(()=>__liteQA.game.phase==='play'&&!__liteQA.busy);
for(const id of ['column','blast','trim','patch','pack','heavy','diamond']){
 await p.evaluate(id=>{__liteQA.start();__liteQA.naturalFall=false;const g=__liteQA.game;g.board=[{x:1,y:0,id:g.id++,type:'T'},{x:-1,y:0,id:g.id++,type:'S'},{x:3,y:0,id:g.id++,type:'L'}];g.active={type:'L',color:'L',shape:[[0,0]],x:0,y:5,origin:'ordinary'};g.checkpointScore=id==='blast'?30:0;g.levelScore=g.score=g.checkpointScore;g.lite.tools['block-'+id]=1;__liteQA.refresh();},id);
 await p.waitForFunction(()=>!__liteQA.busy);await p.locator('#lite-block-'+id).click();await p.waitForFunction(id=>__liteQA.game.active.liteEffect===id,id);
 await p.waitForFunction(()=>Object.values(__liteQA.specialVisuals()).every(v=>v.loaded));
 await p.screenshot({path:out+'/'+id+'-before.png'});
 await p.evaluate(()=>{window._v3Events=[];const g=__liteQA.game;const original=g.events.push;g.events.push=function(...events){window._v3Events.push(...events.map(e=>({kind:e.kind,liteEffect:e.liteEffect,points:e.scoring?.points})));return original.apply(this,events);};__liteQA.action('drop');});
 await p.waitForFunction(()=>window._v3Events.some(e=>e.kind==='special'),{},{timeout:12000});
 await p.screenshot({path:out+'/'+id+'-impact.png'});
 await p.waitForFunction(()=>['play','checkpoint-complete'].includes(__liteQA.game.phase)&&!__liteQA.busy,{},{timeout:25000});
 const state=await p.evaluate(()=>({phase:__liteQA.game.phase,events:window._v3Events,used:__liteQA.game.dropsUsed,board:__liteQA.game.board,active:!!__liteQA.game.active}));
 assert.equal(state.events.filter(e=>e.kind==='special').length,1);assert.equal(state.used,1);if(id==='heavy'){assert(state.events.filter(e=>e.kind==='turn').length<=1);assert(state.board.every(c=>!c.liteHeavyBonus));}if(id==='diamond')assert(state.board.some(c=>c.liteHeavyBonus===2));if(id==='patch')assert(state.board.some(c=>c.liteCoin));
 assert.equal(await p.locator('#lite-block-'+id).isVisible(),false);await p.screenshot({path:out+'/'+id+'-after.png'});report.checks.push({id,phase:state.phase,turns:state.events.filter(e=>e.kind==='turn').length,points:state.events.find(e=>e.kind==='special').points??null});
}
assert.deepEqual(report.errors,[]);report.status='PASS';
}catch(e){report.status='FAIL';report.failure=e.stack;report.state=await p.evaluate(()=>({phase:__liteQA.game.phase,events:window._v3Events,busy:__liteQA.busy}));await p.screenshot({path:out+'/failure.png'});process.exitCode=1;}finally{fs.writeFileSync(out+'/browser-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await b.close();}})();
