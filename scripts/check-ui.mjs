import './check-approved-imagery.mjs';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { chromium, expect } from '@playwright/test';
const browser = await chromium.launch({ headless: true, channel: process.env.UI_BROWSER_CHANNEL || 'msedge' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if(message.type() === 'error') errors.push(message.text()); });
await mkdir('.qa', { recursive: true });
try {
  const base=process.env.SITE_URL;
  assert.ok(base, 'Set SITE_URL to the running preview URL before browser testing.');
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('img').evaluateAll(images => images.forEach(image => image.loading='eager'));
  await page.waitForFunction(() => [...document.images].every(image => image.complete));
  assert.ok(await page.locator('img').evaluateAll(images => images.every(image => image.naturalWidth>0)));
  assert.equal(await page.locator('h1').count(), 1);
  assert.match(await page.locator('meta[name=robots]').getAttribute('content'), /noindex/);
  assert.match(readFileSync('vercel.json','utf8'), /X-Robots-Tag/);
  assert.match(readFileSync('vercel.json','utf8'), /noindex/);
  assert.match(readFileSync('public/robots.txt','utf8'), /Disallow: \//);
  assert.doesNotMatch(await page.locator('body').innerText(), /HOMEPAGE CONCEPT|Independent redesign|DEMO PREVIEW|Demo note|GALLERY CONCEPT|Preview quote enquiry|Let’s chat/);
  assert.deepEqual(await page.locator('a[href^="#"]').evaluateAll(links => links.map(link=>link.getAttribute('href')).filter(href=>!document.querySelector(href))), []);
  for (const name of ['Home','Services','About','Our Work','Areas We Serve','Contact']) {
    await page.getByRole('navigation').getByRole('link', {name,exact:true}).click();
    assert.equal(new URL(page.url()).hash, {Home:'#home',Services:'#services',About:'#about','Our Work':'#work','Areas We Serve':'#areas',Contact:'#contact'}[name]);
  }
  await page.locator('.hero .button').click();
  assert.equal(new URL(page.url()).hash,'#contact');
  for (let i=0;i<3;i++) { await page.locator('.service-card .text-link').nth(i).click(); await expect(page.getByLabel('Service required')).toHaveValue(['Carpet & upholstery cleaning','Window cleaning','Garden services'][i]); }
  for (const name of ['Carpet & upholstery cleaning','Window cleaning','Garden services']) {
    await page.getByRole('group',{name:'Choose a before and after category'}).getByRole('button',{name,exact:true}).click();
    await expect(page.locator('.gallery-project-caption h3')).toHaveText(name);
    assert.equal(await page.locator('.gallery-filters button[aria-pressed=true]').count(),1);
  }
  const internalLinks=await page.locator('a[href^="#"]:not(.skip-link):visible').evaluateAll(links=>links.map(link=>({href:link.getAttribute('href'),text:link.textContent})));
  for (const [index, link] of internalLinks.entries()) {
    await page.locator('a[href^="#"]:not(.skip-link):visible').nth(index).click();
    assert.equal(new URL(page.url()).hash,link.href,`Working internal link: ${link.text}`);
  }
  await page.locator('.service-card .text-link').last().click();
await page.getByRole('link', { name: 'Request a quote in Johannesburg' }).click();
  await expect(page.getByLabel('Location', {exact:true})).toHaveValue('Johannesburg');
  await page.getByRole('button', {name:'Request a quote',exact:true}).click();
  assert.equal(await page.locator('dialog[open]').count(),0);

  await page.getByLabel('Phone number',{exact:true}).fill('         ');assert.equal(await page.getByLabel('Phone number',{exact:true}).evaluate(input=>input.checkValidity()),false,'Whitespace cannot stand in for a phone number');
  await page.getByLabel('Name', {exact:true}).fill('Demo Visitor');
  await page.getByLabel('Phone number', {exact:true}).fill('bad-number');
  assert.equal(await page.getByLabel('Phone number').evaluate(input=>input.checkValidity()),false);
  await page.getByLabel('Phone number').fill('082 123 4567');
  await page.getByLabel('Email', {exact:true}).fill('demo@example.com');
  await page.getByLabel('Tell us about the work').fill('A demonstration enquiry only.');
  await page.locator('input[type=file]').setInputFiles('public/images/cleanest-logo.png');
  assert.ok(await page.getByRole('status').innerText());
  let requests=0;
  page.on('request',request=>{if(request.method()==='POST')requests++;});
  await page.getByRole('button', {name:'Request a quote',exact:true}).click();
  await page.getByRole('dialog').waitFor();
  for(const value of ['Demo Visitor','082 123 4567','demo@example.com','Johannesburg','Garden services','Photos selected: 1']) assert.ok((await page.locator('dialog pre').innerText()).includes(value));
  assert.equal(requests,0);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog[open]').count(),0);
  await page.getByRole('button',{name:'Remove photos'}).click();
  assert.equal(await page.locator('input[type=file]').evaluate(input=>input.files.length),0);
  assert.ok(await page.locator('a[href="https://wa.me/27834402603"]').count()>=2);
  assert.ok(await page.locator('a[href="tel:+27834402603"]').count()>=2);
  for(const email of ['simone@cleanest.co.za','jason@cleanest.co.za'])assert.equal(await page.locator(`a[href="mailto:${email}"]`).count(),2);
  assert.equal(await page.locator('a[href="https://www.facebook.com/cleanestsa"]').count(),1);
  await expect(page.locator('.floating-contact')).toHaveText('WhatsApp us');
  for(const width of [320,375,430,768,1366,1920]) {
    await page.setViewportSize({width,height:1000});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No horizontal overflow at ${width}`);
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:`.qa/layout-${width}.png`,fullPage:true});
    await page.evaluate(()=>document.activeElement?.blur());
    for(const selector of ['.hero','.service-grid','.gallery-project','.about-grid','.areas-section .container','.contact-grid','.footer-grid']) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(80);
      await page.locator(selector).screenshot({path:`.qa/section-${selector.replace(/[^a-z]/g,'')}-${width}.png`,style:'header, .skip-link, .floating-contact { visibility: hidden !important; }'});
      const overflow=await page.locator(selector).evaluate(element=>[...element.querySelectorAll('h1,h2,h3,p,input,select,textarea,.button,img')].filter(item=>{const rect=item.getBoundingClientRect();return rect.width && (rect.left < -1 || rect.right > innerWidth+1)}).map(item=>item.tagName));
      assert.deepEqual(overflow,[],`Section stays inside viewport: ${selector} at ${width}`);
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Open navigation'}).click();
  assert.equal(await page.getByRole('button',{name:'Close navigation'}).getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('button',{name:'Open navigation'}).getAttribute('aria-expanded'),'false');
  await page.getByRole('button',{name:'Open navigation'}).click();
  await page.getByRole('navigation').getByRole('link',{name:'Services',exact:true}).click();
  assert.equal(new URL(page.url()).hash,'#services');
  assert.equal(await page.getByRole('button',{name:'Open navigation'}).getAttribute('aria-expanded'),'false');
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:'.qa/mobile-hero.png'});
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(base);
  await page.screenshot({path:'.qa/desktop-hero.png'});

  const currentOptions=await page.getByLabel('Location',{exact:true}).locator('option').allTextContents();assert.deepEqual(currentOptions.slice(1),['Johannesburg']);
  const retired=Buffer.from('706c657474','hex').toString('utf8');assert.ok(!(await page.locator('body').innerText()).toLowerCase().includes(retired));
  assert.deepEqual(errors,[]);
  console.log('PASS: all internal links/CTAs, 6 responsive widths and section bounds, gallery categories, area/service selections, images, noindex protections, no developer labels, form validation, photo selection/removal, no-send preview, mobile menu, verified contact hrefs and zero browser errors.');
} finally { await browser.close(); }
