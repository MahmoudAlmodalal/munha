import assert from 'node:assert/strict';
import {test} from 'node:test';
import {makeWhatsAppUrl} from '../dist/quote.js';
import {readFileSync,existsSync} from 'node:fs';

test('Arabic enquiry survives encoding and goes to the published sales destination',()=>{
  const details='فلتر & قطعة #123 / فولفو\nالكمية: 2';
  const url=new URL(makeWhatsAppUrl({name:'محمود',service:'parts',details}));
  assert.equal(url.origin,'https://wa.me');
  assert.equal(url.pathname,'/966594344888');
  assert.ok(url.searchParams.get('text').includes(details));
  assert.ok(url.searchParams.get('text').includes('محمود'));
  assert.equal([...url.searchParams].length,1);
});
test('Import enquiries use the published China-import contact',()=>{
  assert.equal(new URL(makeWhatsAppUrl({service:'import',details:'طلب توريد معدات'})).pathname,'/966596945222');
});
test('Empty, invalid and oversized enquiries are rejected',()=>{
  for(const input of [{service:'parts',details:'   '},{service:'unpublished',details:'قطعة'},{service:'parts',details:null},{service:'parts',details:'x'.repeat(1501)},{service:'parts',name:'x'.repeat(81),details:'قطعة'}]) assert.throws(()=>makeWhatsAppUrl(input));
});
test('All public corporate pages, news posts and cached images are present',()=>{
  const source=JSON.parse(readFileSync(new URL('../dist/source.json',import.meta.url)));
  assert.equal(source.pages.length,10);
  assert.equal(source.posts.length,15);
  assert.ok(!source.pages.some(page=>page.slug==='test'));
  const expected=['about','branches','careers','news','banks','fastlinks','organizational-chart','refund_returns','نشاطاتنا','الرئيسيه'];
  for(const slug of expected)assert.ok(source.pages.some(page=>page.slug===slug),slug);
  for(const image of [...source.brands,...source.posts.map(post=>post.thumbnail).filter(Boolean)]) assert.ok(existsSync(new URL('../dist/'+image,import.meta.url)),image);
});
