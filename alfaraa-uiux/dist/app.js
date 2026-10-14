import {SERVICES, makeWhatsAppUrl} from './quote.js';

const main = document.querySelector('main');
document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();main.focus();main.scrollIntoView();});
const nav = document.querySelector('#main-nav');
const menuToggle = document.querySelector('.menu-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const loadingMarkup = main.innerHTML;
const PROFILE = 'https://alfaraaonline.com.sa/wp-content/uploads/2021/04/al-faraa-company-profile-4-1-18.pdf';
const SALES = 'https://wa.me/966594344888';
const icons = {
  arrow:'<path d="M19 12H5m6 6-6-6 6-6"/>',check:'<path d="m5 12 4 4L19 6"/>',
  truck:'<path d="M3 6h11v11H3zm11 5h4l3 4v2h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  parts:'<path d="m14 5-4 4-1 5-6 6 3 3 6-6 5-1 4-4-6 1-3-3 1-5Z"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c6 5 6 13 0 18-6-5-6-13 0-18Z"/>',
  pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  phone:'<path d="m4 3 4 1 1 5-3 2a15 15 0 0 0 7 7l2-3 5 1 1 4c-1 3-6 2-10 0S3 12 3 7c0-2 0-3 1-4Z"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  calendar:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M8 3v4m8-4v4"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  box:'<path d="m12 3 9 5-9 5-9-5Zm-9 5v10l9 5 9-5V8M12 13v10M7 5.8l9 5"/>',
  link:'<path d="M9 15 15 9M8 16l-2 2a4 4 0 0 1-6-6l6-6a4 4 0 0 1 6 0m0 12a4 4 0 0 0 6 0l6-6a4 4 0 0 0-6-6l-2 2"/>',
  document:'<path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6"/>',
  whatsapp:'<path d="M21 11.5a9 9 0 0 1-13.4 7.8L3 21l1.7-4.6A9 9 0 1 1 21 11.5Z"/><path d="M8 7.5c0 4 3 7 7 8l1.5-2-3-1-1 1a7 7 0 0 1-2-2l1-1-1-3Z"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.arrow}</svg>`;
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function safeUrl(value) {
  try { const url = new URL(value); return ['https:','tel:','mailto:'].includes(url.protocol) ? escape(value) : '#/fastlinks'; }
  catch { return '#/fastlinks'; }
}
const external = (href,label,className='text-link') => `<a class="${className}" href="${safeUrl(href)}" target="_blank" rel="noopener noreferrer">${label} ${icon('arrow')}</a>`;
function image(url,alt,className='') {
  const cached = source?.pages.flatMap(item=>item.images).find(item=>item.url===url)?.local || url;
  return `<img src="${cached.startsWith('assets/') ? escape(cached) : safeUrl(cached)}" alt="${escape(alt)}" class="${className}" loading="lazy" decoding="async">`;
}
const link = (href,label,className='text-link') => `<a class="${className}" href="${escape(href)}">${label} ${icon('arrow')}</a>`;
let source;
const page = slug => source.pages.find(item => item.slug === slug);
const date = value => new Intl.DateTimeFormat('ar-SA',{day:'numeric',month:'long',year:'numeric',calendar:'gregory',timeZone:'Asia/Riyadh'}).format(new Date(value.slice(0,10)+'T12:00:00Z'));

const countries = [
  {name:'المملكة العربية السعودية',code:'SAUDI ARABIA',flag:'sa',role:'المقر الرئيسي والمركز الإداري',description:'المقر الرئيسي الذي يضم كافة الأنشطة التشغيلية، مع التركيز على دعم المنتجات المحلية وتلبية متطلبات السوق السعودي.'},
  {name:'جمهورية مصر العربية',code:'EGYPT',flag:'eg',role:'المعدات الثقيلة والتسويق',description:'مركز متخصص في المعدات الثقيلة، وخدمات التسويق والدعم الفني وخدمة العملاء للقطاعات الصناعية والزراعية.'},
  {name:'جمهورية الصين الشعبية',code:'CHINA',flag:'cn',role:'الاستيراد وفحص الجودة',description:'إدارة الاستيراد والتصدير، واختيار المصانع وفحص جودة المنتجات قبل الشحن، وخدمات التخليص الجمركي.'},
  {name:'الإمارات العربية المتحدة',code:'UAE',flag:'ae',role:'الشاحنات والرافعات وقطع الغيار',description:'مركز لبيع الشاحنات والرافعات وقطع الغيار الأصلية، يخدم المقاولين والمشاريع وأسواق منطقة الخليج.'}
];
const branches = [
  {name:'المركز الرئيسي',city:'الطائف',address:'الطائف، السيل الصغير، محطة الخالدية سابقاً',phone:'0555392582',wa:'966555392582',map:'https://goo.gl/maps/suvewGvZ92G7DDVc9'},
  {name:'فرع إيسوزو — السيل الصغير',city:'الطائف',address:'صناعية بن سعد بالقرب من قاعة البشائر',phone:'0507701827',wa:'966507701827',map:'https://goo.gl/maps/Ck7hc3wnyNHCnrzm6'},
  {name:'فرع الدمام',city:'الدمام',address:'صناعية دلة، طريق عمر الخطاب، قبل مركز برجستون',phone:'0555074596',wa:'966555074596',map:'https://goo.gl/maps/Nmmy7AkSMdT9ePKBA'},
  {name:'فرع الخرمة',city:'الخرمة',address:'الدغيمة، طريق رنية',phone:'0507630975',wa:'966507630975',map:'https://goo.gl/maps/a2t7zjymXE6JcwCj7'},
  {name:'فرع رنية',city:'رنية',address:'طريق الملك عبدالله، مقابل محطة المنصور',phone:'0591265111',wa:'966591265111'},
  {name:'مركز الساير لإصلاح طرمبات الديزل',city:'الطائف',address:'قبل محطة الجزيرة سابقاً، بجانب فرع السيل الصغير',phone:'0509304858',wa:'966509304858',map:'https://maps.app.goo.gl/22uFutxWi8xyCGox5?g_st=iw'}
];
// shortcut: public branch labels and map destinations conflict; verify with the owner before production.
const services = [
  {id:'parts',icon:'parts',title:'قطع غيار الشاحنات',description:'قطع غيار أصلية وتجارية للشاحنات والمحركات، وفلاتر وزيوت ومنتجات تشغيلية تدعم استمرار أعمالك.',tags:['مرسيدس','فولفو','مان','إيسوزو']},
  {id:'equipment',icon:'truck',title:'المعدات الثقيلة والرافعات',description:'حلول للمعدات والشاحنات والرافعات وقطع غيارها، تلبي احتياجات المقاولين والمشاريع والقطاع الصناعي.',tags:['شاحنات','رافعات','معدات ثقيلة']},
  {id:'import',icon:'globe',title:'الاستيراد وحلول التوريد',description:'من اختيار الموردين وفحص الجودة في الصين، إلى الشحن والتخليص الجمركي والتوصيل إلى وجهتك.',tags:['فحص جودة','شحن','تخليص جمركي']}
];

function servicesGrid() {
  return `<div class="services-grid">${services.map((service,index)=>`<article class="service-card"><div class="service-top"><span class="icon-block">${icon(service.icon)}</span><span class="service-number">0${index+1}</span></div><h3>${service.title}</h3><p>${service.description}</p><div class="service-tags">${service.tags.map(tag=>`<span>${tag}</span>`).join('')}</div>${link(`#/contact?service=${service.id}`,'اطلب عرض سعر')}</article>`).join('')}</div>`;
}
function countryGrid() {
  return `<div class="global-grid">${countries.map(country=>`<article class="country-card"><div class="country-top"><span class="country-role">${country.role}</span><span class="country-code" dir="ltr">${country.code}</span></div>${image(`assets/flag-${country.flag}.png`,country.name)}<h3>${country.name}</h3><p>${country.description}</p>${link('#/activities','اكتشف أنشطتنا')}</article>`).join('')}</div>`;
}
function newsCard(post) {
  const url = post.thumbnail || post.images[0]?.url;
  const excerpt = post.lines.find(line=>line.length>90) || '';
  return `<article class="news-card">${url ? `<a href="#/news/${post.id}" tabindex="-1" aria-hidden="true">${image(url,'','news-card-img')}</a>` : ''}<div class="news-card-body"><div class="news-meta">${icon('calendar')}<time datetime="${escape(post.date.slice(0,10))}">${date(post.date)}</time><span>· أخبار الفارع</span></div><h3><a href="#/news/${post.id}">${escape(post.title)}</a></h3><p>${escape(excerpt.slice(0,115))}${excerpt.length>115?'…':''}</p>${link(`#/news/${post.id}`,'اقرأ الخبر')}</div></article>`;
}
function cta() {
  return `<section class="cta-section"><div class="container"><div class="cta-box"><div><span class="eyebrow">لنبدأ العمل معاً</span><h2>احتياجك اليوم، هو أولويتنا.</h2><p>أخبرنا بما تحتاجه، ودع فريق الفارع يساعدك في الخطوة القادمة.</p></div>${link('#/contact','اطلب عرض سعر','button button-white')}</div></div></section>`;
}
function pageHero(title,description='',heading='h1') {
  return `<section class="page-hero"><div class="container"><nav class="breadcrumb" aria-label="مسار الصفحة"><a href="#/">الرئيسية</a><span aria-hidden="true">/</span><span aria-current="page">${escape(title)}</span></nav><${heading} class="page-title">${escape(title)}</${heading}>${description?`<p>${escape(description)}</p>`:''}</div></section>`;
}
function brandsStrip() {
  return `<section class="brands-strip" aria-label="العلامات التجارية"><div class="container brands-inner"><p class="brands-label">علامات رائدة،<br>وحلول تثق بها.</p><div class="brand-logos">${(source.brands || []).slice(0,6).map(url=>image(url,'')).join('')}</div></div></section>`;
}

function home() {
  return `<section class="hero reference-hero"><div class="hero-art" aria-hidden="true"></div><div class="container"><div class="hero-content"><div class="eyebrow">خبرة سعودية · آفاق عالمية</div><h1>شركة الفارع الدولية التجارية</h1><p class="hero-english" dir="ltr">AL FARAA COMMERCIAL</p><p class="hero-copy">قطع غيار الشاحنات والمعدات الثقيلة، وحلول توريد تصل بك إلى العالم.</p></div><div class="hero-product"><span class="eyebrow">كل ما تحتاجه، في مكان واحد</span><h2>منتجات تشغيلية متنوعة</h2><p>قطع غيار الشاحنات والمعدات الثقيلة، فلاتر، مسامير، ولوازم ضرورية لمحركات الشاحنات والآلات بأنواعها.</p><div class="hero-actions">${external(PROFILE,'الملف التعريفي للفارع','button button-primary')}${external('https://wa.me/966596945222',`${image('assets/flag-cn.png','')}<span>استورد من الصين<small>توريد وتخليص مباشر</small></span>`,'button button-import')}</div></div><a class="hero-bottom" href="#services"><span class="line"></span><span>اكتشف عالم الفارع</span><span aria-hidden="true">↓</span></a></div></section>
  <nav class="service-ribbon" aria-label="خدمات الفارع"><div class="container">${[['parts','توفير قطع غيار'],['truck','شبكة لوجستية متكاملة'],['globe','حلول استيراد وتصدير'],['box','الكتالوج الإلكتروني'],['pin','فروعنا داخل المملكة']].map(([name,label],index)=>link(['#/contact?service=parts','#/activities','#/contact?service=import','https://catalog.alfaraaonline.com.sa/','#/branches'][index],`${icon(name)}${label}`)).join('')}</div></nav>
  <section class="trust-row" aria-label="خبرتنا وانتشارنا"><div class="container trust-inner"><div class="trust-intro">ثقة تُبنى على الخبرة.<small>شراكة تدعم استمرارية أعمالك.</small></div><div class="trust-item"><strong dir="ltr">2000</strong><span><b>بداية مسيرتنا</b>خبرة تنمو معك</span></div><div class="trust-item"><strong>6</strong><span><b>مواقع داخل المملكة</b>أقرب إلى احتياجك</span></div><div class="trust-item"><strong>4</strong><span><b>دول نتواجد فيها</b>شبكة توريد دولية</span></div></div></section>
  <section class="section" id="services"><div class="container"><div class="section-heading"><div><span class="eyebrow">حلولنا وخدماتنا</span><h2>نحرّك أعمالك.<br>ونوسّع إمكانياتك.</h2><p>من القطعة التي تحتاجها، إلى حل التوريد المتكامل. نحن معك.</p></div>${link('#/activities','جميع الأنشطة')}</div>${servicesGrid()}<div class="catalog-strip"><span>${icon('box')} تبحث عن قطعة محددة؟ اكتشف منتجاتنا وعلاماتنا التجارية.</span>${external('https://catalog.alfaraaonline.com.sa/','تصفح الكتالوج الإلكتروني')}</div></div></section>
  <section class="section section-wash"><div class="container about-grid"><div class="about-copy"><span class="eyebrow">تعرّف على الفارع</span><h2>بدأنا من المملكة.<br>ونواصل الرحلة معك.</h2><p>منذ انطلاقتنا عام 2000، نعمل على توفير قطع غيار الشاحنات والمعدات الثقيلة بالجملة والتجزئة. واليوم، نجمع خبرتنا المحلية بشبكة تجارية تمتد إلى السعودية والإمارات ومصر والصين.</p><div class="check-list">${['قطع أصلية وتجارية','دعم فني وخدمات صيانة','شحن وتخليص جمركي','فحص الموردين والجودة'].map(value=>`<span>${icon('check')}${value}</span>`).join('')}</div>${link('#/about','اكتشف قصتنا','button button-primary')}</div><div class="about-image">${image('assets/equipment.jpeg','شاحنة ضمن المعدات المعروضة في موقع الفارع')}<div class="about-badge"><strong dir="ltr">2000</strong><span>من هنا بدأت الرحلة<br>ولا تزال الثقة تجمعنا</span></div></div></div></section>
  <section class="section global-section reference-global"><div class="container"><div class="section-heading"><div><span class="eyebrow">شبكة الأعمال والتواجد الدولي</span><h2>نشاطنا حول العالم</h2><p>شبكة متكاملة تصل احتياجاتك بمراكز التجارة والتوريد العالمية.</p></div>${link('#/branches','فروعنا في المملكة')}</div>${countryGrid()}</div></section>${brandsStrip()}
  <section class="section"><div class="container"><div class="section-heading"><div><span class="eyebrow">من داخل الفارع</span><h2>أخبارنا، ومحطات رحلتنا.</h2></div>${link('#/news','جميع الأخبار')}</div><div class="news-grid">${source.posts.slice(0,3).map(newsCard).join('')}</div></div></section>${cta()}`;
}
function about() {
  const aboutPage = page('about');
  const index = aboutPage.lines.indexOf('رؤيتنا');
  const intro = aboutPage.lines.slice(2,index).join(' ');
  const headings = ['رؤيتنا','رسالتنا','القيم'];
  return `${pageHero('من نحن','خبرة بدأت من المملكة، وشراكة تنمو مع كل خطوة.')}<section class="section"><div class="container"><div class="prose"><span class="eyebrow">قصتنا</span><h2 style="margin-top:0">شركة الفارع الدولية التجارية</h2><p>${escape(intro)}</p><div class="timeline"><div><strong>2000</strong><p>بداية المسيرة باسم «محل بن فارع».</p></div><div><strong>2018</strong><p>التوسع تحت اسم مؤسسة الفارع الدولية.</p></div><div><strong>2019</strong><p>تأسيس شركة الفارع الدولية.</p></div><div><strong>2020</strong><p>افتتاح فرع الشركة في الدمام.</p></div></div><div class="value-grid">${headings.map((heading,i)=>{const start=aboutPage.lines.indexOf(heading);const end=i<2?aboutPage.lines.indexOf(headings[i+1]):aboutPage.lines.length;return `<article class="value-card"><h3>${heading}</h3><p>${escape(aboutPage.lines.slice(start+1,end).join(' '))}</p></article>`}).join('')}</div><div style="margin-top:30px">${external(PROFILE,'تحميل بروفايل الشركة','button button-primary')}${link('#/organizational-chart','الهيكل التنظيمي')}</div></div></div></section>${cta()}`;
}
function activities() {
  const activity = page('نشاطاتنا');
  return `${pageHero('أنشطتنا وحلولنا','قطع غيار، معدات، وتوريد. منظومة خدمات تجمع الخبرة المحلية بالتواجد الدولي.')}<section class="section"><div class="container"><div class="section-heading"><div><span class="eyebrow">كيف نخدمك</span><h2>لكل احتياج، حل مناسب.</h2></div></div>${servicesGrid()}<div class="catalog-strip"><span>${icon('parts')} تحتاج إلى صيانة محركات أو إصلاح طرمبات الديزل؟</span>${link('#/contact?service=maintenance','تحدث مع فريقنا')}</div></div></section><section class="section section-wash"><div class="container"><div class="section-heading"><div><span class="eyebrow">شبكتنا الدولية</span><h2>خبرات تتكامل عبر الحدود.</h2></div></div><div class="activities-countries">${countries.map(country=>{const occurrences=activity.lines.reduce((found,line,index)=>line===country.name?[...found,index]:found,[]);const start=occurrences.at(-1);const description=activity.lines[start+2] || country.description;const details=activity.lines.slice(start+3,start+7).filter(line=>line.length>20);return `<article class="activity-row"><div class="activity-label">${image(`https://flagcdn.com/w80/${country.flag}.png`,country.name)}<span>${country.code}</span></div><div><div class="eyebrow">${country.role}</div><h2>${country.name}</h2><p>${escape(description)}</p><ul>${details.map(line=>`<li>${escape(line)}</li>`).join('')}</ul>${link(country.flag==='cn'?'#/contact?service=import':'#/contact','استفسر عن هذه الخدمة')}</div></article>`}).join('')}</div></div></section>${brandsStrip()}<div style="height:60px"></div>${cta()}`;
}
function branchCard(branch) {
  return `<article class="branch-card" data-city="${escape(branch.city)}" data-search="${escape(branch.name+' '+branch.address+' '+branch.city)}"><div class="icon-block">${icon('pin')}</div><span class="branch-city">${branch.city}</span><h2>${branch.name}</h2><p>${branch.address}</p><a class="branch-contact" href="tel:${branch.phone}">${icon('phone')}<span dir="ltr">${branch.phone}</span></a><div class="branch-actions">${external('https://wa.me/'+branch.wa,`${icon('whatsapp')} واتساب`,'')}${branch.map?external(branch.map,`${icon('pin')} الاتجاهات`,''):link('#/contact','تواصل معنا','')}</div></article>`;
}
function branchesPage() {
  return `${pageHero('فروعنا','ستة مواقع داخل المملكة، وفريق مستعد لمساعدتك في أقرب فرع.')}<section class="section"><div class="container"><div class="toolbar"><label class="search-box">${icon('search')}<input id="branch-search" type="search" aria-label="ابحث عن فرع أو مدينة" placeholder="ابحث عن فرع أو مدينة…" aria-controls="branches-grid"></label><div class="filter-group" role="group" aria-label="تصفية الفروع حسب المدينة">${['الكل','الطائف','الدمام','الخرمة','رنية'].map((city,i)=>`<button class="filter-button branch-filter" data-city="${city}" aria-pressed="${i===0}" aria-controls="branches-grid">${city}</button>`).join('')}</div></div><p id="branch-count" class="results-count" role="status" aria-live="polite">${branches.length} مواقع لخدمتك</p><div id="branches-grid" class="branches-grid">${branches.map(branchCard).join('')}</div><p class="source-note">تحتاج إلى مساعدة في اختيار الفرع المناسب؟ ${link('#/contact','تواصل مع فريقنا')}</p></div></section>${cta()}`;
}
function news() {
  return `${pageHero('أخبار الفارع','أحداثنا، إنجازاتنا، ومحطات نجاح تجمع فريق الفارع وشركاءه.')}<section class="section"><div class="container"><div class="toolbar news-toolbar"><label class="search-box">${icon('search')}<input id="news-search" type="search" aria-label="البحث في الأخبار" placeholder="ابحث في أخبار الفارع…" aria-controls="news-grid"></label><span id="news-count" class="news-count" role="status" aria-live="polite">${source.posts.length} خبراً</span></div><div id="news-grid" class="news-grid">${source.posts.map(newsCard).join('')}</div></div></section>${cta()}`;
}
function article(post) {
  return `${pageHero('أخبار الفارع','','p')}<section class="section"><div class="container article-layout"><article class="article-copy"><div class="news-meta">${icon('calendar')}<time datetime="${escape(post.date.slice(0,10))}">${date(post.date)}</time></div><h1>${escape(post.title)}</h1>${post.images[0]?image(post.thumbnail || post.images[0].url,post.title,'prose-image'):''}${post.lines.filter(line=>line!==post.title).map(line=>`<p>${escape(line)}</p>`).join('')}${post.images.length>1?`<div class="article-gallery">${post.images.slice(1).map((item,index)=>external(item.url,image(item.url,item.alt || `صورة ${index+2} من الخبر`),'')).join('')}</div>`:''}<div style="margin-top:30px">${link('#/news','العودة إلى جميع الأخبار')}</div></article><aside class="article-aside"><h2>أخبار أخرى</h2>${source.posts.filter(item=>item.id!==post.id).slice(0,4).map(item=>link(`#/news/${item.id}`,escape(item.title))).join('')}</aside></div></section>${cta()}`;
}
function contact(service) {
  return `${pageHero('خلّنا نبدأ باحتياجك','قطعة غيار، معدة، أو طلب توريد. أخبرنا بالتفاصيل وسنساعدك في الخطوة القادمة.')}<section class="section"><div class="container contact-layout"><form class="quote-form" id="quote-form" novalidate><h2>اطلب عرض سعر</h2><p class="form-intro">خطوة بسيطة، وتواصل مباشر مع فريق الفارع.</p><div class="field"><label for="name">الاسم أو اسم المنشأة <span>اختياري</span></label><input id="name" name="name" maxlength="80" autocomplete="name" placeholder="كيف تحب أن نناديك؟"></div><div class="field"><label for="service">نوع الطلب</label><select id="service" name="service" required>${Object.entries(SERVICES).map(([value,label])=>`<option value="${value}" ${value===service?'selected':''}>${label}</option>`).join('')}</select></div><div class="field"><label for="details">تفاصيل احتياجك</label><textarea id="details" name="details" required maxlength="1500" aria-describedby="details-help details-error" placeholder="مثلاً: رقم القطعة، نوع الشاحنة أو المعدة، الكمية، ومدينة التوصيل…"></textarea><p id="details-help" class="form-note">كلما وضحت التفاصيل، كان من الأسهل مساعدتك.</p><p id="details-error" class="field-error" hidden></p></div><button class="button button-primary" type="submit">جهّز طلبي على واتساب ${icon('whatsapp')}</button><p class="form-note">سنجهّز رسالة بطلبك. أنت من يرسلها عبر واتساب؛ لا يُرسل الطلب تلقائياً ولا تُحفظ البيانات في هذا الموقع.</p><div id="quote-draft" class="quote-draft" hidden></div></form><div class="contact-aside"><span class="eyebrow">نحن هنا لمساعدتك</span><h2>تواصل بسيط.<br>وشريك يفهم أعمالك.</h2><p>سواء كنت تدير أسطولاً، أو تعمل على مشروع جديد، أو تبحث عن قطعة محددة، يمكنك التواصل معنا مباشرة.</p><div class="contact-options"><div class="contact-option"><span class="icon-block">${icon('phone')}</span><div><h3>فريق المبيعات</h3><a href="tel:+966594344888" dir="ltr">+966 59 434 4888</a></div></div><div class="contact-option"><span class="icon-block">${icon('mail')}</span><div><h3>البريد الإلكتروني</h3><a href="mailto:info@alfaraaonline.com.sa">info@alfaraaonline.com.sa</a></div></div><div class="contact-option"><span class="icon-block">${icon('globe')}</span><div><h3>الاستيراد من الصين</h3><a href="https://wa.me/966596945222" target="_blank" rel="noopener noreferrer" dir="ltr">+966 59 694 5222</a></div></div><div class="contact-option"><span class="icon-block">${icon('pin')}</span><div><h3>أقرب فرع لك</h3><a href="#/branches">استكشف فروعنا في المملكة</a></div></div></div><div class="small-panel"><h3>تفضّل التواصل بالطريقة المعتادة؟</h3><p>يمكنك أيضاً استخدام نموذج التواصل الحالي لدى الشركة.</p>${external('https://www.alfaraaonline.mg-so.com/forms/?p=3','نموذج التواصل')}</div></div></div></section><section class="section section-wash"><div class="container faq"><span class="eyebrow">قبل أن تتواصل</span><h2>معلومات تساعدك في طلبك.</h2><details><summary>ما التفاصيل المناسبة لطلب قطع الغيار؟</summary><p>اذكر رقم القطعة إن توفر، ونوع الشاحنة أو المعدة وموديلها، والكمية المطلوبة ومدينة التوصيل. يمكن لفريق المبيعات مساعدتك عند عدم توفر رقم القطعة.</p></details><details><summary>كيف أطلب توريداً من الصين؟</summary><p>اختر «الاستيراد والتوريد من الصين» في نموذج الطلب، وأضف وصف المنتج والمواصفات والكمية. تُجهّز الرسالة للتواصل مع رقم الاستيراد المنشور لدى الشركة.</p></details><details><summary>هل يمكنني التواصل مع فرع محدد؟</summary><p>نعم، تحتوي صفحة الفروع على أرقام التواصل وروابط واتساب والاتجاهات المتاحة لكل فرع.</p></details></div></section>`;
}
function banksPage() {
  const bank = page('banks');
  const numbers = bank.lines.filter(line=>/^(SA\d+|\d{10,})$/.test(line));
  return `${pageHero('الحسابات البنكية','بيانات الحسابات المنشورة لدى شركة الفارع الدولية التجارية.')}<section class="section"><div class="container"><div class="bank-grid">${[0,2].map((start,index)=>`<article class="bank-card"><span class="eyebrow">بيانات التحويل</span><h2>الحساب البنكي 0${index+1}</h2><label>رقم الآيبان</label><div class="copy-field" dir="ltr"><code>${escape(numbers[start])}</code><button class="copy-button" data-copy="${escape(numbers[start])}" aria-label="نسخ الآيبان للحساب ${index+1}">نسخ</button></div><label>رقم الحساب</label><div class="copy-field" dir="ltr"><code>${escape(numbers[start+1])}</code><button class="copy-button" data-copy="${escape(numbers[start+1])}" aria-label="نسخ رقم الحساب ${index+1}">نسخ</button></div></article>`).join('')}</div><p class="source-note">البيانات من صفحة الشركة الرسمية. ${external(bank.url,'عرض المصدر الأصلي')}</p><div class="article-gallery">${bank.images.map((item,index)=>external(item.url,image(item.url,`مستند الحساب البنكي ${index+1}`),'')).join('')}</div></div></section>${cta()}`;
}
function documents(slug,title,description) {
  const document = page(slug);
  return `${pageHero(title,description)}<section class="section"><div class="container"><div class="document-grid">${slug==='organizational-chart'?`<p class="callout">${escape(document.lines[1])}</p>`:''}${document.images.map((item,index)=>`<article class="document-card ${slug==='refund_returns'?'policy-image':''}"><div><h2>${slug==='refund_returns'?'السياسة المنشورة لدى الشركة':index===0?'الهيكل التنظيمي — النسخة العربية':'الهيكل التنظيمي — النسخة الإنجليزية'}</h2>${external(item.url,'عرض بحجم كامل')}</div>${image(item.url,slug==='refund_returns'?'وثيقة سياسة الاستبدال والاسترجاع المنشورة لدى الفارع':index===0?'الهيكل التنظيمي باللغة العربية':'الهيكل التنظيمي باللغة الإنجليزية')}</article>`).join('')}<p class="source-note">${external(document.url,'زيارة الصفحة الأصلية')}</p></div></div></section>${cta()}`;
}
function careers() {
  return `${pageHero('انضم إلى فريق الفارع','نواصل النمو مع فريقنا. تعرّف على فرص الانضمام إلى الشركة.')}<section class="section"><div class="container"><div class="careers-box"><div><span class="eyebrow">رحلتك المهنية</span><h2>لنكتب الفصل<br>القادم معاً.</h2><p>تواصل مع الشركة بشأن فرص الانضمام إلى فريقها من خلال نموذج التوظيف الرسمي. يستمر تقديم الطلب عبر نظام الشركة الحالي.</p>${external('https://www.alfaraaonline.mg-so.com/forms/?p=17','انتقل إلى نموذج التوظيف','button button-primary')}</div>${image('assets/equipment.jpeg','شاحنة من المعدات المعروضة في موقع الشركة')}</div></div></section>${cta()}`;
}
function fastlinks() {
  const links = [['المتجر الإلكتروني','منتجات وقطع غيار','box','https://store.alfaraaonline.com.sa/ar'],['الكتالوج الإلكتروني','تعرّف على المنتجات','document','https://catalog.alfaraaonline.com.sa/'],['واتساب المبيعات','تواصل مع فريقنا','whatsapp',SALES],['الاستيراد من الصين','توريد وتخليص مباشر','globe','https://wa.me/966596945222'],['بروفايل الشركة','الملف التعريفي للفارع','document',PROFILE],['بوابة الموظفين','نظام الشركة الداخلي','link','https://www.alfaraaonline.mg-so.com/'],['منصة إكس','تابع أخبار الفارع','link','https://x.com/alfaraacompany'],['إنستغرام','من داخل الفارع','link','https://www.instagram.com/alfaraacompany/'],['تيك توك','تعرّف على نشاطنا','link','https://www.tiktok.com/@alfaraacompany']];
  links.push(['الموقع الحالي','موقع الشركة الرسمي','globe','https://alfaraaonline.com.sa/'],['فيسبوك','قناة الفارع الرسمية','link','https://www.facebook.com/share/12DAe4kZmub/?mibextid=wwXIfr'],['سناب شات','تابع جديد الشركة','link','https://snapchat.com/t/KLmoM3Kn']);
  return `${pageHero('روابطنا الرسمية','كل ما تحتاجه للوصول إلى قنوات الفارع وخدماتها.')}<section class="section"><div class="container"><div class="links-grid">${links.map(([title,subtitle,symbol,url])=>`<a class="quick-link" href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer"><span class="icon-block">${icon(symbol)}</span><span><h2>${title}</h2><small>${subtitle}</small></span><span aria-hidden="true">↗</span></a>`).join('')}</div></div></section>${cta()}`;
}

function closeMenu() {const restoreFocus=nav.classList.contains('open')&&nav.contains(document.activeElement);nav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','فتح القائمة');if(restoreFocus)menuToggle.focus({preventScroll:true});}
menuToggle.addEventListener('click',()=>{if(nav.classList.contains('open')){closeMenu();return;}nav.classList.add('open');menuToggle.setAttribute('aria-expanded','true');menuToggle.setAttribute('aria-label','إغلاق القائمة');nav.querySelector('a').focus({preventScroll:true});});
document.addEventListener('keydown',event=>{if(event.key==='Escape' && nav.classList.contains('open')){closeMenu();menuToggle.focus();}});
nav.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('click',event=>{if(!event.target.closest('.site-header') && nav.classList.contains('open'))closeMenu();});
window.matchMedia('(max-width: 960px)').addEventListener('change',closeMenu);
let toastTimer;
function toast(message) {const target=document.querySelector('#toast');target.textContent=message;target.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>target.classList.remove('visible'),3000);}
let entranceObserver;
function wireMotion() {
  entranceObserver?.disconnect();
  if(reducedMotion.matches || !('IntersectionObserver' in window))return;
  entranceObserver=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('motion-enter');entranceObserver.unobserve(entry.target);}
  },{rootMargin:'0px 0px -24px 0px'});
  main.querySelectorAll('.section > .container, .trust-inner, .brands-inner, .cta-box').forEach(element=>entranceObserver.observe(element));
}
reducedMotion.addEventListener('change',()=>{
  if(reducedMotion.matches)main.getAnimations({subtree:true}).forEach(animation=>animation.cancel());
  wireMotion();
});
function animateResults(grid) {
  grid.getAnimations().forEach(animation=>animation.cancel());
  if(!reducedMotion.matches)grid.animate([{opacity:.5,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:220,easing:'ease-out'});
}
function emptyState(title,description) {
  return `<div class="empty-state"><span class="state-icon">${icon('search')}</span><h2>${title}</h2><p>${description}</p><button class="button button-light" type="button" data-reset-search>مسح البحث والفلاتر ${icon('arrow')}</button></div>`;
}
function wireInteractions() {
  const branchSearch=document.querySelector('#branch-search');
  if(branchSearch){
    let city='الكل';
    const grid=document.querySelector('#branches-grid');
    const filters=[...document.querySelectorAll('.branch-filter')];
    function filter(){
      const search=branchSearch.value.trim();
      const matches=branches.filter(branch=>(city==='الكل'||branch.city===city)&&(branch.name+' '+branch.address+' '+branch.city).includes(search));
      grid.innerHTML=matches.length?matches.map(branchCard).join(''):emptyState('لم نجد فرعاً بهذه البيانات.','جرّب اسم مدينة أو فرع آخر، أو اعرض جميع الفروع.');
      document.querySelector('#branch-count').textContent=matches.length?`الفروع المتاحة: ${matches.length}`:'لا توجد فروع مطابقة للبحث.';
      filters.forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.city===city)));
      animateResults(grid);
    }
    branchSearch.addEventListener('input',filter);
    filters.forEach(button=>button.addEventListener('click',()=>{city=button.dataset.city;filter();}));
    grid.addEventListener('click',event=>{if(event.target.closest('[data-reset-search]')){city='الكل';branchSearch.value='';filter();branchSearch.focus();}});
  }
  const newsSearch=document.querySelector('#news-search');
  if(newsSearch){
    const grid=document.querySelector('#news-grid');
    function filter(){const value=newsSearch.value.trim();const matches=source.posts.filter(post=>post.title.includes(value)||post.lines.join(' ').includes(value));grid.innerHTML=matches.length?matches.map(newsCard).join(''):emptyState('لا توجد أخبار مطابقة.','جرّب كلمة أخرى، أو عد إلى جميع أخبار الفارع.');document.querySelector('#news-count').textContent=`${matches.length} خبراً`;animateResults(grid);}
    newsSearch.addEventListener('input',filter);
    grid.addEventListener('click',event=>{if(event.target.closest('[data-reset-search]')){newsSearch.value='';filter();newsSearch.focus();}});
  }
  const form=document.querySelector('#quote-form');
  if(form){form.addEventListener('submit',event=>{event.preventDefault();const field=form.elements.details;const error=document.querySelector('#details-error');const draft=document.querySelector('#quote-draft');try{const url=makeWhatsAppUrl({name:form.elements.name.value,service:form.elements.service.value,details:field.value});field.removeAttribute('aria-invalid');error.hidden=true;draft.hidden=false;draft.innerHTML=`<span class="success-icon">${icon('check')}</span><h3 tabindex="-1" id="draft-title">طلبك جاهز للمتابعة.</h3><p>افتح واتساب لمراجعة الرسالة وإرسالها إلى فريق ${form.elements.service.value==='import'?'الاستيراد':'المبيعات'}.</p>${external(url,'فتح واتساب وإكمال الطلب','button button-primary')}`;document.querySelector('#draft-title').focus({preventScroll:true});draft.scrollIntoView({block:'nearest',behavior:reducedMotion.matches?'instant':'smooth'});}catch(problem){draft.hidden=true;field.setAttribute('aria-invalid','true');error.textContent=problem.message;error.hidden=false;field.focus();}});form.addEventListener('input',event=>{document.querySelector('#quote-draft').hidden=true;if(event.target===form.elements.details){event.target.removeAttribute('aria-invalid');document.querySelector('#details-error').hidden=true;}});}
  document.querySelectorAll('.copy-button').forEach(button=>button.addEventListener('click',async()=>{button.disabled=true;try{await navigator.clipboard.writeText(button.dataset.copy);button.textContent='تم النسخ';button.classList.add('copied');toast('تم نسخ البيانات.');setTimeout(()=>{button.textContent='نسخ';button.classList.remove('copied');},2400);}catch{toast('تعذر النسخ التلقائي. يمكنك تحديد الرقم ونسخه يدوياً.');}finally{button.disabled=false;}}));
}

const titles={home:'الرئيسية',about:'من نحن',activities:'أنشطتنا',branches:'فروعنا',news:'أخبار الفارع',contact:'تواصل معنا',banks:'الحسابات البنكية',careers:'التوظيف',fastlinks:'روابطنا الرسمية','organizational-chart':'الهيكل التنظيمي',refund_returns:'الاستبدال والاسترجاع'};
function render(focus=true) {
  if(location.hash==='#main'&&!main.querySelector('.initial-loading')){main.focus();return;}
  if(location.hash==='#services'&&document.querySelector('#services')){document.querySelector('#services').scrollIntoView();return;}
  const [path,query='']=(['#main','#services'].includes(location.hash)?'/':location.hash.slice(1)||'/').split('?');
  const route=path.replace(/^\//,'').replace(/\/$/,'')||'home';
  document.body.dataset.page=route.split('/')[0];
  let html;
  if(route==='home')html=home();else if(route==='about')html=about();else if(route==='activities')html=activities();else if(route==='branches')html=branchesPage();else if(route==='news')html=news();else if(route.startsWith('news/')){const post=source.posts.find(item=>String(item.id)===route.split('/')[1]);if(post)html=article(post);}else if(route==='contact')html=contact(new URLSearchParams(query).get('service')||'parts');else if(route==='banks')html=banksPage();else if(route==='organizational-chart')html=documents(route,'الهيكل التنظيمي','أدوار متكاملة تدعم كفاءة العمليات وتطور الشركة.');else if(route==='refund_returns')html=documents(route,'سياسة الاستبدال والاسترجاع','اطّلع على السياسة الرسمية كما نشرَتها الشركة.');else if(route==='careers')html=careers();else if(route==='fastlinks')html=fastlinks();
  main.innerHTML=html||`${pageHero('الصفحة غير موجودة')}<section class="section"><div class="container state-section"><span class="state-icon">${icon('document')}</span><p>قد يكون الرابط تغيّر. يمكنك العودة إلى الرئيسية للوصول إلى خدماتنا.</p>${link('#/','العودة إلى الرئيسية','button button-primary')}</div></section>`;
  document.title=`${titles[route]||(route.startsWith('news/')?'أخبار الفارع':'الصفحة غير موجودة')} | الفارع الدولية`;
  nav.querySelectorAll('[data-nav]').forEach(item=>{if(item.dataset.nav===route.split('/')[0])item.setAttribute('aria-current','page');else item.removeAttribute('aria-current');});
  closeMenu();wireInteractions();window.scrollTo({top:0,behavior:'instant'});wireMotion();if(focus)main.focus({preventScroll:true});if(location.hash==='#services')document.querySelector('#services').scrollIntoView({behavior:'instant'});
}
window.addEventListener('hashchange',()=>{if(source)render();});
document.querySelector('#year').textContent=new Date().getFullYear();
async function loadContent(focus=false){
  main.setAttribute('aria-busy','true');main.innerHTML=loadingMarkup;
  try{const response=await fetch('source.json');if(!response.ok)throw new Error('Content unavailable');source=await response.json();if(!Array.isArray(source.pages)||!Array.isArray(source.posts))throw new Error('Invalid content');render(focus);}
  catch{source=null;main.innerHTML=`<div class="container state-section"><span class="state-icon">${icon('globe')}</span><h1>تعذّر تحميل المحتوى.</h1><p>حدثت مشكلة أثناء التحميل. جرّب مرة أخرى أو تواصل معنا مباشرة.</p><div class="state-actions"><button class="button button-primary" data-retry>إعادة المحاولة ${icon('arrow')}</button>${external(SALES,'تواصل عبر واتساب','button button-light')}</div></div>`;main.querySelector('[data-retry]').addEventListener('click',()=>loadContent(true));if(focus)main.focus();}
  finally{main.setAttribute('aria-busy','false');}
}
await loadContent();
