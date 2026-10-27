/*
  one9studio page generator.
  Run:  node scripts/build-pages.js
  Writes index.html and the 7 service pages into the project root.
  Edit the text and images in the SITE / SERVICES data below, then run again.
  NOTE: names, numbers, clients and case studies here are DEMO content — replace with real ones.
*/
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const img = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SITE = {
  name: 'one9studio',
  domain: 'https://www.one9studio.in',
  tagline: 'Influence has value and we are turning it into the commercial opportunity',
  email: 'hello@one9studio.in',
  phone: '+91 83558 74139',
  // WhatsApp number: country code + number, digits only (no +, spaces or dashes)
  whatsapp: '918355874139',
  city: 'Mumbai, India',
};

// WhatsApp chat link with a ready-made first message.
// data-wa keeps the message so the site can switch numbers if the dashboard changes it.
const waMsg = service => service ? `Hi one9studio, I'm interested in ${service}. Can we talk?` : "Hi one9studio, I'd like to discuss a project.";
const wa = service => `href="https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(waMsg(service))}" data-wa="${esc(waMsg(service))}" target="_blank" rel="noopener"`;
const WA_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2s.2-1.1.1-1.2-.2-.1-.4-.2z"/></svg>';
const serviceOf = slug => SERVICES.find(x => x.slug === slug)?.title;

const ICONS = {
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6"/><path d="M16 4a4 4 0 010 8M22 21c0-3-2-5-4-6"/>',
  star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  handshake: '<path d="M2 12l5-5 4 2 4-2 7 5"/><path d="M7 7l-3 9 4 3 4-3 4 3 4-3-2-6"/>',
  megaphone: '<path d="M3 11v2a1 1 0 001 1h3l8 5V5L7 10H4a1 1 0 00-1 1z"/><path d="M19 9a4 4 0 010 6"/>',
  camera: '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M8 7l2-3h4l2 3"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  ticket: '<path d="M3 8a2 2 0 002-2h14a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H5a2 2 0 00-2-2v-2a2 2 0 000-4z"/><path d="M13 6v12"/>',
  pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/>',
  pin: '<path d="M12 21s-7-6-7-12a7 7 0 0114 0c0 6-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  money: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 10v4M18 10v4"/>',
};
const icon = n => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

const SERVICES = [
  {
    slug: 'brand-management', title: 'Brand Management', icon: 'target',
    short: 'Positioning, identity and reputation built to grow commercial value.',
    lead: 'We shape how your brand looks, sounds and behaves — then protect and grow that value across every channel, partnership and audience.',
    hero: '1557804506-669a67965ba0',
    caps: [
      ['target', 'Brand strategy & positioning', 'Clear market position, audience definition and a value proposition your team can act on.'],
      ['pen', 'Identity & guidelines', 'Visual identity, tone of voice and brand books that keep every touchpoint consistent.'],
      ['shield', 'Reputation management', 'Monitoring, response playbooks and crisis support to protect hard-earned trust.'],
      ['megaphone', 'Launch & campaign planning', 'Go-to-market plans for new products, rebrands and seasonal pushes.'],
      ['chart', 'Brand health tracking', 'Awareness, sentiment and share-of-voice reporting every month.'],
      ['handshake', 'Partnership strategy', 'Identifying the creators, artists and brands that lift your positioning.'],
    ],
    process: [['Audit', 'We review your market, competitors, audience and current brand assets.'], ['Define', 'Positioning, messaging pillars and identity direction, agreed with your team.'], ['Activate', 'Roll-out across digital, retail, PR and partnerships.'], ['Grow', 'Monthly brand-health reviews and continuous optimisation.']],
    split: ['A brand people choose — and pay more for.', 'Strong brands earn attention, loyalty and better margins. We connect strategy with the creators and audiences who make a brand matter.'],
    checks: ['Dedicated brand manager and monthly strategy review', 'Brand guidelines delivered as a living online toolkit', 'Reputation alerts within the hour on priority channels', 'Quarterly brand-health report with clear next steps'],
    case: ['Lifestyle · D2C', 'Repositioning a D2C home-décor label for premium buyers', 'A full refresh of positioning, packaging and creator partnerships ahead of the festive season.', '1483985988355-763728e1935b', [['3.1x', 'festive revenue'], ['+68%', 'branded search'], ['42', 'creator partners']]],
    faq: [['Do you work with early-stage brands?', 'Yes. We run a lighter foundation package for new brands and scale up as you grow.'], ['How long does a rebrand take?', 'Most brand strategy and identity projects take 6–10 weeks, depending on scope and approvals.'], ['Can you work with our in-house team?', 'Absolutely. We often act as the strategic lead while your team handles day-to-day execution.'], ['How do you measure brand growth?', 'We track awareness, sentiment, branded search, share of voice and sales indicators agreed at kickoff.']],
  },
  {
    slug: 'social-media-management', title: 'Social Media Management', icon: 'megaphone',
    short: 'Always-on content, community and paid social that turns followers into customers.',
    lead: 'Strategy, content production, community management and paid amplification — run by one team, measured against business results, not vanity metrics.',
    hero: '1609921212029-bb5a28e60960',
    caps: [
      ['layers', 'Content strategy & calendar', 'Platform-specific content pillars and a monthly calendar approved in advance.'],
      ['camera', 'Content production', 'Reels, shorts, carousels and stories shot and edited by our in-house team.'],
      ['users', 'Community management', 'Comments, DMs and reviews answered in your brand voice, seven days a week.'],
      ['money', 'Paid social', 'Meta, YouTube and LinkedIn campaigns optimised for leads and sales.'],
      ['chart', 'Analytics & reporting', 'Monthly dashboards covering reach, engagement, leads and revenue.'],
      ['spark', 'Trends & real-time', 'Fast-turnaround content that rides relevant trends safely.'],
    ],
    process: [['Discover', 'Account audit, competitor review and audience research.'], ['Plan', 'Content pillars, posting rhythm and monthly calendar.'], ['Create & publish', 'Production, approvals, scheduling and community care.'], ['Optimise', 'Weekly performance reviews and monthly strategy reports.']],
    split: ['Feeds that look good — and pay their way.', 'Every post has a job: build reach, earn trust or drive action. We plan content around the outcome you need and report on what it delivered.'],
    checks: ['Instagram, YouTube, LinkedIn, X and Facebook covered', 'Monthly shoot days with our production team', 'Same-day response on comments and DMs', 'Transparent reporting tied to leads and sales'],
    case: ['Food & Beverage', 'Growing a café chain from 8K to 140K followers', 'Short-form video, local creators and geo-targeted ads built footfall across 12 outlets.', '1460925895917-afdab827c52f', [['140K', 'followers'], ['+46%', 'weekday footfall'], ['5.8%', 'engagement rate']]],
    faq: [['Which platforms do you manage?', 'Instagram, YouTube, LinkedIn, X, Facebook and Snapchat. We recommend focusing on the two or three that matter most for your audience.'], ['Do we approve content before it goes live?', 'Yes. Every month’s calendar and every post is shared for approval before publishing.'], ['Is ad spend included?', 'Our fee covers management; media spend is billed separately and goes directly to the platforms.'], ['How quickly will we see results?', 'Engagement usually improves in the first month; meaningful follower and lead growth typically shows by month three.']],
  },
  {
    slug: 'influencer-management', title: 'Influencer Management', icon: 'users',
    short: 'Creator campaigns matched on audience data, managed end to end.',
    lead: 'We find the right creators for your audience, negotiate fair commercials, manage content and compliance, and report on real results.',
    hero: '1598550476439-6847785fcea6',
    caps: [
      ['target', 'Creator discovery', 'Audience-first matching across nano, micro, macro and celebrity creators.'],
      ['shield', 'Vetting & brand safety', 'Fake-follower checks, content history review and audience-quality scoring.'],
      ['money', 'Negotiation & contracts', 'Fair fees, clear deliverables, usage rights and exclusivity handled for you.'],
      ['pen', 'Briefing & content approval', 'Creative briefs, script reviews and approval workflows that protect your brand.'],
      ['chart', 'Tracking & ROI', 'Unique links, codes and dashboards to measure reach, clicks and sales.'],
      ['layers', 'Always-on ambassador programmes', 'Long-term creator relationships that build trust over time.'],
    ],
    process: [['Brief', 'Goals, audience, budget and KPIs agreed with your team.'], ['Match', 'Shortlist of vetted creators with audience data and costs.'], ['Manage', 'Contracts, briefs, content approvals and posting schedule.'], ['Report', 'Performance report with learnings for the next campaign.']],
    split: ['The right voices, not just the biggest ones.', 'Big follower counts don’t guarantee results. We match creators on audience fit, engagement quality and brand values — and hold every campaign to clear KPIs.'],
    checks: ['Network of 2,500+ vetted creators across India', 'ASCI-compliant disclosures on every post', 'Usage rights negotiated for ads and website', 'Campaign reports within 7 days of wrap'],
    case: ['Beauty · Launch', 'Launching a skincare range with 60 micro-creators', 'A two-week seeding and review programme with honest, tutorial-led content.', '1515886657613-9f3515b0c78f', [['18M', 'impressions'], ['9.2%', 'avg. engagement'], ['4.4x', 'return on spend']]],
    faq: [['What size creators do you work with?', 'All sizes — from nano creators with highly engaged niche audiences to celebrity talent. The mix depends on your goals and budget.'], ['How do you check a creator is genuine?', 'We review audience data, growth patterns, comment quality and past brand work before shortlisting anyone.'], ['Who owns the content?', 'Usage rights are agreed in each contract. We can negotiate paid-ad and website usage as part of the deal.'], ['What is the minimum budget?', 'Campaigns typically start from ₹2 lakh including creator fees, depending on scale and deliverables.']],
  },
  {
    slug: 'talent-management', title: 'Talent Management', icon: 'star',
    short: 'Career strategy, bookings and brand deals for creators, hosts and personalities.',
    lead: 'We manage the careers of digital creators, anchors, models and personalities — building long-term value through the right bookings, partnerships and positioning.',
    hero: '1524504388940-b1c1722653e1',
    caps: [
      ['target', 'Career strategy', 'A clear long-term plan for growth, positioning and revenue streams.'],
      ['handshake', 'Brand deals & endorsements', 'Pitching, negotiating and managing paid partnerships that fit.'],
      ['calendar', 'Bookings & scheduling', 'Shoots, appearances, hosting and events managed in one calendar.'],
      ['shield', 'Contracts & legal support', 'Contract review, payment follow-up and rights protection.'],
      ['camera', 'Portfolio & content support', 'Professional shoots, showreels and media kits that sell.'],
      ['megaphone', 'PR & visibility', 'Press, podcasts and platform features that grow your profile.'],
    ],
    process: [['Meet', 'We understand your goals, audience and the work you want to do.'], ['Plan', 'Positioning, rate card, media kit and target brands.'], ['Represent', 'Pitching, negotiating and managing every booking.'], ['Grow', 'Quarterly career reviews and new revenue opportunities.']],
    split: ['Your talent. Our deal-making.', 'You focus on creating and performing. We handle the business — pricing, pitching, contracts, scheduling and payments — so every opportunity adds to your long-term value.'],
    checks: ['Dedicated talent manager for each client', 'Transparent commission with monthly statements', 'Payment follow-up so you get paid on time', 'Access to 300+ brand partners'],
    case: ['Creator · Lifestyle', 'Turning a lifestyle creator into a year-round brand partner', 'From one-off posts to three annual ambassador contracts in 14 months.', '1542038784456-1ea8e935640e', [['3', 'annual contracts'], ['5x', 'earnings growth'], ['1.2M', 'followers']]],
    faq: [['Who do you represent?', 'Digital creators, anchors and hosts, models, actors and public personalities across lifestyle, fashion, food, tech and entertainment.'], ['How does commission work?', 'We work on a transparent commission on deals we bring or manage. Terms are agreed upfront in writing.'], ['Do I need a minimum following?', 'No fixed number. We look at engagement, content quality, consistency and growth potential.'], ['Is the agreement exclusive?', 'Most representation agreements are exclusive for brand deals, with clear terms and exit clauses.']],
  },
  {
    slug: 'artist-management', title: 'Artist Management', icon: 'mic',
    short: 'Representation, releases and live bookings for musicians and performers.',
    lead: 'We manage musicians, singers, DJs, comedians and performers — from release strategy and live bookings to brand partnerships and long-term career growth.',
    hero: '1493225457124-a3eb161ffa5f',
    caps: [
      ['mic', 'Artist development', 'Sound, image and story shaped into a clear artist identity.'],
      ['ticket', 'Live bookings & tours', 'Clubs, festivals, college fests, weddings and corporate shows.'],
      ['layers', 'Release planning', 'Release calendars, distribution, playlist pitching and launch campaigns.'],
      ['handshake', 'Brand partnerships', 'Sponsorships, collaborations and campaign work with the right brands.'],
      ['camera', 'Content & visuals', 'Music videos, live sessions and social content production.'],
      ['shield', 'Business management', 'Contracts, royalties, invoicing and rider management.'],
    ],
    process: [['Listen', 'We understand your music, audience and ambitions.'], ['Build', 'Identity, content plan and release roadmap.'], ['Book', 'Live shows, collaborations and brand work.'], ['Scale', 'Tours, bigger stages and new revenue streams.']],
    split: ['From the studio to the main stage.', 'Talent gets you noticed; management gets you booked. We build the team, plan and relationships that turn great music and performance into a sustainable career.'],
    checks: ['Booking network across 40+ Indian cities', 'Release and playlist strategy with every single', 'Technical rider and travel logistics handled', 'Clear revenue statements after every show'],
    case: ['Independent music', 'Breaking an independent singer-songwriter nationally', 'A three-single release plan, creator-led promotion and a 12-city college tour.', '1470229722913-7c0e2dbbafd3', [['24M', 'streams'], ['12', 'city tour'], ['2', 'brand anthems']]],
    faq: [['What kind of artists do you manage?', 'Singers, bands, DJs, producers, stand-up comedians and live performers.'], ['Can you book an artist for our event?', 'Yes. Share your date, city, budget and audience, and we’ll recommend available artists from our roster and network.'], ['Do you help with music releases?', 'Yes — release planning, distribution partners, playlist pitching, video production and launch campaigns.'], ['Do you work with new artists?', 'We take on a small number of emerging artists each year with strong material and commitment.']],
  },
  {
    slug: 'brand-collaborations', title: 'Brand Collaborations', icon: 'handshake',
    short: 'Partnerships between brands, creators and artists that both audiences love.',
    lead: 'We design and deliver collaborations — co-branded products, capsule collections, sponsorships and content series — that create new revenue and reach for everyone involved.',
    hero: '1600880292203-757bb62b4baf',
    caps: [
      ['spark', 'Collaboration concepts', 'Original ideas that fit both partners and excite their audiences.'],
      ['target', 'Partner matchmaking', 'Brand-to-brand, brand-to-creator and brand-to-artist matching.'],
      ['layers', 'Co-branded products', 'Capsule collections, limited editions and merchandise lines.'],
      ['money', 'Deal structuring', 'Revenue share, licensing, fees and rights agreed clearly.'],
      ['megaphone', 'Launch campaigns', 'Integrated launches across social, PR, retail and events.'],
      ['chart', 'Performance tracking', 'Sales, reach and audience-crossover reporting.'],
    ],
    process: [['Explore', 'Your goals, audience and partnership appetite.'], ['Match', 'Partner shortlist and collaboration concepts.'], ['Structure', 'Commercials, rights, timeline and approvals.'], ['Launch', 'Campaign roll-out and performance reporting.']],
    split: ['Two audiences. One moment. New revenue.', 'The best collaborations feel inevitable — two names that make sense together. We find those pairings and handle the commercial, creative and legal work to bring them to life.'],
    checks: ['Partner network across fashion, food, tech and lifestyle', 'Clear revenue-share and licensing agreements', 'Joint launch plans with shared KPIs', 'Post-launch sales and audience reports'],
    case: ['Fashion × Creator', 'A creator capsule collection that sold out in 72 hours', 'A streetwear label and a dance creator co-designed a six-piece limited drop.', '1441986300917-64674bd600d8', [['72 hrs', 'to sell out'], ['₹1.8Cr', 'revenue'], ['+31K', 'new customers']]],
    faq: [['What kinds of collaborations do you run?', 'Co-branded products, capsule collections, sponsorships, content series, licensing and event partnerships.'], ['How are collaborations paid for?', 'Depending on the deal: fixed fees, revenue share, licensing royalties or a combination.'], ['Can you find us a partner brand?', 'Yes. We shortlist and approach suitable partners on your behalf.'], ['How long does a collaboration take to launch?', 'Content collaborations can launch in 4–6 weeks; product collaborations usually take 3–6 months.']],
  },
  {
    slug: 'event-show-management', title: 'Event & Show Management', icon: 'calendar',
    short: 'Concerts, launches, meet-and-greets and brand experiences delivered end to end.',
    lead: 'From intimate brand launches to large-scale concerts, we plan, produce and run events — with talent, artists and creators that bring the crowd.',
    hero: '1540575467063-178a50c2df87',
    caps: [
      ['spark', 'Concept & creative', 'Event themes, show formats and audience experience design.'],
      ['mic', 'Artist & celebrity booking', 'Headliners, hosts, performers and creator appearances.'],
      ['layers', 'Production & staging', 'Venue, stage, sound, light, LED and technical production.'],
      ['ticket', 'Ticketing & guest management', 'Ticketing partners, RSVPs, guest lists and access control.'],
      ['megaphone', 'Promotion & creator buzz', 'Pre-event hype through creators, social and PR.'],
      ['shield', 'On-ground operations', 'Permissions, security, hospitality and show-calling on the day.'],
    ],
    process: [['Brief', 'Objectives, audience, budget, date and city.'], ['Design', 'Concept, run-of-show, talent and production plan.'], ['Produce', 'Vendors, bookings, rehearsals and promotion.'], ['Deliver', 'Flawless execution and a post-event report.']],
    split: ['Moments people talk about long after the lights go down.', 'We combine production expertise with our talent and creator network, so your event has the right faces on stage and the right buzz online.'],
    checks: ['Events from 100 to 20,000 guests', 'In-house talent and artist booking', 'Creator coverage built into every event', 'Single point of contact from brief to wrap'],
    case: ['Live · Brand launch', 'A smartphone launch concert for 8,000 fans', 'A headline artist, six creators and a live-streamed show built around the product reveal.', '1501281668745-f7f57925c3b4', [['8,000', 'attendees'], ['2.6M', 'live-stream views'], ['31M', 'social reach']]],
    faq: [['What types of events do you manage?', 'Concerts, brand launches, college fests, award shows, meet-and-greets, corporate events and private celebrations.'], ['Can you book a celebrity for our event?', 'Yes. Share your date, city, budget and event type, and we’ll suggest available artists and celebrities.'], ['How far in advance should we contact you?', 'Ideally 8–12 weeks for large events. We can also turn smaller events around in 2–3 weeks.'], ['Do you handle permissions and safety?', 'Yes. Licences, police permissions, security and crowd management are part of our operations scope.']],
  },
];

// Second image used in the "Why one9studio" section of each service page
const SIDE = { 'brand-management': '1542744173-8e7e53415bb0', 'social-media-management': '1551288049-bebda4e38f71', 'influencer-management': '1526170375885-4d8ecf77b99f', 'talent-management': '1438761681033-6461ffad8d80', 'artist-management': '1511671782779-c97d3d27a1d4', 'brand-collaborations': '1522202176988-66273c2fd55f', 'event-show-management': '1603190287605-e6ade32fa852' };

const nav = active => `
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap nav">
    <a class="brand" href="/" aria-label="one9studio home"><img src="/assets/one9/logo.svg" alt="" width="38" height="38"><span>one9<b>studio</b></span></a>
    <ul class="nav-links" id="nav-links">
      <li class="has-menu"><button type="button" aria-expanded="false" aria-controls="services-menu">Services ▾</button>
        <div class="menu" id="services-menu">
          ${SERVICES.map(s => `<a href="/${s.slug}"${active === s.slug ? ' aria-current="page"' : ''}><strong>${s.title}</strong><small>${esc(s.short)}</small></a>`).join('\n          ')}
        </div>
      </li>
      <li><a href="/#work">Work</a></li>
      <li><a href="/#roster">Roster</a></li>
      <li><a href="/#events">Events</a></li>
      <li><a href="/#about">About</a></li>
      <li><a href="#contact">Contact</a></li>
      <li class="mobile-cta"><a class="btn btn-wa" ${wa(serviceOf(active))}>${WA_ICON} Chat on WhatsApp</a></li>
    </ul>
    <div class="nav-cta">
      <a class="btn btn-wa" ${wa(serviceOf(active))}>${WA_ICON} Chat on WhatsApp</a>
      <button class="menu-toggle" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav-links"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>`;

const contact = (selected, heading = 'Let’s turn your influence into opportunity.') => `
<section class="section dark" id="contact">
  <div class="wrap contact-grid">
    <div class="rv">
      <span class="eyebrow">Contact</span>
      <h2>${heading}</h2>
      <p class="muted">Tell us about your brand, talent or event on WhatsApp — a member of our team will pick it up straight away.</p>
      <ul class="contact-list">
        <li><i>${icon('mail')}</i><div><small>Email</small><a href="mailto:${SITE.email}" data-content="email">${SITE.email}</a></div></li>
        <li><i>${icon('phone')}</i><div><small>Phone / WhatsApp</small><a href="tel:${SITE.phone.replace(/[^+0-9]/g, '')}" data-content="phone">${SITE.phone}</a></div></li>
        <li><i>${icon('pin')}</i><div><small>Studio</small>${SITE.city}</div></li>
      </ul>
    </div>
    <div class="wa-card rv">
      <div class="wa-head"><span class="wa-badge">${WA_ICON}</span><div><h3>Chat with us on WhatsApp</h3><p class="muted">Fastest way to reach the team — we usually reply within the hour during working hours.</p></div></div>
      <a class="btn btn-wa btn-lg" ${wa(selected)}>${WA_ICON} ${selected ? 'Ask about ' + selected : 'Start a WhatsApp chat'}</a>
      <p class="wa-label">Or pick a topic</p>
      <div class="wa-topics">${SERVICES.filter(x => x.title !== selected).map(x => `<a ${wa(x.title)}>${x.title}<span>→</span></a>`).join('')}</div>
    </div>
  </div>
</section>`;

const footer = () => `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="brand" href="/"><img src="/assets/one9/logo.svg" alt="" width="38" height="38"><span>one9<b>studio</b></span></a>
        <p class="footer-tag">${SITE.tagline}.</p>
        <div class="socials"><a href="#" aria-label="Instagram">IG</a><a href="#" aria-label="YouTube">YT</a><a href="#" aria-label="LinkedIn">in</a><a href="#" aria-label="X">X</a></div>
      </div>
      <div><h4>Services</h4><ul>${SERVICES.slice(0, 4).map(s => `<li><a href="/${s.slug}">${s.title}</a></li>`).join('')}</ul></div>
      <div><h4>&nbsp;</h4><ul>${SERVICES.slice(4).map(s => `<li><a href="/${s.slug}">${s.title}</a></li>`).join('')}</ul></div>
      <div><h4>Studio</h4><ul><li><a href="/#about">About</a></li><li><a href="/#work">Work</a></li><li><a href="/#events">Events</a></li><li><a href="mailto:${SITE.email}">${SITE.email}</a></li><li>${SITE.city}</li></ul></div>
    </div>
    <div class="footer-bottom"><span>© <span data-year>2026</span> one9studio. All rights reserved.</span><span>Brand · Talent · Artists · Events</span></div>
  </div>
</footer>
<a class="wa-float" ${wa(null)} aria-label="Chat with one9studio on WhatsApp">${WA_ICON}<span>Chat with us</span></a>
<script src="/assets/one9/one9.js?v=3" defer></script>`;

const head = ({ title, description, url, image }) => `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE.domain}${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE.domain}${url}">
<meta property="og:image" content="${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0b0c14">
<link rel="icon" href="/assets/one9/logo.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap">
<link rel="stylesheet" href="/assets/one9/one9.css?v=3">
</head>
<body>`;

const ROSTER = [
  ['1517841905240-472988babdf9', 'Aanya Kapoor', 'Fashion & lifestyle creator', '1.2M followers', 'Influencer'],
  ['1507003211169-0a1dd7228f2d', 'Rohan Mehta', 'Host & anchor', 'Live events · TV', 'Talent'],
  ['1494790108377-be9c29b29330', 'Meera Iyer', 'Singer-songwriter', '24M streams', 'Artist'],
  ['1500648767791-00dcc994a43e', 'Kabir Sethi', 'Tech & finance creator', '860K subscribers', 'Influencer'],
];

const EVENTS = [
  ['1533174072545-7a4b6ad7a6c3', '2026-11-14', 'Concert · Mumbai · NSCI Dome', 'Monsoon Nights Live', 'An evening with Meera Iyer and special guests, presented with our brand partners.'],
  ['1516450360452-9312f5e86fc7', '2026-12-06', 'Show · Bengaluru · Phoenix Arena', 'Creator Fest 2026', 'Meet 40+ creators, live podcasts, workshops and brand experiences.'],
  ['1531058020387-3be344556be6', '2027-01-18', 'Brand launch · Delhi · Aerocity', 'The Collab Edit', 'Launch showcase of this season’s creator × brand capsule collections.'],
];

function home() {
  const s = SERVICES;
  return head({ title: 'one9studio — Brand, Talent & Influencer Management Agency', description: `${SITE.tagline}. Brand, social media, influencer, talent and artist management, brand collaborations and events.`, url: '/', image: img('1492684223066-81342ee5ff30', 1200) }) + nav('home') + `
<main id="main">
<section class="hero">
  <div class="wrap hero-grid">
    <div class="rv">
      <span class="eyebrow">Brand · Talent · Artists · Events</span>
      <h1 data-content="headline">Influence has value. <em>We turn it into commercial opportunity.</em></h1>
      <p class="lead" data-content="intro">one9studio connects brands, creators and artists — managing reputations, careers, collaborations and live shows that create measurable returns.</p>
      <div class="hero-actions"><a class="btn btn-wa" ${wa(null)}>${WA_ICON} Chat on WhatsApp</a><a class="btn btn-ghost" href="#services">Explore services</a></div>
      <div class="hero-proof"><div><strong>250+</strong><span>Campaigns delivered</span></div><div><strong>2,500+</strong><span>Creators in network</span></div><div><strong>120M+</strong><span>Monthly audience reach</span></div></div>
    </div>
    <div class="collage rv" aria-hidden="true">
      <figure class="c1"><img src="${img('1492684223066-81342ee5ff30', 900)}" alt="" fetchpriority="high"></figure>
      <figure class="c2"><img src="${img('1534528741775-53994a69daeb', 600)}" alt=""></figure>
      <figure class="c3"><img src="${img('1542038784456-1ea8e935640e', 600)}" alt=""></figure>
      <div class="chip chip-1"><i>${icon('chart')}</i><div><b>4.2x</b>avg. campaign ROI</div></div>
      <div class="chip chip-2"><i>${icon('star')}</i><div><b>180+</b>talent &amp; artists</div></div>
    </div>
  </div>
</section>

<section class="strip" aria-label="Brands we have worked with (demo)">
  <div class="wrap"><p>Trusted by growing brands across India</p>
    <ul><li>NORTHLANE</li><li>Velora</li><li>KAAYA</li><li>Brewhaus</li><li>Lumen&amp;Co</li><li>Saffron St.</li></ul></div>
</section>

<section class="section" id="services">
  <div class="wrap">
    <div class="section-head rv"><div><span class="eyebrow">What we do</span><h2>Seven services.<br>One commercial goal.</h2></div><p>Every service is built to do one thing: turn attention, audiences and talent into revenue, partnerships and long-term value.</p></div>
    <div class="services-grid">
      ${s.map((x, i) => `<a class="service-card rv" href="/${x.slug}"><div class="thumb"><img src="${img(x.hero, [0, 1, 5, 6].includes(i) ? 900 : 700)}" alt="" loading="lazy"></div><div class="body"><span class="num">0${i + 1}</span><h3>${x.title}</h3><p>${esc(x.short)}</p><span class="more">Learn more <span class="arrow">→</span></span></div></a>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section dark" id="about">
  <div class="wrap">
    <div class="section-head rv"><div><span class="eyebrow">How we work</span><h2>From attention<br>to revenue.</h2></div><p>A simple, accountable process — the same whether we’re launching a brand, managing a creator or producing a show.</p></div>
    <ol class="process">
      <li class="rv"><h3>Discover</h3><p>We learn your goals, audience, numbers and what success looks like.</p></li>
      <li class="rv"><h3>Match</h3><p>We pair you with the right creators, artists, partners and channels.</p></li>
      <li class="rv"><h3>Activate</h3><p>Campaigns, content, deals and events — planned and run by one team.</p></li>
      <li class="rv"><h3>Measure</h3><p>Clear reporting on reach, engagement, leads and revenue.</p></li>
    </ol>
  </div>
</section>

<section class="section">
  <div class="wrap stats">
    <div class="stat rv"><strong>250+</strong><span>Campaigns and collaborations delivered</span></div>
    <div class="stat rv"><strong>180+</strong><span>Talent, artists and creators managed</span></div>
    <div class="stat rv"><strong>90+</strong><span>Live events and shows produced</span></div>
    <div class="stat rv"><strong>4.2x</strong><span>Average return on campaign spend</span></div>
  </div>
</section>

<section class="section" id="work" style="padding-top:0">
  <div class="wrap">
    <div class="section-head rv"><div><span class="eyebrow">Selected work</span><h2>Results we’re proud of.</h2></div><p>A few recent projects across influencer campaigns, collaborations and live events.</p></div>
    <div class="work-grid">
      ${[[s[2], s[2].case], [s[5], s[5].case], [s[6], s[6].case]].map(([sv, c], i) => `<article class="work-card rv"><div class="thumb"><img src="${img(['1514525253161-7a46d19cd819', '1505236858219-8359eb29e329', '1529156069898-49953e39b3ac'][i], 700)}" alt="" loading="lazy"></div><div class="body"><span class="tag${i % 2 ? ' gold' : ''}">${sv.title}</span><h3>${esc(c[1])}</h3><div class="result">${c[4].slice(0, 2).map(r => `<div><b>${r[0]}</b><span>${r[1]}</span></div>`).join('')}</div></div></article>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section" id="roster" style="background:#fff">
  <div class="wrap">
    <div class="section-head rv"><div><span class="eyebrow">Our roster</span><h2>Influencers, talent<br>and artists.</h2></div><p>A selection of the people we manage. Looking for someone specific? Ask us — our network covers 2,500+ creators and performers.</p></div>
    <div class="roster">
      ${ROSTER.map(r => `<article class="person rv"><img src="${img(r[0], 600)}" alt="${r[1]}" loading="lazy"><span class="badge">${r[4]}</span><div class="info"><h3>${r[1]}</h3><p>${r[2]} · ${r[3]}</p></div></article>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section dark" id="events">
  <div class="wrap">
    <div class="section-head rv"><div><span class="eyebrow">Events &amp; shows</span><h2>Coming up.</h2></div><p>Concerts, creator festivals and brand launches produced by one9studio.</p></div>
    <div class="events" data-events>
      ${EVENTS.map(e => { const d = new Date(e[1] + 'T00:00:00'); return `<article class="event rv"><div class="thumb"><img src="${img(e[0], 700)}" alt="" loading="lazy"><div class="date"><b>${d.getDate()}</b>${d.toLocaleString('en-US', { month: 'short' })}</div></div><div class="body"><div class="meta">${e[2]}</div><h3>${e[3]}</h3><p>${e[4]}</p></div></article>`; }).join('\n      ')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head rv"><div><span class="eyebrow">Testimonials</span><h2>What partners say.</h2></div></div>
    <div class="quotes">
      <figure class="quote rv"><blockquote>“one9studio didn’t just find us creators — they found the right ones. Our launch paid for itself in the first two weeks.”</blockquote><figcaption><img src="${img('1573496359142-b8d87734a5a2', 120)}" alt=""><div><b>Priya Nair</b><span>Marketing Head, Velora Skincare</span></div></figcaption></figure>
      <figure class="quote rv"><blockquote>“Since signing with one9studio my brand income has grown five times, and I finally have time to focus on creating.”</blockquote><figcaption><img src="${img('1560250097-0b93528c311a', 120)}" alt=""><div><b>Arjun Desai</b><span>Lifestyle creator, 1.1M followers</span></div></figcaption></figure>
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap"><div class="cta-band rv"><h2>Have influence, talent or a brand worth growing? Let’s talk.</h2><a class="btn btn-light" ${wa(null)}>${WA_ICON} Chat on WhatsApp</a></div></div>
</section>
</main>` + contact(null) + footer() + '\n</body>\n</html>\n';
}

function servicePage(sv) {
  const others = SERVICES.filter(x => x !== sv);
  return head({ title: `${sv.title} — one9studio`, description: sv.lead, url: '/' + sv.slug, image: img(sv.hero, 1200) }) + nav(sv.slug) + `
<main id="main">
<section class="page-hero">
  <div class="wrap">
    <div class="rv">
      <ol class="crumbs"><li><a href="/">Home</a></li><li><a href="/#services">Services</a></li><li aria-current="page">${sv.title}</li></ol>
      <span class="eyebrow">${sv.title}</span>
      <h1>${esc(sv.short.replace(/\.$/, ''))}.</h1>
      <p class="lead">${esc(sv.lead)}</p>
      <div class="hero-actions"><a class="btn btn-wa" ${wa(sv.title)}>${WA_ICON} Talk to us on WhatsApp</a><a class="btn btn-ghost" href="#case">See a case study</a></div>
    </div>
    <figure class="rv"><img src="${img(sv.hero, 900)}" alt="${sv.title} at one9studio" fetchpriority="high"></figure>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head rv"><div><span class="eyebrow">What’s included</span><h2>Everything you need,<br>one accountable team.</h2></div><p>Pick the full service or the parts you need — every engagement starts with clear goals and ends with clear numbers.</p></div>
    <div class="caps">
      ${sv.caps.map(c => `<div class="cap rv"><div class="ico">${icon(c[0])}</div><h3>${c[1]}</h3><p>${esc(c[2])}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section" style="background:#fff">
  <div class="wrap split">
    <figure class="rv"><img src="${img(SIDE[sv.slug], 900)}" alt="" loading="lazy"></figure>
    <div class="rv"><span class="eyebrow">Why one9studio</span><h2>${esc(sv.split[0])}</h2><p class="muted">${esc(sv.split[1])}</p><ul class="checks">${sv.checks.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>
  </div>
</section>

<section class="section dark">
  <div class="wrap">
    <div class="section-head rv"><div><span class="eyebrow">Our process</span><h2>How it works.</h2></div></div>
    <ol class="process">${sv.process.map(p => `<li class="rv"><h3>${p[0]}</h3><p>${esc(p[1])}</p></li>`).join('')}</ol>
  </div>
</section>

<section class="section" id="case">
  <div class="wrap split">
    <div class="rv"><span class="eyebrow">Case study</span><span class="tag">${sv.case[0]}</span><h2>${esc(sv.case[1])}</h2><p class="muted">${esc(sv.case[2])}</p>
      <div class="case-results">${sv.case[4].map(r => `<div><b>${r[0]}</b><span>${r[1]}</span></div>`).join('')}</div></div>
    <figure class="rv"><img src="${img(sv.case[3], 900)}" alt="" loading="lazy"></figure>
  </div>
</section>

<section class="section" style="background:#fff">
  <div class="wrap">
    <div class="section-head rv"><div><span class="eyebrow">FAQ</span><h2>Common questions.</h2></div></div>
    <div class="faq rv">${sv.faq.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(f[0])}</summary><p>${esc(f[1])}</p></details>`).join('')}</div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head rv"><div><span class="eyebrow">Explore more</span><h2>Other services.</h2></div></div>
    <div class="other-services rv">${others.map(o => `<a href="/${o.slug}">${o.title} →</a>`).join('')}</div>
  </div>
</section>
</main>` + contact(sv.title, `Ready to talk ${sv.title.toLowerCase()}?`) + footer() + '\n</body>\n</html>\n';
}

fs.writeFileSync(path.join(ROOT, 'index.html'), home());
for (const sv of SERVICES) fs.writeFileSync(path.join(ROOT, sv.slug + '.html'), servicePage(sv));
const urls = ['/', ...SERVICES.map(s => '/' + s.slug), '/suppliers', '/diwali-edit'];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${SITE.domain}${u === '/' ? '/' : u}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log('Built index.html, ' + SERVICES.length + ' service pages and sitemap.xml');
module.exports = { SERVICES };
