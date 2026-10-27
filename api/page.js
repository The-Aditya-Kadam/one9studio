/*
  Serves every website page from the database.
  vercel.json rewrites page addresses (/, /brand-management, /about …) to /api/page?path=…
*/
const { render } = require('../lib/render');

module.exports = async (req, res) => {
  try {
    const preview = Boolean(req.query.preview);
    const out = await render(req.query.path || '', { preview });
    res.setHeader('Content-Type', out.type);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Short CDN cache: dashboard edits show on the live site within about 30 seconds.
    res.setHeader('Cache-Control', preview ? 'no-store' : out.status === 200 ? 'public, max-age=0, s-maxage=30, stale-while-revalidate=300' : 'public, max-age=0, s-maxage=10');
    res.status(out.status).send(out.body);
  } catch (e) {
    console.error('Page render:', e.message);
    res.status(500).setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send('Sorry, this page could not be loaded. Please try again shortly.');
  }
};
