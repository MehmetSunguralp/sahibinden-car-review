const express = require('express');
const { connect } = require('puppeteer-real-browser');

async function crawlAd(adNo) {
  const url = `https://www.sahibinden.com/kelime-ile-arama?query_text=${adNo}`;
  console.log(`Opening page for adNo=${adNo} -> ${url}`);

  const { browser, page } = await connect({
    headless: 'auto',
    fingerprint: true,
    turnstile: true,
    tf: true,
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    // Give Cloudflare & dynamic content time to settle
    await new Promise((resolve) => setTimeout(resolve, 15000));
    console.log(`Finished loading page for adNo=${adNo}`);
  } finally {
    // We are only "crawling" (loading the page), not extracting/saving.
    await page.close();
    if (browser && browser.isConnected()) {
      await browser.close();
    }
  }
}

const app = express();

app.get('/', async (req, res) => {
  const { adNo } = req.query;

  if (!adNo) {
    return res.status(400).json({ ok: false, error: 'Missing adNo query parameter' });
  }

  console.log(`Received crawl request for adNo=${adNo}`);

  try {
    await crawlAd(adNo);
    return res.json({ ok: true, adNo });
  } catch (err) {
    console.error(`Error while crawling adNo=${adNo}:`, err);
    return res.status(500).json({ ok: false, error: err.message || 'Unknown error' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Crawler server listening at http://localhost:${PORT}`);
  console.log('Send GET request to trigger a crawl.');
});

