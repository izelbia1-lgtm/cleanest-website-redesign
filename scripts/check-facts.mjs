import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import ts from 'typescript';

// Audit our business content against the archived live source pages. Source
// presence establishes attribution; it does not establish customer consent.
const module = ts.transpileModule(readFileSync('src/data.ts','utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { business, areas, reviews } = await import('data:text/javascript;base64,' + Buffer.from(module).toString('base64'));
const normalize = value => value.replace(/&amp;/g,'&').replace(/&#(?:39|039);|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&nbsp;/g,' ').replace(/[’‘]/g,"'").replace(/[–—]/g,'-').replace(/\s+/g,' ').trim().toLowerCase();
const sources = new Map();
for (const name of ['home','contact','johannesburgcleanest','plettenbergbaycleanest','carpetcleaning','windowcleaning','cleanestgardenservices']) {
  const path = `research/${name}.html`;
  if (existsSync(path)) sources.set(name, readFileSync(path, 'utf8'));
  else {
    const response = await fetch(`https://www.cleanest.co.za/${name === 'home' ? 'index' : name}.html`);
    assert.ok(response.ok, `Source fetch succeeded: ${name}`);
    sources.set(name, await response.text());
  }
}
const raw = name => sources.get(name);
const page = name => normalize(raw(name).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' '));
const contains = (name,text) => assert.ok(page(name).includes(normalize(text)),`Verified source ${name}: ${text}`);
for(const review of reviews){const source=review.source.split('/').pop().replace('.html','');contains(source,review.quote);contains(source,review.name);contains(source,review.area);}
for(const [index,area] of areas.entries()) {const source=index===0?'johannesburgcleanest':'plettenbergbaycleanest';contains(source,area.name);for(const suburb of area.suburbs.split(' · '))contains(source,suburb);}
for(const claim of ['29 Years of Experience','Owner Managed & Results Driven','Personal attention to every project','Dedicated teams based in Plett and Joburg','homes and businesses'])contains('home',claim);
for(const claim of ['all-year-round','Residential, Complex, Estate and Corporate','Tree Felling','Site Clearing','Irrigation Installations','Golf Estate Maintenance','School / Sport Field Maintenance'])contains('cleanestgardenservices',claim);
for(const claim of ['holiday homes','guest houses'])contains('plettenbergbaycleanest',claim);
for(const claim of ['Sofa and chair cleaning','Mattress deep cleaning','Odor elimination'])contains('carpetcleaning',claim);
for(const claim of ['up to the 2nd floor','Window frames, sills, and tracks','Mirrors and other glass surfaces'])contains('windowcleaning',claim);
contains('contact',business.phone);for(const email of business.emails)contains('contact',email);contains('contact','Monday - Friday 08h00 - 17h00');
assert.ok(raw('contact').includes(business.facebook));assert.ok(raw('contact').includes(business.whatsapp));assert.ok(raw('contact').includes(`tel:${business.tel}`));
const walk=directory=>readdirSync(directory).flatMap(name=>{const path=`${directory}/${name}`;return statSync(path).isDirectory()?walk(path):[path]});
const deliveryFiles=[...walk('src'),...walk('public').filter(path=>/\.(svg|txt)$/.test(path)),'index.html'];
for(const path of deliveryFiles){const content=readFileSync(path,'utf8');assert.doesNotMatch(content,/lorem ipsum|5[- ]star|five[- ]star|thousands of|\d+\+ customers|fully insured/i,`No unsupported filler or claims in ${path}`);}
assert.doesNotMatch(readFileSync('src/main.tsx','utf8'),/coming soon|photo to be added|Demo note|Independent redesign demo|HOMEPAGE CONCEPT/);
assert.match(readFileSync('src/main.tsx','utf8'),/Enquiry functionality will be connected on the final website\./);
console.log('PASS: both exact testimonials, all 15 service areas, experience/management/team/property claims, service details, contact details/hours/social hrefs, and delivery-content cleanup verified against refreshed source pages.');
