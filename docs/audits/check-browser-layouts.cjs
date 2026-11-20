// Browser layout measurements of 112 SSR fixtures. Not native or end-to-end QA.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1119-907-0_26.1119.907.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const cases = JSON.parse(fs.readFileSync(path.join(__dirname,'ui-fixture-manifest.json'),'utf8'));
const results = [];
async function main() {
  const browser = await chromium.launch({ channel:'chrome', headless:true });
  try {
    const context = await browser.newContext({locale:'id-ID',timezoneId:'Asia/Jakarta'});
    const page = await context.newPage();
    for (const item of cases) {
      await page.setViewportSize({width:item.width,height:844});
      await page.goto('http://127.0.0.1:8088/'+item.file,{waitUntil:'load',timeout:20000});
      await page.evaluate(()=>document.fonts.ready);
      const measured = await page.evaluate(() => {
        const phone = document.querySelector('.phone');
        const phoneRect = phone.getBoundingClientRect();
        const allowedScroller = el => {
          for(let p=el.parentElement;p && p!==phone;p=p.parentElement){const s=getComputedStyle(p);if(['auto','scroll'].includes(s.overflowX)&&p.scrollWidth>p.clientWidth+1)return true;}
          return false;
        };
        const overflow=[];
        for(const el of phone.querySelectorAll('button,input,textarea,[role="button"],[role="checkbox"],div')){
          if(el.closest('svg') || (!el.matches('input,textarea,button,[role="button"],[role="checkbox"]') && (el.children.length || !el.textContent.trim())))continue;
          const r=el.getBoundingClientRect();const style=getComputedStyle(el);
          if(!r.width||!r.height||style.visibility==='hidden'||style.display==='none'||allowedScroller(el))continue;
          if(r.left<phoneRect.left-1 || r.right>phoneRect.right+1) overflow.push({tag:el.tagName,role:el.getAttribute('role'),text:(el.getAttribute('aria-label')||el.getAttribute('placeholder')||el.textContent).trim().slice(0,100),left:+r.left.toFixed(1),right:+r.right.toFixed(1),width:+r.width.toFixed(1)});
        }
        return {phoneWidth:phone.clientWidth,scrollWidth:phone.scrollWidth,loadedFonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family),overflow};
      });
      const result={...item,...measured};
      if((item.width===360 && item.fontScale===1)||(item.width===320 && item.fontScale===2)){
        result.screenshot='screenshots/'+item.file.replace('.html','.png');
        await page.screenshot({path:path.join(__dirname,result.screenshot),fullPage:true});
      }
      results.push(result);
    }
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(__dirname,'browser-layout-evidence.json'),JSON.stringify({platform:'Chromium SSR fixtures; fonts loaded; no hydration; no native keyboard/safe-area proof',cases:results},null,2));
  }
  const grouped=Object.fromEntries([...new Set(results.map(r=>r.name))].map(name=>[name,results.filter(r=>r.name===name).map(r=>({width:r.width,scale:r.fontScale,overflow:r.overflow.length}))]));
  console.log(JSON.stringify({cases:results.length,grouped},null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
