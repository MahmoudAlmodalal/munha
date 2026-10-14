# Al Faraa UI/UX prototype

Arabic, responsive corporate-site redesign. Colours follow the current company profile: navy `#253a7d`, cyan, blue, and white. The existing logo and company imagery are retained. Static HTML, CSS, and JavaScript; quote requests prepare a WhatsApp draft for the visitor to send.

Run `npm run dev` from this directory for a local preview at http://localhost:4173. No package installation or build step is required. Public company material is captured in `dist/source.json`; refresh it with `python3 scripts/capture-source.py` followed by `python3 scripts/cache-assets.py`.

The prototype includes all 10 corporate pages, a dedicated enquiry page, and all 15 published news articles. Navigation uses hash routes, so the static preview supports direct links and browser history. The unused WordPress test page is excluded.

Check the enquiry builder and content with `npm test`. With the preview server running, `npm run check:browser` checks routes, mobile navigation, responsive overflow, branch search, exact bank account values, and WhatsApp drafts; screenshots are saved to ignored `artifacts/`.

The interface uses the existing Cairo font, company photography, and navy/cyan palette with larger text, consistent cards and fields, clearer focus states, and layouts from 320px upwards. The mobile header keeps the enquiry action visible above 360px; the enquiry form appears before secondary contact information and hides the duplicate floating WhatsApp action.

Motion is dependency-free: CSS entrances and small hover/press transitions, one IntersectionObserver for section reveals, and short Web Animations for filtered results. Navigation, FAQ expansion, copying, loading, and enquiry success provide visual feedback. Reduced-motion preferences disable decorative animation and smooth scrolling, including when changed during use. Content remains visible if IntersectionObserver is unavailable.

Search empty states include a reset action and announce result counts. Content-loading errors offer a retry, validation focuses the details field, and editing a prepared enquiry hides its old draft. Browser checks also cover these recovery paths, clipboard success/failure, reduced motion, direct section links, and all screens at narrow mobile, tablet, and desktop widths. Review captures include `artifacts/home-full-desktop.png`, `home-mobile.png`, `branches-desktop.png`, and `contact-desktop.png`.

The online store, product catalogue, careers application, and employee portal retain their existing destinations. The general sales number is taken from the company's quick links; China import requests use the number linked on its homepage. The Isuzu branch displays a different phone number from its telephone and WhatsApp links; both published numbers are retained. Ranyah directions use the location from its original embedded map, avoiding the malformed homepage link. The homepage publishes seven local branches while the branch page lists six; both source values are retained in their respective contexts.

This is a private review prototype. It does not replace WordPress, save enquiry data, or send a WhatsApp message automatically. Production SEO, analytics, and CMS integration are outside this prototype.

The organizational chart and return policy remain image documents; accessible text equivalents need an owner-approved transcription. External store, catalogue, careers, and employee-portal screens belong to their existing systems and are not restyled here. Physical-device and screen-reader checks remain before production.


The public-content comparison is documented in [CONTENT-AUDIT.md](CONTENT-AUDIT.md). All original company sections, eight brand logos, fifteen complete news galleries, six branch maps, published account documents, hosted form embeds, and source-listed social/profile destinations are retained. Every page/article image is cached locally. Run `python3 scripts/capture-source.py` then `python3 scripts/cache-assets.py` to refresh the public snapshot; review new pages and source discrepancies described in the audit before publishing.
