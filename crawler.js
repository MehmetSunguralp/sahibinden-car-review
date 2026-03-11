const puppeteer = require('puppeteer-core');
const { connect } = require('puppeteer-real-browser');

async function launchBrowser() {
  const useRealBrowser = process.env.USE_REAL_BROWSER === '1';

  if (useRealBrowser) {
    const { browser, page } = await connect({
      headless: false,
      turnstile: true,
    });
    return { browser, page };
  }

  const executablePath =
    process.env.CHROME_PATH ||
    'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  return { browser, page };
}

async function scrapeSahibindenHome() {
  const { browser, page } = await launchBrowser();
  const useRealBrowser = process.env.USE_REAL_BROWSER === '1';

  try {
    await page.goto('https://www.sahibinden.com', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    console.log('Sahibinden homepage opened. You can now interact with the page.');

    if (!useRealBrowser) {
      // In headless mode, just keep the page open for a short time.
      await page.waitForTimeout(30000);
    }

    return;
  } catch (err) {
    console.error('Error while scraping sahibinden.com:', err);
    throw err;
  } finally {
    if (!useRealBrowser) {
      await browser.close();
    } else {
      // In real-browser mode, leave the browser open for manual interaction.
      console.log('Leaving real browser open. Close it manually when done.');
    }
  }
}

if (require.main === module) {
  scrapeSahibindenHome().catch(() => process.exit(1));
}

module.exports = { scrapeSahibindenHome };

