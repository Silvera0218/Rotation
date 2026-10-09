const {chromium}=require('C:/Users/caohua/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
try{
 await p.addInitScript(()=>localStorage.setItem('rotationV3ModsV1',JSON.stringify({equipped:['return']})));
 await p.goto('http://127.0.0.1:5188/rotationV3/?qa=1');await p.waitForFunction(()=>window.__liteQA);
 assert.equal(await p.locator('#home-mods-open,#v3-mods,[data-mod]').count(),0);
 assert.equal(await p.evaluate(()=>[...document.scripts].some(s=>s.src.includes('lite-mods'))),false);
 await p.locator('#home-library-open').click();assert.deepEqual(await p.locator('.codex-group>h3').allTextContents(),['道具','特殊方块']);assert.equal(await p.locator('.codex-item').count(),12);
 for(const id of ['block-column','block-blast','block-trim','block-patch','block-pack','block-heavy','block-diamond']){await p.locator(`[data-entry="${id}"]`).click();assert.equal(await p.locator('#v3-codex').getAttribute('data-selected'),id);}
 await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.getElementById('v3-codex').open);await p.locator('#start').click();await p.waitForFunction(()=>!__liteQA.busy);
 await p.evaluate(()=>{__liteQA.naturalFall=false;__liteQA.game.liteGrantTool('block-column');__liteQA.refresh();});
 assert.equal(await p.evaluate(()=>'mods' in __liteQA.game.lite),false);await p.locator('#lite-block-column').click();assert.equal(await p.evaluate(()=>__liteQA.game.lite.tools['block-column']),0);assert.equal(await p.evaluate(()=>__liteQA.game.active.liteEffect),'column');
 await p.locator('#pause').click();assert.deepEqual(await p.locator('.codex-category-tabs [role=tab]').allTextContents(),['道具','特殊方块']);await p.getByRole('tab',{name:'特殊方块',exact:true}).click();assert.equal(await p.locator('.codex-group:not([hidden]) .codex-item').count(),7);
 await p.locator('#v3-pause-home').click();await p.locator('#exit-save').click();await p.waitForSelector('#overlay[data-home=true]');
 await p.evaluate(()=>{const key='rotationV3SuspendedRunV1',save=JSON.parse(localStorage.getItem(key));save.game.lite.mods=['return','refund','diagonal'];save.game.lite.stageState={stage:save.game.stage,returnUsed:false};save.game.lite.tools['block-column']=1;delete save.game.active.liteEffect;localStorage.setItem(key,JSON.stringify(save));});
 await p.reload();await p.waitForFunction(()=>window.__liteQA);await p.locator('#start').click();await p.waitForFunction(()=>!__liteQA.busy);await p.evaluate(()=>{__liteQA.naturalFall=false;__liteQA.refresh();});
 assert.equal(await p.evaluate(()=>'mods' in __liteQA.game.lite),false);assert.equal(await p.evaluate(()=>'stageState' in __liteQA.game.lite),false);await p.locator('#lite-block-column').click();assert.equal(await p.evaluate(()=>__liteQA.game.lite.tools['block-column']),0);
 assert.equal(await p.locator('#lite-toast').innerText(),'当前落块已改造为变色方块');assert.deepEqual(errors,[]);console.log('PASS: no upgrade entry/resources/classes; 12 catalogue items in two groups; seven special previews; new game and restored legacy equipped save both consume first special; retired profile ignored; no JS or asset errors.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
