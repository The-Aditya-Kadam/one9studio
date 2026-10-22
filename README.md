# one9studio

Responsive HTML, CSS and JavaScript website adapted directly from the supplied M J Media Agency landing-page HTML. Branding is now one9studio. The reference layout, copy, navy/pink/yellow palette, Manrope/Syne typefaces, six flip cards, individual service options, CELEBSBOOKING panel, upcoming events and contact section are retained.

## Preview

Run `python3 -m http.server 8080` from this directory, then open http://localhost:8080.
No package installation or build is required. Fonts are bundled into the stylesheet. No custom export runtime or external scripts are required.

## Inquiry behavior

Each card flips to its original required fields and service-specific choices. Valid submissions prepare a draft that can be copied or downloaded. Nothing is sent or stored remotely. Agency email, phone, social links and a real delivery endpoint were not supplied; direct submission remains pending those details. Event cards explicitly show that dates are unannounced. No reference company's contact information or claims are reused.

## Repository and deployment workflow

1. Develop in https://github.com/The-Aditya-Kadam/one9studio on `main`.
2. Copy reviewed commits to https://github.com/agencywork187-commits/one9studio on `main`.
3. Render must watch **the agency repository**, never the development repository.

The connected GitHub account currently has no push permission on the agency repository. Its owner must give `The-Aditya-Kadam` write access before the handoff can be completed. No automatic synchronization has been configured, and no destination history should be overwritten.

`render.yaml` defines the intended static service, source repository and build. It does not itself create a Render service. A Render owner must connect the agency repository or create a Blueprint from it after the code is copied there.

Manual setup: Static Site; branch `main`; build command `mkdir -p dist && cp index.html styles.css app.js dist/ && cp -R assets dist/`; publish directory `dist`.

## Checks

`node --check app.js` verifies JavaScript syntax. Browser layout and interaction testing is still required before production launch.
