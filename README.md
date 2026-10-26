# one9studio

Agency landing page recreated from the uploaded Landing Page-html.zip mockup, with one9studio branding. The source design's navy, pink and yellow palette, typography, six 3D flip cards, CELEBSBOOKING drawer and event/contact sections are retained.

## Pages

- / — agency homepage
- /dashboard — same service inquiry interface
- /coming-soon — previous coming-soon page

This is a public agency/service interface. It does not include administrative login, a database or lead management.

## Interactions

Each service card flips to a required inquiry form with the mockup's original service choices. Valid input creates an inquiry draft that can be copied or downloaded. Nothing is sent remotely. Confirmed agency contact details and a delivery endpoint are required to enable sending. CELEBSBOOKING options open the celebrity inquiry card and select the requested booking type.

## Deployment

Plain HTML/CSS/JavaScript. On Vercel use framework Other, no build command, output directory '.', repository root. Existing vercel.json enables clean URLs. No environment variables are needed for draft inquiries.

Maintain the agreed flow: The-Aditya-Kadam/one9studio → agencywork187-commits/one9studio → Vercel. Automatic repository synchronization is not configured here.

## Verification

JavaScript syntax checked. The six service headings and all dropdown choices were compared with Main.dc.html from the supplied ZIP. Visual browser testing remains required.
