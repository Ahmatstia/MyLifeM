// Actual application, fresh browser data, audit-only COI proxy. No user database.
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1119-907-0_26.1119.907.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const data={platform:'Chromium actual application via audit-only COI proxy; no native QA',checks:[],errors:[]};
async function main(){
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:360,height:844},locale:'id-ID',timezoneId:'Asia/Jakarta'});
  const page=await context.newPage();
  page.on('pageerror',error=>data.errors.push(error.message));
  await page.goto('http://127.0.0.1:8087',{waitUntil:'domcontentloaded',timeout:60000});
  for(let i=0;i<3;i++){
   await page.waitForFunction(()=>document.body.innerText.includes('Halo,')||document.body.innerText.includes('Data belum dapat dibuka'),{timeout:45000});
   const body=await page.locator('body').innerText();
   data.checks.push({name:'startup-'+i,body:body.slice(0,3000)});
   if(body.includes('Halo,'))break;
   await page.waitForTimeout(3000);
   await page.getByRole('button',{name:'Coba lagi',exact:true}).click();
  }
  if(!(await page.locator('body').innerText()).includes('Halo,'))throw new Error('Live web did not pass database initialization even after retries.');
  await page.screenshot({path:path.join(__dirname,'screenshots/live-home-360.png'),fullPage:true});
  await page.getByRole('button',{name:'Tambah baru',exact:true}).click();
  await page.getByRole('button',{name:'Target Hidup',exact:true}).click();
  await page.getByPlaceholder('Masukkan nama target',{exact:true}).fill('Audit Target Alpha');
  await page.getByPlaceholder('Masukkan deskripsi target',{exact:true}).fill('Data uji dalam profil browser sementara.');
  await page.getByRole('button',{name:'Simpan',exact:true}).click();
  await page.waitForTimeout(1200);
  data.checks.push({name:'create-target',body:(await page.locator('body').innerText()).slice(0,3000)});
  const links=await page.getByRole('tab').allTextContents();
  data.checks.push({name:'navigation-tabs',tabs:links});
 }catch(error){data.failure=error.message;process.exitCode=1;}
 finally{await browser.close();fs.writeFileSync(path.join(__dirname,'live-web-evidence.json'),JSON.stringify(data,null,2));console.log(JSON.stringify(data,null,2));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
