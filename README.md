# Cleanest website redesign

A homepage redesign concept for Cleanest, a South African cleaning and garden services business. This is a separate client presentation demo, **not the current official website**. The official website is [cleanest.co.za](https://www.cleanest.co.za/).

## Stack and setup

React, TypeScript, Vite, Tailwind CSS and Lucide icons. Requires Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

Open the address printed by Vite. Development uses port 5182.

```sh
npm run build
npm run preview
```

The build checks TypeScript before generating `dist`. Preview uses port 4182. Dependencies and generated output are excluded from Git.

## Editing

- `src/data.ts`: verified contacts, services, areas and testimonials.
- `src/main.tsx`: homepage components and local enquiry review.
- `src/styles.css`: approved responsive styling and Tailwind theme.
- `public/images`: original logo and service imagery from Cleanest's website.
- `research/FINAL-FACTUAL-AUDIT.md`: source evidence and client questions.

Before-and-after panels are labelled photo placeholders and do not represent completed projects. The form validates inputs and shows an enquiry review; **nothing is sent or stored**. Selected photos remain on the visitor's device. No backend or upload storage is connected. Phone, email, WhatsApp and Facebook links open the verified real business channels.

## Verification

Run `npm run build` for TypeScript and production-build checks. For browser checks, start a server, set `SITE_URL` to its address and run `npm run test:ui`. Tests use installed Edge by default; `UI_BROWSER_CHANNEL` can choose another installed Playwright browser channel. Screenshots go to ignored `.qa`.

Run `node scripts/check-facts.mjs` to verify content against Cleanest's source pages. It uses local archived HTML when available, otherwise fetches the public pages. Raw local research captures are excluded from Git. Source presence establishes attribution; confirm accuracy and publication permission with Simone before an official launch.

## Vercel preparation

No Vercel deployment has been made. When authorised, import this repository with Vite framework, repository root, build command `npm run build` and output directory `dist`.

Keep search-index protections enabled:

- HTML robots metadata: `noindex, nofollow, noarchive`
- `vercel.json`: `X-Robots-Tag: noindex, nofollow, noarchive` on every path
- `public/robots.txt`: disallows crawling

Noindex does not restrict access. Configure hosting access protection if the preview must be private. Do not modify the client's hosting, DNS or official domain. The social preview is SVG; provide an approved PNG and absolute preview URL for platforms requiring raster images once deployment is authorised.

## Before an official launch

Confirm experience wording, branch services/coverage, contacts/hours, testimonial authenticity and permission, photography rights and high-resolution branding. Obtain matched before-and-after images and captions. Decide enquiry recipients, secure uploads, privacy wording and retention. Prepared LocalBusiness data is inactive and requires launch validation.

Business imagery and testimonials remain attributable to Cleanest; this public repository does not grant permission to reuse them elsewhere.
