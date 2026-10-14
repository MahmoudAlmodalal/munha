import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';

const chromePath=process.env.CHROME_PATH || ['/usr/bin/google-chrome','/usr/bin/chromium'].find(path=>existsSync(path));
assert.ok(chromePath,'Chrome or Chromium is installed (or set CHROME_PATH)');
const chrome=spawn(chromePath,['--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9237','--user-data-dir=/tmp/alfaraa-browser-check','--no-first-run','--no-default-browser-check','about:blank'],{stdio:'ignore'});
let socket;
let nextId=1;
const pending=new Map();
const errors=[];
const retainedSource=JSON.parse((await import('node:fs')).readFileSync(new URL('../dist/source.json',import.meta.url),'utf8'));
async function checkSourceParagraphs(item,label) {
  const paragraphs=[...new Set(item.lines.filter(line=>line.length>=60))];
  const normalizeContent=value=>value.replace(/\s|\p{Cf}/gu,'');
  const missing=await evaluate(`(()=>{const normalize=${normalizeContent.toString()};const text=normalize(document.querySelector('main').textContent);return ${JSON.stringify(paragraphs)}.filter(line=>!text.includes(normalize(line)));})()`);
  check(missing.length===0,label+' retains every source paragraph: '+missing.join(' | '));
}
let pausedContent;
async function command(method,params={}){
  const id=nextId++;
  return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{pending.delete(id);reject(new Error('Timed out: '+method));},20000);pending.set(id,{resolve,reject,timeout});socket.send(JSON.stringify({id,method,params}));});
}
async function evaluate(expression){const result=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.text);return result.result.value;}
async function until(expression){for(let i=0;i<100;i++){if(await evaluate(expression))return;await delay(100);}throw new Error('Condition did not resolve: '+expression);}
async function route(path){await evaluate(`location.hash=${JSON.stringify('#/'+path)}`);await delay(180);}
function check(value,label){assert.ok(value,label);console.log('PASS',label);}
async function screenshot(path){await delay(700);const {data}=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(path,Buffer.from(data,'base64'));}
try{
  let target;
  for(let i=0;i<80;i++){try{target=(await (await fetch('http://127.0.0.1:9237/json/list')).json()).find(item=>item.type==='page');if(target)break;}catch{}await delay(100);}
  assert.ok(target,'Chrome debugging target');
  socket=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id){const request=pending.get(message.id);if(!request)return;clearTimeout(request.timeout);pending.delete(message.id);message.error?request.reject(new Error(message.error.message)):request.resolve(message.result);}else if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.text);else if(message.method==='Fetch.requestPaused')pausedContent=message.params.requestId;});
  await command('Page.enable');await command('Runtime.enable');
  await command('Emulation.setDeviceMetricsOverride',{width:1440,height:1080,deviceScaleFactor:1,mobile:false});
  await command('Page.navigate',{url:'http://127.0.0.1:4173/'});
  await until("document.querySelector('.hero h1') !== null");
  await evaluate('document.fonts.ready');await delay(600);
  mkdirSync('artifacts',{recursive:true});
  check(await evaluate("document.documentElement.dir === 'rtl'"),'Arabic RTL');
  check(await evaluate("document.querySelectorAll('.service-card').length === 3"),'Homepage services');
  await checkSourceParagraphs(retainedSource.pages.find(item=>item.slug==='الرئيسيه'),'Homepage');
  check(await evaluate("document.querySelectorAll('#testimonials figure').length===4 && document.querySelectorAll('#equipment-gallery img').length===6 && document.querySelectorAll('.brand-logos img').length===8"),'All original testimonials, equipment photos and brand logos are displayed');
  check(await evaluate("document.querySelectorAll('.service-ribbon a').length===7"),'All seven original service highlights are displayed');
  await screenshot('artifacts/home-desktop.png');
  await evaluate("document.querySelectorAll('main img').forEach(image=>image.loading='eager')");
  await until("[...document.querySelectorAll('main img')].every(image=>image.complete && image.naturalWidth>0)");
  const layout=await command('Page.getLayoutMetrics');
  for(let top=0;top<layout.cssContentSize.height;top+=900){await evaluate(`window.scrollTo({top:${top},behavior:'instant'})`);await delay(250);}
  await evaluate("window.scrollTo({top:0,behavior:'instant'})");await delay(900);
  const full=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:1440,height:layout.cssContentSize.height,scale:1}});
  writeFileSync('artifacts/home-full-desktop.png',Buffer.from(full.data,'base64'));
  for(const [width,height] of [[320,720],[375,844],[768,1024],[1024,768],[1280,800],[1366,768],[1440,900],[1920,1080]]){
    await command('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<=375});await delay(120);
    check(await evaluate('document.documentElement.scrollWidth <= innerWidth+1'),`Homepage has no horizontal overflow at ${width}px`);
    check(await evaluate("document.querySelector('.trust-row').getBoundingClientRect().top >= document.querySelector('.service-ribbon').getBoundingClientRect().bottom-1"),`Service ribbon remains unobscured at ${width}px`);
    check(await evaluate("[...document.querySelectorAll('.hero-product,.service-ribbon a,.trust-item')].every(element=>{const r=element.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1})"),`Hero panel, service links and statistics stay inside ${width}px viewport`);
    if(width>=1280){
      check(await evaluate("[...document.querySelectorAll('.hero h1,.hero-copy,.hero-product,.hero-actions,.hero-bottom,.main-nav,.header-quote')].every(element=>{const r=element.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight})"),`Hero content and desktop navigation fit ${width}×${height}`);
      check(await evaluate("document.querySelector('.hero-actions').getBoundingClientRect().bottom < document.querySelector('.hero-bottom').getBoundingClientRect().top"),`Hero actions do not overlap the section link at ${width}px`);
      await screenshot(`artifacts/home-${width}x${height}.png`);
    }
    if(width===375)await screenshot('artifacts/home-mobile.png');
  }
  for(const path of ['about','activities','branches','news','contact','banks','careers','fastlinks','organizational-chart','refund_returns']){
    await route(path);check(await evaluate("document.querySelector('h1') !== null && !document.body.textContent.includes('الصفحة غير موجودة')"),`Page ${path}`);
    check(await evaluate('document.documentElement.scrollWidth <= innerWidth+1'),`${path} has no horizontal overflow`);
  }
  for(const [slug,path] of [['about','about'],['نشاطاتنا','activities'],['banks','banks']]){await route(path);await checkSourceParagraphs(retainedSource.pages.find(item=>item.slug===slug),path);}
  await route('branches');check(await evaluate("document.querySelectorAll('.source-map iframe').length===6 && document.querySelector('a[href*=\"7R6M\"]')!==null && document.querySelector('a[href=\"tel:0552141467\"]')!==null"),'All six maps, Ranyah directions and the published Isuzu number are retained');
  await route('careers');check(await evaluate("document.querySelector('iframe').src==='https://www.alfaraaonline.mg-so.com/forms/?p=17'"),'Original careers form is available');
  await route('contact');check(await evaluate("document.querySelector('.source-embed iframe').src==='https://www.alfaraaonline.mg-so.com/forms/?p=3'"),'Original contact form is available');
  await route('fastlinks');check(await evaluate("document.querySelector('a[href*=\"linkedin.com/company/al-faraa\"]')!==null"),'LinkedIn company channel is retained');
  for(const post of retainedSource.posts){await route('news/'+post.id);await checkSourceParagraphs(post,'Article '+post.id);check(await evaluate(`document.querySelectorAll('.article-copy img').length===${post.images.length}`),'All images retained for article '+post.id);}
  await route('news');check(await evaluate("document.querySelectorAll('.news-card').length===15"),'All 15 news articles');
  const articleHash=await evaluate("document.querySelector('.news-card h3 a').hash");await evaluate(`location.hash=${JSON.stringify(articleHash)}`);await delay(150);check(await evaluate("document.querySelector('.article-copy')!==null"),'News article navigation');
  await route('branches');await evaluate("document.querySelector('[data-city=الدمام].branch-filter').click()");check(await evaluate("document.querySelectorAll('.branch-card').length===1"),'Branch city filter');
  await evaluate("const search=document.querySelector('#branch-search');search.value='لايوجد';search.dispatchEvent(new Event('input'))");check(await evaluate("document.querySelector('.empty-state')!==null"),'Branch search empty state');
  check(await evaluate("document.querySelector('#branch-count').textContent.includes('لا توجد')"),'Branch result announcement');
  await evaluate("document.querySelector('[data-reset-search]').click()");
  check(await evaluate("document.querySelectorAll('.branch-card').length===6 && document.querySelector('[data-city=الكل].branch-filter').getAttribute('aria-pressed')==='true' && document.activeElement.id==='branch-search'"),'Branch empty state restores all results and search focus');
  await screenshot('artifacts/branches-desktop.png');
  await route('news');await evaluate("document.querySelector('#news-search').value='لايوجد';document.querySelector('#news-search').dispatchEvent(new Event('input'))");
  check(await evaluate("document.querySelector('.empty-state')!==null && document.querySelector('#news-count').textContent.startsWith('0')"),'News empty state and result announcement');
  await screenshot('artifacts/search-empty.png');
  await evaluate("document.querySelector('[data-reset-search]').click()");
  check(await evaluate("document.querySelectorAll('.news-card').length===15 && document.activeElement.id==='news-search'"),'News empty state restores all articles and search focus');
  await route('contact?service=import');check(await evaluate("document.querySelector('#service').value==='import'"),'Service enquiry preselection');
  await evaluate("document.querySelector('#quote-form').requestSubmit()");check(await evaluate("document.querySelector('#details').getAttribute('aria-invalid')==='true' && document.activeElement.id==='details'"),'Enquiry validation and focus');
  await evaluate("document.querySelector('#details').value='قطع غيار فولفو & طلب #123';document.querySelector('#quote-form').requestSubmit()");
  check(await evaluate("document.querySelector('#quote-draft a').href.startsWith('https://wa.me/966596945222?text=')"),'WhatsApp draft targets China-import contact');
  check(await evaluate("decodeURIComponent(document.querySelector('#quote-draft a').href).includes('قطع غيار فولفو & طلب #123')"),'Arabic WhatsApp draft encoding');
  check(await evaluate("document.activeElement.id==='draft-title' && document.querySelector('.success-icon')!==null"),'Draft success feedback and focus');
  await screenshot('artifacts/contact-desktop.png');
  await evaluate("document.querySelector('#details').dispatchEvent(new Event('input',{bubbles:true}))");
  check(await evaluate("document.querySelector('#quote-draft').hidden"),'Editing an enquiry hides the stale draft');
  await evaluate("document.querySelector('#quote-form').requestSubmit();document.querySelector('#service').value='parts';document.querySelector('#service').dispatchEvent(new Event('input',{bubbles:true}))");
  check(await evaluate("document.querySelector('#quote-draft').hidden"),'Changing service hides the stale draft');
  await command('Emulation.setDeviceMetricsOverride',{width:375,height:844,deviceScaleFactor:1,mobile:true});await route('contact');await screenshot('artifacts/contact-mobile.png');
  check(await evaluate("document.querySelector('#quote-form').getBoundingClientRect().top < 500"),'Mobile enquiry form is immediately visible');
  check(await evaluate("getComputedStyle(document.querySelector('.whatsapp-float')).display==='none'"),'Contact form is unobscured by the floating WhatsApp action');
  for(const path of ['about','activities','branches','news','contact','banks','careers','fastlinks','organizational-chart','refund_returns']){
    await route(path);check(await evaluate('document.documentElement.scrollWidth <= innerWidth+1'),`${path} has no mobile horizontal overflow`);
    check(await evaluate("document.querySelectorAll('main h1').length===1"),`${path} has one primary heading`);
  }
  await evaluate("document.querySelector('.menu-toggle').click()");check(await evaluate("document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='true'"),'Mobile menu opens');
  check(await evaluate("document.activeElement===document.querySelector('#main-nav a')"),'Opening the mobile menu focuses navigation');
  await screenshot('artifacts/navigation-mobile.png');
  await evaluate("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))");check(await evaluate("document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false' && document.activeElement.classList.contains('menu-toggle')"),'Mobile menu Escape and focus');
  await evaluate("document.querySelector('.menu-toggle').click();document.querySelector('main').click()");
  check(await evaluate("document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false'"),'Mobile menu dismisses on outside click');
  await route('banks');check(await evaluate("[...document.querySelectorAll('.copy-field code')].map(item=>item.textContent).join('|')==='SA3180000513608010887974|513608010887974|SA0520000003591716559940|003591716559940'"),'Bank numbers match source exactly');
  await evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedValue=value}}});document.querySelector('.copy-button').click()");
  await until("document.querySelector('.copy-button').textContent==='تم النسخ'");
  check(await evaluate("window.copiedValue===document.querySelector('.copy-button').dataset.copy"),'Clipboard preserves bank data and confirms success');
  await evaluate("navigator.clipboard.writeText=async()=>{throw new Error('Clipboard unavailable')};document.querySelectorAll('.copy-button')[1].click()");
  await until("document.querySelector('#toast').textContent.includes('تعذر النسخ')");
  check(await evaluate("!document.querySelectorAll('.copy-button')[1].disabled"),'Clipboard failure offers manual recovery');
  const routes=['','about','activities','branches','news','contact','banks','careers','fastlinks','organizational-chart','refund_returns',articleHash.slice(2)];
  for(const width of [320,375,768,1024,1280,1366,1440,1920]){
    await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===320});
    for(const path of routes){await route(path);assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth+1'),`${path} overflows at ${width}px`);}
    check(true,`All screens and an article fit at ${width}px`);
  }
  await route('about');await evaluate("location.hash='#logistics'");await delay(400);check(await evaluate("document.querySelector('#logistics')!==null && document.querySelector('#logistics').getBoundingClientRect().top>=75"),'Logistics section anchor resolves from other pages');
  await route('activities');check(await evaluate("getComputedStyle(document.querySelector('.page-hero .container')).animationName==='enter'"),'Page entrance motion is enabled');
  await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await route('branches');await evaluate("document.querySelector('[data-city=الدمام].branch-filter').click()");
  check(await evaluate("document.querySelector('main').getAnimations({subtree:true}).length===0 && getComputedStyle(document.documentElement).scrollBehavior==='auto'"),'Reduced motion disables entrances, result animations and smooth scrolling');
  await route('contact');await evaluate("document.querySelector('#details').value='طلب قطعة غيار';document.querySelector('#quote-form').requestSubmit()");
  check(await evaluate("document.querySelector('main').getAnimations({subtree:true}).length===0 && !document.querySelector('#quote-draft').hidden"),'Reduced motion preserves enquiry success feedback');
  await command('Emulation.setEmulatedMedia',{features:[]});
  await route('missing-page');check(await evaluate("document.querySelector('h1').textContent==='الصفحة غير موجودة'"),'Unknown route recovery');
  await command('Emulation.setDeviceMetricsOverride',{width:375,height:844,deviceScaleFactor:1,mobile:true});
  await command('Fetch.enable',{patterns:[{urlPattern:'*source.json*',requestStage:'Request'}]});
  await command('Page.navigate',{url:'http://127.0.0.1:4173/'});
  for(let i=0;i<100&&!pausedContent;i++)await delay(100);
  assert.ok(pausedContent,'Content request is intercepted');
  check(await evaluate("document.querySelector('main').getAttribute('aria-busy')==='true' && document.querySelector('.loading-spinner')!==null"),'Loading state appears while content is pending');
  await screenshot('artifacts/loading-mobile.png');
  await command('Fetch.fulfillRequest',{requestId:pausedContent,responseCode:503,body:''});
  await until("document.querySelector('[data-retry]')!==null");
  check(await evaluate("document.querySelector('main').getAttribute('aria-busy')==='false'"),'Content failure offers a retry');
  await screenshot('artifacts/error-mobile.png');
  pausedContent=null;await evaluate("document.querySelector('[data-retry]').click()");
  for(let i=0;i<100&&!pausedContent;i++)await delay(100);
  assert.ok(pausedContent,'Retry requests content again');
  await command('Fetch.continueRequest',{requestId:pausedContent});await command('Fetch.disable');
  await until("document.querySelector('.hero h1')!==null");
  check(await evaluate("document.querySelector('main').getAttribute('aria-busy')==='false' && document.activeElement.id==='main'"),'Retry restores the current page and keyboard focus');
  await command('Page.navigate',{url:'http://127.0.0.1:4173/#services'});await until("document.querySelector('#services')!==null");
  await delay(900);
  const anchorTop=await evaluate("document.querySelector('#services').getBoundingClientRect().top");
  check(anchorTop>=75&&anchorTop<160,`Direct services anchor loads and scrolls below the header (${Math.round(anchorTop)}px)`);
  check(errors.length===0,'No JavaScript runtime exceptions');
  console.log('Browser checks complete. Screenshots saved in artifacts/.');
}finally{socket?.close();chrome.kill();}
