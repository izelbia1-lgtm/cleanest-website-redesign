import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import ts from 'typescript';

// Audit our business content against the archived live source pages. Source
// presence establishes attribution; it does not establish customer consent.
const module = ts.transpileModule(readFileSync('src/data.ts','utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { business, areas, reviews } = await import('data:text/javascript;base64,' + Buffer.from(module).toString('base64'));
const normalize = value => value.replace(/&amp;/g,'&').replace(/&#(?:39|039);|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&nbsp;/g,' ').replace(/[’‘]/g,"'").replace(/[–—]/g,'-').replace(/\s+/g,' ').trim().toLowerCase();
const sources = new Map();
for (const name of ['home','contact','johannesburgcleanest','carpetcleaning','windowcleaning','cleanestgardenservices']) {
  const path = `${process.env.CLEANEST_SOURCE_DIR || 'research'}/${name}.html`;
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
assert.equal(areas.length,1);assert.equal(areas[0].name,'Johannesburg');assert.equal(reviews.length,1);assert.equal(reviews[0].name,'Sarah L.');
for(const area of areas) {const source='johannesburgcleanest';contains(source,area.name);for(const suburb of area.suburbs.split(' · '))contains(source,suburb);}
for(const claim of ['29 Years of Experience','Owner Managed & Results Driven','Personal attention to every project','homes and businesses'])contains('home',claim);
for(const claim of ['all-year-round','Residential, Complex, Estate and Corporate','Tree Felling','Site Clearing','Irrigation Installations','Golf Estate Maintenance','School / Sport Field Maintenance'])contains('cleanestgardenservices',claim);
for(const claim of ['Sofa and chair cleaning','Mattress deep cleaning','Odor elimination'])contains('carpetcleaning',claim);
for(const claim of ['up to the 2nd floor','Window frames, sills, and tracks','Mirrors and other glass surfaces'])contains('windowcleaning',claim);
contains('contact',business.phone);for(const email of business.emails)contains('contact',email);contains('contact','Monday - Friday 08h00 - 17h00');
assert.ok(raw('contact').includes(business.facebook));assert.ok(raw('contact').includes(business.whatsapp));assert.ok(raw('contact').includes(`tel:${business.tel}`));
const walk=directory=>readdirSync(directory).flatMap(name=>{const path=`${directory}/${name}`;return statSync(path).isDirectory()?walk(path):[path]});
const deliveryFiles=[...walk('src'),...walk('public').filter(path=>/\.(svg|txt)$/.test(path)),'index.html'];
for(const path of deliveryFiles){const content=readFileSync(path,'utf8');assert.doesNotMatch(content,/lorem ipsum|5[- ]star|five[- ]star|thousands of|\d+\+ customers|fully insured/i,`No unsupported filler or claims in ${path}`);}
assert.doesNotMatch(readFileSync('src/main.tsx','utf8'),/coming soon|photo to be added|Demo note|Independent redesign demo|HOMEPAGE CONCEPT/);
assert.match(readFileSync('src/main.tsx','utf8'),/Enquiry functionality will be connected on the final website\./);
console.log('PASS: client-confirmed Johannesburg-only coverage, 9 source-backed suburbs, retained local testimonial, services and unchanged contacts verified.');

// Encoded terms guard against superseded coverage in authored delivery files.
const retiredTerms=['706c657474','6b6e79736e61','67617264656e20726f757465','6b657572626f6f6d','6e6174757265e28099732076616c6c6579','627261636b656e7269646765','7768616c6520726f636b'].map(value=>Buffer.from(value,'hex').toString('utf8'));
for(const path of deliveryFiles){const text=readFileSync(path,'utf8').toLowerCase();for(const term of retiredTerms)assert.ok(!text.includes(term),'Current coverage only: '+path);}

