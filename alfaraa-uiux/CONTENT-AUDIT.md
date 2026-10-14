# Public company content audit — 14 October 2026

Compared the live WordPress pages/posts API, homepage navigation, and page/post/header sitemaps at https://alfaraaonline.com.sa/ with this project. The snapshot is recorded in `dist/source.json` with its capture time, original URLs, text, image references, linked destinations, map/form embeds, and published counters.

The source contains ten populated corporate pages and fifteen news articles. The empty `test` page and WordPress header/footer template URLs have no independent editorial content; their navigation and channel destinations are retained in the site's header, footer, and official-links page. Category and author archive listings repeat the fifteen articles.

| Content | Result |
| --- | --- |
| Homepage | Original company overview, four values/principles cards, seven service highlights, logistics description and two 100% metrics, four international country descriptions, six equipment photos, four distinct customer testimonials, all eight brand logos, and published company counters are displayed. Repeated marquee/carousel copies are shown once. |
| About | Complete company history, vision, mission, values and six principles, five goals, activities description, and original company image are displayed with separate headings. |
| Activities | Seven service highlights and all four countries' original roles, descriptions, and four detailed service points per country are displayed. |
| Branches | All six listed locations, addresses, phone/WhatsApp targets, email links, original image, all six embedded maps, and Ranyah directions are available. |
| News | All fifteen articles, complete paragraphs, all gallery images, and original attachment links are displayed. Every article image is locally cached. |
| Banks | Published payment description, both IBAN/account pairs, and all five original account images are retained. Account numbers are checked verbatim. |
| Returns policy | Original document image and its accompanying text are displayed. |
| Organization | Original introduction and both Arabic/English chart documents are displayed. |
| Careers/contact | Original hosted forms are available in expandable embeds with independent links. The existing WhatsApp enquiry remains available. |
| Official links | Store, catalogue, profile PDFs, social channels (including LinkedIn and additional source-listed accounts), sales/import contacts, and employee portal remain reachable. |

All 248 distinct source image download destinations (including four existing small flag assets) are cached locally. Decorative source background artwork is retained in the snapshot; the existing truck hero and corporate styling are preserved.

The online store, catalogue, employee portal, and hosted forms run on separate services. This project links to those systems and embeds the public forms; it does not copy their application databases or private content.

## Source inconsistencies preserved

- The homepage counter publishes **7** local branches and **24+** years of experience, while the branch page lists **6** locations. The published counters and listed locations are both preserved; no seventh branch is invented.
- The Isuzu card's displayed number is **0552141467**, while its telephone and WhatsApp links target **0507701827**. Both source numbers remain reachable with the displayed number labeled separately.
- Ranyah's old homepage destination is malformed. Directions use the location query from its original embedded map.

## Verification

`npm test` validates enquiry behavior, page/article inventory, all cached media, branch-map count, brand count, and published counters. `npm run check:browser` checks every source paragraph of at least 60 characters on the homepage, about, activities, banks, and all fifteen articles; all article-image counts; the added content sections and original forms/maps/channels; navigation and enquiry behavior; and overflow across 320, 375, 768, 1024, 1280, 1366, 1440, and 1920px. Laptop checks use 1366×768 and 1440×900 at device scale factor 1.
