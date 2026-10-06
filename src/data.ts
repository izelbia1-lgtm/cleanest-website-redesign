export const business = { phone: '083 440 2603', tel: '+27834402603', whatsapp: 'https://wa.me/27834402603', emails: ['simone@cleanest.co.za', 'jason@cleanest.co.za'], facebook: 'https://www.facebook.com/cleanestsa' };
export const services = [
  { id: 'carpets', name: 'Carpet & upholstery cleaning', image: 'newcarpet1.webp', alt: 'Carpet extraction cleaning, pictured on Cleanest’s existing website', description: 'Freshen up the spaces you live and work in, with deep cleaning for carpets, sofas, chairs and mattresses.', details: ['Deep carpet cleaning', 'Stain & odour treatment', 'Sofas, chairs & mattresses'] },
  { id: 'windows', name: 'Window cleaning', image: 'winc1.webp', alt: 'Squeegee cleaning a window, from Cleanest’s existing service gallery', description: 'Let the light back in. Interior and exterior cleaning for accessible windows up to the second floor.', details: ['Interior & exterior glass', 'Frames, sills & tracks', 'Glass doors & mirrors'] },
  { id: 'gardens', name: 'Garden services', image: 'newgarden1.webp', alt: 'Garden maintenance team on a coastal lawn, pictured on Cleanest’s existing website', description: 'Year-round care for residential gardens, complexes, estates and corporate grounds.', details: ['Mowing, edging & pruning', 'Tree felling & site clearing', 'Irrigation installations'] },
];
export const areas = [
  { name: 'Johannesburg', label: 'CITY & SURROUNDS', description: 'Cleaning and garden care for homes, offices, complexes and estates across greater Johannesburg.', suburbs: 'Sandton · Randburg · Roodepoort · Midrand · Fourways · Bryanston · Rosebank · Bedfordview · Edenvale' },
  { name: 'Plettenberg Bay', label: 'COAST & GARDEN ROUTE', description: 'Care for coastal homes, holiday properties and guest houses in Plett and the Garden Route.', suburbs: 'Plettenberg Bay Central · Keurboomstrand · Knysna · Nature’s Valley · Brackenridge Estate · Whale Rock' },
];
export const reviews = [
  { quote: 'Incredible service! Our carpets in our Sandton office have never looked better. Highly recommend the team from Cleanest.', name: 'Sarah L.', area: 'Sandton, Johannesburg', source: 'https://www.cleanest.co.za/johannesburgcleanest.html' },
  { quote: 'The Cleanest team is essential for managing our holiday rental in Plett. They are trustworthy, and our guests always comment on the cleanliness.', name: 'David F.', area: 'Keurboomstrand, Plettenberg Bay', source: 'https://www.cleanest.co.za/plettenbergbaycleanest.html' },
];
// Prepared for the official launch. Deliberately not injected as active business
// JSON-LD on this independent, noindex demo. Confirm details before activation.
export const preparedLocalBusiness = { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'Cleanest', url: 'https://www.cleanest.co.za/', telephone: business.tel, email: business.emails[0], areaServed: areas.map(area => ({ '@type': 'City', name: area.name })), sameAs: [business.facebook] };
